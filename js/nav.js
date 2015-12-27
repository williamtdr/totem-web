const VIEW_DEFAULT = 0,
	  VIEW_ROOM_LIST = 1,
	  VIEW_PLAYER = 2,
	  VIEW_MUSIC_LIST = 3,
	  VIEW_CREATE_FORM = 4,
	  VIEW_CHAT = 5,
	  VIEW_INFO = 6,
	  VIEW_BANNED = 7,
	  VIEW_REQUIRES_AUTHENTICATION = 8;

const SUBVIEW_DEFAULT = 0,
	  SUBVIEW_PLAYLIST_LIST = 1,
	  SUBVIEW_SEARCH = 2,
	  SUBVIEW_PLAYLIST_ITEMS = 3,
	  SUBVIEW_QUEUE_BANNED = 4;

const NAV_DEFAULT_SHADING = "rgba(0,0,0,0.3)",
	  NAV_DARK_SHADING = "rgba(0,0,0,0.9)",
	  BACKGROUND_DEFAULT_SHADING = 0.7,
	  BACKGROUND_MUSIC_LIST_SHADING = 1,
	  BACKGROUND_DISCONNECTED_SHADING = 1;

var nav = $("nav"),
	nav_room_list = $(".nav_room_list"),
	nav_player = $(".nav_player"),
	nav_music_list = $(".nav_music_list"),
	nav_chat = $(".nav_chat"),
	nav_info = $(".nav_info");

var room_list = $("#room_list"),
	player = $("#player"),
	mobile_chat = $("#mobile_chat"),
	mobile_info = $("#mobile_info"),
	music_list = $("#music_list"),
	create_form = $("#create_form"),
	banned = $("#permission_failure"),
	requires_authentication = $("#requires_authentication"),
	waiting_for_server = $("#waiting_for_server");

var playlist_items = $("#playlist_items"),
	playlist_search = $("#playlist_search"),
	playlist_list = $("#playlist_list"),
	playlist_banned = $("#queue_permission_failure");

var previous_playlist_scroll_pos = 0;

var navbar_shown = false;
current_view = VIEW_DEFAULT,
current_subview = SUBVIEW_DEFAULT;
set_initial_background = false;

function shadeBackground(level) {
	bg_shader.css("opacity", level);
}

function disableNavigation() {
	nav.hide();
}

// Hides & resets all page switching elements so
// we can show a new page
function resetNavigation() {
	$(".active").removeClass("active");

	room_list.hide();
	player.hide();
	mobile_chat.hide();
	music_list.hide();
	create_form.hide();
	mobile_info.hide();
	banned.hide();
	requires_authentication.hide();

	shadeBackground(BACKGROUND_DEFAULT_SHADING);

	// Add animation classes back to the old page,
	// so we get a nice zoom effect the next time
	// the user visits that page
	switch(current_view) {
		case VIEW_ROOM_LIST:
			room_list.addClass("zoom-in-sm");
		break;
		case VIEW_PLAYER:
			player.addClass("zoom-in-sm");
		break;
		case VIEW_MUSIC_LIST:
			if(previous_playlist_scroll_pos == 0) music_list.addClass("zoom-in-sm");
		break;
		case VIEW_CHAT:
			mobile_chat.addClass("zoom-in-sm");
		break;
		case VIEW_INFO:
			mobile_info.addClass("zoom-in-sm");
		break;
	}
}

