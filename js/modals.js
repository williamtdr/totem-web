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
}