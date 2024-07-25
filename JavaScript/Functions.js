function Progress(){
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
	{place: 0, content: "序"},
	{place: 10, content: "已读10%"},
	{place: 20, content: "已读20%"},
	{place: 30, content: "已读30%"},
	{place: 40, content: "已读40%"},
	{place: 50, content: "已读50%"},
	{place: 60, content: "已读60%"},
	{place: 70, content: "已读70%"},
	{place: 80, content: "已读80%"},
	{place: 90, content: "已读90%"},
	{place: 100, content: "已读100%"}
];
function CurbTab() {
	function findTab(time) {
		for(let i=0; i<timings.length-1; i++){
			if(timings[i].place<=time && time<timings[i+1].place){
				return i;
			}
		}
		return timings.length-1;
	}
	let p = findTab(Progress());
	let TabLast = document.getElementById('TabLast');
	let TabThis = document.getElementById('TabThis');
	let TabNext = document.getElementById('TabNext');
	if(p-1>=0) TabLast.innerHTML = timings[p-1].content;
	else TabLast.innerHTML = "";
	TabThis.innerHTML = timings[p].content;
	if(p+1<timings.length) TabNext.innerHTML = timings[p+1].content;
	else TabNext.innerHTML = "";
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
	function style(num) {
		if(num < 10) return "0" + num;
		else return "" + num;
	}
	let PrintTime= "";
	if(year > 0) PrintTime += year + "年";
	if(month > 0) PrintTime += style(month) + "月";
	if(day > 0) PrintTime += style(day) + "天";
	if(hour > 0) PrintTime += style(hour) + "小时";
	if(minute > 0) PrintTime += style(minute) + "分钟";
	if(second > 0) PrintTime += style(second) + "秒";
	let Time = document.getElementById("Time");
	if(Time!=null) Time.innerHTML = "我们的回忆就在" + PrintTime + "前";
}
setInterval(PassingTime, 0);

function ShowTime() {
	if(Progress() >= 75 && document.getElementById('Time')==null){
		let P = document.createElement('p');
		P.id = 'Time';
		P.className = 'Time';
		document.body.appendChild(P);
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

