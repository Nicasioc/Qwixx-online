function Connection(serverUrl) {
  this.conn = new WebSocket(serverUrl);

  this.conn.onopen = function (message) {
    console.debug(message.type);
  };

  this.conn.onclose = function (e) {
    console.debug("Connection closed " + e.code);
  };
}

Connection.prototype.send = function (objMsj) {
  this.conn.send(JSON.stringify(objMsj));
};

Connection.prototype.setOnmessage = function (callback) {
  this.conn.onmessage = callback;
};
