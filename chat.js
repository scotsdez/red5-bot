/**
Red 5 Prototype
Version 0.1
9/5/2018

Requires: JQuery (imported separately).

Class: 			Chat
Description: 	Handles front end chat messages.
*/

const inputFieldName = '#chatInput';

function submitButtonPress() {
	var newMsg = { sender: "user", content: $(inputFieldName).val() };
	console.log(newMsg);
	if(newMsg.content) {
		processMessage(newMsg);
	}
	$(inputFieldName).val("");
}

/**
* Expects chat message in form of JSON object:
* sender (string) - 'bot' for bot, 'user' for user input
* content (string) - message contents
*/
function displayChatMessage(message) {
	$("#chat").append("<li class='chatMessage " + message.sender + "'>" + message.content + "</li>");
	$('#chat').animate({"scrollTop": $('#chat')[0].scrollHeight}, "fast");
}

$(document).ready(function(){
	$(inputFieldName).keypress(function(e){
	  if(e.keyCode==13)	{
		submitButtonPress();
	  }
	});
	
	$('#worldstate').val(getWorldState());
	
});