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
	connect: function() {
		server = new WebSocket(config.SERVER, 'echo-protocol');
		$("#waiting_for_server").show();
		this.connected = true;

		server.onclose = client.onDisconnect;

		$("#skip_song").click(function() {
			server.send(JSON.stringify({
				event: "skip",
				key: authkey
			}));
		});

		server.onmessage = function(event) {
			event_data = JSON.parse(event.data);
			data = event_data.data;
			console.log(event_data);

			switch (event_data.event) {
				case "room_data": // called to initialize room
					$("#waiting_for_server").hide();
					$("#main_content").show();
					$("#sidebar").show();
					room.name = data.display_name;
					room.description = data.description;
					room.user_list = data.listeners_by_name;
					room.queue = data.queue;

					updateRoomMetadata();
					counterUpdate();

					if(data.song) {
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
					room.user_list = data;
					refreshUserList();
					counterUpdate();

				break;
				case "song_change":
					$(".activated").removeClass("activated");
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
					server.send(JSON.stringify({
						event: "login",
						key: authkey,
						room: room.id
					}));
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