var song_info_cache = {};

function previewVideo(id, title, artist) {
	setSongInfo(title, artist);
	client.stateBefore = STATE_PREVIEWING;

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
		var vol = $("#volume-slider").val();
		yt_player.setVolume(vol);
		window.localStorage.setItem('volume', vol);
	});
	
	event.target.playVideo();
}

function onPlayerStateChange(event) {
	song.progress = yt_player.getCurrentTime();
	song.duration = yt_player.getDuration();
	artist_display_selector = $(".artist_display");
	if(artist_display_selector.html() == "" && yt_player.getVideoData().author != "") {
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
		event: "queue_append",
		data: id,
		key: authkey
	}));
}

function updateMyQueue() {
	var my_queue = $("#my_queue"),
		view = $("#queue_view");

	if(client.queue.length > 0) {
		$("#my_queue").show();
	} else {
		$("#my_queue").hide();
		if(view.is(":visible")) view.animate({height: "toggle"});
	}
	view.empty();
	for(var index in client.queue) {
		var item = client.queue[index];
		view.append('<li class="playlist"><img class="queue-item-thumbnail" src="' + item.thumbnail + '" onclick="previewVideo(\'' + item.id + '\', \'' + item.name.replace(/(['"])/g, "&quot;") + '\', \'' + item.artist + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">'+ item.artist + ' - ' + item.name + '</span></div><span class="queue-item-preview" onclick="previewVideo(\'' + item.id + '\', \'' + item.name.replace(/(['"])/g, "&quot;") + '\', \'' + item.artist + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-delete" onclick="removeFromQueueById(\'' + item.id + '\')"><i class="fa fa-trash-o"></i>Remove</span></li>');
	}
}

function initQueue() {
	var my_queue = $("#my_queue"),
		view = $("#queue_view");
		
	if (client.queue.length > 0) {
		$("#my_queue").show();
		updateMyQueue();
	}
		
	my_queue.click(function () {
		if(view.css("display") == "block") {
			my_queue.removeAttr("style").show();
		} else {
			my_queue.css("color", "#fff");
		}
		view.animate({height: "toggle"});
	});
}

function removeFromQueueById(id) {
	server.send(JSON.stringify({
		event: "queue_remove",
		data: id,
		key: authkey
	}));
}

function addCurrentSongToQueue() {
	mode = 0;
	$("#room_info").show();
	$("#score_wrapper").show();
	$("#manual").hide();

	server.send(JSON.stringify({
		event: "queue_append",
		data: yt_player.getVideoData().video_id,
		key: authkey
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