function Connection(serverUrl) {
	this.conn = new WebSocket(serverUrl);

	this.conn.onopen = function(message) {
		console.debug(message);
	}

}

Connection.prototype.send = function(objMsj) {
	this.conn.send( JSON.stringify(objMsj) );
};

Connection.prototype.setOnmessage = function(callback) {
	this.conn.onmessage = callback;
}
