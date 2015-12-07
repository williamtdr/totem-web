function initRoomSettings() {
    $(".modal-action").click(function(el) {
        var destination = $(el.target).parent().data('destination'),
            destination_el = $("#room_settings_" + destination),
            home = $("#room_settings_home"),
            back = $("#room_settings_return"),
            title = $("#room_settings_title");
        home.hide();
        back.show();
        destination_el.show();
        title.html(destination_el.data("title"));
    });
    $("#room_settings_return").click(function() {
        var destination_el = $("#room_settings_home"),
            back = $("#room_settings_return"),
            title = $("#room_settings_title");
        $('.room-settings-content .modal-body').children().each(function(i) {
            $(this).hide();
        });
        back.hide();
        destination_el.show();
        title.html('Room Settings');
    });
    $(".dynamic_user_list_footer").keyup(function() {
        var suggestion_textbox = $(".dynamic_user_list_footer"),
            content = suggestion_textbox.val(),
            suggestion_list = $(".user_suggestion_wrapper ul");
        if(content.length > 0) {
            $.ajax({
                url: config.API + '/room/suggest_user.php',
                data: {
                    q: content
                },
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    suggestion_list.empty();
                    for(i = 0; i <= data.length; i++) {
                        var item = data[i];
                        if(item) {
                            suggestion_list.append('<li class="user-selection-option">' + item + '</li>');
                        }
                    }
                    $(".user-selection-option").click(function(el) {
                        var target_user = $(el.target).html();
                        $(".dynamic_user_list_footer").val(target_user);
                        $(".user_suggestion_wrapper ul").empty();
                    });
                }
            });
        } else {
            suggestion_list.empty();
        }
    });
    $("#user_add_admin").click(function() {

    });
}