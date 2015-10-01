var WebSocketServer = require("websocket").server,
	express = require("express"),
	DiceRoller = require("./DiceRoller"),
	crypto = require('crypto');

var diceRoller = new DiceRoller(),
	roll,
	diceLog = [];
var connections = {};
var readyPlayers = 0;

var app = express();

app.use( "/", express.static(__dirname + "/public") );

/** start server */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://"+host+":"+port);

});

var wsServer = new WebSocketServer({
	httpServer:server
});


wsServer.on("request", function(request) {

	connection = request.accept(null, request.origin);
	connection.id = crypto.randomBytes(20).toString('hex');
	
	var msg = {
			type: "playerId",
			text: connection.id
	};
	
	connection.send( JSON.stringify( msg ) );
	console.log( "Connection open" );
	console.log( "Player ID: " + connection.id );



	var sendMessageToAll = function(msgType, msgText) {
		var msg = {
			type: msgType,
			text: msgText||null
		};
		for (var id in connections ) {
			connections[id].send( JSON.stringify( msg ) );
		}
	};	

	var checkStartStatus = function(readyPlayers) {
		if (readyPlayers>1) {
			sendMessageToAll("readyToStartGame");
		} else {
			sendMessageToAll("noReadyToStartGame");
		};
	};


	connection.on("message", function(message) {

		var msgJson = JSON.parse(message.utf8Data);
		console.log("Player Id: " + this.id);
		console.log("Message received: "+msgJson.type);

		switch (msgJson.type) {
			case "roll":
				console.log("Dice roll");
				roll = diceRoller.roll();
				diceLog.push(roll);
				sendMessageToAll("roll", roll);
				break;

			case "removeColor":
				console.log("Color "+ msgJson.text +" removed");
				diceRoller.removeColor(msgJson.text);
				sendMessageToAll("closeRow", msgJson.text);
				break;
			case "isReady":
				if( msgJson.text ) {
					readyPlayers++;
				} else {
					readyPlayers--;					
				}
				sendMessageToAll("playersReady", readyPlayers);
				checkStartStatus(readyPlayers);
				break;
			case "startCountDown":
				console.log("envia startGame");
				sendMessageToAll("startGame");
				break;
		}
	})

	connection.on("close", function(reasonCode, description) {
		console.log( "Connection closed" );
		console.log( reasonCode +" "+description );
		delete connections[connection.id];
		console.log("conections open "+ connections.length);
		if (readyPlayers>0) {
			readyPlayers--;
			checkStartStatus(readyPlayers);
		};
	});

	connections[connection.id] = connection;

	//always send ready players count to players on connection
	sendMessageToAll("playersReady", readyPlayers);

	console.log("conections open "+ connections.length);

});