// Switches which content the user sees. Includes the
// tabs in the navigation bar, create form, and additional
// views mobile users get as tabs.
function switchView(destination) {
	if(current_view == VIEW_MUSIC_LIST && destination != VIEW_MUSIC_LIST) {
		previous_playlist_scroll_pos = pageYOffset;
	}

    if(destination != VIEW_PLAYER && !set_initial_background) {
        advanceBackgroundImage();
        set_initial_background = true;
    }

	resetNavigation();

	if(!navbar_shown) {
		nav.css("opacity", 1);
		navbar_shown = true;
	}

	switch(destination) {
		case VIEW_ROOM_LIST:
			refreshRoomList();
			nav_room_list.addClass("active");
			room_list.show();
			$('#user_list').hide();
			$('#queue_list').hide();
			$('#chat').show();
			current_view = VIEW_ROOM_LIST;
		break;
		case VIEW_PLAYER:
			nav_player.addClass("active");
			player.show();
			current_view = VIEW_PLAYER;
            if(delayed_notification_request) showNotificationPrompt();
		break;
		case VIEW_MUSIC_LIST:
			nav_music_list.addClass("active");
			music_list.show();
			shadeBackground(BACKGROUND_MUSIC_LIST_SHADING);
			current_view = VIEW_MUSIC_LIST;
			if(client.queue_banned) {
				switchSubView(SUBVIEW_QUEUE_BANNED);
			} else {
				window.scrollTo(0, previous_playlist_scroll_pos);
			}
		break;
		case VIEW_CREATE_FORM:
			nav_room_list.addClass("active");
			create_form.show();
			current_view = VIEW_CREATE_FORM;
		break;
		case VIEW_BANNED:
			nav_player.addClass("active");
			$("#now_playing").hide();
			$("#no_video").hide();
			player.show();
			banned.show();
			$("#sidebar").hide();
			current_view = VIEW_BANNED;
		break;
		case VIEW_REQUIRES_AUTHENTICATION:
			nav_player.addClass("active");
			waiting_for_server.hide();
			$("#now_playing").hide();
			$("#no_video").hide();
			player.show();
			requires_authentication.show();
			$("#sidebar").hide();
			current_view = VIEW_REQUIRES_AUTHENTICATION;
		break;
		case VIEW_CHAT:
			nav_chat.addClass("active");
			mobile_chat.show();
			current_view = VIEW_CHAT;
		break;
		case VIEW_INFO:
			nav_info.addClass("active");
			mobile_info.show();
			$('#mobile_user_list').show();
			$('#mobile_queue_list').hide();
			if($('.room-informations .room-queue').hasClass('selected')) {
				$('.room-informations .room-users').addClass('selected');
				$('.room-informations .room-queue').removeClass('selected');
			}
			current_view = VIEW_INFO;
	}
}

function switchSubView(destination) {
	playlist_items.hide();
	playlist_search.hide();
	playlist_list.hide();
	current_subview = destination;
	switch(destination) {
		case SUBVIEW_PLAYLIST_LIST:
			if(client.queue_banned) {
				playlist_banned.show();
			} else {
				playlist_list.show();
			}
		break;
		case SUBVIEW_SEARCH:
			playlist_search.show();
			$(".searchResults .playlist-list-content").empty();
			$("#search_suggestions").show().empty();
			$("#search_text").val("").focus();
			if(localStorage.getItem("search_history")) {
				var history = JSON.parse(localStorage.getItem("search_history"));
				if(history) {
					history.reverse();
					$.each(history, function(index, history_item) {
						console.log(history_item);
						$("#search_suggestions").append('<li>' + history_item + '</li>');
					});
					bindSuggestionActions();
				}
				if(history.length > 0) $("#clear_search_history").show();
			}
		break;
		case SUBVIEW_PLAYLIST_ITEMS:
			playlist_items.show();
		break;
		case SUBVIEW_QUEUE_BANNED:
			playlist_banned.show();
		break;
	}
}

function initNavigation() {
	nav_room_list.click(function() {
		return switchView(VIEW_ROOM_LIST)
	});
	nav_player.click(function() {
		return switchView(VIEW_PLAYER)
	});
	nav_music_list.click(function() {
		return switchView(VIEW_MUSIC_LIST)
	});
	nav_chat.click(function() {
		return switchView(VIEW_CHAT)
	});
	nav_info.click(function() {
		return switchView(VIEW_INFO)
	});
}

function navOnLogin() {
	var menu = $("#login_menu");
	if(authkey == 'unauthenticated') {
		menu.addClass("signInButton");
		menu.html('Log In<span id="login-full"> with Google');
	} else {
        menu.removeClass("signInButton");
        menu.unbind();
		menu.click(function() {
			var user_menu = $("#user_menu");
			if(user_menu.is(":visible")) $(".expanded").click();
            user_menu.animate({height:"toggle"});
        });
        $("#logout").click(logout);
		menu.html('<span id="login-full">Hi, </span>' + display_name);
	}
}

// When the user scrolls down past the top of the page in
// their music listing or on the room list, darken the navbar
// a bit so the page content doesn't bleed through
$(window).scroll(function() {
	var winElement = $(window)[0];

	if(winElement.pageYOffset > 20) {
		nav.css("background-color", NAV_DARK_SHADING);
	} else {
		nav.css("background-color", NAV_DEFAULT_SHADING);
	}
});