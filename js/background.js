function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

last_image_placed = 2;
first_background = true;

$("body").append('<div id="background_layer"><div class="top"></div><div class="bottom"></div></div><div id="background_shader"></div>');

advanceBackgroundImage = function () {
    var top_img = $(".top");
    var bottom_img = $(".bottom");

    var new_background = 'http://static.totem.fm/bg/' + getRandomInt(1, 572) + '.jpg';
    if(room.backgrounds && room.backgrounds.length > 0) {
        new_background = room.backgrounds[Math.floor(Math.random()*room.backgrounds.length)];
    }

    if(last_image_placed == 2) {
        top_img.attr('style', 'background: url("' + new_background + '") no-repeat center center fixed; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover;');
        last_image_placed = 1;
    } else {
        bottom_img.attr('style', 'background: url("' + new_background + '") no-repeat center center fixed; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover;');
        last_image_placed = 2;
    }

    if(first_background) {
        $(document).ready(function () {
            $("#background_layer").delay(500).animate({
                opacity: 1
            }, 500);
        });
        first_background = false;
    } else {
        setTimeout(function () {
            $(".top").toggleClass("transparent");
        }, 500);
    }
};