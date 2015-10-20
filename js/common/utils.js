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