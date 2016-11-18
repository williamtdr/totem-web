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
	yt_player.setVolume(window.localStorage.getItem("volume") === undefined ? 50 : window.localStorage.getItem("volume"));

	$("#volume-slider").on("input", function() {
		const vol = $("#volume-slider").val();

		yt_player.setVolume(vol);
		window.localStorage.setItem("volume", vol);
	});
	
	event.target.playVideo();
}

function onPlayerStateChange(event) {
	song.progress = yt_player.getCurrentTime();
	song.duration = yt_player.getDuration();
	artist_display_selector = $(".artist_display");
	if(artist_display_selector.html() === "" && yt_player.getVideoData().author != "") {
		artist_display_selector.html(yt_player.getVideoData().author);
		$("title").html($(".title_display").html() + " · " + yt_player.getVideoData().author + " · Totem");
	}

	if(event.data === 0) {
		if((yt_player.getCurrentTime() + 1) > yt_player.getDuration()) {
			switchClientState(STATE_NO_SONG);
		}
	} else {
		if(event.data === 2 && client.state != STATE_NO_SONG) { // user clicked the video to pause it. nope.
			yt_player.playVideo();
		}
	}
}

function addToQueueById(id, dom) {
	server.send(JSON.stringify({
		event: "queue_append",
		data: id,
		key: authkey
	}));
	$("[data-id='" + id + "']:not(.in-room-queue)").addClass('click_disabled');
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
		view.append('<li class="playlist_item"><img src="' + item.thumbnail + '" onclick="previewVideo(\'' + item.id + '\', \'' + item.name.replace(/(['"])/g, "&quot;") + '\', \'' + item.artist + '\')"><div class="playlist_item_title_container"><span class="playlist_item_title">'+ item.artist + ' - ' + item.name + '</span></div><span class="sidebar_queue_list_item_preview" onclick="previewVideo(\'' + item.id + '\', \'' + item.name.replace(/(['"])/g, "&quot;") + '\', \'' + item.artist + '\')"><span class="icon-play" style="vertical-align: 12%"></span> Preview</span><span class="playlist_item_delete" onclick="removeFromQueueById(\'' + item.id + '\')"><i class="fa fa-trash-o"></i>Remove</span></li>');
	}
}

function initQueue() {
	var my_queue = $("#my_queue"),
		view = $("#queue_view");
		
	if(client.queue.length > 0) {
		$("#my_queue").show();
		updateMyQueue();
	}
		
	my_queue.click(function () {
		if(view.css("display") === "block") {
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
	$("[data-id='" + id + "']").addClass('click_disabled');
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

function updatePlaylist(data) {
	$(".in-room-queue").unbind().html("<i class=\"fa fa-plus\"></i> Queue").click(function(e) {
		addToQueueById($(this).data('id'));
	}).removeClass("in-room-queue");
	for(var index in client.queue) {
		var data = client.queue[index];
		$("[data-id='" + data.id + "']:not(.in-room-queue)").html("<i class=\"fa fa-trash-o\"></i> Remove").unbind().addClass("in-room-queue").click(function() {
			removeFromQueueById($(this).data('id'));
		});
	}
	$(".playing-in-room").html("<i class=\"fa fa-plus\"></i> Queue").click(function(e) {
		var target = $(e.target);
		addToQueueById(target.data('id'));
	}).removeClass("playing-in-room");
	$("[data-id='" + song.url_fragment + "']").html("<i class=\"fa fa-play\"></i> Playing").unbind().addClass("playing-in-room");
	$(".click_disabled").removeClass('click_disabled');
}

if(window.localStorage.getItem("hide_video") === "true") togglePlayerVisibility();

$("#volume-slider").val(window.localStorage.getItem("volume"));

setInterval(function() {
	if(yt_player.getDuration === undefined) return false;

	$("#time_elapsed div").css("width", (yt_player.getCurrentTime() / yt_player.getDuration()) * 100 + '%');
	$('#time_elapsed').css('width','calc(100% - '+ Math.floor((room.dj.length * 15) + 70) +'px)');
	// Above is a temporary fix for the username messing up the video sometimes... get order of things better so this isn't a problem
	if(client.state === STATE_PLAYING) song.progress = yt_player.getCurrentTime();

	var time_remaining = new Date((yt_player.getDuration() - yt_player.getCurrentTime()) * 1000);
	$("#time_remaining").html(time_remaining.getMinutes() + ":" + zeroPad(time_remaining.getSeconds(), 2));
}, 200);