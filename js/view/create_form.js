function onPasswordSwitcherSwitch() {
	var disabled_el = $(".password_switcher_disabled");
	var enabled_el = $(".password_switcher_enabled");
	disabled_el.addClass("password_switcher_enabled");
	enabled_el.addClass("password_switcher_disabled");
	enabled_el.removeClass("password_switcher_enabled");
	disabled_el.removeClass("password_switcher_disabled");

	$("#room_form_password_well").animate({
		height: "toggle"
	});
	enabled_el = disabled_el;
	if(enabled_el.is("#room_form_password")) {
		$("#new_room_password").focus();
	}
}

function initCreateForm() {
	$("#room_form_header").click(function() {
		switchView(VIEW_ROOM_LIST);
	});

	$('#create_form.form').on('submit', function(ev) {
		ev.preventDefault();
		var form = $(this),
			error = form.find('.alert-danger'),
			name = form.find('#room_name').val().trim(),
			description = form.find('#room_description').val().trim(),
			password = form.find('#room_password').val().trim();

		error.hide();

		$.ajax({
			url: config.API + '/room/create.php',
			jsonp: 'callback',
			dataType: 'jsonp',
			data: {
				name: name,
				description: description,
				password: password
			},
			success: function(r) {
				if(r.success) {
					joinRoom(name);
				} else {
					error.html(r.message).show();
				}
			},
			error: function(e) {
				error.html("Server error when trying to create a room. Please try again later.").show();
			}
		})
	});

	$("#room_form_password_select").click(onPasswordSwitcherSwitch);
}

function createFormOnLogin() {
	if(display_name) $("#new_room_name").val(display_name + "'s Room");
}