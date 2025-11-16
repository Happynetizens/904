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

document.getElementById('Music').addEventListener('ended', () => {
	let music = document.getElementById('Music');
	music.src = './Music/' + musicList[nowMusic++ % musicList.length];
	music.play();
});

