function switchRoom(destination) {
    history.pushState({}, destination + " &middot; Totem", "/room/" + destination);
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
    $("#background_shader").animate({
        opacity: 0.7
    }, 1000, function() {
        // Animation complete.
    });
}

function showRoomList() {
    $("#create_room").attr("hidden", "hidden");
    $("#room_list").removeAttr("hidden");
}

function showCreateForm() {
    $("#room_list").attr("hidden", "hidden");
    $("#create_room").removeAttr("hidden");
}

function switchTab(destination) {
    $("#background_shader").animate({
        opacity: 0.7
    }, 1000, function() {
        // Animation complete.
    });
    $(".active").removeClass("active");
    $("#room_list").attr("hidden", "hidden");
    $("#now_playing").attr("hidden", "hidden");
    $("#my_music").attr("hidden", "hidden");
    switch(destination) {
        case "rooms":
            $("#nav_rooms").addClass("active");
            $("#room_list").removeAttr("hidden");
        break;
        case "now_playing":
            $("#nav_room").addClass("active");
            $("#now_playing").removeAttr("hidden");
        break;
        case "my_music":
            $("#nav_music").addClass("active");
            $("#my_music").removeAttr("hidden");
        break;
    }
}

$(document).ready(function() {
    if(window.location.pathname.replace("/room/", "") !== "/") {
        force_room = true;
        $(".active").removeClass("active");
        $("#nav_room").addClass("active");
    } else {
        $("#room_list").removeAttr("hidden");
    }
});

$('#changeUsernameModal').modal({
    keyboard: false
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
        url: "http://totem.fm/api/changeUsername.php",
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

function sessionComplete() {
    if(authUrl != undefined) {
        $("#login-menu").append('<a href="' + authUrl + '">Log In<span id="login-full"> with Google</span></a>');
    } else {
        $("#login-menu").append('<a onclick="logout()"><span id="login-full">Hi, </span>' + display_name + '</a>');
    }
}