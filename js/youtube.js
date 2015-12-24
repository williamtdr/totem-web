searching = false;
search_term = "";

function loadYoutubePlaylists() {
	$("#playlist_list").html('<b><i class="fa fa-circle-o-notch fa-spin"></i> Loading...</b>');
	$.ajax({
		url: config.API + "/youtube/getPlaylists.php",
		jsonp: "callback",
		dataType: "jsonp",
		success: function(response) {
			$("#playlist_list")
				.html('<a href="https://www.youtube.com/view_all_playlists" target="_blank"><i class="fa fa-th-list"></i> Manage Playlists</a><a href="http://www.playlistbuddy.com/" target="_blank"><i class="fa fa-spotify"></i> Spotify Importer</a><a onclick="loadYoutubePlaylists()"><i class="fa fa-refresh"></i> Refresh</a><ul class="list-group sidebar-playlist"><li class="list-group-item" id="search_launcher">Search YouTube</li>');

			$("#search_launcher").click(function() {
				switchSubView(SUBVIEW_SEARCH);
			});

			if(response.success) {
				$.each(response.data, function(name, id) {
					$("#playlist_list ul").append("<li class=\"list-group-item playlist-launcher\" data-name=\"" + name.replace('"', "&quot;") + "\" data-id=\"" + id + "\">" + name + "</li>");
				});
				$(".playlist-launcher").click(loadPlaylistItems);
			} else {
				$("#playlist_list ul").append("There was a problem retrieving your YouTube playlists. Check to make sure that a Youtube channel exists for your account and you are logged in.");
			}
		},
		error: function(error) {
			$("#room_list_content").append('<b>There was a problem retrieving your YouTube playlists. <a onclick="loadYoutubePlaylists()">Refresh?</a></b>');
		}
	});
}

function search(more) {
	var container = $(".searchResults"),
		rowsContainer = container.find('.playlist-list-content'),
		searchText = $('#search_text').val().trim(),
		data;

	more = more || false;

	if(!searchText.length) {
		return false;
	}

	data = {
		q: searchText,
		page: 'true'
	};

	if(!more) {
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
		success: function(response) {
			var title, by_string, by_title;
			rowsContainer.find('.loading').remove();

			$.each(response, function(index, e) {
				title = e.title;
				if(title.length > 60) {
					title = $.trim(e.title.replace(/(["])/g, "&quot;").replace(/(['])/g, "&#39;")).substring(0, 60).split(" ").slice(0, -1).join(" ") + "...";
				}
				by_string = "";
				by_title = "";
				if(e.by != undefined) {
					by_string = '<span class="playlist_item_artist">by ' + e.by + '</span>';
					by_title = e.by.replace('"', '\"');
				}
				rowsContainer.append('<li class="list-group-item playlist"><img class="playlist-item-thumbnail" src="' + e.thumb + '" onclick="previewVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div><span class="playlist-item-preview" onclick="previewVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-queue" data-id="' + e.link + '"><i class="fa fa-plus"></i> Add to Queue</span></li>');
			});
			$(".playlist-item-queue").click(function(e) {
				var target = $(e.target);
				addToQueueById(target.data('id'));
			});

			if(response.length == 0) {
				container.append('<li class="list-group-item playlist finished">No results. Check your spelling and try again.</li>');
			} else if(response.length < 50) {
				container.append('<li class="list-group-item playlist finished">-- end --</li>');
			}
		},
		error: function(error) {
			console.log(error);
		}
	});
}

var currentPlaylistId;
function loadPlaylistItems(el, more) {
	var playlistId = $(this).data('id'),
		name = $(this).data('name'),
		data,
		container = $('.playlist-list-content');
	more = more || false;
	playlistId = playlistId || currentPlaylistId;

	data = {
		playlistId: playlistId,
		page: 'true'
	};

	if(!more) {
		currentPlaylistId = playlistId;

		delete data.page;

		container.html('');

		$("#playlist_list").hide();
		$("#playlist_items").show();
	}

	container.append('<li class="list-group-item playlist loading"><i class="fa fa-circle-o-notch fa-spin"></i> Loading... </li>');

	$.ajax({
		url: config.API + "/youtube/getPlaylistItems.php",
		jsonp: "callback",
		dataType: "jsonp",
		data: $.param(data),
		success: function(response) {
			console.log(response);
			var title, by_string, by_title;

			container.find('.loading').remove();

			container.append('<div class="playlist_header"><div class="playlist_name">' + name + '</div><div class="queue_current_playlist no-sel"><i class="fa fa-plus"></i> Queue Playlist</div></div>');
			$.each(response, function(index, e) {
				title = e.title;
				if(title.length > 60) {
					title = $.trim(e.title.replace(/(["])/g, "&quot;").replace(/(['])/g, "&#39;")).substring(0, 60).split(" ").slice(0, -1).join(" ") + "...";
				}
				by_string = "";
				by_title = "";
				if(e.by != undefined) {
					by_string = '<span class="playlist_item_artist">by ' + e.by + '</span>';
					by_title = e.by.replace('"', '\"');
				}

				container.append('<li class="list-group-item playlist"><img class="playlist-item-thumbnail" src="' + e.thumb + '" onclick="previewVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><div class="playlist-item-metadata-container"><span class="playlist-item-title">' + title + '</span>' + by_string + '</div><span class="playlist-item-preview" onclick="previewVideo(\'' + e.link + '\', \'' + e.title.replace(/(['"])/g, "&quot;") + '\', \'' + by_title + '\')"><i class="fa fa-play"></i> Preview</span><span class="playlist-item-queue" data-id="' + e.link + '"><i class="fa fa-plus"></i> Add to Queue</span></li>');
			});
			$(".playlist-item-queue").click(function(e) {
				var target = $(e.target);
				addToQueueById(target.data('id'));
			});

			if(response.length == 0) {
				container.append('<li class="list-group-item playlist finished">This playlist is empty.</li>');
			} else if(response.length < 50) {
				container.append('<li class="list-group-item playlist finished">-- end --</li>');
			}
		},
		error: function(error) {
			container.find('.loading').remove();
			container.append('<li class="list-group-item playlist finished">Error when trying to load playlist content - check that you have permission.</li>');
		}
	});
}

$(window).scroll(function() {
	var docElement = $(document)[0].documentElement,
		winElement = $(window)[0],
		videoRows = $('li.list-group-item.playlist'),
		rowsLoading = $('li.list-group-item.playlist.loading'),
		rowsFinished = $('li.list-group-item.playlist.finished');

	if(!videoRows.length || rowsLoading.length || rowsFinished.length) {
		return false;
	}

	if((docElement.scrollHeight - winElement.innerHeight) == winElement.pageYOffset) {
		if(searching) {
			search(true);

			return false;
		}

		loadPlaylistItems(false, true);
	}
});

function getYoutubeRate(videoId) {
	var container = $('#youtube_rate');

	$.ajax({
		url: config.API + '/youtube/video.php',
		data: $.param({
			id: videoId,
			action: 'status'
		}),
		jsonp: "callback",
		dataType: "jsonp",
		success: function(r) {
			if(r.success) {
				container.find('.rate')
					.text((r.message == 'like') ? 'Unlike' : 'Like');

				container.attr('data-videoid', videoId);
				container.show();

				return false;
			}

			console.warn(r);
		}
	});
}

function initSearch() {
	$(".playlist-list-return").click(function() {
		switchSubView(SUBVIEW_PLAYLIST_LIST);
	});

	$('#searchYoutube').on('submit', function(ev) {
		ev.preventDefault();

		search();
	});
}