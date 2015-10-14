function sidebarInit() {
    $(".chat_message").keyup(function(event){
        if(event.keyCode == 13){
            $(".chat_send").click();
        }
    });

    $(".chat_send").click(function() {
        server.send(JSON.stringify({
            event: "chat",
            data: $(".chat_message").val(),
            key: authkey
        }));
        $(".chat_message").val("");
    });

    $("#search_text").keyup(function(event){
        if(event.keyCode == 13){
            $("#search_send").click();
        }
    });

    $("#volume-toggle").click(function() {
        if(muted) {
            player.setVolume(volumeBeforeMute);
            $("#volume-slider").val(volumeBeforeMute);
            $(".fa-volume-off").addClass("fa-volume-down");
            $(".fa-volume-down").removeClass("fa-volume-off");
            muted = false;
        } else {
            volumeBeforeMute = player.getVolume();
            player.setVolume(0);
            $("#volume-slider").val(0);
            $(".fa-volume-down").addClass("fa-volume-off");
            $(".fa-volume-off").removeClass("fa-volume-down");
            muted = true;
        }
    });

    $("#search_send").click(function() {
        search($("#search_text").val());
        $("#search_text").val("");
    });

    $("#add-to-queue").click(function() {
        addCurrentSongToQueue();
    });

    $("#room-users, .subcaption-users").click(function() {
        $(".chat").fadeToggle("fast");
        $("#roomlist").fadeToggle("fast");
        $("#roomlist-row").empty().append('<li class="roomlist-title"><span>Listeners</span></li>');

        for(var listd in user_list) {
            if(listd[i].toLowerCase() == display_name)
                $("#roomlist-row").append('<li><span class="roomlist-prename">&gt;</span><span class="chat-you">listd[i]</span></li>');
            if(listd[i].toLowerCase().toString() == "dcv" || data.sender.toLowerCase().toString() == "williamtdr")
                $("#roomlist-row").append('<li><span class="roomlist-prename">&gt;</span><span class="chat-dev">listd[i]</span></li>');
            else
                $("#roomlist-row").append('<li><span class="roomlist-prename">&gt;</span><span>listd[i]</span></li>');
        }
    });

    if(window.localStorage.getItem("is_fullscreen") !== undefined) {
        if(window.localStorage.getItem("is_fullscreen") == "true") setFullscreen(true);
    } else {
        window.localStorage.setItem("is_fullscreen", false);
    }

    $(window).resize(function () {
        resize();
    });

    $("#fullscreen-toggle").click(function() {
        if(fullscreen) {
            setFullscreen(false);
        } else {
            setFullscreen(true);
        }
    });

    resize();
}

function resize() {
    if(window.innerWidth <= 1400) {
        setFullscreen(true);
        $("#fullscreen-toggle").hide();
    } else {
        $("#fullscreen-toggle").show();
    }

    autosizePlayer();
}

function autosizePlayer() {
    var player_el = $("#player");

    if(window.innerWidth <= 500) {
        $("#now_playing_content").removeClass("container");
    } else {
        $("#now_playing_content").addClass("container");
    }

    if(window.innerWidth <= 768) {
        $("#mobile_navigation_emblems").removeAttr("hidden");
        $("div[role=\"navigation\"]").attr("hidden", "hidden");
        if(window.innerWidth > 768) {
            player_el.css("width", $("#now_playing_content").width() - 50 + "px");
        } else {
            player_el.css("width", $("#now_playing_content").width() + "px");
        }
        player_el.css("height", ($("#now_playing_content").width() / 1.77) + "px");
        $("#time_elapsed").css("margin-left", "0");
        $("#sidebar").attr("hidden", "hidden");
        $("#no_video").removeClass("fullscreen");
        $("#toggles").css("padding-left", "10px");
        $("#no_video").css("margin-left", "5px");
        $(".big-header").css("margin-top", "0");
    } else {
        $("#mobile_navigation_emblems").attr("hidden", "hidden");
        $("div[role=\"navigation\"]").removeAttr("hidden");
        $("#time_elapsed").css("margin-left", "0");
        $("#toggles").css("padding-left", "0");
        $("#sidebar").removeAttr("hidden");
        $("#no_video").css("margin-left", "5px");
        $(".big-header").css("margin-top", "30px");
        if(fullscreen) {
            player_el.css("height", Math.min((($("#now_playing_content").width() - 400) / 1.77), ($("#now_playing_content").height() - 250)) + "px");
            if(Math.min((($("#now_playing_content").width() - 400) / 1.77), ($("#now_playing_content").height() - 250)) == ($("#now_playing_content").height() - 250)) {
                player_el.css("width", (($("#now_playing_content").height() - 320) * 1.77) + "px");
            } else {
                player_el.css("width", $("#now_playing_content").width() - 400 + "px");
            }
        } else {
            player_el.css("width", "640px");
            player_el.css("height", "390px");
        }
    }

    $("#main_content").css("width", player_el.width());
}

