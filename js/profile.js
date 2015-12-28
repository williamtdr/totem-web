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

	if(client.profile) {
		$("#user_bio").html(client.profile.bio.split("\n").join("<br>"));
		$("#user_twitter").val(client.profile.twitter);
		$("#user_steam").val(client.profile.steam);
		$("#user_website").val(client.profile.website);
		$("#user_picture").val(client.profile.profile_picture);
	}
}

profile_target = false;

function lookupProfile(who, target) {
	profile_target = target;
	server.send(JSON.stringify({
		event: "get_profile",
		data: who.toLowerCase(),
		key: authkey
	}));
}

function onProfileModalClicked() {
	if(!file_upload_loaded) {
		loadJavascript("http://static.origin.totem.fm/totem.fileupload.min.js");
	}
}