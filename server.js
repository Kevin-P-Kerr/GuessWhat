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
		var player = new players.Player({socket : socket})
		socket.set("playerObj", player, function () {
			console.log("we made the player!");
		});
		socket.on("createRoom", function (obj) {
			if (roomData.hasOwnProperty(obj.roomName)) {
				socket.emit("roomExists", {err : "room exists"});
			} else {
				socket.emit("yo", {what : "is going on?"})
				socket.get("playerObj", function (err, player) {
					console.log("this is obj.roomName" + obj.roomName);
					obj.player = player;
					var newRoom = new rooms.Room(obj);
                    roomData[obj.roomName] = newRoom;
					socket.emit("roomCreated", {room : obj.roomName});
				});
			}
	});
        })
};

exports.start = start;
