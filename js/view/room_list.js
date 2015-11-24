function initRoomList() {
	$("#nav_create_room").click (function() {
		switchView(VIEW_CREATE_FORM);
	});
	$("#nav_refresh_list").click(refreshRoomList);
}

function refreshRoomList() {
	content = $("#room_list_content");
	content.empty();
	content.append('<b><i class="fa fa-circle-o-notch fa-spin"></i> Loading...</b>');
	$.ajax({
		url: config.API + "/room/list.php",
		jsonp: "callback",
		dataType: "jsonp",
		success: function(response) {
			content.empty();
			$.each(response, function(index, room) {
				if(room.song) {
					$("#room_list_content").append(
						'<div class="col-sm-4 room-card"><div class="panel panel-default"><div class="panel-body room-card">' +
						'<span class="room-name">' + room.display_name + '</span>' +
						'<span class="room_users_wrapper"><span class="room-users">' + room.user_counter + '</span><i class="fa fa-users"></i></span>' +
						'<img src="http://i.ytimg.com/vi/' + room.song.url_fragment + '/0.jpg"></div>' +
						'<div class="panel-footer"><span class="song-name">' + room.song.name + '</span>' +
						'<span class="song-artist">' + room.song.artist + '</span>' +
						'<button class="btn btn-info footer_option" onclick="joinRoom(\'' + room.id + '\')">join</button>' +
						'</div></div></div>'
					);
				} else {
					$("#room_list_content").append(
						'<div class="col-sm-4 room-card"><div class="panel panel-default"><div class="panel-body">' +
						'<span class="room-name">' + room.display_name + '</span>' +
						'<span class="room_users_wrapper"><span class="room-users">' + room.user_counter + '</span><i class="fa fa-users"></i></span><br>' +
						'<span class="no-song">No song playing</span></div>' +
						'<div class="panel-footer">' +
						'<button class="btn btn-info footer_option" onclick="joinRoom(\'' + room.id + '\')">join</button>' +
						'</div></div></div>'
					);
				}
			});
		},
		error: function(error) {
			$("#room_list_content").append('<b>Failed to load the room list. <a onclick="refreshRoomList()">Refresh?</a></b>');
		}
	});
}