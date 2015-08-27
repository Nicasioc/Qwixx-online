var webSocketServer = require("websocket").server,
	express = require("express");

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
	console.log("open");
	connection.on("message", function(message) {
		console.log(message);
	})

});