const uchange = $("#username_change"),
	  changebtn = $("#save_username"),
	  spinner = $("#change_username_spinner");

function showUsernameModal(newUser) {
	newUser = newUser || false;

	if(snippet.username) {
		$("#change_username_modal").modal();
		uchange.focus();
	} else {
		$.ajax({
			url: "snippet/username.html",
			dataType: "html",
			success: function(data) {
				snippet.username = true;
				$("body").append(data);
				$("#change_username_modal").modal();

				uchange.keyup(function(event) {
					if(event.keyCode === 13) {
						$("#save_username").click();
					}
				}).focus();

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
							errors = $(".errors").empty();

							switch(response.success) {
								case "exists":
									errors.append('<div class="alert alert-warning" role="alert">Someone\"s already registered an account using that name.</div>');
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

				if(newUser) {
					$("#change_username_modalLabel").html("Change Username");
					$("#change_username_modal_text").html("Loading...");
					$.ajax({
						url: config.API + "/user/remainingUsernameChanges.php",
						jsonp: "callback",
						dataType: "jsonp",
						success: function(data) {
							if(data.data === 0) {
								uchange.hide();
								$("#change_username_modal_text").html("You have reached the maximum number of username changes on this account.");
							} else {
								$("#change_username_modal_text").html("You can change your username up to " + data.data + " more times. Type a new username:");
							}
						}
					});
				}
			}
		});
	}
}