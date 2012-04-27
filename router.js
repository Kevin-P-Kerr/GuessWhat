var fs = require('fs');
 
function route(pathname) {
	console.log(pathname);
	if (pathname === "/index.html") {
		var ind = fs.readFileSync("./templates/index.html");
		return ind;
	}else if (pathname === "/client.js") {
		var js = fs.readFileSync("./client.js");
		return js;
	} else if (pathname === "/templates/public.css") {
		var css = fs.readFileSync("./templates/public.css");
		return css;
	} else {
		var notFound = "404 not found";
		return notFound;
	}console.log("About to route a reqest" + pathname);
}

exports.route = route; 
