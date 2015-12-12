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
					console.log(target.parent().parent());
					if(target.parent().parent().is("#setting_chat_notifications")) {
						indicator.html("ALL");
					} else {
						indicator.html("ON");
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
			});
		}
	});
}