var http = require('http');
var url = require("url");
var fs = require('fs');
var io = require("socket.io");
var players = require("./player.js");
var rooms = require("./rooms.js");

var roomData = {};

var wordList = ["monkey", "banana", "fish", "tree", "baseball", "James Madison"];

function start(route) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log(url.parse(request.url));
		console.log("Request for " + pathname + " received.");
		if (pathname === "/index.html") {
			console.log("index.html");	
			response.writeHead(200, {"Content-Type" : "text/html"});
		} else if (pathname === "/client.js") {
			response.writeHead(200, {"Content-Type" : "text/javascript"});
			console.log("client.js");
		} else if (pathname === "/templates/public.css") {
			response.writeHead(200, {"Content-Type" : "text/css"});
			console.log("yes, we made it to css");
		} else {
			response.writeHead(404, {"Content-Type" : "text/html"});
		}
		var content = route(pathname);
		response.write(content);
		response.end();
	} 
	var server = http.createServer(onRequest);
    io = io.listen(server);
    server.listen(8000);
	console.log("Server has started");

    io.sockets.on('connection', function(socket) {
        socket.emit("current-rooms", roomData);
		var player = new players.Player({socket : socket})
		socket.set("playerObj", player, function () {
			console.log("we made the player!");
		});

		socket.on("createRoom", function (obj) {
			if (roomData.hasOwnProperty(obj.roomName)) {
				socket.emit("roomExists", {err : "room exists"});
			} else {
				socket.get("playerObj", function (err, player) {
					console.log("this is obj.roomName" + obj.roomName);
					obj.player = player;
					var newRoom = new rooms.Room(obj);
                    socket.set('room', newRoom, function() {
                        roomData[obj.roomName] = newRoom;
                        socket.join(obj.roomName);
                        console.log('nr obj: '+newRoom);
					    socket.emit("roomCreated", newRoom);
                        socket.broadcast.emit("current-rooms", roomData);
                    });
				});
			}
	    });

        socket.on("join-room", function(room) {
			console.log("the first room is this " + room);
			console.log("room.room is " + room.room);
            var livingRoom = roomData[room.room];
			console.log("livingRoom is " + livingRoom);
			console.log("livingRoom. is " + livingRoom.roomName);
            socket.get("playerObj", function(err, player) {
				console.log("this is "+livingRoom.roomName);
                livingRoom.players.push(player);
                socket.set('room', livingRoom, function() {
                });
				console.log("server: 71" + player);
                io.sockets.in(livingRoom.roomName).emit('player-changed', {players : livingRoom.players});
                socket.join(livingRoom.roomName);
                socket.emit('room-joined', livingRoom);
            });
            if (livingRoom.playing === false && livingRoom.players.length > 1) {
                livingRoom.playing = true;
                var sock = livingRoom.players[0].id;
                io.sockets.socket(sock).emit('room-ready');
            }
        });

        socket.on('begin-game', function() {
            socket.get('room', function(err, room) {
				for (var prop in room) {
					console.log(prop);
				}
                room.prepRound();
				console.log("server 90: room.drawer.id is " + room.drawer.id);
                io.sockets.socket(room.drawer.id).emit('start-drawing', {word: room.currentWord});
                io.sockets.in(room.name).emit('round-started');
            });
        });

        socket.on('line-data', function(lineData) {
            console.log('line-data server.js 100 called');
            socket.get('room', function(err, room) {
                io.sockets.in(room.name).emit('update-drawing', lineData);
            });
        });
		socket.on("clear-drawing", function () {
			socket.get('room', function(err, room) {
			io.sockets.in(room.name).emit("clear-canvas", {});
		});
    });
		socket.on("guess", function(guess) {
		console.log("someone made a guess " + guess.guess);
			socket.get('room', function (err, room) {
				console.log("the answer: " + room.currentWord);
				if (room.currentWord ===  guess.guess.toLowerCase()) {
					socket.get('playerObj', function (err, player) {
						io.sockets.in(room.name).emit("winner", {winner : player.name});
					});
				}
			});
		});
});
};

exports.start = start;
