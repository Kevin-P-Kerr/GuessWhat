var Player = function (obj) {
	this.name = obj.name || "new player";
	this.id = obj.socket.id;
	this.isDrawing = false;
};

exports.Player = Player; 
