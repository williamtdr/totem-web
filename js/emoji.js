var emoji = {

	emojilist	: "",
	parseMessage: function (msg) {
		msg = msg.replace(':)', '<div title=":)" class="emoji emoji-chat" style="background-position:-416px -288px"> </div>');
		msg = msg.replace(':(', '<div title=":(" class="emoji emoji-chat" style="background-position:-416px -288px"> </div>');
		msg = msg.replace('<3', '<div title="<3" class="emoji emoji-chat" style="background-position:-64px -144px"> </div>');
		msg = msg.replace(';(', '<div title=";(" class="emoji emoji-chat" style="background-position:-432px -288px"> </div>');
		msg = msg.replace(":'(", '<div title=";\'(" class="emoji emoji-chat" style="background-position:-432px -288px"> </div>');
		msg = msg.replace("xD", '<div title="xD" class="emoji emoji-chat" style="background-position:-416px -320px"> </div>');
	
		if(msg.indexOf(":") > -1) {
			var isEmoji = false,
				emojiname = "",
				split = msg.split("");
				
			for(var i = 0; i < split.length; i++) {
				if (split[i] == ":") {
					if(!isEmoji) {
						isEmoji = true;
					} else {
						for(var a in emoji.emojilist) {
							for(var b in emoji.emojilist[a].short_names) {
								if(emoji.emojilist[a].short_names[b] == emojiname)
									msg = msg.replace(':'+ emojiname +':', '<div title=":'+ emojiname +':" class="emoji emoji-chat" style="background-position:-'+ (emoji.emojilist[a].sheet_x * 16) +'px -'+ (emoji.emojilist[a].sheet_y * 16) +'px"> </div>');
							}
						}
						emojiname = "";
						isEmoji = false;
					}
				} else if (isEmoji) {
					emojiname = emojiname + '' + split[i];
				}
			}
			
			return msg;
		} else
			return msg;
	},
	
	showList: function() {
		return list;
	}
};