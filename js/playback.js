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
	$('#time_elapsed').css('width','calc(100% - '+ Math.floor((room.dj.length * 10) + 70) +'px)');
	// Above is a temporary fix for the username messing up the video sometimes... get order of things better so this isn't a problem
	song.progress = yt_player.getCurrentTime();

	var time_remaining = new Date((yt_player.getDuration() - yt_player.getCurrentTime()) * 1000);
	$("#time-remaining").html(time_remaining.getMinutes() + ":" + zeroPad(time_remaining.getSeconds(), 2));
}, 200);

youtube_ready = false;
authkey = false;
room_name = "";
function onYouTubeIframeAPIReady() {
	youtube_ready = true;
}

function loadVideoById(id, time) {
	$("#no_video").attr("hidden", "hidden");
	$("#main_content").removeAttr("hidden");
	if (!player_initialized) {
		player = new YT.Player('player', {
			height: '390',
			width: '640',
			videoId: id,
			playerVars: {
				autoplay: 1,
				border: 0,
				cc_load_policy: 0,
				controls: 0,
				disablekb: 1,
				enablejsapi: 1,
				hd: 1,
				playsinline: 1,
				iv_load_policy: 3,
				modestbranding: 1,
				origin: "http://totem.fm",
				playerapiid: "player",
				rel: 0,
				showinfo: 0,
				showsearch: 0,
				start: time
			},
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});

		player_initialized = true;
	} else {
		player.loadVideoById({'videoId': id, 'suggestedQuality': 'large'});
		player.seekTo(time);
	}
}

function setSongInfo(title, artist) {
	if(title.length > 80) title = $.trim(title).substring(0, 80).split(" ").slice(0, -1).join(" ") + "…";
	if(artist.length > 40) artist = $.trim(artist).substring(0, 40).split(" ").slice(0, -1).join(" ") + "…";

	if (mode == 0) {
		$("title").html(title + " · " + artist + " · " + room_name + " · Totem");
	} else {
		$("title").html(title + " · " + artist + " · Totem");
	}
	$(".title_display").html(title);
	$(".artist_display").html(artist);
}

function setScore(positive, negative) {
	$(".score-positive").html(positive);
	$(".score-negative").html(negative);
}

function vote(type) {
	$(".activated").removeClass("activated");
	switch (type) {
		case -1:
			$(".score-negative-wrapper").addClass("activated");
			break;
		case 1:
			$(".score-positive-wrapper").addClass("activated");
			break;
	}
	server.send(JSON.stringify({
		event: "vote",
		key: authkey,
		vote: type
	}));
}

var replaceTwemoji = function(emoji, name) {
	var emojifiedString = "<div title=':"+ name +":' class='twa twa-"+ name +"'> </div>";
	return emojifiedString;
}

