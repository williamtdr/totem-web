function switchRoom(destination) {
    window.location.hash = destination;
    server.send(JSON.stringify({
        event: "login",
        key: authkey,
        room: destination
    }));
    $("#now_playing").removeAttr("hidden");
    $(".active").removeClass("active");
    $("#nav_room").addClass("active");
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
    window.location.href="http://api.totem.fm/user/logout.php";
}

function switchTab(destination) {
    $(".active").removeClass("active");
    $("#room_list").attr("hidden", "hidden");
    $("#now_playing").attr("hidden", "hidden");
    $("#my_music").attr("hidden", "hidden");
    var bgshader = $("#background_shader");
    switch(destination) {
        case "rooms":
            refreshRoomList();
            bgshader.animate({
                opacity: 0.7
            }, 500);
            $('.site_navigation').css("background-color", "rgba(0,0,0,0.3)");
            $("#nav_rooms").addClass("active");
            $("#room_list").removeAttr("hidden");
        break;
        case "now_playing":
            bgshader.animate({
                opacity: 0.7
            }, 500);
            $('.site_navigation').css("background-color", "rgba(0,0,0,0.3)");
            $("#nav_room").addClass("active");
            $("#now_playing").removeAttr("hidden");
        break;
        case "my_music":
            bgshader.animate({
                opacity: 1
            }, 500);
            $("#nav_music").addClass("active");
            $("#my_music").removeAttr("hidden");
            $('.site_navigation').css("background-color", "rgba(0,0,0,1)");
        break;
    }
}

