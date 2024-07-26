function Progress() {
	let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	let scrollHeight = document.documentElement.scrollHeight;
	let windowHeight = window.innerHeight;
	let scrollPercent = (scrollTop / (scrollHeight - windowHeight));
	return scrollPercent * 100;
}

document.addEventListener('DOMContentLoaded', function() {
	window.onscroll = function () {
		let scrollPercent = Progress();
		let progress = document.querySelector('progress');
		progress.value = scrollPercent;
	}
});

const timings = [
	{place: 'Grade7Volume1', date: "七年级上册"},
	{place: 'BeginSchool', date: "2023年9月1日"},
	{place: 'Grade7Volume2', date: "七年级下册"},
	{place: 'Grade8Volume1', date: "八年级上册"},
	{place: 'Grade8Volume2', date: "八年级下册"},
	{place: 'Grade9Volume1', date: "九年级上册"},
	{place: 'Grade9Volume2', date: "九年级下册"},
	{place: 'EMPTY', date: ""}
];
function IsShowing(ElementId) {
	const element = document.getElementById(ElementId);
	if (!element) return false;
	const rect = element.getBoundingClientRect();
	return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}
function findTab() {
	let IsIn = 2;
	for(let i=0; i<timings.length-1; i++) {
		if(IsShowing(timings[i].place) && !IsShowing(timings[i+1].place)) {
			return i;
		}
	}
	return -1;
}
function CurbTab() {
	let p = findTab();
	let TabLast = document.getElementById('TabLast');
	let TabThis = document.getElementById('TabThis');
	let TabNext = document.getElementById('TabNext');
	if(p === -1) {
		TabLast.innerHTML = "";
		TabThis.innerHTML = "";
		TabNext.innerHTML = "";
	} else {
		if(p-1 >= 0) TabLast.innerHTML = timings[p-1].date;
		else TabLast.innerHTML = "";
		TabThis.innerHTML = timings[p].date;
		if(p+1 < timings.length) TabNext.innerHTML = timings[p+1].date;
		else TabNext.innerHTML = "";
	}
}
setInterval(CurbTab, 0);

function PassingTime() {
	let time = new Date() - new Date(2024, 5, 2, 21, 0, 0);
	let year = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
	let month = Math.floor((time % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
	let day = Math.floor((time % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
	let hour = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	let minute = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
	let second = Math.floor((time % (60 * 1000)) / 1000);
	let PrintTime= "";
	if(year > 0) PrintTime += year + "年";
	if(month > 0) PrintTime += month + "个月";
	if(day > 0) PrintTime += day + "天";
	if(hour > 0) PrintTime += hour + "小时";
	if(minute > 0) PrintTime += minute + "分钟";
	if(second > 0) PrintTime += second + "秒";
	let Time = document.getElementById("Time");
	if(Time!=null) Time.innerHTML = "我们的回忆就在" + PrintTime + "前";
}

function ShowTime() {
	if(document.getElementById('Time')==null) {
		if(Progress() >= 75 || isNaN(Progress())) {
			let P = document.createElement('p');
			P.id = 'Time';
			P.className = 'Time';
			document.body.appendChild(P);
		}
	} else {
		PassingTime();
	}
}
setInterval(ShowTime, 0);

const Musics = [
	{name: "记念", url: "../Music/记念.flac"},
	{name: "窗外的月光", url: "../Music/窗外的月光.flac"},
]
let ThisMusic = 0;
const Music = document.getElementById('Music');
let flag = false;
if (!flag) {
	document.addEventListener('keydown', function () {
		Music.play();
		flag = true;
	});
	document.addEventListener('mousemove', function () {
		Music.play();
		flag = true;
	});
}
Music.addEventListener('ended', function () {
	Music.src = Musics[++ThisMusic % Musics.length].url;
	Music.play();
});

