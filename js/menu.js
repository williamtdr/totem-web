$.fn.extend({clearIndicator: function() {
    this.removeClass("switch-disabled").removeClass("switch-enabled").removeClass("switch-multiple");
    return this;
}});

delayed_notification_request = false;
supress_notification_request = false;

function updateClientSettings() {
    var setting_song_change = $("#setting_song_change"),
        setting_chat_notifications = $("#setting_chat_notifications"),
        have_notifs_to_show = false;
    if(client.settings.notif_song_change) {
        $(setting_song_change.find(".switch-indicator")[0]).clearIndicator().addClass("switch-enabled").html("ON");
        have_notifs_to_show = true;
    } else {
        $(setting_song_change.find(".switch-indicator")[0]).clearIndicator().addClass("switch-disabled").html("OFF");
    }
    if(client.settings.notif_chat) {
        have_notifs_to_show = true;
        if(client.settings.notif_chat == "mention") {
            $(setting_chat_notifications.find(".switch-indicator")[0]).clearIndicator().addClass("switch-multiple").html("MENTION");
        } else {
            $(setting_chat_notifications.find(".switch-indicator")[0]).clearIndicator().addClass("switch-enabled").html("ALL");
        }
    } else {
        $(setting_chat_notifications.find(".switch-indicator")[0]).clearIndicator().addClass("switch-disabled").html("OFF");
    }
    if(!client.settings.hide_hints) {
        supress_notification_request = true;
        showBasicTutorial();
        return false;
    }
    if(!have_notifs_to_show) return false;
    if(current_view == VIEW_PLAYER) {
        showNotificationPrompt();
    } else {
        delayed_notification_request = true;
    }
}

var tutorial_progress = -1;
var tutorial_stops = [
    {
        title: "Video Player",
        text: "Here's the information and video for the current song. Everyone takes turns adding songs to play, and you can see who's playing now next to the headphones.",
        height: "185px",
        top: "55px",
        right: (window.innerWidth - 430) + "px"
    }, {
        title: "Actions",
        text: "On the left, you can hide or show the video and adjust the volume. Use the up and down arrows on the right to vote on a song - songs that people dislike are skipped, and positive feedback helps the DJ. The like button will save the song to your liked playlist on YouTube.",
        height: "235px",
        top: (window.innerHeight - 300) + "px",
        right: (window.innerWidth - 430) + "px"
    }, {
        title: "Room",
        text: "Here you can see information about the room. Click on the listening and queue numbers to see more information.",
        height: "165px",
        top: "250px",
        right: "30px"
    }, {
        title: "My Music",
        text: "From this screen you can select music to play for everyone else in the room. You can use songs from your YouTube playlists or the search feature to find music.",
        height: "185px",
        top: "55px",
        right: "30px",
        oncomplete: function() {
            switchView(VIEW_MUSIC_LIST);
        }
    }, {
        title: "Room List",
        text: "On the Rooms tab, you can see all of the rooms on Totem and what they're playing. You can also create a room here.",
        height: "165px",
        top: "55px",
        right: "30px",
        oncomplete: function() {
            switchView(VIEW_ROOM_LIST);
        }
    }, {
        title: "You're all set!",
        text: "That's everything you need to know. Enjoy your time, we hope you find some great music.",
        height: "165px",
        top: "55px",
        right: "30px",
        oncomplete: function() {
            switchView(VIEW_PLAYER);
            $("#basic_player_tutorial_advance").html("Bye!");
        }
    }
];

function showBasicTutorial() {
    if(window.localStorage.getItem("no_tutorial")) {
        client.settings.hide_hints = true;
        saveSettings();
        return false;
    }
    $("#basic_player_tutorial").delay(3000).animate({height: "toggle"});
    $("#basic_player_tutorial_accept").click(function() {
        var advance = $("#basic_player_tutorial_advance"),
            notification = $("#basic_player_tutorial"),
            header = $("#basic_player_tutorial h4"),
            text = $("#basic_player_tutorial p");
        $("#basic_player_tutorial_actions span").hide();
        client.settings.hide_hints = true;
        saveSettings();
        advance.show();
        advance.click(function() {
            tutorial_progress++;
            var stop = tutorial_stops[tutorial_progress];
            if(stop == undefined) {
                $("#basic_player_tutorial").animate({height: "toggle"});
            }
            $("#dot" + tutorial_progress).addClass("dot-done");
            header.html(stop.title);
            text.html(stop.text);
            notification.animate({right: stop.right,height: stop.height, top: stop.top});
            if(stop.oncomplete) stop.oncomplete();
        });
        advance.click();
    });
    $("#basic_player_tutorial_deny").click(function() {
        client.settings.hide_hints = true;
        window.localStorage.setItem("no_tutorial", true);
        $("#basic_player_tutorial").animate({height: "toggle"});
    });
    $("#basic_player_tutorial_advance").click();
}

