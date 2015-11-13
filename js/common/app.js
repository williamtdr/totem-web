force_room = false;
loadJavascript(config.API + '/app/session.php');

function switchRoom(destination) {
    window.location.hash = destination;
    server.send(JSON.stringify({
        event: "login",
        key: authkey,
        room: destination
    }));
    room = destination;
    $("#now_playing").removeAttr("hidden");
    $(".active").removeClass("active");
    $(".nav_room").addClass("active");
    $("#room_list").attr("hidden", "hidden");
    $("#now_playing_content").removeAttr("hidden");
    $("#now_playing_placeholder").attr("hidden", "hidden");
}

function showRoomList() {
    $("#create_room").attr("hidden", "hidden");
    $("#room_list").removeAttr("hidden");
}

function showCreateForm() {
    $("#room_list").attr("hidden", "hidden");
    $("#create_room").removeAttr("hidden");
}

function logout() {
    window.location.href = config.API + "/user/logout.php";
}

function switchTab(destination) {
    $(".active").removeClass("active");
    $("#room_list").attr("hidden", "hidden");
    $("#now_playing").attr("hidden", "hidden");
    $("#my_music").attr("hidden", "hidden");
    var bgshader = $("#background_shader");
    switch (destination) {
        case "rooms":
            refreshRoomList();
            bgshader.animate({
                opacity: 0.7
            }, 500);
            $('.site_navigation').css("background-color", "rgba(0,0,0,0.3)");
            $(".nav_rooms").addClass("active");
            $("#room_list").removeAttr("hidden");
            break;
        case "now_playing":
            bgshader.animate({
                opacity: 0.7
            }, 500);
            $('.site_navigation').css("background-color", "rgba(0,0,0,0.3)");
            $(".nav_room").addClass("active");
            $("#now_playing").removeAttr("hidden");
            break;
        case "my_music":
            bgshader.animate({
                opacity: 1
            }, 500);
            $(".nav_music").addClass("active");
            $("#my_music").removeAttr("hidden");
            $('.site_navigation').css("background-color", "rgba(0,0,0,1)");
            break;
    }
}

