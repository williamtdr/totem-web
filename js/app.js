bg_shader = $("#background_shader");

var config = {
	API: 'http://api.totem.fm',
	SERVER: 'ws://server.totem.fm:10000/',
	GOOGLE_CLIENT_ID: '545747761221-rb098ajp2aik13fhp7h7bn5m0s9l7iir.apps.googleusercontent.com'
};

var loadJavascript = function(path) {
	var ref = document.createElement('script');

	ref.setAttribute("type", "text/javascript");
	ref.setAttribute('src', path);

	document
		.getElementsByTagName("head")[0]
		.appendChild(ref)
};

function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

loadJavascript(config.API + '/app/session.php');

function joinRoom(destination) {
	window.location.hash = destination;
	room.enabled = true;
	room.id = destination;
	$("#waiting_for_server").show();
	$("#main_content").hide();
	if(client.connected) {
		var packet = {
			event: "login",
			key: authkey,
			room: destination
		};
		if(client.guest_key) packet.guest_key = client.guest_key;
		server.send(JSON.stringify(packet));
	} else {
		client.connect();
	}
	switchView(VIEW_PLAYER);
}

function logout() {
	window.location.href = config.API + "/user/logout.php";
}

// Called by the JS returned from the server-side session.php
// after a user logs in. display_name and authkey are set by this time
function sessionComplete() {
	navOnLogin();
	playerOnLogin();
	createFormOnLogin();
	assignAuthButtonHandler();

	if(room.enabled) {
		client.sendLoginRequest();
	}
}

$(document).ready(function() {
	// Set up handlers here:
	initNavigation();
	initPlayerToggles();
	initSearch();
	initRoomList();
	initCreateForm();
	initGoogleAuth();
    initRoomSettings();
    //$("#room_settings_modal").modal();

	$.getJSON("http://static.totem.fm/emoji/emoji.json", function(data) {
		emoji.emojilist = data;
	});
	
	if(room.enabled) {
		if(client.connected) {
			server.send(JSON.stringify({
				event: "login",
				key: authkey,
				room: client.room.id
			}));
		} else {
			client.connect();
		}
		switchView(VIEW_PLAYER);
	} else {
		switchView(VIEW_ROOM_LIST);
	}

	if(room) {
		$("#now_playing_content").show();
		$("#now_playing_placeholder").hide();
	}
});

initDelayTimer = setInterval(function() {
	if(youtube_ready && authkey) {
		clearTimeout(initDelayTimer);
	}
}, 100);