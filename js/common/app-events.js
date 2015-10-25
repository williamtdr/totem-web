$(document).ready(function () {
    $('#createRoomForm').on('submit', function (ev) {
        ev.preventDefault();
        var form = $(this),
            error = form.find('.alert-danger'),
            success = form.find('.alert-success'),
            name = form.find('#roomName')
                .val().trim(),
            description = form.find('#roomDescription')
                .val().trim(),
            password = form.find('#roomPassword')
                .val().trim();

        success.hide();
        error.hide();

        $.ajax({
            url: config.API + '/room/create.php',
            jsonp: 'callback',
            dataType: 'jsonp',
            data: {
                name: name,
                description: description,
                password: password
            },
            success: function (r) {
                if (r.success) {
                    refreshRoomList();
                    switchRoom(name);

                    return false;
                }

                if (!r.success) {
                    error.html(r.message).show();

                    return false;
                }

                console.warn('Unhandled case after form submission');
            }
        })
    });

    $('body')
        .delegate('.signInButton', 'click', function () {
            auth2
                .grantOfflineAccess({
                    redirect_uri: 'postmessage',
                    scope: 'https://www.googleapis.com/auth/youtube'
                })
                .then(function (response) {
                    $.ajax({
                        url: config.API + '/app/session.php',
                        method: 'POST',
                        jsonp: 'callback',
                        dataType: 'jsonp',
                        data: response,
                        complete: function () {
                            // ..
                        }
                    });
                });
        })
        .delegate('.youtubeRate', 'click', function () {
            var btn = $(this),
                btnText = btn.find('.rate'),
                mode = (btn.text().trim().toLowerCase() == 'unlike') ? 'none' : 'like',
                videoId = btn.data('videoid');

            if (mode == 'none') {
                btnText.text('Like');
            } else {
                btnText.text('Unlike');
            }

            $.ajax({
                url: config.API + '/youtube/video.php',
                data: $.param({
                    id: videoId,
                    mode: mode,
                    action: 'rate'
                }),
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function (r) {
                    // console.log(r);
                }
            });
        });
});