uchange = $("#username-change");
changebtn = $("#save-username");
uchange.focus();
uchange.keyup(function (event) {
    if (event.keyCode == 13) {
        changebtn.click();
    }
});
changebtn.click(function () {
    spin('change-username-spinner');
    $.ajax({
        url: config.API + "/user/changeUsername.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            username: uchange.val()
        },
        success: function (response) {
            stop_spin('change-username-spinner');
            errors = $(".errors");
            errors.empty();
            console.log(response);
            switch (response.success) {
                case "exists":
                    errors.append('<div class="alert alert-warning" role="alert">Someone\'s already registered an account using that name.</div>');
                    break;
                case "invalid":
                    errors.append('<div class="alert alert-warning" role="alert">Use fewer special characters.</div>');
                    break;
                case "length":
                    errors.append('<div class="alert alert-warning" role="alert">Username can be from 3 - 30 characters.</div>');
                    break;
                default:
                    window.location.reload();
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
});

function refreshRoomList() {
    content = $("#room_list_content");
    content.empty();
    content.append('<b><i class="fa fa-circle-o-notch fa-spin"></i> Loading...</b>');
    $.ajax({
        url: config.API + "/room/list.php",
        jsonp: "callback",
        dataType: "jsonp",
        success: function (response) {
            content.empty();
            $(".site_navigation").animate({
                "opacity": 1
            }, 500);
            $.each(response, function (index, room) {
                if (room.song) {
                    $("#room_list_content").append(
                        '<div class="col-sm-4 room-card"><div class="panel panel-default"><div class="panel-body room-card">' +
                        '<span class="room-name">' + room.display_name + '</span>' +
                        '<span class="room-users-wrapper"><span class="room-users">' + room.user_counter + '</span><i class="fa fa-users"></i></span>' +
                        '<img src="http://i.ytimg.com/vi/' + room.song.url_fragment + '/0.jpg"></div>' +
                        '<div class="panel-footer"><span class="song-name">' + room.song.name + '</span>' +
                        '<span class="song-artist">' + room.song.artist + '</span>' +
                        '<button class="btn btn-info footer_option" onclick="switchRoom(\'' + room.id + '\')">join</button>' +
                        '</div></div></div>'
                    );
                } else {
                    $("#room_list_content").append(
                        '<div class="col-sm-4 room-card"><div class="panel panel-default"><div class="panel-body">' +
                        '<span class="room-name">' + room.display_name + '</span>' +
                        '<span class="room-users-wrapper"><span class="room-users">' + room.user_counter + '</span><i class="fa fa-users"></i></span><br>' +
                        '<span class="no-song">No song playing</span></div>' +
                        '<div class="panel-footer">' +
                        '<button class="btn btn-info footer_option" onclick="switchRoom(\'' + room.id + '\')">join</button>' +
                        '</div></div></div>'
                    );
                }
            });
        },
        error: function (error) {
            $("#room_list_content").append('<b>Failed to load the room list. <a onclick="refreshRoomList()">Refresh?</a></b>');
        }
    });
}

function loadYoutubePlaylists() {
    $(".sidebar-playlist-list").html('<b><i class="fa fa-circle-o-notch fa-spin"></i> Loading...</b>');
    $.ajax({
        url: config.API + "/youtube/getPlaylists.php",
        jsonp: "callback",
        dataType: "jsonp",
        success: function (response) {
            $(".sidebar-playlist-list")
                .html('<ul class="list-group sidebar-playlist"><li class="list-group-item" onclick="showSearch()">Search YouTube</li>');

            if (response.success) {
                $.each(response.data, function (name, id) {
                    $(".sidebar-playlist-list ul").append("<li class=\"list-group-item\" onclick=\"loadPlaylistItems('" + id + "')\">" + name + "</li>");
                });
            } else {
                $(".sidebar-playlist-list ul").append("There was a problem retrieving your Youtube playlists. Check to make sure that a Youtube channel exists for your account and you are logged in.");
            }
            content.append('</ul>');
        },
        error: function (error) {
            $("#room_list_content").append('<b>There was a problem retrieving your youtube playlists. <a onclick="loadYoutubePlaylists()">Refresh?</a></b>');
        }
    });
}

function initAuth2() {
    gapi.load('auth2', function () {
        auth2 = gapi.auth2.init({
            client_id: config.GOOGLE_CLIENT_ID
        });
    });
}

function sessionComplete() {
    if (authkey == 'unauthenticated') {
        $("#login-menu").html('<a class="signInButton">Log In<span id="login-full"> with Google</span></a>');
        $(".chat-textbox").html('<div class="chatbox-placeholder"><a class="signInButton">Log in</a> to chat</div>');

        $(".sidebar-playlist-list")
            .addClass("sidebar-no-login")
            .append('<a class="signInButton">Log in</a> to see your playlists');
    } else {
        $("#login-menu").html('<a onclick="logout()"><span id="login-full">Hi, </span>' + display_name + '</a>');

        $(".chat-textbox")
            .html('<input type="text" class="form-control chat_message" placeholder="Say something nice"><span class="input-group-btn"><button class="btn btn-primary chat_send" type="button">Send</button></span>');

        loadYoutubePlaylists();
    }

    if (!force_room) {
        refreshRoomList();
    }

    try {
        server.send(JSON.stringify({
            event: "login",
            key: authkey,
            room: room
        }));
    } catch(e) {

    }

    $(".chat_message").keyup(function (event) {
        if (event.keyCode == 13) {
            $(".chat_send").click();
        }
    });

    $(".chat_send").click(function () {
        $(".chat_message").each(function (index, e) {
            var message = $(e).val();
            if (message.length > 0) {
                server.send(JSON.stringify({
                    event: "chat",
                    data: message,
                    key: authkey
                }));
            }
        });
        $(".chat_message").val("");
    });

    if(display_name) $("#roomName").val(display_name + "'s Room");
}

$(document).ready(function() {
    if(window.location.hash !== "" && window.location.hash.length > 0) {
        force_room = true;
        $(".active").removeClass("active");
        $("#nav_room").addClass("active");
    } else {
        $("#room_list").removeAttr("hidden");
    }
});