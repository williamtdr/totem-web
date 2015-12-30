function initModals() {
	$(".show_about_modal").click(function() {
		if(snippet.about) {
			$("#about_modal").modal();
		} else {
			$.ajax({
				url: 'snippet/about.html',
				dataType: 'html',
				success: function (data) {
					snippet.about = true;
					$("body").append(data);
					$("#about_modal_content_close").click(function() {
						$("#about_modal").modal("toggle");
					});
					$("#about_modal").modal();
				}
			});
		}
	});
	$(".show_contact_modal").click(function() {
		if(snippet.contact) {
			$("#contact_modal").modal();
			$("#contact_subject").focus();
		} else {
			$.ajax({
				url: 'snippet/contact.html',
				dataType: 'html',
				success: function(data) {
					$("body").append(data);
					snippet.contact = true;
					$("#send_contact").click(function() {
						var errors = $("#contact_errors"),
							subject = $("#contact_subject"),
							text = $("#contact_text");

						if(subject.val().length == 0 || text.val().length == 0) {
							errors.show().empty().append('<div class="alert">Please type a subject and body text.</div>');
						} else {
							errors.empty().hide();
						}

						$.ajax({
							url: config.API + '/user/contact.php',
							jsonp: 'callback',
							dataType: 'jsonp',
							data: {
								subject: subject.val(),
								text: text.val()
							},
							success: function(data) {
								errors.empty().hide();
								text.hide();
								if(data.success) {
									subject.parent().html("Message sent!<br><br><a class='cancel_contact'>Close</a>");
								} else {
									subject.parent().html("An error occurred when trying to send the message.<br><br><a class='cancel_contact'>Close</a>");
								}
								bindCancelContact();
							}
						});
					});
					bindCancelContact();
					$("#contact_modal").modal();
					$("#contact_subject").focus();
				}
			});
		}
	});
}

function bindCancelContact() {
	$(".cancel_contact").click(function() {
		$("#contact_modal").modal("toggle");
	});
}