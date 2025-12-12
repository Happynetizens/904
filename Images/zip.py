import os
import sys
from PIL import Image
import io
import shutil

def get_script_directory():
	"""获取脚本所在的目录"""
	return os.path.dirname(os.path.abspath(__file__))

def compress_image_to_target_size(image_path, max_size_kb=240, max_width=2000):
	"""
	压缩图像到目标大小以下
	返回压缩后的图像二进制数据和扩展名
	"""
	try:
		img = Image.open(image_path)
	except Exception as e:
		print(f"无法打开图像 {image_path}: {e}")
		return None, None

	# 保存原始模式，用于判断是否需要转换
	original_mode = img.mode

	# 转换RGB模式（如果RGBA需要转换为RGB）
	if img.mode in ('RGBA', 'LA', 'P'):
		# 处理透明度和调色板模式
		if img.mode == 'RGBA':
			background = Image.new('RGB', img.size, (255, 255, 255))
			background.paste(img, mask=img.split()[3] if len(img.split()) > 3 else None)
			img = background
		elif img.mode == 'LA':
			background = Image.new('L', img.size, 255)
			background.paste(img, mask=img.split()[1] if len(img.split()) > 1 else None)
			img = img.convert('RGB')
		elif img.mode == 'P':
			img = img.convert('RGB')
	elif img.mode == 'L':
		# 灰度图直接转换为RGB
		img = img.convert('RGB')

	# 如果图像宽度太大，先调整尺寸
	if img.width > max_width:
		ratio = max_width / img.width
		new_height = int(img.height * ratio)
		img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

	# 获取原始扩展名
	original_ext = os.path.splitext(image_path)[1].lower()

	# 确定输出格式
	# 优先使用JPEG，因为它压缩率更高
	output_format = 'JPEG'
	file_ext = '.jpg'

	# 如果是GIF，尝试保持为GIF（但可能更难压缩）
	if original_ext == '.gif':
		# GIF可以尝试保持为GIF，但压缩率较低
		# 这里我们先尝试JPEG，如果需要可以改为尝试GIF
		pass

	# 逐步降低质量以达到目标大小
	quality = 95  # 初始质量
	min_quality = 10  # 最低质量

	while quality >= min_quality:
		buffer = io.BytesIO()

		# 保存到内存缓冲区
		if output_format == 'JPEG':
			img.save(buffer, format=output_format, quality=quality, optimize=True)
		else:
			img.save(buffer, format=output_format, optimize=True)

		# 检查大小
		size_kb = len(buffer.getvalue()) / 1024

		if size_kb <= max_size_kb or quality <= min_quality:
			if size_kb <= max_size_kb:
				print(f"  质量 {quality}% - {size_kb:.1f}KB ✓")
			else:
				print(f"  质量 {quality}% - {size_kb:.1f}KB (无法达到目标，使用最小质量)")
			return buffer.getvalue(), file_ext

		# 降低质量继续尝试
		quality -= 15

	# 如果所有尝试都失败，返回最低质量的结果
	buffer = io.BytesIO()
	img.save(buffer, format=output_format, quality=min_quality, optimize=True)
	return buffer.getvalue(), file_ext

def compress_non_image_file(file_path, max_size_kb=240):
	"""
	压缩非图像文件
	返回压缩后的二进制数据和扩展名
	"""
	try:
		with open(file_path, 'rb') as f:
			original_data = f.read()

		original_size_kb = len(original_data) / 1024

		# 如果原文件已经小于目标大小，直接返回
		if original_size_kb <= max_size_kb:
			return original_data, os.path.splitext(file_path)[1]

		# 尝试gzip压缩
		import gzip

		buffer = io.BytesIO()
		with gzip.GzipFile(fileobj=buffer, mode='wb', compresslevel=9) as f:
			f.write(original_data)

		compressed_data = buffer.getvalue()
		compressed_size_kb = len(compressed_data) / 1024

		if compressed_size_kb <= max_size_kb:
			print(f"  gzip压缩 - {compressed_size_kb:.1f}KB ✓")
			return compressed_data, os.path.splitext(file_path)[1] + '.gz'
		else:
			print(f"  gzip压缩后仍为 {compressed_size_kb:.1f}KB，无法达到目标大小")
			# 返回压缩后的数据，即使大于目标大小
			return compressed_data, os.path.splitext(file_path)[1] + '.gz'

	except Exception as e:
		print(f"  压缩非图像文件时出错: {e}")
		return None, None

def is_image_file(filepath):
	"""检查是否为图像文件"""
	image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.tif']
	ext = os.path.splitext(filepath)[1].lower()
	return ext in image_extensions

