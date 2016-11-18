function initAuth2() {
	gapi.load('auth2', function() {
		auth2 = gapi.auth2.init({
			client_id: config.GOOGLE_CLIENT_ID
		});
	});
}

function assignAuthButtonHandler() {
	$('.signInButton').click(function() {
		auth2.grantOfflineAccess({
			redirect_uri: "postmessage",
			scope: "https://www.googleapis.com/auth/youtube",
			approval_prompt: "force"
		})
		.then(function(response) {
			$.ajax({
				url: config.API + "/app/session.php",
				method: "POST",
				jsonp: "callback",
				dataType: "jsonp",
				data: response
			});
		});
	});
}

function initGoogleAuth() {
	$("#youtube_rate").click(function() {
		var btn = $(this),
			btnText = btn.find('.rate'),
			mode = (btn.text().trim().toLowerCase() === 'unlike') ? 'none' : 'like',
			videoId = btn.data('videoid'),
			notification = function(text) {
				noty({
					text: text,
					theme: 'relax',
					dismissQueue: true,
					type: "info",
					layout: "topRight",
					animation: {
						open: {height: 'toggle'},
						close: {height: 'toggle'}
					},
					timeout: 5000
				});
			};

		if(mode === 'none') {
			notification("Removed from Liked Videos.");
			btnText.text('Like');
		} else {
			notification("Added to Liked Videos.");
			btnText.text('Unlike');
		}

		$.ajax({
			url: config.API + '/youtube/video.php',
			data: $.param({
				id: videoId,
				mode: mode,
				action: 'rate'
			}),
			jsonp: "callback",
			dataType: "jsonp"
		});
	});
}