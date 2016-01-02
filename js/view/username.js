function showUsernameModal(is_new) {
	var uchange = $("#username_change"),
		changebtn = $("#save_username"),
		spinner = $("#change_username_spinner"),
		is_new = is_new || false;

	if(snippet.username) {
		$("#change_username_modal").modal();
		$("#username_change").focus();
	} else {
		$.ajax({
			url: 'snippet/username.html',
			dataType: 'html',
			success: function(data) {
				var uchange = $("#username_change"),
					changebtn = $("#save_username"),
					spinner = $("#change_username_spinner");

				snippet.username = true;
				$("body").append(data);
				$("#change_username_modal").modal();
				$("#username_change").focus();

				$("#username_change").keyup(function(event) {
					if(event.keyCode == 13) {
						$("#save_username").click();
					}
				});
				$("#save_username").click(function() {
					spinner.show();
					spinner.css("opacity", 1);
					alert($("#username_change").val());
					$.ajax({
						url: config.API + "/user/changeUsername.php",
						jsonp: "callback",
						dataType: "jsonp",
						data: {
							username: $("#username_change").val()
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

				if(is_new) {
					$("#change_username_modalLabel").html("Change Username");
					$("#change_username_modal_text").html("Loading...");
					$.ajax({
						url: config.API + "/user/remainingUsernameChanges.php",
						jsonp: "callback",
						dataType: "jsonp",
						success: function(data) {
							if(data.data == 0) {
								$("#username_change").hide();
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