function tryPassword(password, display_errors) {
    $.ajax({
        url: "http://api.totem.fm/app/authorize.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            password: password
        },
        success: function(response) {
            if(response.success) {
                $("#landing_page").attr("hidden", "hidden");
                var sn = $(".site_navigation");
                sn.removeAttr("hidden");
                sn.css("top", "-60px");
                sn.animate({
                    "top": 0
                }, 500);
                if(window.location.hash !== "" && window.location.hash.length > 0) {
                    force_room = true;
                    $(".active").removeClass("active");
                    $("#nav_room").addClass("active");
                } else {
                    $("#room_list").removeAttr("hidden");
                }
                if($("#beta_code").val().length > 3) window.localStorage.setItem("beta_password", $("#beta_code").val());
            } else {
                if(display_errors) {
                    var af = $("#auth_failed");
                    af.removeAttr("hidden");
                    af.css("opacity", 0);
                    af.animate({
                        opacity: 1
                    }, 200);
                } else {
                    $("#landing_page").removeAttr("hidden");
                }
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function submitEmail(email) {
    $.ajax({
        url: "http://api.totem.fm/app/subscribe.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            email: email
        },
        success: function(response) {
            $("#email_group").empty();
            $("#email_group").append('<span style="color: #2ECC71"><b>Thanks!</b></span>');
        },
        error: function(error) {
            $("#email_group").empty();
            $("#email_group").append('<span style="color: #E74C3C"><b>Subscription failed.</b></span>');
        }
    });
}

$(document).ready(function() {
    if(window.localStorage.getItem("beta_password") != undefined) {
        var password = window.localStorage.getItem("beta_password");
        tryPassword(password, false);
    } else {
        $("#landing_page").removeAttr("hidden");
    }
    var email = $("#email");
    email.keyup(function(event){
        if(event.keyCode == 13){
            $("#email_submit").click();
        }
    });
    $("#email_submit").click(function() {
        submitEmail($("#email").val());
    });
    $("#beta_launch_header").click(function() {
        $("#beta_launch_header").attr("hidden", "hidden");
        $("#email_group").animate({
            opacity: 0
        }, 200);
        $("#beta_launch_content").animate({
            opacity: 1
        }, 200);
        var code = $("#beta_code");
        code.focus();
        code.keyup(function(event){
            if(event.keyCode == 13){
                $("#beta_submit").click();
            }
        });
    });

    $("#beta_submit").click(function() {
        tryPassword($("#beta_code").val(), true);
    });
});

uchange = $("#username-change");
changebtn = $("#save-username");
uchange.focus();
uchange.keyup(function(event){
    if(event.keyCode == 13){
        changebtn.click();
    }
});
changebtn.click(function() {
    spin('change-username-spinner');
    $.ajax({
        url: "http://api.totem.fm/user/changeUsername.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            username: uchange.val()
        },
        success: function(response) {
            stop_spin('change-username-spinner');
            errors = $(".errors");
            errors.empty();
            console.log(response);
            switch(response.success) {
                case "exists":
                    errors.append('<div class="alert alert-warning" role="alert">Someone\'s already registered an account using that name.</div>');
                    break;
                case "invalid":
                    errors.append('<div class="alert alert-warning" role="alert">Use fewer special characters.</div>');
                    break;
                case "length":
                    errors.append('<div class="alert alert-warning" role="alert">Username can be from 3 - 30 characters.</div>');
                    break;
                case true:
                    window.location.reload();
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
});

function refreshRoomList() {
    content = $("#room_list_content");
    content.empty();
    content.append('<b>Loading...</b>');
    $.ajax({
        url: "http://api.totem.fm/room/list.php",
        jsonp: "callback",
        dataType: "jsonp",
        success: function(response) {
            content.empty();
            $.each(response, function(index, room) {
                if(room.song) {
                    $("#room_list_content").append('<div class="col-sm-4 room-card"><div class="panel panel-default"><div class="panel-body room-card"><span class="room-name">' + room.display_name + '</span><span class="room-users-wrapper"><span class="room-users">' + room.user_counter + '</span><i class="fa fa-users"></i></span><img src="http://i.ytimg.com/vi/' + room.song.url_fragment + '/0.jpg"></div><div class="panel-footer"><span class="song-name">' + room.song.name + '</span><span class="song-artist">' + room.song.artist + '</span><button class="btn btn-info footer_option" onclick="switchRoom(\'' + room.id + '\')">join</button></div></div></div>');
                } else {
                    $("#room_list_content").append('<div class="col-sm-4 room-card"><div class="panel panel-default"><div class="panel-body"><span class="room-name">' + room.display_name + '</span><span class="room-users-wrapper"><span class="room-users">' + room.user_counter + '</span><i class="fa fa-users"></i></span><br><span class="no-song">No song playing</span></div><div class="panel-footer"><button class="btn btn-info footer_option" onclick="switchRoom(\'' + room.id + '\')">join</button></div></div></div>');
                }
            });
        },
        error: function(error) {
            $("#room_list_content").append('<b>Failed to load the room list. <a onclick="refreshRoomList()">Refresh?</a></b>');
        }
    });
}

function loadYoutubePlaylists() {
    $(".sidebar-playlist-list").empty();
    $(".sidebar-playlist-list").append('<b>Loading...</b>');
    $.ajax({
        url: "http://api.totem.fm/youtube/getPlaylists.php",
        jsonp: "callback",
        dataType: "jsonp",
        success: function(response) {
            $(".sidebar-playlist-list").empty();
            $(".sidebar-playlist-list").append('<ul class="list-group sidebar-playlist"><li class="list-group-item" onclick="showSearch()">Search YouTube</li>');
            if(response.success) {
                $.each(response.data, function(name, id) {
                    $(".sidebar-playlist-list ul").append("<li class=\"list-group-item\" onclick=\"loadPlaylistItems('" + id + "')\">" + name + "</li>");
                });
            } else {
                $(".sidebar-playlist-list ul").append("There was a problem retrieving your Youtube playlists. Check to make sure that a Youtube channel exists for your account and you are logged in.");
            }
            content.append('</ul>');
        },
        error: function(error) {
            $("#room_list_content").append('<b>There was a problem retrieving your youtube playlists. <a onclick="loadYoutubePlaylists()">Refresh?</a></b>');
        }
    });
}

function sessionComplete() {
    if(!display_name) {
        $("#login-menu").append('<a href="' + authUrl + '">Log In<span id="login-full"> with Google</span></a>');
        $("#chat-textbox").append('<div class="chatbox-placeholder"><a href="' + authUrl + '">Log in</a> to chat</div>');
        $(".sidebar-playlist-list").addClass("sidebar-no-login");
        $(".sidebar-playlist-list").append("<a href=\"" + authUrl + "\">Log in</a> to see your playlists");
    } else {
        $("#login-menu").append('<a onclick="logout()"><span id="login-full">Hi, </span>' + display_name + '</a>');
        $("#chat-textbox").append('<input type="text" class="form-control" placeholder="Say something nice" id="chat_message"><span class="input-group-btn"><button class="btn btn-primary" type="button" id="chat_send">Send</button></span>');
        loadYoutubePlaylists();
    }

    if(!force_room) {
        refreshRoomList();
    }
}