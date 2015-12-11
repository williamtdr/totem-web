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
	showRequiresAuthentication: function() {
		switchClientState(STATE_NO_SONG);
		if(yt_player.pauseVideo) yt_player.pauseVideo();
		$("#invalid_room_password").hide();
		$("#room_password_name_target").html(room.display_name);
		$("title").html(room.display_name + " &middot; Totem");
		switchView(VIEW_REQUIRES_AUTHENTICATION);
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
					try {
						var password_store = window.localStorage.getItem("saved_room_passwords");
						if(password_store && JSON.parse(password_store)[room.id]) {
							client.attempting_auto_login = true;
							server.send(JSON.stringify({
								event: "password_attempt",
								data: {
									password: JSON.parse(password_store)[room.id],
									scope: room.id
								}
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
					$("#requires_authentication").hide();
                    if(data == false) {
                        switchView(VIEW_ROOM_LIST);
                        return false;
                    }
					if(room.password && $("#remember_room_password").attr("checked") == "checked") {
						if(window.localStorage.getItem("saved_room_passwords")) {
							window.localStorage.setItem("saved_room_passwords", JSON.parse(window.localStorage.getItem("saved_room_passwords"))[room.id] = room.password);
						} else {
							var password_obj = {};
							password_obj[room.id] = room.password;
							window.localStorage.setItem("saved_room_passwords", JSON.stringify(password_obj));
						}
						room.password = false;
					}
					$("#waiting_for_server").hide();
					$("#main_content").show();
					$("#sidebar").show();
					room.name = data.display_name;
					room.description = data.description;
					room.user_list = data.listeners_by_name;
					room.queue = data.queue;
                    room.user_counter = data.listener_count;
                    room.backgrounds = data.backgrounds;
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
					song.duration = 0;

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

					break;
				case "chat":
					addChatMessage(data.sender, data.message);

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