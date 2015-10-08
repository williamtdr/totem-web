uchange = $("#username-change");
changebtn = $("#save-username");
uchange.focus();
uchange.keyup(function(event){
    if(event.keyCode == 13){
        changebtn.click();
    }
});
changebtn.click(function() {
    spin('change-username-spinner');
    $.ajax({
        url: "http://api.totem.fm/user/changeUsername.php",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            username: uchange.val()
        },
        success: function(response) {
            stop_spin('change-username-spinner');
            errors = $(".errors");
            errors.empty();
            console.log(response);
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
                case true:
                    window.location.reload();
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
});