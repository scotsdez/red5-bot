/**
Red 5 Prototype
Version 0.1
9/5/2018

Requires: JQuery (imported separately).
*/

const botName = "Red 5";
const debugMode = false;

var intentArray = [];
// define intents and aliases
const intent_hi = { name: "hi", selectors: ["hi","hello","hey","yo","sup","what's up"], tokenise: true };
const intent_coverme = { name: "cover me", selectors: ["need cover","cover me","need backup","help","cover","protect me", "all over me", "I'm taking damage"], tokenise: false };
const intent_attackmytarget = { name: "attack my target", selectors: ["attack my target","destroy","kill", "attack "], tokenise: false };
const intent_escortmytarget = { name: "escort my target", selectors: ["escort my target","protect target","guard ", "escort ", "protect the", "protect that"], tokenise: false };

const worldInfo = { playerName: "Red leader", 
	friendlyIFF: "rebel", 
	activeShips:  [
		{ name: "Red 1", IFF: "rebel", shiptype: "X-Wing" },
		{ name: "Red 5", IFF: "rebel", shiptype: "X-Wing"},
		{ name: "Alpha 1", IFF: "imperial", shiptype: "TIE-Fighter"},
		{ name: "Alpha 2", IFF: "imperial", shiptype: "TIE-Fighter"}
		] 
	};

const unmatchedIntent = "I didn't understand that message.";

const intent_coverme_replies = { message: ["Roger, I'm on my way.","Got it, I'm on him!","I've got your back.","Stay calm, I'm plotting an intercept course!","On it, PLAYERNAME!"] };
const intent_attack_replies = { message: ["Attacking your target.", "Roger that, engaging target.", "Setting up attack run.", "Okay, PLAYERNAME, attacking your target.", "Attacking your target, PLAYERNAME."] };
const intent_attack_replies_spec = { message: ["Attacking TARGETNAME.", "Roger that, engaging TARGETNAME.", "Got it, attacking TARGETNAME.", "Acknowledged, engaging TARGETNAME."] };
const intent_attack_replies_no = { message: ["Are you crazy, they're on our side!", "No way, that's a friendly!"] };
const intent_attack_replies_notfound = { message: ["I'm not sure which target you mean, PLAYERNAME.", "I can't see that target, are you sure?", "I'm sorry, PLAYERNAME, which target did you mean?"] };
const intent_escort_replies = { message: ["Acknowledged, escorting target.", "Assuming escort position.", "I'll look after the target."] };

function init() {
	// build intent array
	intentArray.push(tokeniseIntent(intent_hi));
	intentArray.push(tokeniseIntent(intent_coverme));	
	intentArray.push(tokeniseIntent(intent_attackmytarget));
	intentArray.push(tokeniseIntent(intent_escortmytarget));
	
	console.log("Red5_init: Initialised " + intentArray.length + " intents.");
}

function getWorldState() {
	return JSON.stringify(worldInfo);
}

function updatePlayerName(name) {
	worldInfo.playerName = name;
}

function tokeniseIntent(intent) {
	var selectors = [];
	if(intent && intent.tokenise) {
		for(var i=0;i < intent.selectors.length;i++) {
			var thisLine = intent.selectors[i].toLowerCase();
			selectors.push(" " + thisLine);
			selectors.push(thisLine + " ");
		}
		console.log("Red5_tokeniseIntent: Tokenised " + intent.selectors.length + " selectors for intent " + intent.name + " resulting in " + selectors.length + " total selectors.");
	}
	else {
		// convert all to lower case
		for(var i=0;i < intent.selectors.length;i++) {
			var thisLine = intent.selectors[i].toLowerCase();
			selectors.push(thisLine);
		}	
		console.log("Red5_tokeniseIntent: No tokenisation performed. Lowercase conversion completed.");
	}
	
	intent.selectors = selectors;
	return intent;
}

function processMessage(message) {
	displayChatMessage(message);
	var detectedIntent = detectIntent(message.content);
	if(detectedIntent) {
		var returnedMessage;
		if(debugMode) {
			returnedMessage = { sender: "bot", content: "Matched intent: " + detectedIntent };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			displayChatMessage(returnedMessage);
		}
		if(detectedIntent == "hi") {
			returnedMessage = { sender: "bot", content: "I'm Red 5, a prototype AI wingman demo." };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "cover me") {
			// select random response
			var randomIndex = Math.floor(Math.random() * intent_coverme_replies.message.length);

			returnedMessage = { sender: "bot", content: intent_coverme_replies.message[randomIndex] };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "attack my target") {
			var spec = false;
			var friendly = false;
			var targetName = "";
			var generic = false;
			
			var msgContent = message.content.toLowerCase();
			
			// determine if target exists in world state
			for(var i=0;i<worldInfo.activeShips.length;i++) {
				if(msgContent.includes(worldInfo.activeShips[i].name.toLowerCase())) {
					if(worldInfo.activeShips[i].IFF == worldInfo.friendlyIFF) {
						friendly = true;
					}
					spec = true;
					targetName = worldInfo.activeShips[i].name;
				}
			}
			
			if(!spec) {
				if(msgContent.includes("my ") || msgContent.includes(" target") ) {
					generic = true;
				}
			}

			var randomIndex;
			
			// if target is a friendly
			if(friendly) {
				randomIndex = Math.floor(Math.random() * intent_attack_replies_no.message.length);
				
				returnedMessage = { sender: "bot", content: intent_attack_replies_no.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
				displayChatMessage(returnedMessage);
			}
			
			// if target is specific and exists
			else if(spec) {
				randomIndex = Math.floor(Math.random() * intent_attack_replies_spec.message.length);
				
				returnedMessage = { sender: "bot", content: intent_attack_replies_spec.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("TARGETNAME", targetName);
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
				displayChatMessage(returnedMessage);
			}
			else if(generic) {
				// select random response
				randomIndex = Math.floor(Math.random() * intent_attack_replies.message.length);

				returnedMessage = { sender: "bot", content: intent_attack_replies.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
				displayChatMessage(returnedMessage);				
			}
			// if we are here, we didn't determine a generic response, so the player
			// may have specified a non-existent target.
			else {
				// select random response
				randomIndex = Math.floor(Math.random() * intent_attack_replies_notfound.message.length);

				returnedMessage = { sender: "bot", content: intent_attack_replies_notfound.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
				displayChatMessage(returnedMessage);		
			}
		}
		else if(detectedIntent == "escort my target") {
			// select random response
			var randomIndex = Math.floor(Math.random() * intent_escort_replies.message.length);

			returnedMessage = { sender: "bot", content: intent_escort_replies.message[randomIndex] };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			displayChatMessage(returnedMessage);
		}
	}
	// otherwise message was not understood.
	else {
		var returnedMessage = { sender: "bot", content: unmatchedIntent };
		returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
		displayChatMessage(returnedMessage);
	}
}

function detectIntent(message) {
	message = message.toLowerCase();
	var messagePrefixSpace = " " + message;
	var messageSuffixSpace = message + " ";
	for(var i=0;i < intentArray.length;i++) {
		for(var j=0;j < intentArray[i].selectors.length;j++) {
			if(message.includes(intentArray[i].selectors[j])) {
				return intentArray[i].name;
			}
			if(messagePrefixSpace.includes(intentArray[i].selectors[j])) {
				return intentArray[i].name;
			}
			if(messageSuffixSpace.includes(intentArray[i].selectors[j])) {
				return intentArray[i].name;
			}
		}
	}

	
	// otherwise return undefined if no match
	return undefined;
}

// on document load, initialise bot (JQuery 3.0+ syntax)
$(init());