var Room = function (options) {
	this.players = [options.player];
	this.roomName = options.roomName || "A Room";
};

exports.Room = Room;
