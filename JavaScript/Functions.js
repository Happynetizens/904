import {timings, useless, scrollThreshold, Musics} from './Library.js';
let lastScrollY = 0;
let ThisMusic = 0;
let Flag = false;

function IsShowing(ElementId) {
	let element = document.getElementById(ElementId);
	if (element) return document.getElementById(ElementId).classList.contains("appear");
	else return false;
}
function Inspect(p) {
	for (let i = 0; i < useless.length; i++) {
		if (useless[i] === timings[p].place) return false;
	}
	return true;
}
function theNext(place) {
	while (!Inspect(++place)) void(0);
	return place === timings.length-1? -1 : place;
}
function theLast(place) {
	while (!Inspect(--place)) void(0);
	return place === 0? -1 : place;
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
	if (Time !== null) Time.innerHTML = "我们的回忆就在" + PrintTime + "前";
}
function ShowTime() {
	if (document.getElementById('Time') === null) {
		if (document.getElementById('End').classList.contains('appear')) {
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
	if (way && theNext(now) !== -1) {
		console.log('+');
		document.getElementById(timings[now].place).className = "hidden";
		document.getElementById(timings[theNext(now)].place).className = "appear";
	}
	if (!way && theLast(now)!== -1) {
		console.log('-');
		document.getElementById(timings[now].place).className = "hidden";
		document.getElementById(timings[theLast(now)].place).className = "appear";
	}
}
function CurbMusic() {
	let Music = document.getElementById('Music');
	Music.src = './Music/' + Musics[ThisMusic++ % Musics.length].file;
	Music.play();
}

window.addEventListener('scroll', function() {
	const currentScrollY = window.scrollY || document.documentElement.scrollTop;
	const scrollDelta = currentScrollY - lastScrollY;
	if (scrollDelta > scrollThreshold) CurbShow(true);
	if (scrollDelta < -scrollThreshold) CurbShow(false);
	lastScrollY = currentScrollY;
});
window.addEventListener('keydown', function(event) {
	if (!Flag) {
		CurbMusic();
		Flag = true;
	}
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
document.getElementById('Music').addEventListener('ended', CurbMusic);

setInterval(CurbTab, 0);
setInterval(ShowTime, 0);

