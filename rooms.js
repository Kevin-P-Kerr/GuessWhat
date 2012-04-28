var Room = function (options) {
	this.players = [options.player];
	this.roomName = options.roomName || "A Room";
    this.playing = false;
};

exports.Room = Room;
