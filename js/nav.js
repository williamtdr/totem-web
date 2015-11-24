const VIEW_DEFAULT = 0,
	  VIEW_ROOM_LIST = 1,
	  VIEW_PLAYER = 2,
	  VIEW_MUSIC_LIST = 3,
	  VIEW_CREATE_FORM = 4,
	  VIEW_CHAT = 5,
	  VIEW_INFO = 6;

const SUBVIEW_PLAYLIST_LIST = 0,
	  SUBVIEW_SEARCH = 1,
	  SUBVIEW_PLAYLIST_ITEMS = 2;

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
	music_list = $("#music_list"),
	create_form = $("#create_form");

var playlist_items = $("#playlist_items"),
	playlist_search = $("#playlist_search"),
	playlist_list = $("#playlist_list");

var navbar_shown = false;
current_view = VIEW_DEFAULT;

function shadeBackground(level) {
	bg_shader.css("opacity", level);
}

// Hides & resets all page switching elements so
// we can show a new page
function resetNavigation() {
	$(".active").removeClass("active");

	room_list.hide();
	player.hide();
	music_list.hide();
	create_form.hide();

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
			music_list.addClass("zoom-in-sm");
		break;
	}
}

// Switches which content the user sees. Includes the
// tabs in the navigation bar, create form, and additional
// views mobile users get as tabs.
function switchView(destination) {
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
			current_view = VIEW_ROOM_LIST;
		break;
		case VIEW_PLAYER:
			nav_player.addClass("active");
			player.show();
			current_view = VIEW_PLAYER;
		break;
		case VIEW_MUSIC_LIST:
			nav_music_list.addClass("active");
			music_list.show();
			shadeBackground(BACKGROUND_MUSIC_LIST_SHADING);
			current_view = VIEW_MUSIC_LIST;
		break;
		case VIEW_CREATE_FORM:
			nav_room_list.addClass("active");
			create_form.show();
			current_view = VIEW_CREATE_FORM;
		break;
	}
}

function switchSubView(destination) {
	playlist_items.hide();
	playlist_search.hide();
	playlist_list.hide();
	switch(destination) {
		case SUBVIEW_PLAYLIST_LIST:
			playlist_list.show();
		break;
		case SUBVIEW_SEARCH:
			playlist_search.show();
			$("#search_text").focus();
			$(".searchResults .playlist-list-content").empty();
		break;
		case SUBVIEW_PLAYLIST_ITEMS:
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
		menu.click(logout);
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