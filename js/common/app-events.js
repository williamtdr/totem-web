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
                if (!isUndefined(r.success)) {
                    refreshRoomList();
                    switchRoom(name);

                    console.log(r.success);
                    return false;
                }

                if (!isUndefined(r.error)) {
                    error.html(r.error).show();

                    return false;
                }

                console.warn('Unhandled case after form submission');
            }
        })
    });
});