function addChatMessage(sender, text) {
	chatmessage = text.trim();
	chatclass = " ";
	if (chatmessage.toLowerCase().indexOf("@" + display_name) > -1) {
		if (! data.sender) { } else {
			var audio = new Audio('https://rawgit.com/dcvslab/dcvslab.github.io/master/badoop.mp3');
			audio.play();
			var chatmessage = chatmessage.replace("@" + display_name, "<b>@" + display_name + "</b>");
			var chatclass = " chat-tag ";
			noty({
				text: data.sender + ": " + chatmessage,
				theme: 'relax',
				dismissQueue: true,
				type: "information",
				layout: "topRight",
				animation: {
					open: {height: 'toggle'},
					close: {height: 'toggle'}
				},
				timeout: 5000
			});
		}
	}
	if (chatmessage.match("[ ]*")) {
		console.log("only spaces")
	}
	if (chatmessage.indexOf("*") > -1) {
		var asterisktally = 0;
		var msplit = chatmessage.split("");
		var msplitl = msplit.length;
		for (var i = 0; i < msplitl; i++) {
			if (msplit[i] == "*") {
				if (asterisktally == 0) {
					cmp = chatmessage;
					chatmessage = chatmessage.replace("*", "<b>");
					asterisktally = 1;
				} else {
					cmp = chatmessage;
					chatmessage = chatmessage.replace("*", "</b>");
					asterisktally = 0;
				}
			}
		}
		if (asterisktally == 1) {
			chatmessage = cmp;
		}
	}
	if (chatmessage.indexOf("_") > -1) {
		var uscoretally = 0;
		var msplit = chatmessage.split("");
		var msplitl = msplit.length;
		for (var i = 0; i < msplitl; i++) {
			if (msplit[i] == "_") {
				if (uscoretally == 0) {
					cmp = chatmessage;
					chatmessage = chatmessage.replace("_", "<i>");
					uscoretally = 1;
				} else {
					cmp = chatmessage;
					chatmessage = chatmessage.replace("_", "</i>");
					uscoretally = 0;
				}
			}
		}
		if (uscoretally == 1) {
			chatmessage = cmp;
		}
	}
	if (chatmessage.indexOf("http://") > -1 || chatmessage.indexOf("https://") > -1) {
		var msplit = chatmessage.split(" ");
		var msplitl = msplit.length;
		for (var i = 0; i < msplitl; i++) {
			console.log(msplit[i] + " msplit")
			if (msplit[i].startsWith("http://") || msplit[i].startsWith("https://")) {
				var omlink = msplit[i];
				var mlink = msplit[i];
				if (mlink.indexOf("<i>") > -1) {
					mlink = mlink.replace(/<i>/g, "_");
					mlink = mlink.replace(/<\/i>/g, "_");
				}
				mlink = "<a href='" + mlink + "' target='_blank'>" + mlink + "</a>";
				chatmessage = chatmessage.replace(omlink, mlink)
			}
		}
	}
	var sendercheck = sender.toLowerCase().toString();
	var senderclass = "";
	if (sendercheck == "dcv" || sendercheck == "williamtdr") {
		senderclass = senderclass + " chat-dev ";
	}
	if (sendercheck == "encadyma" || sendercheck == "tugaaa" || sendercheck == "xbytez" || sendercheck == "felicity" || sendercheck == "koolkidkenny" || sendercheck == "not trevor" || sendercheck == "pogodaanton" || sendercheck == "vitals") {
		senderclass = senderclass + " chat-beta ";
	}
	if (sendercheck == display_name.toLowerCase()) {
		senderclass = senderclass + " chat-you ";
	}
	
	if (chatmessage.length > 0) {
		var chat_text = $(".chat-text");
		chat_text.append('<span class="chat-message-wrapper' + chatclass + '"><span class="chat-message-sender' + senderclass + '">' + sender + '</span> <span class="chat-message-text">' + emojify.replace(chatmessage, replaceTwemoji) + '</span></span>');
		$.each(chat_text, function(index, el) {
			$(el).scrollTop(el.scrollHeight);
		});
	}
}

function getYoutubeRate(videoId) {
	var container = $('.youtubeRate');

	$.ajax({
		url: config.API + '/youtube/video.php',
		data: $.param({
			id: videoId,
			action: 'status'
		}),
		jsonp: "callback",
		dataType: "jsonp",
		success: function (r) {
			if (r.success) {
				container.find('.rate')
					.text((r.message == 'like') ? 'Unlike' : 'Like');

				container.attr('data-videoid', videoId);
				container.show();

				return false;
			}

			console.warn(r);
		}
	});
}

function counterUpdate(data) {
	$("#room-users")
		.find('.number').html(data.user_counter);
	$("#room-queue")
		.find('.number').html(data.queue_counter || data.queue_size);
}

