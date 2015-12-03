function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.getElementById("background_layer").setAttribute('style', 'background: url("http://d35y9swri9q567.cloudfront.net/background/' + getRandomInt(1, 572) + '.jpg") no-repeat center center fixed; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover;');
var time = 10;
var timer = document.getElementById("time");
function countDown() {
	setTimeout(function() {
		time = time - 1;
		if(time == 0) {
			location.href = "http://totem.fm";
		}
		timer.innerHTML = time;
		countDown();
	}, 1000);
}
countDown();