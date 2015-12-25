var emoji = {

	emojilist	: "",
	showedList	: false,
	
	parseMessage: function (msg) {
		msg = msg.replace(/:\)/g, '<div title=":)" class="emoji emoji-chat" style="background-position:-416px -224px"> </div>');
		msg = msg.replace(/:D/g, '<div title=":D" class="emoji emoji-chat" style="background-position:-416px -288px"> </div>');
		msg = msg.replace(/:\(/g, '<div title=":(" class="emoji emoji-chat" style="background-position:-432px -48px"> </div>');
		msg = msg.replace(/<3/g, '<div title="<3" class="emoji emoji-chat" style="background-position:-64px -144px"> </div>');
		msg = msg.replace(/;\(/g, '<div title=";(" class="emoji emoji-chat" style="background-position:-432px -288px"> </div>');
		//msg = msg.replace(/\:\'\(/g, '<div title=":\'(" class="emoji emoji-chat" style="background-position:-432px -288px"> </div>');
		msg = msg.replace(/xD|XD/g, '<div title="xD" class="emoji emoji-chat" style="background-position:-416px -320px"> </div>');
	
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
		var list = $('#chat-emojilist'),
			short_names = "";
		
		list.html('<ul id="emojilist-People"><h2>People</h2></ul>\
				<ul id="emojilist-Nature"><h2>Nature</h2></ul>\
				<ul id="emojilist-Foods"><h2>Foods & Drinks</h2></ul>\
				<ul id="emojilist-Activity"><h2>Activities</h2></ul>\
				<ul id="emojilist-Places"><h2>Places</h2></ul>\
				<ul id="emojilist-Objects"><h2>Objects</h2></ul>\
				<ul id="emojilist-Symbols"><h2>Symbols</h2></ul>\
				<ul id="emojilist-Flags"><h2>Flags</h2></ul>');
				
		$('#chat-emojilist ul h2').click(function(a) {
			$(a.target).parent().find('li').slideToggle(300);
		});
	
		for(var a in emoji.emojilist) {
			for (var b in emoji.emojilist[a].short_names)
				short_names = ", :" + emoji.emojilist[a].short_names[b] + ":";
		
			if (emoji.emojilist[a].name != null)
				list.find('#emojilist-'+ emoji.emojilist[a].category).append('<li><div title="'+ emoji.emojilist[a].name.toLowerCase() + '' + short_names +'" class="emoji emoji-list emojiname-'+ emoji.emojilist[a].short_name +'" style="background-position:-'+ (emoji.emojilist[a].sheet_x * 16) +'px -'+ (emoji.emojilist[a].sheet_y * 16) +'px"> </div></li>');
			else
				list.find('#emojilist-'+ emoji.emojilist[a].category).append('<li><div title="'+ short_names +'" class="emoji emoji-list emojiname-'+ emoji.emojilist[a].short_name +'" style="background-position:-'+ (emoji.emojilist[a].sheet_x * 16) +'px -'+ (emoji.emojilist[a].sheet_y * 16) +'px"> </div></li>');
				
			$('.emojiname-'+ emoji.emojilist[a].short_name).click(function(a) {
				$(".chat_message").val($(".chat_message").val() + ' :' + a.target.className.substr(27) + ':');
			})
			
			short_names = "";
		}
		
		emoji.showedList = true;
	}
};