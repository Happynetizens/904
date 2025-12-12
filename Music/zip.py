import os
import sys
import subprocess
import shlex
from pathlib import Path
import math
import shutil

# zip.py
# 将同级目录下主文件名包含 ".org" 的音频文件压缩（有损）至 24MB 及以下，
# 永远保留源文件（.org）
# 已经满足大小的文件不再压缩，直接复制并去掉 ".org" 并改名为最终文件名。
# 依赖: 系统需安装 ffmpeg / ffprobe，可通过 https://ffmpeg.org/ 获取。
# 使用方法: 将此脚本放在目标目录，双击或在该目录运行 python zip.py


# 目标最大字节数（24MB）
MAX_BYTES = 24 * 1024 * 1024

# 支持映射：输出扩展 -> ffmpeg 使用的音频编码器
ENCODER_MAP = {
	'.mp3': 'libmp3lame',
	'.m4a': 'aac',
	'.aac': 'aac',
	'.ogg': 'libvorbis',
	'.opus': 'libopus',
}

# 最低允许的音频码率（kbps），低于会严重影响质量
MIN_KBPS = 24

def run_cmd(cmd):
	"""运行 shell 命令，返回 (returncode, stdout, stderr)."""
	p = subprocess.Popen(shlex.split(cmd), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	out, err = p.communicate()
	return p.returncode, out.decode('utf-8', errors='ignore'), err.decode('utf-8', errors='ignore')

def get_duration_seconds(path):
	"""用 ffprobe 获取音频时长（秒）。失败返回 None。"""
	cmd = fr'"c:\Program Files (x86)\ffmpeg\bin\ffprobe.exe" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{path}"'
	rc, out, err = run_cmd(cmd)
	if rc != 0:
		return None
	try:
		return float(out.strip())
	except:
		return None

def unique_path(path: Path):
	"""如果目标已存在，则产生一个不冲突的文件路径（在文件名后加 _1/_2 ...）。"""
	if not path.exists():
		return path
	base = path.stem
	suffix = path.suffix
	parent = path.parent
	i = 1
	while True:
		new = parent / f"{base}_{i}{suffix}"
		if not new.exists():
			return new
		i += 1

def compress_to_bitrate(in_path: Path, out_path: Path, kbps: int, encoder: str):
	"""调用 ffmpeg 将输入文件按指定 kbps 压缩到 out_path，返回是否成功（0）"""
	# 输出容器格式由 out_path.suffix 决定；使用指定编码器。
	# -vn 去掉视频流，-y 覆盖输出（若存在）
	cmd = fr'"c:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe" -y -i "{in_path}" -vn -c:a {encoder} -b:a {kbps}k -f mp3 "{out_path}"'
	rc, out, err = run_cmd(cmd)
	return rc == 0

def process_file(path: Path):
	"""处理单个文件：如果文件名中有 .org（作为主名的一部分），按规则处理"""
	name = path.name
	# 只处理像 xxx.org.ext 这样的文件（主文件名以 .org 结尾）
	# 例如: song.org.mp3
	parts = name.split('.')
	if len(parts) < 3:
		return False  # 不符合 xxx.org.ext 结构
	if parts[-2] != 'org':
		return False

	# 构造目标文件名：去掉中间的 .org
	new_name = '.'.join(parts[:-2] + parts[-1:])
	orig_size = path.stat().st_size
	print(f'处理: {name} ({orig_size / (1024*1024):.2f} MB) -> {new_name}')

	target_path = path.with_name(new_name)
	target_path = unique_path(target_path)

	if orig_size <= MAX_BYTES:
		# 已满足，不压缩，复制并改名（保留源文件）
		print('\t已小于等于 24MB，复制为最终文件（保留源）')
		try:
			shutil.copy2(str(path), str(target_path))
		except Exception as e:
			print('\t复制失败:', e)
		return True
	
	# 需要压缩：先获取时长，估算比特率
	duration = get_duration_seconds(str(path))
	if not duration or duration <= 0:
		print('\t无法获取时长，跳过压缩（保留源文件）')
		return True

	# 计算目标总比特率（bps）: 允许的最大 bits / 秒
	target_bps = (MAX_BYTES * 8) / duration
	# 预留 95% 空间给音频（容器头等），转换为 kbps
	target_kbps = max(int(target_bps / 1000 * 0.95), MIN_KBPS)
	print(f'\t时长: {duration:.1f}s，初始目标码率: {target_kbps} kbps')

	print("\t开始压缩...")

	# 选择编码器与输出扩展
	out_ext = path.suffix.lower()
	encoder = ENCODER_MAP.get(out_ext)
	if encoder is None:
		# 默认转为 mp3
		out_ext = '.mp3'
		encoder = ENCODER_MAP[out_ext]
		target_path = target_path.with_suffix(out_ext)
		target_path = unique_path(target_path)

	# 迭代尝试压缩，若输出仍超限则降低码率重试
	attempt = 0
	kbps = target_kbps
	success = False
	tmp_out = target_path.with_suffix(target_path.suffix + '.tmp')
	while attempt < 10 and kbps >= MIN_KBPS:
		attempt += 1
		print(f'\t尝试 {attempt}: 使用 {kbps} kbps 压缩 ...')
		if tmp_out.exists():
			try:
				tmp_out.unlink()
			except:
				pass
		ok = compress_to_bitrate(path, tmp_out, kbps, encoder)
		if not ok or not tmp_out.exists():
			print('\tffmpeg 压缩失败，取消本次尝试')
			kbps = int(kbps * 0.95)
			continue
		out_size = tmp_out.stat().st_size
		print(f'\t输出大小: {out_size / (1024*1024):.2f} MB')
		if out_size <= MAX_BYTES:
			# 成功，重命名临时文件到最终目标，保留源文件
			try:
				# 使用 replace 保证覆盖同名目标（如果 unique_path 选的目标已被创建则替换）
				tmp_out.replace(target_path)
			except Exception:
				try:
					shutil.move(str(tmp_out), str(target_path))
				except Exception as e:
					print('\t移动临时文件失败:', e)
					try:
						if tmp_out.exists():
							tmp_out.unlink()
					except:
						pass
					break
			print('\t成功：已压缩并保存为', target_path.name, '（保留源）')
			success = True
			break
		else:
			# 还太大，降低码率重试
			print('\t仍然超出限制，降低码率重试')
			# 将 kbps 降到 85% 再试
			kbps = max(int(kbps * 0.85), kbps - 16)
			# 清理临时文件再试
			try:
				if tmp_out.exists():
					tmp_out.unlink()
			except:
				pass

	if not success:
		# 若多次尝试仍失败，保守策略：复制原文件作为目标名（不覆盖源）
		print('\t未能在限定尝试内压缩至 24MB，复制原文件作为最终文件名（保留源）')
		try:
			shutil.copy2(str(path), str(target_path))
		except Exception as e:
			print('\t复制失败:', e)
		# 清理可能残留的临时文件
		try:
			if tmp_out.exists():
				tmp_out.unlink()
		except:
			pass

	return True

def main():
	cwd = Path(__file__).parent.resolve()
	print('工作目录:', cwd)
	files = sorted([p for p in cwd.iterdir() if p.is_file()])
	processed = 0
	for f in files:
		try:
			if process_file(f):
				processed += 1
		except Exception as e:
			print('处理文件出错:', f.name, e)
	print(f'完成，共处理 {processed} 个符合条件的文件。')

if __name__ == '__main__':
	print("run zip.py to compress audio files to 24MB or less.")
	main()

# by ChatGPT

