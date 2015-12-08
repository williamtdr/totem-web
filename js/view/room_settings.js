room_description_changed = false;
room_blacklist_changed = false;
room_whitelist_changed = false;

function bindHoverHandler(destination) {
    $("#room_" + destination + "_list li").click(function(e) {
        if($(this).hasClass("no_hover_x")) return false;
        var parentOffset = $(this).offset();
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        if(relX > 360) {
            var target = $(this).html();
            $.each($("#room_" + destination + "_list").children(), function(index, el) {
                if($(el).html() == target) {
                    $(el).addClass("demotion_target");
                    $(el).removeClass("hover_x");
                    $(el).html('Are you sure that you want to demote ' + target + '? <a class="do_demotion" data-target="' + target + '" data-rank="' + destination.substring(0, destination.length - 1) + '">demote</a> &middot; <a class="cancel_demotion">cancel</a>');
                }
            });
        }

        $(".do_demotion").click(function(e) {
            var target = $(e.target).data("target"),
                rank = $(e.target).data("rank");
            $.ajax({
                url: config.API + '/room/demote.php',
                data: {
                    username: target,
                    scope: room.id,
                    rank: rank
                },
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    if(data.success) {
                        $(".demotion_target").remove();
                        server.send(JSON.stringify({
                            event: "chat",
                            data: "/demote " + target + " silent",
                            key: authkey
                        }));
                    } else {
                        $(".demotion_target").html('Demotion failed: ' + data.reason);
                    }
                }
            });
        });

        $(".cancel_demotion").click(function() {
            var target = $(".demotion_target");
            target.html($(target.find("a")[0]).data("target"));
            target.removeClass("demotion_target");
        });
    });
}

function initRoomSettings() {
    $(".modal-action").click(function(el) {
        var destination = $(el.target).data('destination') || $(el.target).parent().data('destination'),
            destination_el = $("#room_settings_" + destination),
            home = $("#room_settings_home"),
            back = $("#room_settings_return"),
            title = $("#room_settings_title");
        home.hide();
        back.show();
        destination_el.show();
        switch(destination) {
            case "admins":
            case "hosts":
                var user_list = $("#room_" + destination + "_list");
                user_list.empty();
                user_list.append('<li>Loading...</li>');
                $.ajax({
                    url: config.API + '/room/get_' + destination + '.php',
                    data: {
                        scope: room.id
                    },
                    jsonp: 'callback',
                    dataType: 'jsonp',
                    success: function(data) {
                        user_list.empty();
                        for(i = 0; i <= data.length; i++) {
                            var item = data[i];
                            if(item) {
                                user_list.append('<li class="hover_x">' + item + '</li>');
                            }
                        }

                        bindHoverHandler(destination);
                    }
                });
            break;
            case "blacklist":
            case "whitelist":
                var content = $("#room_" + destination);
                content.val("Loading...");
                $.ajax({
                    url: config.API + '/room/get_' + destination + '.php',
                    data: {
                        scope: room.id
                    },
                    jsonp: 'callback',
                    dataType: 'jsonp',
                    success: function(data) {
                        content.val(data.data);
                    }
                });
        }
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
    $(".dynamic_user_list_footer").keyup(function(event) {
        if(event.keyCode == 13) {
            if($(this).attr("id") == "admin_textbox") {
                $("#user_add_admin").click();
            } else {
                $("#user_add_host").click();
            }
            return true;
        }
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
                        var target_user = $(el.target).html(),
                            box = $(".dynamic_user_list_footer");
                        box.val(target_user);
                        box.focus();
                        $(".user_suggestion_wrapper ul").empty();
                    });
                }
            });
        } else {
            suggestion_list.empty();
        }
    });

    $(".user_add").click(function() {
        var level;
        if($(this).attr("id") == "user_add_admin") {
            level = "admin";
        } else {
            level = "host";
        }
        var box = $("#" + level + "_textbox");
        var error_target = $("#" + level + "_error");
        var target = box.val();
        $.ajax({
            url: config.API + '/room/promote.php',
            data: {
                username: target,
                scope: room.id,
                rank: level
            },
            jsonp: 'callback',
            dataType: 'jsonp',
            success: function(data) {
                if(data.success) {
                    $("#room_" + level + "s_list").append('<li class="hover_x">' + target + '</li>');
                    bindHoverHandler(level + "s");
                    server.send(JSON.stringify({
                        event: "chat",
                        data: "/promote " + target + " " + level + " silent",
                        key: authkey
                    }));
                    box.val("");
                    error_target.hide();
                } else {
                    error_target.show();
                    error_target.html(data.reason);
                }
            }
        });
    });

    $("#cancel_room_settings").click(function() {
        $("#room_settings_modal").modal('toggle');
        $("#room_settings_desc").val(room.description);
        room_description_changed = false;
        room_whitelist_changed = false;
        room_blacklist_changed = false;
    });

    $("#save_room_settings").click(function() {
        $("#room_settings_modal").modal('toggle');
        if(room_description_changed) {
            server.send(JSON.stringify({
                event: "chat",
                data: "/setdesc " + $("#room_settings_desc").val(),
                key: authkey
            }));
        }
        if(room_blacklist_changed) {
            $.ajax({
                url: config.API + '/room/blacklist.php',
                data: {
                    scope: room.id,
                    content: $("#room_blacklist").val()
                },
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    if(data.success) {
                        noty({
                            text: "Updated room blacklist.",
                            theme: 'relax',
                            dismissQueue: true,
                            type: "success",
                            layout: "topRight",
                            animation: {
                                open: {height: 'toggle'},
                                close: {height: 'toggle'}
                            },
                            timeout: 5000
                        });
                    } else {
                        noty({
                            text: "Encountered an error when trying to update the room blacklist.",
                            theme: 'relax',
                            dismissQueue: true,
                            type: "danger",
                            layout: "topRight",
                            animation: {
                                open: {height: 'toggle'},
                                close: {height: 'toggle'}
                            },
                            timeout: 5000
                        });
                    }
                }
            });
        }
        if(room_whitelist_changed) {
            $.ajax({
                url: config.API + '/room/whitelist.php',
                data: {
                    scope: room.id,
                    content: $("#room_whitelist").val()
                },
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    if(data.success) {
                        noty({
                            text: "Updated room whitelist.",
                            theme: 'relax',
                            dismissQueue: true,
                            type: "success",
                            layout: "topRight",
                            animation: {
                                open: {height: 'toggle'},
                                close: {height: 'toggle'}
                            },
                            timeout: 5000
                        });
                    } else {
                        noty({
                            text: "Encountered an error when trying to update the room whitelist.",
                            theme: 'relax',
                            dismissQueue: true,
                            type: "danger",
                            layout: "topRight",
                            animation: {
                                open: {height: 'toggle'},
                                close: {height: 'toggle'}
                            },
                            timeout: 5000
                        });
                    }
                }
            });
        }
        room_description_changed = false;
        room_whitelist_changed = false;
        room_blacklist_changed = false;
    });

    $("#room_blacklist").keyup(function() {
        room_blacklist_changed = true;
    });

    $("#room_whitelist").keyup(function() {
        room_whitelist_changed = true;
    });

    $("#room_settings_desc").keyup(function() {
        room_description_changed = true;
    });
}