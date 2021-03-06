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
	enabled: false,
	password: false,
    backgrounds: false,
	joined_at: 0,
	icon: 'http://static.totem.fm/default_notification.png'
};

yt_player = false;
youtube_ready = false;
authkey = false;
var volumeBeforeMute,
	last_chat_message = "";

function onYouTubeIframeAPIReady() {
	yt_player = new YT.Player("youtube_player", {
		height: 360,
		width: 640,
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
			playerapiid: "yt_player",
			rel: 0,
			showinfo: 0,
			showsearch: 0
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		}
	});

	youtube_ready = true;
}

function loadVideoById(id, time) {
	if(id === "")
		return false;

	$("#no_video").hide();
	$("#new_room_welcome").hide();
	$("#main_content").show();
	if(!(typeof yt_player.loadVideoById === "function")) {
		waiting_for_youtube_timer = setInterval(function() {
			if(typeof yt_player.loadVideoById === "function") {
				yt_player.loadVideoById({'videoId': song.url_fragment, 'suggestedQuality': getVideoQuality()});
				yt_player.seekTo(Math.floor(Date.now() / 1000) - song.started_at);
				clearInterval(waiting_for_youtube_timer);
			}
		}, 100);
	} else {
		yt_player.loadVideoById({'videoId': id, 'suggestedQuality': getVideoQuality()});
		yt_player.seekTo(time);
	}

	if(client.stateBefore === STATE_PREVIEWING || client.stateBefore === STATE_NO_SONG && client.state === STATE_PLAYING)
		client.stateBefore = STATE_PLAYING;
}

function backToRoom() {
	$(".current-dj-wrapper").show();
	if(song.url_fragment) {
		switchClientState(STATE_PLAYING);
	} else {
		switchClientState(STATE_NO_SONG);
	}
}

function switchClientState(state) {
	client.state = state;

	$("#now_playing_content").show();
	$("#now_playing_placeholder").hide();

	if(state === STATE_PLAYING || state === STATE_NO_SONG) {
		if(state === STATE_NO_SONG) {
			$("#no_video").show();
			$("#main_content").hide();
			$("title").html(room.name + " &middot; Totem");
			song.url_fragment = false;
			if(yt_player.pauseVideo) yt_player.pauseVideo();
		} else {
			$("#new_room_welcome").hide();
			$("#no_video").hide();
			$("#main_content").show();
			setSongInfo(song.name, song.artist);
			if(song.url_fragment) loadVideoById(song.url_fragment, Math.floor(Date.now() / 1000) - song.started_at);
		}
		$("#manual").hide();
		$("#score_wrapper").show();
		$("#room_info").show();
	} else if(state === STATE_PREVIEWING) {
		$(".current-dj-wrapper").hide();
		$("#room_info").hide();
		$("#manual").show();
		$("#score_wrapper").hide();
	}
}