function showNotificationPrompt() {
    if(supress_notification_request) return false;
    if(Notification.permission !== "granted") {
        if(!window.localStorage.getItem("no_notifications")) {
            $("#notification_request").delay(5000).animate({height: "toggle"});
        }
    }
    $("#notification_request_actions").click(function() {
        $("#notification_request_actions").animate({height: "toggle"});
    });
    $("#notification_request_accept").click(function() {
        $("#notification_request p").html("Your browser will now ask you if you want to see the notifications. Click \"Allow\", \"Accept\", etc.");
        $("#notification_request").animate({height: "125px"});
        Notification.requestPermission(function() {
            $("#notification_request").animate({height: "165px"});
            $("#notification_request p").html("You're all set! You can change which events you get notified in the settings menu (click your name in the upper right).");
            $("#notification_request_actions").animate({height: "toggle"});
            $("#notification_request_actions span").hide();
            $("#notification_request_dismiss").show();
        });
    });
    $("#notification_request_deny").click(function() {
        window.localStorage.setItem("no_notifications", true);
        $("#notification_request").animate({height: "toggle"});
    });
    $("#notification_request_dismiss").click(function() {
        $("#notification_request").animate({height: "toggle"});
    });
}

function saveSettings() {
    $.ajax({
        url: config.API + '/user/set_settings.php',
        jsonp: 'callback',
        dataType: 'jsonp',
        data: client.settings
    });
}

function initMenu() {
    $("#setting_change_username").click(function() {
		$("#user_menu").animate({height: 0});
        $("#change_username_modalLabel").html("Change Username");
        $("#change_username_modal_text").html("Choose a new username:");
        showUsernameModal();
    });

	$(".switch-indicator").click(function(e) {
		$(e.target).parent().click();
	});
	$(".switch").click(function(e) {
		var target = $(e.target),
			menu_target = target.find(".switch_selector"),
			indicator = $(target.find(".switch-indicator")[0]);
		menu_target.empty();
		if(target.hasClass("expanded")) {
			target.removeClass("expanded");
			menu_target.animate({height: "0px"});
		} else {
			target.addClass("expanded");
			menu_target.css("height", "0px");
			menu_target.animate({height: "40px"});
			if(target.is("#setting_song_change")) {
				menu_target.append('<span class="switch-disabled pull-left">OFF</span><span class="switch-enabled pull-right">ON</span>');
			}
			if(target.is("#setting_chat_notifications")) {
				menu_target.append('<span class="switch-disabled pull-left">OFF</span><span class="switch-multiple">MENTION</span><span class="switch-enabled pull-right">ALL</span>');
			}
			var options = ["switch-disabled", "switch-multiple", "switch-enabled"];
			for(var option_id in options) {
				var option = options[option_id];
				if(indicator.hasClass(option)) {
					menu_target.find("." + option).addClass("switch-active");
				}
			}
			$(".switch_selector span").click(function(e) {
				var target = $(e.target);
				var indicator = target.parent().parent().find(".switch-indicator");
				if(target.hasClass("switch-enabled")) {
					indicator.removeClass("switch-disabled");
					indicator.removeClass("switch-multiple");
					indicator.addClass("switch-enabled");
					if(target.parent().parent().is("#setting_chat_notifications")) {
						indicator.html("ALL");
					} else {
                        client.settings.notif_song_change = true;
						indicator.html("ON");
                        saveSettings();
					}
				}
				if(target.hasClass("switch-disabled")) {
					indicator.removeClass("switch-enabled");
					indicator.removeClass("switch-multiple");
					indicator.addClass("switch-disabled");
					indicator.html("OFF");
				}
				if(target.hasClass("switch-multiple")) {
					indicator.removeClass("switch-enabled");
					indicator.removeClass("switch-disabled");
					indicator.addClass("switch-multiple");
					indicator.html("MENTION");
				}
				target.parent().find(".switch-active").removeClass("switch-active");
				target.addClass("switch-active");
                if(target.parent().parent().is("#setting_chat_notifications")) {
                    switch(indicator.html()) {
                        case "ALL":
                            client.settings.notif_chat = true;
                            break;
                        case "MENTION":
                            client.settings.notif_chat = "mention";
                            break;
                        case "OFF":
                            client.settings.notif_chat = false;
                            break;
                    }
                    saveSettings();
                }
                if(target.parent().parent().is("#setting_song_change")) {
                    switch(indicator.html()) {
                        case "ON":
                            client.settings.notif_song_change = true;
                            break;
                        case "OFF":
                            client.settings.notif_song_change = false;
                            break;
                    }
                    saveSettings();
                }
			});
		}
	});

    $.ajax({
        url: config.API + '/user/get_settings.php',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(data) {
            client.settings = data;
            if(client.settings.notif_song_change === "0") client.settings.notif_song_change = false;
            if(client.settings.notif_song_change === "1") client.settings.notif_song_change = true;
            if(client.settings.hide_hints === "0") client.settings.hide_hints = false;
            if(client.settings.hide_hints === "1") client.settings.hide_hints = true;
            if(client.settings.notif_chat === "false") client.settings.notif_chat = false;
            if(client.settings.notif_chat === "true") client.settings.notif_chat = true;
            updateClientSettings();
        }
    });
}