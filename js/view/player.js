song = {
	name: "",
	artist: "",
	url_fragment: false,
	progress: 0,
	duration: 0,
	started_at: 0
};

room = {
	name: "",
	dj: "",
	description: "",
	user_counter: 0,
	queue_counter: 0,
	id: "",
	user_list: [],
	queue: [],
	history: [],
	enabled: false
};

yt_player = false;
youtube_ready = false;
player_initialized = false;
authkey = false;
var volumeBeforeMute;

function onYouTubeIframeAPIReady() {
	youtube_ready = true;
}

function loadVideoById(id, time) {
	if(id == "") return false;
	$("#no_video").hide();
	$("#main_content").show();
	if(!youtube_ready) return false;

	console.log(player_initialized);

	if (!player_initialized) {
		yt_player = new YT.Player('youtube_player', {
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
				origin: "http://localhost",
				playerapiid: "yt_player",
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
		yt_player.loadVideoById({'videoId': id, 'suggestedQuality': 'hd720'});
		yt_player.seekTo(time);
	}
}

function switchClientState(state) {
	client.state = state;

	$("#now_playing_content").show();
	$("#now_playing_placeholder").hide();

	if(state == STATE_PLAYING || state == STATE_NO_SONG) {
		if(state == STATE_NO_SONG) {
			$("#no_video").show();
			$("#main_content").hide();
			$("title").html(room.name + " &middot; Totem");
			if(yt_player.pauseVideo) yt_player.pauseVideo();
		} else {
			$("#no_video").hide();
			$("#main_content").show();
			setSongInfo(song.name, song.artist);
			if(song.url_fragment) loadVideoById(song.url_fragment, Math.floor(Date.now() / 1000) - song.started_at);
		}
		$("#manual").hide();
		$("#score_wrapper").show();
		$("#room_info").show();
	} else if(state == STATE_PREVIEWING) {
		$("#room_info").hide();
		$("#manual").show();
		$("#score_wrapper").hide();
	}
}

function refreshQueueList() {
	var queue_list = $('#queue_list');

	queue_list.html('<ul class="list-row"><li class="list-title">Queue List</li></ul>');
	queue_list.height($('#chat').height()).width($('#chat').width());
	if($('#chat').css('display') !== 'block') {
		$('#chat').show().css('visibility','hidden');
		$('#queue_list').height($('#chat').height()).width($('#chat').width());
		$('#chat').hide().css('visibility', 'visible');
	}

	queue_list = $('.list-row');
	room.queue.forEach(function(q, index) {
		queue_list.append('<li class="queue-list-item"><img src="' + q.song.picture_url + '"><span class="queue-list-name">' + q.song.name + '</span><span class="queue-list-artist">' + q.song.artist + '</span><span class="queue-item-preview" onclick="previewVideo(\'' + q.song.url_fragment + '\', \'' + q.song.name.replace(/(['"])/g, "&quot;") + '\', \'' + q.song.artist.replace(/(['"])/g, "&quot;") + '\')"><i class="fa fa-play"></i> Preview</span><a class="queue-item-share" target="_blank" href="http://www.youtube.com/watch?v=' + q.song.url_fragment + '"><i class="fa fa-share-alt"></i> Share</a></li>')
	});
}

function refreshUserList() {
	var user_list = $("#user_list"), temp;

	user_list.html('<ul class="list-row list-title">Listeners</ul>');
	user_list.height($('#chat').height()).width($('#chat').width());
	if($('#chat').css('display') !== 'block') {
		$('#chat').show().css('visibility','hidden');
		$('#user_list').height($('#chat').height()).width($('#chat').width());
		$('#chat').hide().css('visibility', 'visible');
	}

	user_list = $('.list-row');
	room.user_list.forEach(function(username, index) {
		temp = username.toLowerCase(),
			dname = display_name.toLowerCase();

		if(temp == dname) {
			user_list.append('<li class="list-item list-item-small"><span class="chat-you">' + username + '</span></li>');
		} else if(temp == "dcv" || temp == "williamtdr") {
			user_list.append('<li class="list-item list-item-small"><span class="chat-dev">' + username + '</span></li>');
		} else {
			user_list.append('<li class="list-item list-item-small"><span>' + username + '</span></li>');
		}
	});
}

function setSongInfo(title, artist) {
	if(title.length > 80) title = $.trim(title).substring(0, 80).split(" ").slice(0, -1).join(" ") + "…";
	if(artist.length > 40) artist = $.trim(artist).substring(0, 40).split(" ").slice(0, -1).join(" ") + "…";

	if(player.state == STATE_PLAYING) {
		$("title").html(title + " · " + artist + " · " + room.name + " · Totem");
	} else {
		$("title").html(title + " · " + artist + " · Totem");
	}
	$(".title_display").html(title);
	$(".artist_display").html(artist);
}

function setScore(positive, negative) {
	$("#score-positive").html(positive);
	$("#score-negative").html(negative);
}

function vote(vote) {
	$(".activated").removeClass("activated");
	if(client.vote == vote) {
		server.send(JSON.stringify({
			event: "vote",
			key: authkey,
			vote: VOTE_NEUTRAL
		}));
		client.vote = VOTE_NEUTRAL;
	} else {
		switch(vote) {
			case VOTE_NEGATIVE:
				$("#score-negative-wrapper").addClass("activated");
				break;
			case VOTE_POSITIVE:
				$("#score-positive-wrapper").addClass("activated");
				break;
		}
		server.send(JSON.stringify({
			event: "vote",
			key: authkey,
			vote: vote
		}));
		client.vote = vote;
	}
}

function replaceTwemoji(name) {
	return "<div title=':"+ name +":' class='twa twa-"+ name +"'> </div>";
}

function counterUpdate() {
	$("#room-users").find('.number').html(room.user_counter);
	$("#room-queue").find('.number').html(room.queue.length);
}

function updateRoomMetadata() {
	$(".room-title").html(room.name);
	$("#room_description").html(room.description);
}

function addChatMessage(sender, text) {
	chatmessage = text.trim();
	chatclass = " ";
	if(chatmessage.toLowerCase().indexOf("@" + display_name) > -1) {
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
	if(chatmessage.match("[ ]*")) {
		console.log("only spaces")
	}
	if(chatmessage.indexOf("*") > -1) {
		var asterisktally = 0;
		var msplit = chatmessage.split("");
		var msplitl = msplit.length;
		for (var i = 0; i < msplitl; i++) {
			if(msplit[i] == "*") {
				if(asterisktally == 0) {
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
		if(asterisktally == 1) {
			chatmessage = cmp;
		}
	}
	if(chatmessage.indexOf("_") > -1) {
		var uscoretally = 0;
		var msplit = chatmessage.split("");
		var msplitl = msplit.length;
		for (var i = 0; i < msplitl; i++) {
			if(msplit[i] == "_") {
				if(uscoretally == 0) {
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
		if(uscoretally == 1) {
			chatmessage = cmp;
		}
	}
	if(chatmessage.indexOf("http://") > -1 || chatmessage.indexOf("https://") > -1) {
		var msplit = chatmessage.split(" ");
		var msplitl = msplit.length;
		for (var i = 0; i < msplitl; i++) {
			console.log(msplit[i] + " msplit")
			if(msplit[i].startsWith("http://") || msplit[i].startsWith("https://")) {
				var omlink = msplit[i];
				var mlink = msplit[i];
				if(mlink.indexOf("<i>") > -1) {
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
	if(sendercheck == "dcv" || sendercheck == "williamtdr") {
		senderclass = senderclass + " chat-dev ";
	}
	if(sendercheck == "encadyma" || sendercheck == "tugaaa" || sendercheck == "xbytez" || sendercheck == "felicity" || sendercheck == "koolkidkenny" || sendercheck == "not trevor" || sendercheck == "pogodaanton" || sendercheck == "vitals") {
		senderclass = senderclass + " chat-beta ";
	}
	if(sendercheck == display_name.toLowerCase()) {
		senderclass = senderclass + " chat-you ";
	}

	if(chatmessage.length > 0) {
		var chat_text = $(".chat-text");
		chat_text.append('<span class="chat-message-wrapper' + chatclass + '"><span class="chat-message-sender' + senderclass + '">' + sender + '</span> <span class="chat-message-text">' + emoji.parseMessage(chatmessage) + '</span></span>');
		$.each(chat_text, function(index, el) {
			$(el).scrollTop(el.scrollHeight);
		});
	}
}

function playerOnLogin() {
	if(authkey == 'unauthenticated') {
		$(".chat_textbox").html('<div class="chatbox-placeholder"><a class="signInButton">Log in</a> to chat</div>');

		$("#playlist_list")
			.addClass("sidebar-no-login")
			.append('<a class="signInButton">Log in</a> to see your playlists');
	} else {
		$(".chat_textbox").html('<span title=":grinning:" class="twa twa-grinning chat_emojisel"></span><input type="text" class="form-control chat_message" placeholder="Say something nice"><span class="input-group-btn"><button class="btn btn-primary chat_send" type="button">Send</button></span>');

		loadYoutubePlaylists();
	}

	$(".chat_message").keyup(function(event) {
		if(event.keyCode == 13) {
			$(".chat_send").click();
		}
	});

	$(".chat_send").click(function() {
		$(".chat_message").each(function(index, e) {
			var message = $(e).val();
			if(message == "/help" || message == "!help" || message == "/?") {
				$("#commands_modal").modal();
			} else {
				if(message.length > 0) {
					server.send(JSON.stringify({
						event: "chat",
						data: message,
						key: authkey
					}));
				}
			}
		});
		$(".chat_message").val("");
	});
}

function togglePlayerVisibility() {
	var yt_player_el = $("#youtube_player");
	var visible_emblem = $(".fa-eye");
	var hidden_emblem = $(".fa-eye-slash");
	if(client.player_shown) {
		visible_emblem.toggleClass("fa-eye-slash");
		visible_emblem.toggleClass("fa-eye");

		yt_player_el.animate({
			opacity: 0,
			height: '0px'
		}, 500, function() {
			$("#youtube_player").hide();
		});
		client.player_shown = false;
		window.localStorage.setItem("hide_video", true);
	} else {
		hidden_emblem.toggleClass("fa-eye");
		hidden_emblem.toggleClass("fa-eye-slash");

		yt_player_el.show();
		yt_player_el.animate({
			opacity: 1,
			height: '100%'
		}, 500);
		client.player_shown = true;
		window.localStorage.setItem("hide_video", false);
	}
}

function initPlayerToggles() {
	$("#score-positive-wrapper").click(function() {
		return vote(VOTE_POSITIVE)
	});
	$("#score-negative-wrapper").click(function() {
		return vote(VOTE_NEGATIVE)
	});

	$("#video-toggle").click(togglePlayerVisibility);

	$("#volume-toggle").click(function() {
		if(client.muted) {
			yt_player.setVolume(volumeBeforeMute);
			$("#volume-slider").val(volumeBeforeMute);
			$(".fa-volume-off").addClass("fa-volume-down");
			$(".fa-volume-down").removeClass("fa-volume-off");
			client.muted = false;
		} else {
			volumeBeforeMute = yt_player.getVolume();
			yt_player.setVolume(0);
			$("#volume-slider").val(0);
			$(".fa-volume-down").addClass("fa-volume-off");
			$(".fa-volume-off").removeClass("fa-volume-down");
			client.muted = true;
		}
	});

	$("#add-to-queue").click(function() {
		addCurrentSongToQueue();
	});

	//Roomlist height resize
	$(window).on('resize', function() {
		if($('#user_list').css('display') == 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#user_list').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		} else if($('#queue_list').css('display') == 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#queue_list').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		} else
			return false;
	});

	$('.chat_emojisel').click(toggleEmojiList);

	$('#room-queue').click(function() {
		if(!room.queue.length) {
			noty({
				text: "No songs are in the queue.",
				theme: 'relax',
				dismissQueue: true,
				type: "info",
				layout: "topRight",
				animation: {
					open: {height: 'toggle'},
					close: {height: 'toggle'}
				},
				timeout: 5000
			});
			return false;
		}

		toggleBoxes('queue_list');

		refreshQueueList();
	});

	$('#room-users').click(function() {
		if(!room.user_list.length) {
			return false;
		}

		toggleBoxes('user_list');

		refreshUserList();
	});
}

function toggleBoxes(exceptId) {
	var tempEl,
		toShow = $('#' + exceptId),
		isVisible = (toShow.css('display') == 'block');

	if(isVisible) {
		toShow.fadeOut('fast');
		$('.chat').fadeIn('fast');
		return false;
	}

	$('.toToggle').each(function() {
		tempEl = $(this);
		if(tempEl.attr('id') !== exceptId) {
			tempEl.fadeOut('fast');
			return;
		}

		tempEl.fadeIn('fast');
	});
}

function toggleEmojiList() {
	$('.chat-emojilist').toggle().empty();

	var emojiList = emojiListString.replace(/_/g,'-').split(',');
	for (var x in emojiList)
		$('.chat-emojilist').append('<span title=":'+ emojiList[x] +':" class="twa twa-'+ emojiList[x] +'"></span>')
}

var room_hash = window.location.hash.replace("#", "");
if(room_hash.length > 0) {
	room.id = room_hash;
	room.enabled = true;
}