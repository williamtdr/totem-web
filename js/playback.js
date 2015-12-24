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
	if (!room.isUserQueued && !room.willAddToQueue) {
		server.send(JSON.stringify({
			"event": "queue",
			"song": {
				url_fragment: id
			},
			"key": authkey
		}));
		
		room.isUserQueued = true;
	}
	
	local_queue.push(id);
	localStorage.setItem("Queue", JSON.stringify(local_queue));

	if(client.state != STATE_NO_SONG) {
		var target = $("[data-id='" + id + "']");
		target.html('<i class="fa fa-trash-o"></i>Remove From Queue');
		target.unbind("click");
		target.click(function(e) {
			var target = $(e.target);
			removeFromQueueById(target.data('id'));
		});
		updateLocalQueue();
	} else {
		setTimeout(function() {
			$("[data-id='" + id + "']").html('<i class="fa fa-play"></i>Playing').unbind("click").addClass("playing-indicator");
		}, 500);
	}

	switchView(VIEW_PLAYER);
	if(client.state != STATE_PLAYING) switchClientState(STATE_PLAYING);
}

function updateLocalQueue() {
	var my_queue = $("#my_queue"),
		container = $("#queue_view_container"),
		view = $("#queue_view");

	if(local_queue.length > 0) {
		$("#my_queue").show();
	} else {
		$("#my_queue").hide();
		if(container.is(":visible")) container.animate({height: "toggle"});
	}
	view.empty();
	for(var index in local_queue) {
		var item = local_queue[index];
		if(song_info_cache[item]) {
			var data = song_info_cache[item],
				id = data.thumbnail.substr(23, 11);
			view.append('<li class="playlist"><img class="queue-item-thumbnail" src="' + data.thumbnail + '" onclick="previewVideo(\'' + id + '\', \'' + data.name.replace(/(['"])/g, "&quot;") + '\', \'' + data.artist + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">'+ data.artist + ' - ' + data.name + '</span></div><span class="queue-item-preview" onclick="previewVideo(\'' + id + '\', \'' + data.name.replace(/(['"])/g, "&quot;") + '\', \'' + data.artist + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-delete" onclick="removeFromQueueById(\'' + item + '\')"><i class="fa fa-trash-o"></i>Remove</span></li>');
		} else {
			$.ajax({
				url: "http://api.totem.fm/youtube/getSongInfo.php?id="+ item,
				dataType: "jsonp",
				async	: false,
				success: function(data) {
					var id = data.thumbnail.substr(23, 11);
					song_info_cache[id] = data;
					view.append('<li class="playlist"><img class="queue-item-thumbnail" src="' + data.thumbnail + '" onclick="previewVideo(\'' + id + '\', \'' + data.name.replace(/(['"])/g, "&quot;") + '\', \'' + data.artist + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">'+ data.artist + ' - ' + data.name + '</span></div><span class="queue-item-preview" onclick="previewVideo(\'' + id + '\', \'' + data.name.replace(/(['"])/g, "&quot;") + '\', \'' + data.artist + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-delete" onclick="removeFromQueueById(\'' + id + '\')"><i class="fa fa-trash-o"></i>Remove</span></li>');
				}
			});
		}
	}

}

function initQueue() {
	var my_queue = $("#my_queue"),
		container = $("#queue_view_container"),
		view = $("#queue_view");
		
	if (local_queue.length > 0) {
		$("#my_queue").show();
		updateLocalQueue();
	}
		
	my_queue.click(function () {
		if(container.css("display") == "block") {
			my_queue.removeAttr("style").show();
		} else {
			my_queue.css("color", "#fff");
		}
		container.animate({height: "toggle"});
	});
}

function removeFromQueueById(id) {
	if(local_queue[0] == id) {
		server.send(JSON.stringify({
			"event": "revoke_queue",
			"key": authkey
		}));
	}
	for(var index in local_queue) {
		if(local_queue[index] == id) {
			local_queue.splice(index, 1);
		}
	}
	var target = $("[data-id='" + id + "']");
	target.html('<i class="fa fa-plus"></i> Add to Queue');
	target.unbind("click");
	target.click(function(e) {
		var target = $(e.target);
		addToQueueById(target.data('id'));
	});
	window.localStorage.setItem("Queue", local_queue);
	updateLocalQueue();
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
	
	queue.push(id);
	localStorage.setItem("Queue", JSON.stringify(queue));

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