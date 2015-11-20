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

var toggleEmojiList = function() {
	$('.chat-emojilist').toggle().empty();
	
	var emojiList = emojiListString.replace(/_/g,'-').split(',');
	for (var x in emojiList)
		$('.chat-emojilist').append('<span title=":'+ emojiList[x] +':" class="twa twa-'+ emojiList[x] +'"></span>')
}

var refreshQueueList = function () {
    var queuelist = $('#queuelist');

    queuelist.html('<ul class="list-row"><li class="list-title">Queue List</li></ul>');
    queuelist.height($('#chat').height()).width($('#chat').width());
	if ($('#chat').css('display') !== 'block') {
		$('#chat').show().css('visibility','hidden');
		$('#queuelist').height($('#chat').height()).width($('#chat').width());
		$('#chat').hide().css('visibility', 'visible');
	}
	
	queuelist = $('.list-row');
    queuedSongs.forEach(function (q, index) {
        queuelist.append('<li class="list-item list-item-small"><span>' + q.song.artist + ' - ' + q.song.name + '</span></li>')
    });

};

var refreshUserList = function () {
    var userlist = $("#userlist"), temp;

    userlist.html('<ul class="list-row list-title">Listeners</ul>');
	userlist.height($('#chat').height()).width($('#chat').width());
	if ($('#chat').css('display') !== 'block') {
		$('#chat').show().css('visibility','hidden');
		$('#userlist').height($('#chat').height()).width($('#chat').width());
		$('#chat').hide().css('visibility', 'visible');
	}
	
	userlist = $('.list-row');
    user_list.forEach(function (userName, index) {
        temp = userName.toLowerCase(),
		dname = display_name.toLowerCase();

        if (temp == dname) {
            userlist.append('<li class="list-item list-item-small"><span class="chat-you">' + userName + '</span></li>');
        } else if (temp == "dcv" || temp == "williamtdr") {
            userlist.append('<li class="list-item list-item-small"><span class="chat-dev">' + userName + '</span></li>');
        } else {
            userlist.append('<li class="list-item list-item-small"><span>' + userName + '</span></li>');
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

    /*$("#room-users").click(function () {
        toggleBoxes('userlist');

        refreshUserList();
    });*/
		
	//Roomlist height resize
    $(window).on('resize', function () {
		if ($('#userlist').css('display') == 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#userlist').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		} else if ($('#queuelist').css('display') == 'block') {
			$('#chat').show().css('visibility','hidden');
			$('#queuelist').height($('#chat').height()).width($('#chat').width());
			$('#chat').hide().css('visibility', 'visible');
		} else
			return;
    });
	
	$('.chat_emojisel').on('click', toggleEmojiList);

    $('#room-queue').on('click', function () {
        if (!queuedSongs.length) {
            return false;
        }

        toggleBoxes('queuelist');

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