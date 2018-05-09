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
const intent_attackmytarget = { name: "attack my target", selectors: ["attack my target","destroy ","kill ", "attack ", "engage "], tokenise: false };
const intent_escortmytarget = { name: "escort my target", selectors: ["escort my target","protect target","guard ", "escort ", "protect the", "protect that"], tokenise: false };
const intent_ignoremytarget = { name: "ignore my target", selectors: ["ignore my target","ignore target","ignore ", "leave target", "abort attack", "abandon attack", "stop attack"], tokenise: false };
const intent_waitfororders = { name: "wait for orders", selectors: ["wait for orders","wait there","wait ", "stop ", "halt "], tokenise: false };
const intent_evasive = { name: "evasive manoeuvres", selectors: ["evasive manoeuvres","evasive action","dive", "swerve", "jink", "weave", "escape"], tokenise: false };

var currentActivity = "";

const worldInfo = { playerName: "Red 2", 
	friendlyIFF: "rebel", 
	activeShips:  [
		{ name: "Red 1", IFF: "rebel", shiptype: "X-Wing"},
		{ name: "Red 2", IFF: "rebel", shiptype: "X-Wing"},
		{ name: "Red 5", IFF: "rebel", shiptype: "X-Wing"},
		{ name: "Green 1", IFF: "rebel", shiptype: "A-Wing"},
		{ name: "Alpha 1", IFF: "imperial", shiptype: "TIE-Fighter"},
		{ name: "Alpha 2", IFF: "imperial", shiptype: "TIE-Fighter"},
		{ name: "Delta 1", IFF: "imperial", shiptype: "TIE-Bomber"},
		{ name: "Delta 2", IFF: "imperial", shiptype: "TIE-Bomber"},
		{ name: "Immortal", IFF: "imperial", shiptype: "ISD"}
		] 
	};

const unmatchedIntent = "I didn't understand that message.";

const intent_coverme_replies = { message: ["Roger, I'm on my way.","Got it, I'm on him!","I've got your back.","Stay calm, I'm plotting an intercept course!","On it, PLAYERNAME!"] };
const intent_attack_replies = { message: ["Attacking your target.", "Roger that, engaging target.", "Setting up attack run.", "Okay, PLAYERNAME, attacking your target.", "Attacking your target, PLAYERNAME."] };
const intent_attack_replies_typeonly = { message: ["Attacking TARGETTYPE.", "Roger that, engaging TARGETTYPE.", "Setting up attack run.", "Okay, PLAYERNAME, attacking TARGETTYPE.", "Attacking TARGETTYPE, PLAYERNAME."] };
const intent_attack_replies_spec = { message: ["Attacking TARGETTYPE TARGETNAME.", "Roger that, engaging TARGETTYPE TARGETNAME.", "Got it, attacking TARGETTYPE TARGETNAME.", "Acknowledged, engaging TARGETTYPE TARGETNAME."] };
const intent_attack_replies_no = { message: ["Are you crazy, they're on our side!", "No way, that's a friendly!"] };
const intent_attack_replies_notfound = { message: ["I'm not sure which target you mean, PLAYERNAME.", "I can't see that target, are you sure?", "I'm sorry, PLAYERNAME, which target did you mean?"] };
const intent_escort_replies = { message: ["Acknowledged, escorting target.", "Assuming escort position.", "I'll look after the target."] };
const intent_ignore_replies = { message: ["Acknowledged, ignoring target.", "Ignoring your target, PLAYERNAME.", "Roger that, ignoring target.", "It's all yours, PLAYERNAME."] };
const intent_wait_replies = { message: ["Acknowledged, waiting for further orders.", "Waiting for further orders.", "Okay PLAYERNAME, waiting for further orders.", "I'll hang tight."] };
const intent_evasive_replies = { message: ["I know just the manoeuvre to get out of this one!", "Evading!", "Let's see them try and match this!", "I hope this buckethead has a strong stomach..."] };

const shipAliases = { 
	"X-Wing" : ["x-w","x wing", "x w"],
	"A-Wing" : ["a-w","a wing", "a w"],
	"TIE-Fighter" : ["t-f","tie fighter", "tie/ln", "tie ln", "tie l n"],
	"TIE-Bomber" : ["t-b","tie bomber", "tie/b", "bomber"],
	"ISD" : ["star destroyer","destroyer", "isd1", "isdii"]
};

