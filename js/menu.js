function initMenu() {
    $("#setting_change_username").click(function() {
        $("#change_username_modalLabel").html("Change Username");
        $("#change_username_modal_text").html("Choose a new username:");
        showUsernameModal();
    });
}