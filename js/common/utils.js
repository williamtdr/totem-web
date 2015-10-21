/* Utils */
var isUndefined = function (a) {
    return typeof a == 'undefined';
};

var isNull = function (a) {
    return a == null;
};

var playerNotInitiated = function () {
    return isUndefined(player) || isNull(player) || !player;
};

var loadJavascript = function(path) {
    var ref = document.createElement('script');

    ref.setAttribute("type", "text/javascript");
    ref.setAttribute('src', path);

    document
        .getElementsByTagName("head")[0]
        .appendChild(ref)
};