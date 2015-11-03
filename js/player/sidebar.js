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

    roomList.html('<ul id="roomlist-row"><span class="roomlist-title">Listeners</span></ul>');
	roomList.height($('#chat').height()).width($('#chat').width());
	
	roomList = $('#roomlist-row');

    user_list.forEach(function (userName, index) {
        temp = userName.toLowerCase(),
		dname = display_name.toLowerCase();

        if (temp == dname) {
            roomList.append('<li class="roomlist-listenersuser"><span class="chat-you">' + userName + '</span></li>');
			return;
        } else if (temp == "dcv" || temp == "williamtdr") {
            roomList.append('<li class="roomlist-listenersuser"><span class="chat-dev">' + userName + '</span></li>');
			return;
        } else {
            roomList.append('<li class="roomlist-listenersuser"><span>' + userName + '</span></li>');
			console.log('normal');
		}
    });
};

function sidebarInit() {
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

    $("#add-to-queue").click(function () {
        addCurrentSongToQueue();
    });

    $("#room-users").click(function () {
        toggleBoxes('roomlist');

        refreshUserList();
    });
		
	//Roomlist height resize
    $(window).on('resize', function () {
		if($('#roomlist').css('display') == 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#roomlist').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		} else
			return;
    });

    $('#room-queue').on('click', function () {
        if (!queuedSongs.length) {
            return false;
        }

        toggleBoxes('queueList');

        refreshQueueList();
    });
}

var currentPlaylistId;
function loadPlaylistItems(playlistId, more) {
    var data, container = $('.playlist-list-content');
    more = more || false;
    playlistId = playlistId || currentPlaylistId;

    data = {
        playlistId: playlistId,
        page: 'true'
    };

    if (!more) {
        currentPlaylistId = playlistId;

        delete data.page;

        container.html('');

        $(".sidebar-playlist-list").attr("hidden", "hidden");
        $(".sidebar-playlist-items").removeAttr("hidden");
    }

    container.append('<li class="list-group-item playlist loading"><i class="fa fa-circle-o-notch fa-spin"></i> Loading... </li>');

    $.ajax({
        url: config.API + "/youtube/getPlaylistItems.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: $.param(data),
        success: function (response) {
            var title, by_string, by_title;

            container.find('.loading').remove();

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

                container.append('<li class="list-group-item playlist"><img class="playlist-item-thumbnail" src="' + e.thumb + '" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div><span class="playlist-item-preview" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-queue" onclick="addToQueueById(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-plus"></i> Add to Room Queue</span></li>');
            });

            if (response.length < 50) {
                container.append('<li class="list-group-item playlist finished">End of list..</li>');
            }
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
	$(".searchResults .playlist-list-content").empty();
}

function search(more) {
    var container = $(".searchResults"),
        rowsContainer = container.find('.playlist-list-content'),
        searchText = $('#search_text').val().trim(),
        data;

    more = more || false;
	
    if (!searchText.length) {
        return false;
    }

    data = {
        q: searchText,
        page: 'true'
    };

    if (!more) {
        rowsContainer.html();
        delete data.page;
    }
	
	rowsContainer.empty();
    rowsContainer.append('<li class="list-group-item playlist loading">Loading... </li>');

    container.show();
    $.ajax({
        url: config.API + "/youtube/getSearchResults.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: $.param(data),
        success: function (response) {
            var title, by_string, by_title;
            rowsContainer.find('.loading').remove();

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

                rowsContainer.append('<li class="list-group-item playlist" onclick="loadVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><img class="playlist-item-thumbnail" src="' + e.thumb + '"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div></li>');
            });

            if (response.length < 50) {
                container.append('<li class="list-group-item playlist finished">End of list..</li>');
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}