function refreshQueueList() {
	var queue_list_bigscreen = $('#queue_list'),
		queue_list = $('.queue_list');

	queue_list.html('<ul class="list-row"><li class="list-title">Queue List</li></ul>');
	queue_list_bigscreen.height($('#chat').height()).width($('#chat').width());
	if($('#room_description_wrapper .room-description').height() === 0)
		queue_list_bigscreen.css('top', ($('#room_info .room-title').height() + $('#room_description_wrapper .room-description').height() + 60));
	else
		queue_list_bigscreen.css('top', ($('#room_info .room-title').height() + $('#room_description_wrapper .room-description').height() + 70));
	
	if($('#chat').css('display') !== 'block') {
		$('#chat').show().css('visibility','hidden');
		queue_list_bigscreen.height($('#chat').height()).width($('#chat').width());
		$('#chat').hide().css('visibility', 'visible');
	}

	queue_list = $('.queue_list .list-row');
	room.queue.forEach(function(q, index) {
		queue_list.append('<li class="sidebar_queue_list_item"><img src="' + q.song.picture_url + '"><span class="sidebar_queue_list_item_title">' + q.song.name + '</span><span class="sidebar_queue_list_item_artist">' + q.song.artist + '</span><span class="sidebar_queue_list_item_preview" onclick="previewVideo(\'' + q.song.url_fragment + '\', \'' + q.song.name.replace(/(['"])/g, "&quot;") + '\', \'' + q.song.artist.replace(/(['"])/g, "&quot;") + '\')"><span class="icon-play" style="vertical-align: 12%"></span> Preview</span><a class="sidebar_queue_list_item_share" target="_blank" href="http://www.youtube.com/watch?v=' + q.song.url_fragment + '"><i class="fa fa-share-alt"></i> Share</a></li>')
	});
}

function refreshUserList() {
	var user_list_bigscreen = $("#user_list"),
		user_list = $('.user_list'), temp;

	user_list.html('<ul class="list-row"><li class="list-title">Listeners</li></ul>');
	user_list_bigscreen.height($('#chat').height()).width($('#chat').width());
	if($('#room_description_wrapper .room-description').height() === 0)
		user_list_bigscreen.css('top', ($('#room_info .room-title').height() + $('#room_description_wrapper .room-description').height() + 60));
	else
		user_list_bigscreen.css('top', ($('#room_info .room-title').height() + $('#room_description_wrapper .room-description').height() + 70));
	
	if($('#chat').css('display') !== 'block') {
		$('#chat').show().css('visibility','hidden');
		user_list_bigscreen.height($('#chat').height()).width($('#chat').width());
		$('#chat').hide().css('visibility', 'visible');
	}

	user_list = $('.user_list .list-row');
	room.user_list.forEach(function(username, index) {
		temp = username.toLowerCase(),
			dname = display_name.toLowerCase();

		if(temp === dname) {
			user_list.append('<li class="list-item list-item-small"><span class="chat-you">' + username + '</span></li>');
		} else if(temp === "dcv" || temp === "williamtdr" || temp === "pogodaanton") {
			user_list.append('<li class="list-item list-item-small"><span class="chat-dev">' + username + '</span></li>');
		} else {
			user_list.append('<li class="list-item list-item-small"><span>' + username + '</span></li>');
		}
	});
}

function setSongInfo(title, artist) {
	if(title.length > 80) title = $.trim(title).substring(0, 80).split(" ").slice(0, -1).join(" ") + "…";
	if(artist.length > 40) artist = $.trim(artist).substring(0, 40).split(" ").slice(0, -1).join(" ") + "…";

	if(player.state === STATE_PLAYING) {
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
	if(client.vote === vote) {
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

function counterUpdate() {
	$(".room-users").find('.number').html(room.user_counter);
	$(".room-queue").find('.number').html(room.queue.length);
}

function updateRoomMetadata() {
    var room_title = $(".room-title"),
		newlines = room.description.split("\n"),
		short_desc = twemoji.parse(room.description.split("\n").splice(0, 4).join("<br>").substring(0, 200).replace(/\*\*[A-z0-9 ]+\*\*/gi, function(x) {
			return '<span style="font-weight: bold;">' + x.substring(2, x.length - 2) + '</span>';
		})),
		read_more = '<span class="room_description_extend">read more...</span>';
	room_title.empty();
	room_title.html(room.name);
	if(client.is_admin) room_title.append('<span class="icon-cog room_settings_launcher"></span>');
	if((newlines && newlines.length > 4) || room.description.length > 300) {
		$(".room-description").html(twemoji.parse(short_desc + read_more));
	} else {
		$(".room-description").html(newlines.join("<br>"));
	}
	$("#room_description_extend_content").html(markdown.toHTML(room.description).split("\n\n").join("\n").split("\n").join("<br>"));
	$("#room_description_modal_label").html(room.title);
	$(".room_description_extend").click(function() {
		$("#room_description_modal").modal();
	});
    $("#room_settings_desc").html(room.description);
    $(".room_settings_launcher").click(function() {
		if(snippet.room_settings) {
			$("#room_settings_modal").modal();
		} else {
			$.ajax({
				url: 'snippet/room_settings.html',
				dataType: 'html',
				success: function(data) {
					$("body").append(data);
					if(!snippet.room_settings) initRoomSettings();
					snippet.room_settings = true;
					$("#room_settings_modal").modal();
				}
			});
		}
    })
}

function htmlEncode(value){
	return $('<div/>').text(value).html().replace("&nbsp;", " ");
}

function addChatMessage(sender, text, formatted, color, hover_color) {
	var chatmessage = text.trim(),
		chatclass = "",
		notified = false,
		formatted = formatted || false,
		color = color || "#2ECC71",
		hover_color = hover_color || "#27AE60";

	if(chatmessage.length === 0) return false;

	if(chatmessage.toLowerCase().indexOf("@" + display_name.toLowerCase()) > -1) {
		var audio = new Audio('https://rawgit.com/dcvslab/dcvslab.github.io/master/badoop.mp3');
		audio.play();
		chatmessage = chatmessage.replace("@" + display_name, "<b>@" + display_name + "</b>");
		chatclass = " chat-tag";

        if((room.joined_at < (Math.floor(Date.now() / 1000) - 10)) && client.settings.notif_chat === "mention" && Notification.permission === "granted" && !document.hasFocus()) {
			notified = true;
            var notification = new Notification('Mentioned by ' + sender + ' in ' + room.display_name + ':', {
                icon: room.icon,
                body: text
            });

            notification.onclick = function() {
                window.focus();
                this.cancel();
            };

            setTimeout(notification.close.bind(notification), 10000);
        }

		noty({
			text: sender + ": " + chatmessage,
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

	if(!formatted) {
		if(chatmessage.indexOf("*") > -1) {
			var asterisktally = 0,
				msplit = chatmessage.split("");

			for (var i = 0; i < msplit.length; i++) {
				if(msplit[i] === "*") {
					if(asterisktally === 0) {
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
			if(asterisktally === 1) chatmessage = cmp;
		}

		if(chatmessage.indexOf("_") > -1) {
			var uscoretally = 0,
				msplit = chatmessage.split("");
			for (var i = 0; i < msplit.length; i++) {
				if(msplit[i] === "_") {
					if(uscoretally === 0) {
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
			if(uscoretally === 1) chatmessage = cmp;
		}
		if(chatmessage.indexOf("http://") > -1 || chatmessage.indexOf("https://") > -1) {
			var msplit = chatmessage.split(" ");
			for (var i = 0; i < msplit.length; i++) {
				if(msplit[i].startsWith("http://") || msplit[i].startsWith("https://")) {
					var omlink = msplit[i],
						mlink = msplit[i];
					if(mlink.indexOf("<i>") > -1) {
						mlink = mlink.replace(/<i>/g, "_");
						mlink = mlink.replace(/<\/i>/g, "_");
					}
					mlink = "<a href='" + mlink + "' target='_blank'>" + mlink + "</a>";
					chatmessage = chatmessage.replace(omlink, mlink)
				}
			}
		}
	}

	if(!notified && !formatted && (room.joined_at < (Math.floor(Date.now() / 1000) - 10)) && client.settings.notif_chat && client.settings.notif_chat != "mention" && Notification.permission === "granted" && !document.hasFocus()) {
		var notification = new Notification(sender + ' in ' + room.name + ' said:', {
			icon: room.icon,
			body: text
		});

		notification.onclick = function() {
			window.focus();
			this.cancel();
		};

		setTimeout(notification.close.bind(notification), 5000);
	}

	var chat_text = $(".chat-text"),
		message = chatmessage;

	if(sender != ">" && sender != "" && !formatted)
		message = chatmessage;

	var start_new_text = $('<span class="chat-message-wrapper' + chatclass + '"></span>'),
		sender_text = $('<span class="chat-message-sender" style="color: ' + color + '">' + sender + '</span>'),
		message_text = $(' <span class="chat-message-text">' + twemoji.parse(message) + '</span>');

	sender_text.click(function(event) {
		if($(event.target).is(".chat-message-sender")) lookupProfile(sender, $(event.target));
	}).mouseenter(function() {
		$(this).css("color", hover_color);
	}).mouseleave(function() {
		$(this).css("color", color);
	});
	chat_text.append(start_new_text.append(sender_text).append(message_text));
	$.each(chat_text, function(index, el) {
		$(el).scrollTop(el.scrollHeight);
	});
}

last_suggestion = false;

var emojiLoaded = false;
function onEmojiLoaded() {
	emojiLoaded = true;

	renderEmojiPicker();
}

function renderEmojiPicker() {
	const chatMessageInputs = $(".chat_message");

	for(var index = 0; index <= chatMessageInputs.length; index++) {
		const target = $(chatMessageInputs[index]);

		if(!target.parent().hasClass("twemoji-wrap")) {
			if(!target[0])
				continue;

			$(target).twemojiPicker({
				height: 40,
				pickerHeight: 150,
				icon: "grinning",
				category: ["smile", "cherry-blossom", "video-game", "oncoming-automobile", "symbols"],
				iconSize: 15,
				categorySize: 25,
				size: 12
			});

			var fakeTextArea = $(target).parent().find(".twemoji-textarea");

			fakeTextArea.html("Say something nice");
			fakeTextArea.focus(function() {
				fakeTextArea.css("color", "#fff");

				if(fakeTextArea.text() === "Say something nice")
					fakeTextArea.html("");
			});

			fakeTextArea.focusout(function() {
				if(fakeTextArea.html() === "") {
					fakeTextArea.html("Say something nice");

					fakeTextArea.css("color", "#bdc3c7");
				}
			});

			fakeTextArea.keydown(function(event) {
				var message = $(event.target).html(),
					list = $("#user_mention ul");

				if(event.which === 13) {
					$(".chat_send").click();

					return false;
				}

				if(event.which === 38)
					$(event.target).text(last_chat_message);

				if(event.which === 40)
					$(event.target).text("");

				var last_word = message.split(" ").pop();

				list.empty();
				if(message.length > 0) {
					$.each(room.user_list, function(index, potential_match) {
						if(last_word.indexOf('@') === 0)
							last_word = last_word.substr(1);

						if(potential_match.indexOf(last_word) === 0 && last_word.length >= 3 && potential_match != last_word) {
							list.append('<li>' + potential_match + '</li>');
							$('li:contains(' + potential_match + ')').click(function() {
								var box = $(event.target),
									message = box.html();

								box.html(message.substring(0, message.lastIndexOf(message.split(' ').pop())) + $(this).text());

								$("#user_mention ul").empty();
								box.focus();
								last_suggestion = false;
							});
							last_suggestion = potential_match;
						}
					});
				}

				if(event.keyCode === 9 && last_suggestion) {
					event.preventDefault();
					var newMessage = message.substring(0, message.lastIndexOf(last_word)) + last_suggestion;
					$(event.target).html(newMessage);

					list.empty();
					last_suggestion = false;

					var node = $(event.target)[0];
					node.focus();

					var textNode = node.firstChild;
					var caret = newMessage.length;
					var range = document.createRange();
					range.setStart(textNode, caret);
					range.setEnd(textNode, caret);
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);

					return false;
				}
			});
		}
	}
}

function playerOnLogin() {
	if(authkey === "unauthenticated") {
		$(".chat_textbox").html('<div class="chatbox-placeholder"><a class="signInButton">Log in</a> to chat</div>');
		$("#playlist_list").addClass("sidebar-no-login").append('<a class="signInButton">Log in</a> to see your playlists');
	} else {
		$("#chat .chat_textbox").html('<input type="text" class="form-control chat_message" placeholder="Say something nice"><span class="input-group-btn"><button class="btn btn-primary chat_send" type="button">Send</button></span><div id="user_mention"><ul></ul></div>');
		$("#mobile_chat .chat_textbox").html('<input type="text" class="form-control chat_message" placeholder="Say something nice"><span class="input-group-btn"><button class="btn btn-primary chat_send" type="button">Send</button></span><div id="mobile-user_mention"><ul></ul></div>');

		if(emojiLoaded)
			renderEmojiPicker();

		loadYoutubePlaylists();
	}

	$(".chat_send").click(function() {
		var message = "";

		$.each($(".chat_message"), function(index, el) {
			if($(el).text() != "")
				message = el.innerText;
		});

		if(message === "/help" || message === "!help" || message === "/?")
			if(snippet.commands)
				$("#commands_modal").modal();
			else
				$.ajax({
					url: "snippet/commands.html",
					dataType: "html",
					success: function(data) {
						snippet.commands = true;
						$("body").append(data);
						$("#commands_modal").modal();
					}
				});
		else
			if(message.length > 0) {
				last_chat_message = message;
				last_suggestion = false;
				server.send(JSON.stringify({
					event: "chat",
					data: message,
					key: authkey
				}));
			}

		$(".twemoji-textarea").text("");
	});
}

function togglePlayerVisibility() {
	var yt_player_el = $("#youtube_player");
	if(client.player_shown) {
		$("#video-toggle").html('<i class="fa fa-eye-slash"></i>');

		yt_player_el.animate({
			opacity: 0,
			height: '0px'
		}, 500, function() {
			$("#youtube_player").hide();
		});
		client.player_shown = false;
		window.localStorage.setItem("hide_video", true);
	} else {
		$("#video-toggle").html('<span class="icon-eye" style="vertical-align: 35%;"></span>');

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
			window.localStorage.setItem("volume", 0);
			yt_player.setVolume(0);
			$("#volume-slider").val(0);
			$(".fa-volume-down").addClass("fa-volume-off");
			$(".fa-volume-off").removeClass("fa-volume-down");
			client.muted = true;
		}
	});

	$("#add_to_queue").click(function() {
		addCurrentSongToQueue();
	});

	//Roomlist height resize
	$(window).on("resize", function() {
		if($('#user_list').css('display') === 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#user_list').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		} else if($('#queue_list').css('display') === 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#queue_list').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		}
	});

	$('.room-queue').click(function() {
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

		if($('#mobile_info').css('display') === 'block') {
			if($('#mobile_queue_list').css('display') === 'block')
				return false;
			else {
				toggleBoxes('mobile_queue_list');
				$('.room-informations .room-users').removeClass('selected');
				$('.room-informations .room-queue').addClass('selected');
			}
		}
		else
			toggleBoxes('queue_list');

		refreshQueueList();
	});

	$('.room-users').click(function() {
		if(!room.user_list.length) {
			return false;
		}

		if($('#mobile_info').css('display') === 'block') {
			if($('#mobile_user_list').css('display') === 'block')
				return false;
			else {
				toggleBoxes('mobile_user_list');
				$('.room-informations .room-users').addClass('selected');
				$('.room-informations .room-queue').removeClass('selected');
			}
		} else
			toggleBoxes('user_list');

		refreshUserList();
	});
}

function initRequiresAuthentication() {
	$("#room_password_prompt").keyup(function(event) {
		if(event.keyCode === 13) {
			$("#submit_room_password").click();
		}
	});

	$("#submit_room_password").click(function(){
		var password = $("#room_password_prompt").val();
		server.send(JSON.stringify({
			event: "password_attempt",
			data: {
				password: password,
				scope: room.id
			},
			key: authkey
		}));
		room.password = password;
	});
}

function toggleBoxes(exceptId) {
	var tempEl,
		toShow = $('#' + exceptId),
		isVisible = (toShow.css('display') === 'block');

	if(isVisible) {
		toShow.fadeOut('fast');
		$('#chat').fadeIn('fast');
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

var room_hash = window.location.hash.replace("#", "");
if(room_hash.length > 0) {
	room.id = room_hash;
	room.enabled = true;
}