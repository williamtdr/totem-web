/* Utils */
var isUndefined = function (a) {
    return typeof a == 'undefined';
};

var isNull = function (a) {
    return a == null;
};

var playerInitiated = function () {
    return typeof player.setVolume == 'function';
};

var loadJavascript = function (path) {
    var ref = document.createElement('script');

    ref.setAttribute("type", "text/javascript");
    ref.setAttribute('src', path);

    document
        .getElementsByTagName("head")[0]
        .appendChild(ref)
};