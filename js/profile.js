function initProfile() {
	$("#save_profile").click(function () {
		$("#profile_modal").modal("toggle");
		server.send(JSON.stringify({
			event: "set_profile",
			data: {
				bio: $("#user_bio").val(),
				twitter: $("#user_twitter").val(),
				steam: $("#user_steam").val(),
				website: $("#user_website").val(),
				profile_picture: $("#user_picture").attr('src')
			},
			"key": authkey
		}));
	});
}

profile_target = false;

function lookupProfile(who, target) {
	profile_target = target;
	server.send(JSON.stringify({
		event: "get_profile",
		data: who,
		key: authkey
	}));
}

function onProfileModalClicked() {
	if(!file_upload_loaded) {
		loadJavascript("http://static.origin.totem.fm/totem.fileupload.min.js");
	}
}