function setFullscreen(is_fullscreen) {
    if(is_fullscreen) {
        var arrow_gui = $(".fa-expand");
        arrow_gui.addClass("fa-compress");
        arrow_gui.removeClass("fa-expand");
        window.localStorage.setItem("is_fullscreen", true);
        $("#main_content").addClass("fullscreen");
        $(".player-container").addClass("fullscreen");
        $(".score_wrapper_top").attr("hidden", "hidden");
        $(".score_wrapper_bottom").removeAttr("hidden");
        $("#room-description-wrapper").hide();
    } else {
        var arrow_gui = $(".fa-compress");
        arrow_gui.addClass("fa-expand");
        arrow_gui.removeClass("fa-compress");
        window.localStorage.setItem("is_fullscreen", false);
        $("#main_content").removeClass("fullscreen");
        $(".player-container").removeClass("fullscreen");
        $(".score_wrapper_top").removeAttr("hidden");
        $(".score_wrapper_bottom").attr("hidden", "hidden");
        $("#room-description-wrapper").show();
    }
    fullscreen = is_fullscreen;
    autosizePlayer();
}

function loadPlaylistItems(playlistId) {
    $(".sidebar-playlist-list").attr("hidden", "hidden");
    $(".sidebar-playlist-items").removeAttr("hidden");
    $(".playlist-list-content").empty();
    $(".playlist-list-content").append('<li class="list-group-item playlist">Loading... </li>');
    $.ajax({
        url: "http://api.totem.fm/youtube/getPlaylistItems.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            playlistId: playlistId
        },
        success: function( response ) {
            $(".playlist-list-content").empty();
            $.each(response, function(index, e) {
                title = e.title;
                if(title.length > 60) {
                    title = $.trim(e.title.replace(/(["])/g, "&quot;").replace(/(['])/g, "&#39;")).substring(0, 60).split(" ").slice(0, -1).join(" ") + "...";
                }
                by_string = "";
                by_title = "";
                if(e.by != undefined) {
                    by_string = '<span class="playlist-item-artist-container">by <span class="playlist-item-artist">' + e.by + '</span></span>';
                    by_title = e.by.replace('"', '\"');
                }
                $(".playlist-list-content").append('<li class="list-group-item playlist"><img class="playlist-item-thumbnail" src="' + e.thumb + '" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div><span class="playlist-item-preview" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-queue" onclick="addToQueueById(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-plus"></i> Add to Room Queue</span></li>');
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

var sidebar_state = 'playlist';
var muted = false;
var volumeBeforeMute = 50;

function switchSidebar(destination) {
    if(sidebar_state == destination) return;

    $(".sidebar-chat").attr("hidden", "hidden");
    $(".sidebar-playlist-list").attr("hidden", "hidden");
    $(".sidebar-search").attr("hidden", "hidden");
    $(".sidebar-history").attr("hidden", "hidden");
    $(".sidebar-no-login").attr("hidden", "hidden");
    $(".sidebar-playlist-items").attr("hidden", "hidden");
    $(".emblem-active").removeClass("emblem-active");

    sidebar_state = destination;
    switch(destination) {
        case 'chat':
            $(".sidebar-chat").removeAttr("hidden");
            $(".emblem-chat").addClass("emblem-active");
            break;
        case 'playlist':
            $(".sidebar-playlist-list").removeAttr("hidden");
            $(".sidebar-o-login").removeAttr("hidden");
            $(".emblem-playlist").addClass("emblem-active");
            break;
        case 'history':
            $(".emblem-history").addClass("emblem-active");
            $(".sidebar-history").removeAttr("hidden");
            break;
    }
}

function returnToPlaylistList() {
    $(".sidebar-playlist-list").removeAttr("hidden");
    $(".sidebar-playlist-items").attr("hidden", "hidden");
    $(".sidebar-search").attr("hidden", "hidden");
}

function showSearch() {
    $(".sidebar-chat").attr("hidden", "hidden");
    $(".sidebar-playlist-list").attr("hidden", "hidden");
    $(".sidebar-search").attr("hidden", "hidden");
    $(".sidebar-no-login").attr("hidden", "hidden");
    $(".sidebar-playlist-items").attr("hidden", "hidden");
    $(".sidebar-search").removeAttr("hidden");
    $("#search_text").focus();
}

function search(text) {
    $(".sidebar-search").attr("hidden", "hidden");
    $(".sidebar-playlist-items").removeAttr("hidden");
    $(".playlist-list-content").empty();
    $(".playlist-list-content").append('<li class="list-group-item playlist">Loading... </li>');
    $.ajax({
        url: "http://api.totem.fm/youtube/getSearchResults.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            q: text
        },
        success: function(response) {
            $(".playlist-list-content").empty();
            $.each(response, function(index, e) {
                title = e.title;
                if(title.length > 60) {
                    title = $.trim(e.title.replace(/(["])/g, "&quot;").replace(/(['])/g, "&#39;")).substring(0, 60).split(" ").slice(0, -1).join(" ") + "...";
                }
                by_string = "";
                by_title = "";
                if(e.by != undefined) {
                    by_string = '<span class="playlist-item-artist-container">by <span class="playlist-item-artist">' + e.by + '</span></span>';
                    by_title = e.by.replace('"', '\"');
                }
                $(".playlist-list-content").append('<li class="list-group-item playlist" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><img class="playlist-item-thumbnail" src="' + e.thumb + '"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div></li>');
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}