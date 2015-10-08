function sidebarInit() {
    $("#chat_message").keyup(function(event){
        if(event.keyCode == 13){
            $("#chat_send").click();
        }
    });

    $("#chat_send").click(function() {
        server.send(JSON.stringify({
            event: "chat",
            data: $("#chat_message").val(),
            key: authkey
        }));
        $("#chat_message").val("");
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

}

function updateMyQueue() {
    if(in_queue) {
        $(".queue-list-content").empty();
        $.each(my_queue, function(index, value) {
            if(value.id == player.getVideoData().video_id) {
                my_queue.splice(index, 1);
            }
        });

        if(my_queue.length == 0) {
            in_queue = false;
            $("#in-room").removeAttr("hidden");
            $("#queue-container").attr("hidden", "hidden");
        } else {
            $.each(my_queue, function(index, value) {
                $(".queue-list-content").append('<li class="list-group-item playlist" onclick="loadVideo(\'' + value.id + '\', \'' + value.title + '\', \'' + value.artist + '\')"><div class="queue-item-metadata-container"><span class="playlist-item-title">' + value.artist + '</span><span class="playlist-item-artist-container">by <span class="playlist-item-artist">' + value.artist + '</span></span></div></li>');
            });
            if(nothing_playing) {
                $(".queue-status").removeAttr("hidden");
            } else {
                $(".queue-status").attr("hidden", "hidden");
            }
        }
    }
}

function loadPlaylistItems(playlistId) {
    $("#background_shader").animate({
        opacity: 1
    }, 1000);
    $(".sidebar-playlist-list").attr("hidden", "hidden");
    $(".sidebar-playlist-items").removeAttr("hidden");
    $(".playlist-list-content").empty();
    $(".playlist-list-content").append('<li class="list-group-item playlist">Loading... </li>');
    $.ajax({
        url: "http://totem.fm/api/getYoutubePlaylistItems.php",
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
    $(".sidebar").animate({
        width: "300px"
    }, 250);
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
    $(".sidebar").animate({
        width: "300px"
    }, 250);
    $(".emblem-history").animate({
        "margin-left": "50px"
    }, 250);
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
    $(".sidebar").animate({
        width: "420px"
    }, 250);
    $(".emblem-history").animate({
        "margin-left": "100px"
    }, 250);
    $(".sidebar-search").attr("hidden", "hidden");
    $(".sidebar-playlist-items").removeAttr("hidden");
    $("#background_shader").animate({
        opacity: 1
    }, 1000);
    $(".playlist-list-content").empty();
    $(".playlist-list-content").append('<li class="list-group-item playlist">Loading... </li>');
    $.ajax({
        url: "http://totem.fm/api/getYoutubeSearchResults.php",
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