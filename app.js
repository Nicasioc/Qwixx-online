var webSocketServer = require("websocket").server,
	express = require("express"),
	DiceRoller = require("./DiceRoller");

var diceRoller = new DiceRoller();
var connections = [];

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


	connection.on("message", function(message) {

		var msgJson = JSON.parse(message.utf8Data);

		switch (msgJson.type) {
			case "roll":
				console.log("Dice roll");
					var msg = {
						type: "roll",
						text: diceRoller.roll()
					}
				connections.forEach(function(item, index) {
					item.send( JSON.stringify( msg ) );
				})
				break;

			case "removeColor":
				console.log("Color "+ msgJson.text +" removed");
				diceRoller.removeColor(msgJson.text);
				var msg = {
					type: "closeRow",
					text: msgJson.text
				}
				connections.forEach(function(item, index) {
					item.send( JSON.stringify( msg ) );
				})
				break;
		}
	})

	connection.on("close", function(reasonCode, description) {
		console.log( "Connection closed" );
		console.log( reasonCode +" "+description );
		connections.splice( connections.indexOf(this), 1);
		console.log("conections open "+ connections.length);
	})

	connections.push( connection );
	console.log("conections open "+ connections.length);

});