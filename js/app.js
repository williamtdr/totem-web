bg_shader = $("#background_shader");

const config = {
	API: "http://api.totem.fm",
	SERVER: "ws://server.totem.fm:10000/",
	GOOGLE_CLIENT_ID: "545747761221-rb098ajp2aik13fhp7h7bn5m0s9l7iir.apps.googleusercontent.com"
};

function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

$.getScript(config.API + "/app/session.php");

function joinRoom(destination) {
	window.location.hash = destination;
	room.enabled = true;
	room.id = destination;
	if($("#waiting_for_server").length === 0) $("#now_playing_content").append('<div id="waiting_for_server"><div class="container"><i class="fa fa-circle-o-notch fa-spin"></i> Joining the room...</div></div>');
	$("#main_content").hide();
	$(".chat-text").empty();
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
	$("#user_menu").animate({height: 0});
	window.location.href = config.API + "/user/logout.php";
}

// Called by the JS returned from the server-side session.php
// after a user logs in. display_name and authkey are set by this time
function sessionComplete() {
	navOnLogin();
	playerOnLogin();
	createFormOnLogin();
	assignAuthButtonHandler();

	if(room.enabled)
		client.sendLoginRequest();

	if(display_name) $(".display_name").html(display_name);
}

$(document).ready(function() {
	// Set up handlers here:
	initNavigation();
	initPlayerToggles();
	initSearch();
	initRoomList();
	initCreateForm();
	initGoogleAuth();
    initMenu();
	initRequiresAuthentication();
	initQueue();
	initModals();
	
	if(room.enabled) {
		if(client.connected)
			server.send(JSON.stringify({
				event: "login",
				key: authkey,
				room: client.room.id
			}));
		else
			client.connect();

		switchView(VIEW_PLAYER);
	} else
		switchView(VIEW_ROOM_LIST);

	if(room) {
		$("#now_playing_content").show();
		$("#now_playing_placeholder").hide();
	}
});

initDelayTimer = setInterval(function() {
	if(youtube_ready && authkey)
		clearTimeout(initDelayTimer);
}, 100);