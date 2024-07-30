import {timings, useless, lastScrollY, scrollThreshold, Musics, ThisMusic} from './Library.js';

function Progress() {
	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	const scrollHeight = document.documentElement.scrollHeight;
	const windowHeight = window.innerHeight;
	const scrollPercent = (scrollTop / (scrollHeight - windowHeight));
	return scrollPercent * 100;
}
function IsShowing(ElementId) {
	return document.getElementById(ElementId).className === "appear";
}
function Inspect(p) {
	for (let i = 0; i < useless.length; i++) {
		if (useless[i] === timings[p].place) {
			return false;
		}
	}
	return true;
}
function theNext(place) {
	place++;
	while (!Inspect(place)) {
		place++;
	}
	return place;
}
function theLast(place) {
	place--;
	while (!Inspect(place)) {
		place--;
	}
	return place;
}
function findContent() {
	for (let i=0; i<timings.length-1; i++) {
		if (!Inspect(i)) continue;
		if (IsShowing(timings[i].place)) {
			return i;
		}
	}
	return -1;
}
function CurbTab() {
	const p = findContent();
	const TabLast = document.getElementById('TabLast');
	const TabThis = document.getElementById('TabThis');
	const TabNext = document.getElementById('TabNext');
	if (p === -1) {
		TabLast.innerHTML = "";
		TabThis.innerHTML = "";
		TabNext.innerHTML = "";
	} else {
		if (p-1 >= 0) TabLast.innerHTML = timings[p-1].date;
		else TabLast.innerHTML = "";
		TabThis.innerHTML = timings[p].date;
		if (p+1 < timings.length) TabNext.innerHTML = timings[p+1].date;
		else TabNext.innerHTML = "";
	}
}
function PassingTime() {
	const time = new Date() - new Date(2024, 5, 2, 21, 0, 0);
	const year = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
	const month = Math.floor((time % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
	const day = Math.floor((time % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
	const hour = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const minute = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
	const second = Math.floor((time % (60 * 1000)) / 1000);
	let PrintTime= "";
	if (year > 0) PrintTime += year + "年";
	if (month > 0) PrintTime += month + "个月";
	if (day > 0) PrintTime += day + "天";
	if (hour > 0) PrintTime += hour + "小时";
	if (minute > 0) PrintTime += minute + "分钟";
	if (second > 0) PrintTime += second + "秒";
	const Time = document.getElementById("Time");
	if (Time!=null) Time.innerHTML = "我们的回忆就在" + PrintTime + "前";
}
function ShowTime() {
	if (document.getElementById('Time')==null) {
		if (Progress() >= 75 || isNaN(Progress())) {
			const P = document.createElement('p');
			P.id = 'Time';
			P.className = 'Time';
			document.body.appendChild(P);
		}
	} else {
		PassingTime();
	}
}
function CurbShow(way) {
	let now = findContent();
	if (way) {
		console.log('+');
		document.getElementById(timings[now].place).className = "hidden";
		document.getElementById(timings[theNext(now)].place).className = "appear";
	} else {
		console.log('-');
		document.getElementById(timings[now].place).className = "hidden";
		document.getElementById(timings[theLast(now)].place).className = "appear";
	}
}

document.addEventListener('DOMContentLoaded', function() {
	window.onscroll = function () {
		const scrollPercent = Progress();
		const progress = document.querySelector('progress');
		progress.value = scrollPercent;
	}
});
window.addEventListener('scroll', function() {
	const currentScrollY = window.scrollY || document.documentElement.scrollTop;
	const scrollDelta = currentScrollY - lastScrollY;
	if (scrollDelta > scrollThreshold) CurbShow(true);
	if (scrollDelta < -scrollThreshold) CurbShow(false);
	lastScrollY = currentScrollY;
});
window.addEventListener('keydown', function(event){
	document.getElementById('Music').play();
	switch (event.key) {
		case'ArrowDown': case'ArrowRight':
		CurbShow(true);
		break;
		case'ArrowUp': case'ArrowLeft':
		CurbShow(false);
		break;
		default:
		break;
	}
});
document.getElementById('Music').addEventListener('ended', function () {
	let Music = document.getElementById('Music');
	Music.src = Musics[++ThisMusic % Musics.length].url;
	Music.play();
});

setInterval(CurbTab, 0);
setInterval(ShowTime, 0);

