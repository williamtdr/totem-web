function showUsernameModal() {
	var uchange = $("#username_change"),
		changebtn = $("#save_username"),
		spinner = $("#change_username_spinner");
	uchange.keyup(function(event) {
		if(event.keyCode == 13) {
			changebtn.click();
		}
	});
	changebtn.click(function() {
		spinner.show();
		spinner.css("opacity", 1);
		$.ajax({
			url: config.API + "/user/changeUsername.php",
			jsonp: "callback",
			dataType: "jsonp",
			data: {
				username: uchange.val()
			},
			success: function(response) {
				spinner.hide();
				errors = $(".errors");
				errors.empty();
				switch(response.success) {
					case "exists":
						errors.append('<div class="alert alert-warning" role="alert">Someone\'s already registered an account using that name.</div>');
						break;
					case "invalid":
						errors.append('<div class="alert alert-warning" role="alert">Use fewer special characters.</div>');
						break;
					case "length":
						errors.append('<div class="alert alert-warning" role="alert">Username can be from 3 - 30 characters.</div>');
						break;
					default:
						window.location.reload();
				}
			},
			error: function(error) {
				console.log(error);
			}
		});
	});

	if(snippet.username) {
		$("#change_username_modal").modal();
		uchange.focus();
	} else {
		$.ajax({
			url: 'snippet/username.html',
			dataType: 'html',
			success: function(data) {
				snippet.username = true;
				$("body").append(data);
				$("#change_username_modal").modal();
				uchange.focus();
			}
		});
	}
}