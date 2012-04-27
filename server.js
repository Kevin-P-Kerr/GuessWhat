var http = require('http');
var url = require("url");
var fs = require('fs');

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
	http.createServer(onRequest).listen(8000);
	console.log("Server has started");
};

exports.start = start;
