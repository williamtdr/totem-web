$.fn.extend({clearIndicator: function() {
    this.removeClass("switch-disabled").removeClass("switch-enabled").removeClass("switch-multiple");
    return this;
}});

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
            if(client.settings.notif_chat === "false") client.settings.notif_chat = false;
            if(client.settings.notif_chat === "true") client.settings.notif_chat = true;
            updateClientSettings();
        }
    });
}