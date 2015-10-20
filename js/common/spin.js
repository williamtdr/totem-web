!function (a, b) {
    "object" == typeof exports ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.Spinner = b()
}(this, function () {
    "use strict";
    function d(a, b) {
        var d, c = document.createElement(a || "div");
        for (d in b)c[d] = b[d];
        return c
    }

    function e(a) {
        for (var b = 1, c = arguments.length; c > b; b++)a.appendChild(arguments[b]);
        return a
    }

    function g(a, d, e, g) {
        var h = ["opacity", d, ~~(100 * a), e, g].join("-"), i = .01 + 100 * (e / g), j = Math.max(1 - (1 - a) / d * (100 - i), a), k = c.substring(0, c.indexOf("Animation")).toLowerCase(), l = k && "-" + k + "-" || "";
        return b[h] || (f.insertRule("@" + l + "keyframes " + h + "{" + "0%{opacity:" + j + "}" + i + "%{opacity:" + a + "}" + (i + .01) + "%{opacity:1}" + (i + d) % 100 + "%{opacity:" + a + "}" + "100%{opacity:" + j + "}" + "}", f.cssRules.length), b[h] = 1), h
    }

    function h(b, c) {
        var e, f, d = b.style;
        for (c = c.charAt(0).toUpperCase() + c.slice(1), f = 0; f < a.length; f++)if (e = a[f] + c, void 0 !== d[e])return e;
        return void 0 !== d[c] ? c : void 0
    }

    function i(a, b) {
        for (var c in b)a.style[h(a, c) || c] = b[c];
        return a
    }

    function j(a) {
        for (var b = 1; b < arguments.length; b++) {
            var c = arguments[b];
            for (var d in c)void 0 === a[d] && (a[d] = c[d])
        }
        return a
    }

    function l(a, b) {
        return "string" == typeof a ? a : a[b % a.length]
    }

    function n(a) {
        this.opts = j(a || {}, n.defaults, m)
    }

    function o() {
        function a(a, b) {
            return d("<" + a + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', b)
        }

        f.addRule(".spin-vml", "behavior:url(#default#VML)"), n.prototype.lines = function (b, c) {
            function g() {
                return i(a("group", {coordsize: f + " " + f, coordorigin: -d + " " + -d}), {width: f, height: f})
            }

            function m(b, f, h) {
                e(j, e(i(g(), {
                    rotation: 360 / c.lines * b + "deg",
                    left: ~~f
                }), e(i(a("roundrect", {arcsize: c.corners}), {
                    width: d,
                    height: c.width,
                    left: c.radius,
                    top: -c.width >> 1,
                    filter: h
                }), a("fill", {color: l(c.color, b), opacity: c.opacity}), a("stroke", {opacity: 0}))))
            }

            var k, d = c.length + c.width, f = 2 * d, h = 2 * -(c.width + c.length) + "px", j = i(g(), {
                position: "absolute",
                top: h,
                left: h
            });
            if (c.shadow)for (k = 1; k <= c.lines; k++)m(k, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
            for (k = 1; k <= c.lines; k++)m(k);
            return e(b, j)
        }, n.prototype.opacity = function (a, b, c, d) {
            var e = a.firstChild;
            d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c))
        }
    }

    var c, a = ["webkit", "Moz", "ms", "O"], b = {}, f = function () {
        var a = d("style", {type: "text/css"});
        return e(document.getElementsByTagName("head")[0], a), a.sheet || a.styleSheet
    }(), m = {
        lines: 12,
        length: 7,
        width: 5,
        radius: 10,
        rotate: 0,
        corners: 1,
        color: "#000",
        direction: 1,
        speed: 1,
        trail: 100,
        opacity: .25,
        fps: 20,
        zIndex: 2e9,
        className: "spinner",
        top: "50%",
        left: "50%",
        position: "absolute"
    };
    n.defaults = {}, j(n.prototype, {
        spin: function (a) {
            this.stop();
            var b = this, e = b.opts, f = b.el = i(d(0, {className: e.className}), {
                position: e.position,
                width: 0,
                zIndex: e.zIndex
            });
            if (e.radius + e.length + e.width, i(f, {
                    left: e.left,
                    top: e.top
                }), a && a.insertBefore(f, a.firstChild || null), f.setAttribute("role", "progressbar"), b.lines(f, b.opts), !c) {
                var k, h = 0, j = (e.lines - 1) * (1 - e.direction) / 2, l = e.fps, m = l / e.speed, n = (1 - e.opacity) / (m * e.trail / 100), o = m / e.lines;
                !function p() {
                    h++;
                    for (var a = 0; a < e.lines; a++)k = Math.max(1 - (h + (e.lines - a) * o) % m * n, e.opacity), b.opacity(f, a * e.direction + j, k, e);
                    b.timeout = b.el && setTimeout(p, ~~(1e3 / l))
                }()
            }
            return b
        }, stop: function () {
            var a = this.el;
            return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), this.el = void 0), this
        }, lines: function (a, b) {
            function k(a, c) {
                return i(d(), {
                    position: "absolute",
                    width: b.length + b.width + "px",
                    height: b.width + "px",
                    background: a,
                    boxShadow: c,
                    transformOrigin: "left",
                    transform: "rotate(" + ~~(360 / b.lines * f + b.rotate) + "deg) translate(" + b.radius + "px" + ",0)",
                    borderRadius: (b.corners * b.width >> 1) + "px"
                })
            }

            for (var j, f = 0, h = (b.lines - 1) * (1 - b.direction) / 2; f < b.lines; f++)j = i(d(), {
                position: "absolute",
                top: 1 + ~(b.width / 2) + "px",
                transform: b.hwaccel ? "translate3d(0,0,0)" : "",
                opacity: b.opacity,
                animation: c && g(b.opacity, b.trail, h + f * b.direction, b.lines) + " " + 1 / b.speed + "s linear infinite"
            }), b.shadow && e(j, i(k("#000", "0 0 4px #000"), {top: "2px"})), e(a, e(j, k(l(b.color, f), "0 0 1px rgba(0,0,0,.1)")));
            return a
        }, opacity: function (a, b, c) {
            b < a.childNodes.length && (a.childNodes[b].style.opacity = c)
        }
    });
    var p = i(d("group"), {behavior: "url(#default#VML)"});
    return !h(p, "transform") && p.adj ? o() : c = h(p, "animation"), n
});
!function (a) {
    if ("object" == typeof exports)a(require("jquery"), require("spin")); else if ("function" == typeof define && define.amd)define(["jquery", "spin"], a); else {
        if (!window.Spinner)throw new Error("Spin.js not present");
        a(window.jQuery, window.Spinner)
    }
}(function (a, b) {
    a.fn.spin = function (c, d) {
        return this.each(function () {
            var e = a(this), f = e.data();
            f.spinner && (f.spinner.stop(), delete f.spinner), c !== !1 && (c = a.extend({color: d || e.css("color")}, a.fn.spin.presets[c] || c), f.spinner = new b(c).spin(this))
        })
    }, a.fn.spin.presets = {
        tiny: {lines: 8, length: 2, width: 2, radius: 3},
        small: {lines: 8, length: 4, width: 3, radius: 5},
        large: {lines: 10, length: 8, width: 4, radius: 8}
    }
});
function spin(where) {
    if (where == undefined) where = 'spin-destination';
    var opts = {
        lines: 9, // The number of lines to draw
        length: 2, // The length of each line
        width: 3, // The line thickness
        radius: 8, // The radius of the inner circle
        corners: 0.7, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1.3, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '75%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    $('.' + where).spin(opts);
}
function stop_spin(where) {
    if (where == undefined) where = 'spin-destination';
    $('.' + where).spin(false);
}