var http = require('http');
var url = require("url");
var fs = require('fs');
var io = require("socket.io");

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

    io.sockets.on('connection', function(socket){
        socket.emit('hello', {who:"you"});
        socket.on('how-are-you', function(data) {
            console.log(data);
            socket.emit('im-well', {feeling:'fine'})
        })
    });
};

exports.start = start;