def process_files_with_org_in_name():
	"""处理文件名中包含.org的文件"""
	# 获取脚本所在目录
	script_dir = get_script_directory()
	print(f"脚本目录: {script_dir}")

	# 查找所有文件名中包含.org的文件
	target_files = []
	for filename in os.listdir(script_dir):
		filepath = os.path.join(script_dir, filename)
		if os.path.isfile(filepath) and '.org' in filename:
			target_files.append((filename, filepath))

	if not target_files:
		print("在脚本目录中未找到文件名中包含 .org 的文件")
		return

	print(f"找到 {len(target_files)} 个文件名中包含 .org 的文件:")
	for filename, filepath in target_files:
		print(f"  {filename}")
	print()

	processed_count = 0
	skipped_count = 0

	for org_filename, org_filepath in target_files:
		print(f"处理: {org_filename}")

		# 计算新文件名（去掉.org部分）
		# 注意：我们只去掉文件名中的.org，保留扩展名部分
		base_name, ext = os.path.splitext(org_filename)
		# 从基础名称中去掉.org
		new_base_name = base_name.replace('.org', '')
		# 如果没有扩展名，只使用新基础名称
		if ext:
			new_filename = new_base_name + ext
		else:
			new_filename = new_base_name

		# 构建完整的新文件路径
		new_filepath = os.path.join(script_dir, new_filename)

		# 检查原始文件大小
		try:
			original_size = os.path.getsize(org_filepath) / 1024
		except OSError as e:
			print(f"  无法获取文件大小: {e}")
			skipped_count += 1
			continue

		# 检查是否为图像文件
		if is_image_file(org_filepath):
			print(f"  图像文件，原始大小: {original_size:.1f}KB")

			if original_size <= 240:
				# 如果已经小于240KB，直接复制并重命名
				try:
					shutil.copy2(org_filepath, new_filepath)
					print(f"  直接复制为: {new_filename} ({original_size:.1f}KB)")
					processed_count += 1
				except Exception as e:
					print(f"  复制文件时出错: {e}")
					skipped_count += 1
			else:
				# 需要压缩
				compressed_data, new_ext = compress_image_to_target_size(org_filepath)

				if compressed_data:
					# 确定最终文件名
					if new_ext != ext:
						# 如果扩展名改变了（比如.png变成了.jpg）
						final_name = new_base_name + new_ext
						final_path = os.path.join(script_dir, final_name)
					else:
						final_name = new_filename
						final_path = new_filepath

					# 保存新文件
					with open(final_path, 'wb') as f:
						f.write(compressed_data)

					new_size = len(compressed_data) / 1024
					print(f"  保存为: {final_name} ({new_size:.1f}KB)")
					processed_count += 1
				else:
					print(f"  图像压缩失败")
					skipped_count += 1

		else:
			# 非图像文件
			print(f"  非图像文件，原始大小: {original_size:.1f}KB")

			if original_size <= 240:
				# 直接复制并重命名
				try:
					shutil.copy2(org_filepath, new_filepath)
					print(f"  直接复制为: {new_filename} ({original_size:.1f}KB)")
					processed_count += 1
				except Exception as e:
					print(f"  复制文件时出错: {e}")
					skipped_count += 1
			else:
				# 尝试压缩
				compressed_data, new_ext = compress_non_image_file(org_filepath)

				if compressed_data:
					# 确定最终文件名
					if new_ext != ext:
						# 如果扩展名改变了（比如.txt变成了.txt.gz）
						final_name = new_base_name + new_ext
						final_path = os.path.join(script_dir, final_name)
					else:
						final_name = new_filename
						final_path = new_filepath

					with open(final_path, 'wb') as f:
						f.write(compressed_data)

					new_size = len(compressed_data) / 1024
					print(f"  保存为: {final_name} ({new_size:.1f}KB)")
					processed_count += 1
				else:
					skipped_count += 1

		print()

	print(f"处理完成！")
	print(f"成功处理: {processed_count} 个文件")
	if skipped_count > 0:
		print(f"跳过: {skipped_count} 个文件")

def main():
	print("开始处理脚本目录中文件名包含 .org 的文件压缩任务")
	print("目标：压缩到 240KB 以下\n")

	# 检查所需库
	try:
		from PIL import Image
	except ImportError:
		print("需要安装 PIL/Pillow 库来处理图像")
		print("请运行: pip install Pillow")
		sys.exit(1)

	# 检查gzip库（Python标准库自带，但确认一下）
	try:
		import gzip
	except ImportError:
		print("警告: 无法导入gzip库，非图像文件压缩可能不可用")

	process_files_with_org_in_name()

if __name__ == "__main__":
	main()

# by DeepSeek

