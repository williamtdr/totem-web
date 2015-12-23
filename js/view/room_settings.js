room_description_changed = false;
room_blacklist_changed = false;
room_whitelist_changed = false;
file_upload_loaded = false;
hide_password_on_next_load = false;
var subview = false;

function updateRoomSettings() {
	var remove_password_well = $("#remove_password_well"),
		set_password_well = $("#set_password_well");
	if(client.room_needs_auth) {
		$("[data-destination='set_password'] label").html("Change/Remove Password »");
		$("[data-destination='set_password'] span").html("Change or remove the password required from new listeners before accessing the room.");
		$("#room_settings_set_password").data('title', 'Change/Remove Password');
		remove_password_well.show();
	} else {
		$("[data-destination='set_password'] label").html("Set Password »");
		$("[data-destination='set_password'] span").html("Requires new listeners to enter a password before accessing the room.");
		$("#room_settings_set_password").data('title', 'Set Password');
		remove_password_well.hide();
	}
}

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
					var verb = "demote";
					switch(subview) {
						case "mute":
							verb = "unmute";
						break;
						case "ban":
							verb = "unban";
						break;
						case "queue_ban":
							verb = "unqueueban";
					}
                    $(el).html('Are you sure that you want to ' + verb + ' ' + target + '? <a class="do_demotion" data-target="' + target + '" data-rank="' + subview + '">' + verb + '</a> &middot; <a class="cancel_demotion">cancel</a>');
                }
            });
        }

        $(".do_demotion").click(function(e) {
			var target = $(e.target).data("target"),
				rank = $(e.target).data("rank");
			$.ajax({
				url: config.API + '/room/permission.php',
				data: {
					username: target,
					scope: room.id,
					type: "remove",
					level: rank
				},
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data) {
					if(data.success) {
						$(".demotion_target").remove();
						var command = false;
						switch(rank) {
							case 'admin':
							case 'host':
								command = "demote";
							break;
							case 'mute':
								command = "um";
							break;
							case 'ban':
								command = "ub";
							break;
							case 'queue_ban':
								command = "uqb";
						}
						server.send(JSON.stringify({
							event: "chat",
							data: "/" + command + " " + target + " silent",
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

function bindRemoveButtons() {
    $(".remove-background-image").click(function(e) {
        var target = $(e.target).data("url");
        $.ajax({
            url: config.API + '/room/image.php',
            data: {
                url: target,
                scope: room.id,
				action: "remove",
				type: "background"
            },
            jsonp: 'callback',
            dataType: 'jsonp',
            success: function (data) {
                if(data.success) {
                    $(e.target).parent().remove();
                    server.send(JSON.stringify({
                        event: "chat",
                        data: "/syncbackgrounds",
                        key: authkey
                    }));
                } else {
                    $(e.target).html('Removal failed.');
                }
            }
        });
    });
}

function fileUploadLoaded() {
    file_upload_loaded = true;
    'use strict';
    var uploadButton = $('<button></button>')
        .addClass('btn btn-primary')
        .prop('disabled', true)
        .text('Processing...')
        .on('click', function () {
            var $this = $(this),
                data = $this.data();
            $this
                .off('click')
                .text('Abort')
                .on('click', function () {
                    $this.remove();
                    data.abort();
                });
            data.submit().always(function () {
                $this.remove();
            });
        });
    $('#fileupload').fileupload({
        url: 'http://origin.totem.fm/upload.php?authkey=' + authkey + '&scope=' + room.id + '&type=background',
        dataType: 'json',
        autoUpload: false,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 2000000,
        disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
        previewMaxWidth: 160,
        previewMaxHeight: 90,
        previewCrop: true
    }).on('fileuploadadd', function (e, data) {
        data.context = $('<div class="background-preview-container"></div>').appendTo('#files');
        $.each(data.files, function (index, file) {
            var node = $('<span/>').text(file.name);
            if (!index) {
                node
                    .append('<br>')
                    .append(uploadButton.clone(true).data(data));
            }
            node.appendTo(data.context);
        });
    }).on('fileuploadprocessalways', function (e, data) {
        var index = data.index,
            file = data.files[index],
            node = $(data.context.children()[index]);
        if (file.preview) {
            node
                .prepend('<br>')
                .prepend(file.preview);
        }
        if (file.error) {
            node
                .append('<br>')
                .append($('<span class="text-danger"/>').text(file.error));
        }
        if (index + 1 === data.files.length) {
            data.context.find('button')
                .text('Upload')
                .prop('disabled', !!data.files.error);
        }
    }).on('fileuploadprogressall', function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css(
            'width',
            progress + '%'
        );
    }).on('fileuploaddone', function (e, data) {
        $.each(data.result.files, function (index, file) {
            if (file.error) {
                var error = $('<span class="text-danger"/>').text(file.error);
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            } else if(file.name) {
                var url = 'http://static.totem.fm/room_bg/' + room.id + '/' + file.name;
                $(data.context.children()[index]).html('<div class="background-preview-container"><img src="' + url + '" class="background-image-preview"><a class="remove-background-image" data-url="' + url + '">remove</a></div>');
                server.send(JSON.stringify({
                    event: "chat",
                    data: "/syncbackgrounds",
                    key: authkey
                }));
            }
            bindRemoveButtons();
        });
    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index) {
            var error = $('<span class="text-danger"/>').text('File upload failed.');
            $(data.context.children()[index])
                .append('<br>')
                .append(error);
        });
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
    $.ajax({
        url: config.API + '/room/info.php',
        data: {
            scope: room.id,
			q: "backgrounds"
        },
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(data) {
            $.each(data, function(index, url) {
                $("#files").append('<div class="background-preview-container"><img src="' + url + '" class="background-image-preview"><a class="remove-background-image" data-url="' + url + '">remove</a></div>');
            });
            bindRemoveButtons();
        }
    });
}

function initRoomSettings() {
    $(".modal-action").click(function(el) {
        var destination = $(el.target).data('destination') || $(el.target).parent().data('destination'),
            destination_el = $("#room_settings_" + destination),
            home = $("#room_settings_home"),
            back = $("#room_settings_return"),
            title = $("#room_settings_title"),
			danger = $("#room_settings_danger"),
			moderation = $("#room_settings_moderation");
		danger.hide();
        home.hide();
        back.show();
		moderation.hide();
        destination_el.show();
		$("#set_password_well").show();
		if(hide_password_on_next_load) {
			$("#remove_password_well").hide();
			$("#set_room_password_1").val("");
			$("#set_room_password_2").val("");
			hide_password_on_next_load = false;
		}
		$("#set_password_errors").empty();
		subview = destination;
        switch(destination) {
            case "admin":
			case "mute":
			case "ban":
			case "queue_ban":
            case "host":
                var user_list = $("#room_" + destination + "_list");
                user_list.empty();
                user_list.append('<li>Loading...</li>');
                $.ajax({
                    url: config.API + '/room/info.php',
                    data: {
                        scope: room.id,
						q: destination
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
                    url: config.API + '/room/info.php',
                    data: {
                        scope: room.id,
						q: destination
                    },
                    jsonp: 'callback',
                    dataType: 'jsonp',
                    success: function(data) {
                        content.val(data.data);
                    }
                });
            break;
            case "gallery":
                if(!file_upload_loaded) {
                    loadJavascript("http://static.origin.totem.fm/totem.fileupload.min.js");
                }
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
    $(".dynamic_user_list_footer").each(function(index, el) {
		$(el).keyup(function(event) {
			var wrapper = $(this).attr("id").replace("_textbox", "");
			if(event.keyCode == 13) {
				$("#user_add_" + wrapper).click();
				return true;
			}
			var suggestion_textbox = $(this),
				content = suggestion_textbox.val(),
				suggestion_list = $("#" + wrapper + "_suggestion ul");
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
	});

    $(".user_add").click(function() {
		var level = $(this).attr("id").replace("user_add_", ""),
			box = $("#" + level + "_textbox"),
			error_target = $("#" + level + "_error"),
			target = box.val();
        $.ajax({
            url: config.API + '/room/permission.php',
            data: {
                username: target,
                scope: room.id,
                level: level,
				type: "add"
            },
            jsonp: 'callback',
            dataType: 'jsonp',
            success: function(data) {
                if(data.success) {
                    $(".user_suggestion_wrapper").empty();
                    $("#room_" + level + "_list").append('<li class="hover_x">' + target + '</li>');
                    bindHoverHandler(level);
					var command;
					switch(level) {
						case "admin":
						case "host":
							command = "/promote " + target + " " + level + " silent";
						break;
						case "ban":
						case "mute":
							command = "/" + level + " " + target;
						break;
						case "queue_ban":
							command = "/qb " + target;
						break;
					}
                    server.send(JSON.stringify({
                        event: "chat",
                        data: command,
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
                url: config.API + '/room/settings.php',
                data: {
                    scope: room.id,
                    content: $("#room_blacklist").val(),
					action: "blacklist"
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
                url: config.API + '/room/settings.php',
                data: {
                    scope: room.id,
                    content: $("#room_whitelist").val(),
					action: "whitelist"
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

	$("#set_room_password_2").keyup(function(e) {
		if(e.keyCode == 13) {
			$("#set_room_password_btn").click();
		}
	});

	$("#delete_room_btn").click(function() {
		var errors = $("#delete_room_errors");

		errors.empty();
		$.ajax({
			url: config.API + '/room/settings.php',
			data: {
				scope: room.id,
				action: "delete"
			},
			jsonp: 'callback',
			dataType: 'jsonp',
			success: function (data) {
				if(data.success) {
					$('#room_settings_modal').modal('toggle');
					server.send(JSON.stringify({
						event: "delete_room",
						key: authkey
					}));
				}
			}
		});
	});

	$("#remove_room_password_btn").click(function() {
		var errors = $("#set_password_errors");

		errors.empty();
		$.ajax({
			url: config.API + '/room/settings.php',
			data: {
				scope: room.id,
				action: "remove_password"
			},
			jsonp: 'callback',
			dataType: 'jsonp',
			success: function (data) {
				if(data.success) {
					$("#set_password_well").hide();
					$("#remove_password_well").hide();
					$("#set_password_errors").append('<div class="alert alert-success">Password removed.</div>');
					server.send(JSON.stringify({
						event: "remove_password",
						key: authkey
					}));
					$("[data-destination='set_password'] label").html("Set Password »");
					$("[data-destination='set_password'] span").html("Requires new listeners to enter a password before accessing the room.");
					$("#room_settings_set_password").data('title', 'Set Password');
					hide_password_on_next_load = true;
				}
			}
		});
	});

	$("#set_room_password_btn").click(function() {
		var errors = $("#set_password_errors"),
			password = $("#set_room_password_1").val();

		errors.empty();
		if(password != $("#set_room_password_2").val()) {
			errors.append('<div class="alert alert-danger">Passwords do not match.</div>');
			return false;
		}
		$.ajax({
			url: config.API + '/room/settings.php',
			data: {
				scope: room.id,
				password: password,
				action: "set_password"
			},
			jsonp: 'callback',
			dataType: 'jsonp',
			success: function (data) {
				if(data.success) {
					$('#room_settings_modal').modal('toggle');
					server.send(JSON.stringify({
						event: "set_password",
						password: password,
						key: authkey
					}));
				}
			}
		});
	});

	$("#transfer_ownership_btn").click(function() {
		var errors = $("#transfer_ownership_errors");

		errors.empty();
		$.ajax({
			url: config.API + '/room/settings.php',
			data: {
				scope: room.id,
				action: "transfer_ownership",
				username: $("#transfer_ownership_textbox").val()
			},
			jsonp: 'callback',
			dataType: 'jsonp',
			success: function (data) {
				if(data.success) {
					errors.empty();
					server.send(JSON.stringify({
						event: "reload_room_permission_table",
						key: authkey
					}));
					errors.append('<div class="alert alert-success">Ownership transferred. Reloading in 3s...</div>');
					setTimeout(function() {
						window.location.reload();
					}, 3000);
				} else {
					errors.append('<div class="alert alert-danger">' + data.reason + '</div>');
				}
			}
		});
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