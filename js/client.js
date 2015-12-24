const VOTE_POSITIVE = 1;
const VOTE_NEUTRAL = 0;
const VOTE_NEGATIVE = -1;

const STATE_LOADING = 0;
const STATE_PLAYING = 1;
const STATE_NO_SONG = 2;
const STATE_PREVIEWING = 3;

client = {
	vote: VOTE_NEUTRAL,
	player_shown: true,
	state: STATE_LOADING,
	stateBefore: STATE_NO_SONG,
	connected: false,
	disconnect_timer: 3,
	disconnect_timer_id: 0,
	logged_in: false,
	muted: false,
	queue_banned: false,
	banned: false,
	chat_muted: false,
	is_admin: false,
	guest_key: false,
	attempting_auto_login: false,
	room_needs_auth: false,
	new_room: false,
	queue: [],
    settings: {
        notif_song_change: true,
        notif_chat: "mention",
        hide_hints: false,
		video_quality: "720p"
    },
	showRequiresAuthentication: function() {
		switchClientState(STATE_NO_SONG);
		if(yt_player.pauseVideo) yt_player.pauseVideo();
		$("#invalid_room_password").hide();
		$("#room_password_name_target").html(room.display_name);
		$("title").html(room.display_name + " &middot; Totem");
		switchView(VIEW_REQUIRES_AUTHENTICATION);
		client.room_needs_auth = true;
		updateRoomSettings();
	},
	connect: function() {
		server = new WebSocket(config.SERVER, 'echo-protocol');
		$("#waiting_for_server").show();
		client.connected = true;

		server.onclose = client.onDisconnect;

		$("#skip_song").click(function() {
			server.send(JSON.stringify({
				event: "skip",
				key: authkey
			}));
		});

		server.onmessage = function(event) {
			var event_data = JSON.parse(event.data);
			var data = event_data.data;
            console.log(event_data);

			switch (event_data.event) {
				case "requires_authentication":
					room.display_name = event_data.display_name;
					client.room_needs_auth = true;
					updateRoomSettings();
					try {
						var password_store = window.localStorage.getItem("saved_room_passwords");
						if(password_store && JSON.parse(password_store)[room.id]) {
							client.attempting_auto_login = true;
							server.send(JSON.stringify({
								event: "password_attempt",
								data: {
									password: JSON.parse(password_store)[room.id],
									scope: room.id
								},
								key: authkey
							}));
						} else {
							client.attempting_auto_login = false;
							client.showRequiresAuthentication();
						}
					} catch(e) {
						client.attempting_auto_login = false;
						client.showRequiresAuthentication();
					}
				break;
				case "invalid_password":
					if(client.attempting_auto_login) {
						client.attempting_auto_login = false;
						client.showRequiresAuthentication();
					} else {
						$("#invalid_room_password").show();
					}
				break;
				case "room_data": // called to initialize room
					room.joined_at = Math.floor(Date.now() / 1000);
					$("#requires_authentication").hide();
                    if(data == false) {
                        switchView(VIEW_ROOM_LIST);
                        return false;
                    }
					if(room.password && $("#remember_room_password").attr("checked") == "checked") {
						client.room_needs_auth = true;
						updateRoomSettings();
						if(window.localStorage.getItem("saved_room_passwords")) {
							window.localStorage.setItem("saved_room_passwords", JSON.parse(window.localStorage.getItem("saved_room_passwords"))[room.id] = room.password);
						} else {
							var password_obj = {};
							password_obj[room.id] = room.password;
							window.localStorage.setItem("saved_room_passwords", JSON.stringify(password_obj));
						}
						room.password = false;
					}
					updateRoomSettings();
					$("#waiting_for_server").hide();
					$("#main_content").show();
					$("#sidebar").show();
					room.name = data.display_name;
					room.description = data.description;
					room.user_list = data.listeners_by_name;
                    room.user_counter = data.listener_count;
                    room.backgrounds = data.backgrounds;
					setIcon(data.icon);
                    if(room.backgrounds && room.backgrounds.length > 0) {
                        advanceBackgroundImage();
                    } else {
                        if(!set_initial_background) {
                            set_initial_background = true;
                            advanceBackgroundImage();
                        }
                    }
					client.banned = false;
					client.queue_banned = false;

					updateRoomMetadata();
					counterUpdate();

					if(data.song && !this.banned) {
						var now = Math.floor(Date.now() / 1000);

						song.started_at = data.song.started_at;
						song.progress = now - song.started_at;
						song.name = data.song.name;
						$("#current-dj-wrapper").show();
						$(".current-dj").html(data.current_dj);

						song.name = data.song.name;
						song.artist = data.song.artist;
						song.url_fragment = data.song.url_fragment;
						room.dj = data.current_dj;

						setScore(data.score.positive, data.score.negative);
						getYoutubeRate(data.song.url_fragment);
						switchClientState(STATE_PLAYING);
					} else {
						switchClientState(STATE_NO_SONG);
					}

					$.each(data.chat_history, function(index, chat_obj) {
						addChatMessage(chat_obj.sender, chat_obj.message);
					});

					if(client.new_room) {
						$("#no_video").hide();
						$("#new_room_welcome").show();
						$("#share_room_text").html("http://totem.fm/#" + room.id);
						$(".fa-twitter").click(function() {
							window.open("https://twitter.com/intent/tweet?text=I%20just%20created%20" + room.name + "%20on%20Totem.%20Let's%20share%20some%20tunes%20together%3A%20http%3A%2F%2Ftotem.fm%2F%23" + room.id)
						});
						$(".fa-facebook").click(function() {
							window.open("https://www.facebook.com/dialog/feed?app_id=694165360698061&link=http%3A%2F%2Ftotem.fm%2F%23" + room.id + "&picture=http%3A%2F%2Fstatic.totem.fm%2Fshare.png&name=" + room.name + "%20on%20Totem&caption=%20&description=Totem%20is%20a%20group%20DJ%20site%20where%20anyone%20can%20share%20their%20favorite%20songs%20or%20find%20new%20ones.&redirect_uri=http%3A%2F%2Fwww.facebook.com%2F")
						});
						$(".fa-link").click(function() {
							$("#share_room_well").animate({height:"toggle"}, 500);
							selectText("share_room_text");
						});
						$(".room_welcome_description a").click(function() {
							$("#new_room_welcome").animate({height: "toggle"}, 500, function() {
								$("#no_video").animate({height: "toggle"}, 500);
							});
						})
					}
				break;
				case "score_update":
					setScore(data.positive, data.negative);
				break;
				case "notification":
					if(client.banned) return false;
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
				case "user_counter_update":
                    room.user_counter = data;
                    counterUpdate();
                break;
				case "user_list_change":
					room.user_list = data;
					refreshUserList();
				break;
                case "desc_update":
                    room.description = data;
                    updateRoomMetadata();
                break;
                case "backgrounds":
                    if(data.length > 0) {
                        if(!room.backgrounds) {
                            room.backgrounds = data;
                            advanceBackgroundImage();
                        } else {
                            room.backgrounds = data;
                        }
                    }
                break;
				case "room_deleted":
					switchClientState(STATE_NO_SONG);
					if(yt_player.pauseVideo) yt_player.pauseVideo();
					switchView(VIEW_ROOM_LIST);
					alert(room.name + " has been deleted by a room owner.");
				break;
				case "icon_change":
					setIcon(data);
				break;
				case "permission":
					var banned_notification = function(text) {
						noty({
							text: text,
							theme: 'relax',
							dismissQueue: true,
							type: "danger",
							layout: "topRight",
							animation: {
								open: {height: 'toggle'},
								close: {height: 'toggle'}
							},
							timeout: 15000
						});
					}, textbox = $(".chat_textbox");
					switch(data.type) {
                        case "unbanned":
                            window.location.reload();
                        break;
                        case "unmuted":
                            playerOnLogin();
                        break;
						case "banned_room":
							banned_notification("You are banned from this room.");
							switchClientState(STATE_NO_SONG);
							if(yt_player.pauseVideo) yt_player.pauseVideo();
							client.banned = true;
							$("#permission_failure h2").html("You are banned from joining " + room.name + ".");
							switchView(VIEW_BANNED);
						break;
						case "banned_site":
							disableNavigation();
							switchClientState(STATE_NO_SONG);
							if(yt_player.pauseVideo) yt_player.pauseVideo();
							client.connected = false;
							client.banned = true;
							server.disconnect();
							$("#permission_failure h2").html("You have been banned from this website.");
							$("#permission_failure p").html("Contact a site admin for more information or to ask for the ban to be removed.");
							switchView(VIEW_BANNED);
						break;
						case "queue_ban_room":
							client.banFromQueue();
							banned_notification("You are not allowed to queue songs in this room.");
						break;
						case "queue_ban_site":
							client.banFromQueue();
							banned_notification("You are not allowed to queue songs.");
						break;
						case "muted_room":
							textbox.empty();
							textbox.append("You are muted in this room.");
						break;
						case "muted_site":
							textbox.empty();
							textbox.append("You are muted.");
						break;
						case "room_admin":
							client.is_admin = true;
							updateRoomMetadata();
						break;
						case "room_host":
						break;
					}
				break;
				case "guest_key":
					client.guest_key = data;
				break;
				case "song_change":
					if(client.banned) return false;
					$(".activated").removeClass("activated");
					client.vote = VOTE_NEUTRAL;
					song.progress = 0;
					room.history.push(song);

					song.name = data.song.name;
					song.artist = data.song.artist;
					song.url_fragment = data.song.url_fragment;
					song.started_at = Math.floor(Date.now() / 1000);
					song.progress = 0;
					song.duration = data.song.duration;

                    if((room.joined_at < (Math.floor(Date.now() / 1000) - 10)) && client.settings.notif_song_change && Notification.permission == "granted" && !document.hasFocus()) {
                        var notification = new Notification(song.name, {
                            icon: room.icon,
                            body: song.artist
                        });

                        notification.onclick = function() {
                            window.focus();
                            this.cancel();
                        };

                        setTimeout(notification.close.bind(notification), 5000);
                    }

					room.dj = data.dj;
					if(client.state == STATE_NO_SONG) {
						switchClientState(STATE_PLAYING);
					}

					if(client.state == STATE_PLAYING) {
						$("#current-dj-wrapper").show();
						$(".current-dj").html(data.dj);
						setSongInfo(song.name, song.artist);
						loadVideoById(song.url_fragment, song.progress);
						getYoutubeRate(data.song.url_fragment);
						setScore(0, 0);

						noty({
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
					}

					advanceBackgroundImage();

					$(".playing-in-room").html("<i class=\"fa fa-plus\"></i> Add To Queue").click(function(e) {
						var target = $(e.target);
						addToQueueById(target.data('id'));
					}).removeClass("playing-in-room");
					$("[data-id='" + data.song.url_fragment + "']").html("<i class=\"fa fa-play\"></i> Playing").unbind().addClass("playing-in-room");

					break;
				case "chat":
					addChatMessage(data.sender, data.message);

					break;
				case "queue_update":
					client.queue = data;
					updateMyQueue();
					$(".in-room-queue").unbind().html("<i class=\"fa fa-plus\"></i> Add To Queue").click(function(e) {
						addToQueueById($(this).data('id'));
					}).removeClass("in-room-queue");
					for(var index in client.queue) {
						var data = client.queue[index];
						$("[data-id='" + data.id + "']:not(.in-room-queue)").html("<i class=\"fa fa-trash-o\"></i> Remove From Queue").unbind().addClass("in-room-queue").click(function() {
							removeFromQueueById($(this).data('id'));
						});
					}
				break;
				case "queue_change":
					room.queue = data;
					refreshQueueList();
					counterUpdate();

					break;
				default:
					console.warn('Unhandled event: ' + event_data.event);

					break;
			}
		};

		if(room.enabled) {
			window.location.hash = room.id;
			server.onopen = client.sendLoginRequest;
		}
	},
	banFromQueue: function() {
		client.queue_banned = true;
		if(current_view == VIEW_MUSIC_LIST) {
			switchSubView(SUBVIEW_QUEUE_BANNED);
		}
	},
	onDisconnect: function() {
		$("#disconnected").css("display", "table");
		bg_shader.css("z-index", "8000");
		shadeBackground(BACKGROUND_DISCONNECTED_SHADING);
		client.disconnect_timer_id = setInterval(function() {
			client.disconnect_timer--;
			$("#disconnected-countdown").html(client.disconnect_timer);
			if(client.disconnect_timer == 0) {
				window.location.reload();
				clearInterval(client.disconnect_timer_id);
			}
		}, 1000);
	},
	sendLoginRequest: function() {
		client.logged_in = false;
		login_timer = setInterval(function() {
			if(client.logged_in) {
				clearInterval(login_timer);
				return false;
			}
			if(authkey) {
				try {
					var packet = {
						event: "login",
						key: authkey,
						room: room.id
					};
					if(client.guest_key != undefined) packet.guest_key = client.guest_key;
					server.send(JSON.stringify(packet));
					client.logged_in = true;
					return false;
				} catch(e) {
					console.log("Unexpected error when establishing a connection to the server.");
					return false;
				}
			} else {
				console.log("Waiting for login info before sending request...");
			}
		}, 50);
	}
};