function finishInit() {
	server = new WebSocket(config.SERVER, 'echo-protocol');

	server.onclose = function () {
		$("#disconnected").removeAttr("hidden");
		var bgshader = $("#background_shader");
		bgshader.css("z-index", "8000");
		bgshader.animate({
			opacity: 1
		}, 500);
		setInterval(function () {
			disconnect_timer--;
			$("#disconnected-countdown").html(disconnect_timer);
			if (disconnect_timer == 0) {
				window.location.reload();
			}
		}, 1000);
	};

	$("#skip_song").click(function () {
		server.send(JSON.stringify({
			event: "skip",
			key: authkey
		}));
	});

	if (force_room || (window.location.hash !== "" && window.location.hash.length > 0)) {
		window.location.hash = room;
		server.onopen = function () {
			server.send(JSON.stringify({
				event: "login",
				key: authkey,
				room: room
			}));
		}
	}

	server.onmessage = function (event) {
		event_data = JSON.parse(event.data);
		data = event_data.data;
		console.log(event_data);

		switch (event_data.event) {
			case "room_data": // called to initialize room
				room_name = data.display_name;
				$("#room-description").html(data.description);
				$(".room-title").html(data.display_name);
				user_list = data.listeners_by_name;

				counterUpdate(data);

				if (data.song) {
					started = data.song.started_at;
					now = Math.floor(Date.now() / 1000);
					difference = now - started;

					loadVideoById(data.song.url_fragment, difference);

					setSongInfo(data.song.name, data.song.artist);
					setScore(data.score.positive, data.score.negative);
					$("#current-dj-wrapper").removeAttr("hidden");
					$(".current-dj").html(data.current_dj);

					last_title = data.song.name;
					last_artist = data.song.artist;
					last_url_fragment = data.song.url_fragment;
					started_at = Math.floor(Date.now() / 1000);

					nothing_playing = false;

					getYoutubeRate(data.song.url_fragment);

					queuedSongs = data.queue;
					
					$('#time_elapsed').attr('style','width: calc(100% - '+ Math.floor($('.current-dj-wrapper').width() + $('#time-remaining').width() + 20) +'px);')
				} else {
					$("#main_content").attr("hidden", "hidden");
					$("#no_video").removeAttr("hidden");
					nothing_playing = true;
				}

				$.each(data.chat_history, function (index, chat_obj) {
					addChatMessage(chat_obj.sender, chat_obj.message);
				});
				break;
			case "score_update":
				setScore(data.positive, data.negative);
				break;
			case "count_update":
				counterUpdate(data);
				break;
			case "notification":
				noty({
					text: data.text,
					theme: 'relax',
					dismissQueue: true,
					type: data.type,
					layout: "topRight",
					animation: {
						open: {height: 'toggle'},
						close: {height: 'toggle'}
					},
					timeout: 5000
				});

				break;
			case "user_list_change":
				user_list = data;
				refreshUserList();

				break;
			case "song_change":
				$(".activated").removeAttr("activated");
				$(".history-content").append('<li class="list-group-item playlist" onclick="loadVideo(\'' + data.song.url_fragment + '\', \'' + data.song.name.replace("'", "&quot;") + '\', \'' + data.song.artist.replace("'", "&quot;") + '\')"><img class="playlist-item-thumbnail" src="' + data.song.picture_url + '"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + data.song.name + '</span><span class="playlist-item-artist-container">by <span class="playlist-item-artist">' + data.song.artist.replace("'", "&quot;") + '</span></span></div></li>');
				if (mode == 0) {
					loadVideoById(data.song.url_fragment, 0);

					setSongInfo(data.song.name, data.song.artist);

					var n = noty({
						text: data.dj + " is playing " + data.song.artist + " - " + data.song.name,
						theme: 'relax',
						dismissQueue: true,
						type: "information",
						layout: "topRight",
						animation: {
							open: {height: 'toggle'},
							close: {height: 'toggle'}
						},
						timeout: 10000
					});

					$("#current-dj-wrapper").removeAttr("hidden");
					$(".current-dj").html(data.dj);
					$("#main_content").removeAttr("hidden");
					$("#no_video").attr("hidden", "hidden");
					last_title = data.song.name;
					last_artist = data.song.artist;
					last_url_fragment = data.song.url_fragment;
					started_at = Math.floor(Date.now() / 1000);
					nothing_playing = false;
					setScore(0, 0);
					$('#time_elapsed').attr('style','width: calc(100% - '+ Math.floor($('.current-dj-wrapper').width() + $('#time-remaining').width() + 20) +'px)')

					getYoutubeRate(data.song.url_fragment);
				}

				advanceBackgroundImage();

				break;
			case "chat":
				addChatMessage(data.sender, data.message);

				break;
			case 'queue_change':
				queuedSongs = data;
				refreshQueueList();

				break;
			default:
				console.warn('Unhandled event: ' + event_data.event);

				break;
		}
	};

	sidebarInit();
}

initDelayTimer = setInterval(function () {
	if (youtube_ready && authkey) {
		finishInit();
		clearTimeout(initDelayTimer);
	}
	if (force_room) {
		$("#now_playing_content").removeAttr("hidden");
		$("#now_playing_placeholder").attr("hidden", "hidden");
	}
}, 100);
>>>>>>> origin/master
