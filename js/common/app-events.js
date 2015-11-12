var apik = "AIzaSyDtzwkqYtp2LG1skKPj63EgzJxOJwLhdYk"
var authk = "545747761221-rb098ajp2aik13fhp7h7bn5m0s9l7iir.apps.googleusercontent.com"
function init() {
    gapi.client.setApiKey(apik);
}
var OAUTH2_CLIENT_ID = authk;
var OAUTH2_SCOPES = [
    'https://www.googleapis.com/auth/youtube'
];
function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        loadAPIClientInterfaces()
        checkYTAuth()
    } else {
        gapi.auth.authorize({
            client_id: OAUTH2_CLIENT_ID,
            scope: OAUTH2_SCOPES,
            immediate: false
            }, handleAuthResult);
    }
}
function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function() {
    });
}
function signIn(gu) {
    window.gup = gu.getBasicProfile();
    checkYTAuth()
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut()
}
function checkYTAuth() {
    gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: true
    }, YTAuthResult);
}
function YTAuthResult(authResult) {
    if (authResult && !authResult.error) {
        document.getElementById("#yt-auth").style.display = "none" 
    } else {
        document.getElementById("#yt-auth").style.display = "block" 
    }
}
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


    $('#searchYoutube').on('submit', function (ev) {
        ev.preventDefault();

        search();
    });

    $(window).scroll(function () {
        var docElement = $(document)[0].documentElement,
            winElement = $(window)[0],
            videoRows = $('li.list-group-item.playlist'),
            rowsLoading = $('li.list-group-item.playlist.loading'),
            rowsFinished = $('li.list-group-item.playlist.finished');

        if (!videoRows.length || rowsLoading.length || rowsFinished.length) {
            return false;
        }

        if ((docElement.scrollHeight - winElement.innerHeight) == winElement.pageYOffset) {

            if ($('#searchYoutube').is(':visible')) {
                search(true);

                return false;
            }

            loadPlaylistItems(false, true);
        }
    });
});