function init() {
	// build intent array
	intentArray.push(tokeniseIntent(intent_hi));
	intentArray.push(tokeniseIntent(intent_coverme));	
	intentArray.push(tokeniseIntent(intent_attackmytarget));
	intentArray.push(tokeniseIntent(intent_escortmytarget));
	intentArray.push(tokeniseIntent(intent_ignoremytarget));
	intentArray.push(tokeniseIntent(intent_waitfororders));
	intentArray.push(tokeniseIntent(intent_evasive));
	
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
			returnedMessage = { sender: "bot", content: "I'm " + botName + ", a prototype AI wingman demo." };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			displayChatMessage(returnedMessage);
			returnedMessage = { sender: "bot", content: "Try asking me to attack or escort a target, or to cover you." };
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "cover me") {
			// select random response
			var randomIndex = Math.floor(Math.random() * intent_coverme_replies.message.length);

			returnedMessage = { sender: "bot", content: intent_coverme_replies.message[randomIndex] };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			
			currentActivity = "Covering player";
			
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "attack my target") {
			var spec = false;
			var friendly = false;
			var targetName = "";
			var targetType = "";
			var generic = false;
			
			var msgContent = message.content.toLowerCase();
			// replace instances of bot name with blank string.
			// i.e. "Okay, Red 5, ..."
			msgContent = msgContent.replace(botName.toLowerCase(), "");
			console.log(msgContent);
			
			// determine if target exists in world state
			for(var i=0;i<worldInfo.activeShips.length;i++) {
				if(msgContent.includes(worldInfo.activeShips[i].name.toLowerCase())) {
					if(worldInfo.activeShips[i].IFF == worldInfo.friendlyIFF) {
						friendly = true;
					}
					spec = true;
					targetName = worldInfo.activeShips[i].name;
					targetType = worldInfo.activeShips[i].shiptype;
				}
			}
			
			if(!spec) {
				if(msgContent.includes("my ") || msgContent.includes(" target") ) {
					generic = true;
				}
				
				// determine if ship type was given
				var shipTypes = getWorldShipTypes();
				for(var i=0;i<shipTypes.length;i++) {
				//	for(var j=0;i<shipTypes[i].length;j++) {
						if(msgContent.includes(shipTypes[i].toLowerCase())) {
							targetType = shipTypes[i];
						}
				//	}
				}
			}

			var randomIndex;
			
			// if target is a friendly
			if(friendly) {
				if(targetName.toLowerCase() == worldInfo.playerName.toLowerCase()) {
					returnedMessage = { sender: "bot", content: "Are you crazy, I'm not going to attack you!" };
					displayChatMessage(returnedMessage);
				}
				else if(targetName.toLowerCase() == botName.toLowerCase()) {
					returnedMessage = { sender: "bot", content: "That's me..." };
					displayChatMessage(returnedMessage);
				}
				else {
					randomIndex = Math.floor(Math.random() * intent_attack_replies_no.message.length);
					
					returnedMessage = { sender: "bot", content: intent_attack_replies_no.message[randomIndex] };
					returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
					displayChatMessage(returnedMessage);					
				}
			}
			
			// if target is specific and exists
			else if(spec) {
				randomIndex = Math.floor(Math.random() * intent_attack_replies_spec.message.length);
				
				returnedMessage = { sender: "bot", content: intent_attack_replies_spec.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("TARGETNAME", targetName);
				returnedMessage.content = returnedMessage.content.replace("TARGETTYPE", targetType);
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
				
				currentActivity = "Attacking player's target by name: " +  targetName;
				
				displayChatMessage(returnedMessage);
			}
			// generic target type selected only
			else if(targetType) {
				randomIndex = Math.floor(Math.random() * intent_attack_replies_typeonly.message.length);
				
				returnedMessage = { sender: "bot", content: intent_attack_replies_typeonly.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("TARGETTYPE", targetType);
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
				
				currentActivity = "Attacking player's target by type: " +  targetType;
				
				displayChatMessage(returnedMessage);
			}
			else if(generic) {
				// select random response
				randomIndex = Math.floor(Math.random() * intent_attack_replies.message.length);

				returnedMessage = { sender: "bot", content: intent_attack_replies.message[randomIndex] };
				returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
							
				currentActivity = "Attacking player's target";			

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
			
			currentActivity = "Escorting player's target";	
			
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "ignore my target") {
			// select random response
			var randomIndex = Math.floor(Math.random() * intent_ignore_replies.message.length);

			returnedMessage = { sender: "bot", content: intent_ignore_replies.message[randomIndex] };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			
			currentActivity = "Ignoring player's target";	
			
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "wait for orders") {
			// select random response
			var randomIndex = Math.floor(Math.random() * intent_wait_replies.message.length);

			returnedMessage = { sender: "bot", content: intent_wait_replies.message[randomIndex] };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			
			currentActivity = "Waiting for orders";	
			
			displayChatMessage(returnedMessage);
		}
		else if(detectedIntent == "evasive manoeuvres") {
			// select random response
			var randomIndex = Math.floor(Math.random() * intent_evasive_replies.message.length);

			returnedMessage = { sender: "bot", content: intent_evasive_replies.message[randomIndex] };
			returnedMessage.content = returnedMessage.content.replace("PLAYERNAME", worldInfo.playerName);
			
			currentActivity = "Evasive manoeuvres";	
			
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

function getCurrentOrder() {
	return currentActivity;
}

function getWorldShipTypes() {
	var shipTypes = [];
	for(var i=0;i < worldInfo.activeShips.length;i++) {
		if(!shipTypes.includes(worldInfo.activeShips[i].shiptype) ) {
			shipTypes.push(worldInfo.activeShips[i].shiptype);
		}
	}
	var updatedShipTypes = [];
	for(var i=0;i < shipTypes.length;i++) {
		updatedShipTypes.push(shipTypes[i]);
		
		if(shipAliases.hasOwnProperty(shipTypes[i]) ) {
			for(var j=0; j < shipAliases[shipTypes[i]].length; j++){
				shipTypes.push(shipAliases[shipTypes[i]][j]);
			}
		}
	}
	return shipTypes;
}

// on document load, initialise bot (JQuery 3.0+ syntax)
$(init());