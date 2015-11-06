var WebSocketServer = require("websocket").server,
	express = require("express"),
	DiceRoller = require("./DiceRoller"),
	crypto = require('crypto');

var diceRoller = new DiceRoller(),
	roll,
	diceLog = [];
var connection,
	connections = {};
/* connections obj idea
{
  idG1: {
      connections: {
        connId1: conn,
        connId2: conn,
        connId3: conn,
        connId4: conn    
      },
      isReady: false,
      isPlaying: false
  },
  idG2: {
      connections: {
        connId1: conn,
        connId2: conn,
        connId3: conn,
        connId4: conn    
      },
      isReady: false,
      isPlaying: false
}
*/


var app = express();

app.use( "/", express.static(__dirname + "/public") );

/** start server */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Quixx online at http://"+host+":"+port);

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

	var checkStartStatus = function() {
		var readyPlayers = 0;
		for ( var connId in connections ) {
			if(connections[connId].isReady) {
				readyPlayers++;
			}
		}
		if (readyPlayers>1) {
			sendMessageToAll("readyToStartGame");
		} else {
			sendMessageToAll("noReadyToStartGame");
		};
		sendMessageToAll("playersReady", readyPlayers);
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
				this.isReady = msgJson.text;
				checkStartStatus();
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
		checkStartStatus();	
	})
/*	
	//testing idea
	var groupdIds = Object.keys(connections);
	
	for (var gid in connections ) {
		if ( !connections[gid].isPlaying && !connections[gid].isFull ) {
			connections[gid][connection.id] = connection;
		}
	}
*/
	connections[connection.id] = connection;

	//always send ready players count to players on connection
	checkStartStatus();

	console.log("conections open "+ connections.length);

});