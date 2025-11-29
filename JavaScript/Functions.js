import {contentList, musicList} from './Library.js';
let nowContent = 0, nowMusic = 0;

// change content
function listCheck(ptr) {
	return (0 < ptr && ptr < contentList.length)? ptr : 0;
}
function pageChange(toward) {		// toward = 1 / -1
	if(! listCheck(nowContent + toward)) return;
	nowContent += toward;
	console.log("page will turn to " + nowContent);
	document.getElementById("content").innerHTML = contentList[listCheck(nowContent)].codes;
	document.getElementById("lastTag").innerHTML = contentList[listCheck(nowContent - 1)].tag;
	document.getElementById("thisTag").innerHTML = contentList[listCheck(nowContent)].tag;
	document.getElementById("nextTag").innerHTML = contentList[listCheck(nowContent + 1)].tag;
	console.log("page has turned to " + nowContent);
	document.getElementById('Music').play();		//just play music
}
window.pageChange = pageChange;		// button control
window.addEventListener('keydown', function(event) {		// key control
	switch (event.key) {
		case'ArrowUp': case'ArrowLeft':
		pageChange(-1);
		break;
		case'ArrowDown': case'ArrowRight':
		pageChange(+1);
		break;
		default:
		break;
	}
});

const thePassTime = setInterval(() => {
	const time = new Date() - new Date(2024, 6 - 1, 2, 21, 0, 0);
	const year = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
	const month = Math.floor((time % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
	const day = Math.floor((time % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
	const hour = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const minute = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
	const second = Math.floor((time % (60 * 1000)) / 1000);
	let printTime= "";
	if(year > 0) printTime += year + "年";
	if(month > 0) printTime += month + "个月";
	if(day > 0) printTime += day + "天";
	if(hour > 0) printTime += hour + "小时";
	if(minute > 0) printTime += minute + "分钟";
	if(second > 0) printTime += second + "秒";
	document.getElementById("time").innerHTML = "我们的回忆就在" + printTime + "前";
	const timeBoxLeft = document.getElementById("time").getBoundingClientRect().left, titleBoxWidth = document.getElementById("title").getBoundingClientRect().width;
	console.log("timeBoxLetf=" + (timeBoxLeft - 20) + "\n" + "titleBoxWidtht=" + titleBoxWidth);
	if(titleBoxWidth > timeBoxLeft - 20) {
		document.getElementById("time").remove();
		clearInterval(thePassTime);
	}
}, 1000);

document.getElementById('Music').addEventListener('ended', () => {
	const music = document.getElementById('Music');
	music.src = './Music/' + musicList[nowMusic++ % musicList.length];
	music.play();
});

