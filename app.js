var webSocketServer = require("websocket").server,
	express = require("express"),
	DiceRoller = require("./DiceRoller");

var diceRoller = new DiceRoller();
var connections = [];
var readyPlayers = 0;

var app = express();

app.use( "/", express.static(__dirname + "/public") );

/** start server */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://"+host+":"+port);

});

wsServer = new webSocketServer({
	httpServer:server
})

wsServer.on("request", function(request) {

	var connection = request.accept(null, request.origin);
	console.log( "Connection open" );

	var sendMessageToAll = function(msgType, msgText) {
		var msg = {
			type: "playersReady",
			text: readyPlayers
		};
		connections.forEach(function(item, index) {
			item.send( JSON.stringify( msg ) );
		});
	};	


	connection.on("message", function(message) {

		var msgJson = JSON.parse(message.utf8Data);

		console.log("Message received: "+msgJson.type);

		switch (msgJson.type) {
			case "roll":
				console.log("Dice roll");
				sendMessageToAll("roll", diceRoller.roll());
				break;

			case "removeColor":
				console.log("Color "+ msgJson.text +" removed");
				diceRoller.removeColor(msgJson.text);
				sendMessageToAll("closeRow", msgJson.text);
				break;
			case "ready":
				readyPlayers++;
				sendMessageToAll("playersReady", readyPlayers);
				break;
			case "notReady":
				readyPlayers--;
				sendMessageToAll("playersReady", readyPlayers);
				break;
		}
	})

	connection.on("close", function(reasonCode, description) {
		console.log( "Connection closed" );
		console.log( reasonCode +" "+description );
		connections.splice( connections.indexOf(this), 1);
		console.log("conections open "+ connections.length);
		if (readyPlayers>0) {
			readyPlayers--;
		};
	})

	connections.push( connection );

	//always send ready players count to players on connection
	sendMessageToAll("playersReady", readyPlayers);

	console.log("conections open "+ connections.length);

});