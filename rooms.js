var Room = function (options) {
	this.players = [options.player];
	this.roomName = options.roomName || "A Room";
    this.playing = false;
    this.drawer = null;
    this.currentWord = '';
    this.solvedWords = [];
};

Room.words = ['banana','apple','train','car','building','baseball','field','chair','river','fish'];

Room.prototype.prepRound = function () {
    this.drawer = this.drawer ? this.nextDrawer(this.drawer) : this.players[0];
    this.currentWord = this.nextWord();
};

Room.prototype.nextDrawer = function (drawer) {
    var i;
    for (i=0;i<this.players.length-1; i++) {
        if (drawer.id === this.players[i].id) {
            if (i === this.players.length-1) {
                return this.players[0];
            }
            else {
                return this.players[++i];
            }
        }
    }
};

Room.prototype.nextWord = function () {
    var word, i;
    while(word && this.solvedWords.indexOf(word) === -1) {
        i = Math.floor(Math.random() * Room.words.length);
        word = Room.words[i];
    }
    this.solvedWords.push(word);
    return word;
};

exports.Room = Room;
