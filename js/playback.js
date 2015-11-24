function previewVideo(id, title, artist) {
	setSongInfo(title, artist);

	loadVideoById(id, 0);
	switchClientState(STATE_PREVIEWING);
	switchView(VIEW_PLAYER);
	$("#now_playing_content").show();
	$("#now_playing_placeholder").hide();

	advanceBackgroundImage();
}

function onPlayerReady(event) {
	if(window.localStorage.getItem("volume") != undefined) {
		yt_player.setVolume(window.localStorage.getItem("volume"));
	} else {
		yt_player.setVolume(50);
	}

	$("#volume-slider").on('input', function(e) {
		vol = $("#volume-slider").val();
		yt_player.setVolume(vol);
		window.localStorage.setItem('volume', vol);
	});

	event.target.playVideo();
}

function onPlayerStateChange(event) {
	song.progress = yt_player.getCurrentTime();
	song.duration = yt_player.getDuration();
	artist_display_selector = $(".artist_display");
	if(artist_display_selector.html() == "") {
		artist_display_selector.html(yt_player.getVideoData().author);
		$("title").html($(".title_display").html() + " · " + yt_player.getVideoData().author + " · Totem");
	}

	if(event.data == 0) {
		if((yt_player.getCurrentTime() + 1) > yt_player.getDuration()) {
			switchClientState(STATE_NO_SONG);
		}
	} else {
		if(event.data == 2 && client.state != STATE_NO_SONG) { // user clicked the video to pause it. nope.
			yt_player.playVideo();
		}
	}
}

function addToQueueById(id) {
	server.send(JSON.stringify({
		"event": "queue",
		"song": {
			url_fragment: id
		},
		"key": authkey
	}));

	switchView(VIEW_PLAYER);
	if(client.state != STATE_PLAYING) switchClientState(STATE_PLAYING);
}

function addCurrentSongToQueue() {
	mode = 0;
	$("#room_info").show();
	$("#score_wrapper").show();
	$("#manual").hide();

	server.send(JSON.stringify({
		"event": "queue",
		"song": {
			url_fragment: yt_player.getVideoData().video_id
		},
		"key": authkey
	}));

	switchClientState(STATE_PLAYING);
	switchView(VIEW_PLAYER);
}

if(window.localStorage.getItem("hide_video") == "true") togglePlayerVisibility();

$("#volume-slider").val(window.localStorage.getItem("volume"));

setInterval(function() {
	if(yt_player.getDuration == undefined) return false;

	$("#time_elapsed div").css("width", (yt_player.getCurrentTime() / yt_player.getDuration()) * 100 + '%');
	$('#time_elapsed').css('width','calc(100% - '+ Math.floor((room.dj.length * 15) + 70) +'px)');
	// Above is a temporary fix for the username messing up the video sometimes... get order of things better so this isn't a problem
	if(client.state == STATE_PLAYING) song.progress = yt_player.getCurrentTime();

	var time_remaining = new Date((yt_player.getDuration() - yt_player.getCurrentTime()) * 1000);
	$("#time-remaining").html(time_remaining.getMinutes() + ":" + zeroPad(time_remaining.getSeconds(), 2));
}, 200);