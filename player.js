var Player = function (obj) {
	this.name = obj.name || "new player";
	this.id = obj.socket.id;
    this.score = 0;
};

exports.Player = Player; 
