var toggleBoxes = function (exceptId) {
    var tempEl,
        toShow = $('#' + exceptId),
        isVisible = (toShow.css('display') == 'block');

    if (isVisible) {
        toShow.fadeOut('fast');
        $('.chat').fadeIn('fast');
        return false;
    }

    $('.toToggle').each(function () {
        tempEl = $(this);
        if (tempEl.attr('id') !== exceptId) {
            tempEl.fadeOut('fast');
            return;
        }

        tempEl.fadeIn('fast');
    });
};

var refreshQueueList = function () {
    var queueList = $('#queueList');

    queueList.html('<span>In queue:</span>');

    queuedSongs.forEach(function (q, index) {
        queueList.append('<li><span>' + q.song.artist + '-' + q.song.name + '</span></li>')
    });
};

var refreshUserList = function () {
    var roomList = $("#roomlist"), temp;

    roomList.html('<span>Listeners</span>');

    user_list.forEach(function (userName, index) {
        temp = userName.toLowerCase;

        if (temp == display_name)
            roomList.append('<li><span class="roomlist-prename">&gt;</span><span class="chat-you">' + userName + '</span></li>');
        if (temp == "dcv" || temp == "williamtdr")
            roomList.append('<li><span class="roomlist-prename">&gt;</span><span class="chat-dev">' + userName + '</span></li>');
        else
            roomList.append('<li><span class="roomlist-prename">&gt;</span><span>' + userName + '</span></li>');
    });
};

function sidebarInit() {
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

    $("#search_text").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#search_send").click();
        }
    });

    $("#volume-toggle").click(function () {
        if (muted) {
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

    $("#search_send").click(function () {
        search($("#search_text").val());
        $("#search_text").val("");
    });

    $("#add-to-queue").click(function () {
        addCurrentSongToQueue();
    });

    $("#room-users").click(function () {
        toggleBoxes('roomlist');

        refreshUserList();
    });

    $('#room-queue').on('click', function () {
        if (!queuedSongs.length) {
            return false;
        }

        toggleBoxes('queueList');

        refreshQueueList();
    });
}

function loadPlaylistItems(playlistId) {
    $(".sidebar-playlist-list").attr("hidden", "hidden");
    $(".sidebar-playlist-items").removeAttr("hidden");
    $(".playlist-list-content").empty();
    $(".playlist-list-content").append('<li class="list-group-item playlist">Loading... </li>');
    $.ajax({
        url: config.API + "/youtube/getPlaylistItems.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            playlistId: playlistId
        },
        success: function (response) {
            $(".playlist-list-content").empty();
            $.each(response, function (index, e) {
                title = e.title;
                if (title.length > 60) {
                    title = $.trim(e.title.replace(/(["])/g, "&quot;").replace(/(['])/g, "&#39;")).substring(0, 60).split(" ").slice(0, -1).join(" ") + "...";
                }
                by_string = "";
                by_title = "";
                if (e.by != undefined) {
                    by_string = '<span class="playlist-item-artist-container">by <span class="playlist-item-artist">' + e.by + '</span></span>';
                    by_title = e.by.replace('"', '\"');
                }
                $(".playlist-list-content").append('<li class="list-group-item playlist"><img class="playlist-item-thumbnail" src="' + e.thumb + '" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div><span class="playlist-item-preview" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-queue" onclick="addToQueueById(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-plus"></i> Add to Room Queue</span></li>');
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

var sidebar_state = 'playlist';
var muted = false;
var volumeBeforeMute = 50;

function switchSidebar(destination) {
    if (sidebar_state == destination) return;

    $(".sidebar-chat").attr("hidden", "hidden");
    $(".sidebar-playlist-list").attr("hidden", "hidden");
    $(".sidebar-search").attr("hidden", "hidden");
    $(".sidebar-history").attr("hidden", "hidden");
    $(".sidebar-no-login").attr("hidden", "hidden");
    $(".sidebar-playlist-items").attr("hidden", "hidden");
    $(".emblem-active").removeClass("emblem-active");

    sidebar_state = destination;
    switch (destination) {
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
        url: config.API + "/youtube/getSearchResults.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            q: text
        },
        success: function (response) {
            $(".playlist-list-content").empty();
            $.each(response, function (index, e) {
                title = e.title;
                if (title.length > 60) {
                    title = $.trim(e.title.replace(/(["])/g, "&quot;").replace(/(['])/g, "&#39;")).substring(0, 60).split(" ").slice(0, -1).join(" ") + "...";
                }
                by_string = "";
                by_title = "";
                if (e.by != undefined) {
                    by_string = '<span class="playlist-item-artist-container">by <span class="playlist-item-artist">' + e.by + '</span></span>';
                    by_title = e.by.replace('"', '\"');
                }
                $(".playlist-list-content").append('<li class="list-group-item playlist" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><img class="playlist-item-thumbnail" src="' + e.thumb + '"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div></li>');
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}