
var options = {};
var isDrawing = false;
var socket = io.connect('http://localhost:8000');

socket.on("start-drawing", function (word) {
        console.log("start drawing fired");
		isDrawing = true;
		$("#start-game").hide('slow');
		$(".now-drawing").show();
		options = initCanvas();
		var drawObj = new Draw(options);
		$("select").removeClass("hidden");
		$("#clear-drawing").removeClass("hidden");
		$(this).addClass("hidden");
        initDrawingSession(drawObj);
		$("#word").text(word.word);
    });

socket.on("round-started", function () {
	console.log("round started fired");
	$("#canvas-wrap").show();
	if (!isDrawing) {
		$(".guessing").show();
        options = initCanvas();
        var drawObj = new Draw(options);
        viewDrawingSession(drawObj);
		clearCanvas(drawObj);
	}
});

$("#guess-button").click(function (e) {
	e.preventDefault();
	var val = $("#guess-val").val();
	socket.emit("guess", {guess: val});
	$("#guess-val").val('');
});

socket.on("winner", function (winner) {
	var winUser = winner.winner;
	$("#winner").show();
	$("#winner h1").text(winUser + "Wins!");
	alert("The Winner Is " + winUser + "!");
});

$("#clear-drawing").click(function () {
	options.canvas.width = options.canvas.width;
	socket.emit("clear-drawing", {});
});

$("#roomSubmit").click(function (e) {
	e.preventDefault();
	var input = $("#formText").val();
	socket.emit("createRoom", {roomName : input});
});

var updateCurrentRoom = function(room) {
	$(".lobby").hide();
	//$(".room").fadeIn(1000);
	$("#roomName").removeClass("hidden")
                  .html("<h3>" + room + "</h3>");
};

var updateCurrentPlayers = function (players) {
	console.log("players are: "+players[0].name);
	var n;
	var ul = $('div#current-players ul');
	ul.empty();
	for (n=0; n<players.length; n++) {
		ul.append('<li><a href="#">'+players[n].name+'</a></li>');
	}
};

socket.on("roomCreated", function (data) {
    updateCurrentRoom(data.roomName);
    $('.pre-game').show('slow');
	$('.room').show('slow');
    $('#current-players ul').append('<li>'+data.players[0].name+'</li>');
});

socket.on('player-changed', function(data) {
   updateCurrentPlayers(data.players);
});

socket.on('room-joined', function(room) {
    console.log('rj: '+room.roomName);
    updateCurrentRoom(room.roomName);
	console.log(room.players);
	updateCurrentPlayers(room.players);
	$('.room').show('slow');
});

var updateRooms = function(roomObj) {
    var prop;
    var ul = $('div#current-rooms ul');
    for (prop in roomObj) {
        ul.append('<li><a href="#">'+prop+'</a></li>');
    }

};

socket.on('room-ready', function() {
    $('.pre-game').hide();
    $('#start-game').show();
    });

$("#start-game").click(function () {
	socket.emit("begin-game", {});
});

socket.on("current-rooms", function(roomData) {
    updateRooms(roomData);
});

$('#current-rooms').on('click', 'a', function(e) {
    e.preventDefault();
    var room = $(this).text();
    socket.emit('join-room', {room:room});
});

var initCanvas = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    return {ctx : ctx, canvas : canvas};
};

var selectColor = function(drawObj) {
};

var initDrawingSession = function (drawObj) {
    $('#canvas').mousedown(function(e) {
        console.log('mousedown fired');
        e.preventDefault();
        var x = e.offsetX, y = e.offsetY;
        $('#status').html(x + " - " + y);
		drawObj.startDraw(x, y);
	}); 
	$('#canvas').mouseup(function (e) {
        console.log('mouseup fired');
		drawObj.isDrawing = false;
        emitLine(drawObj.line, drawObj.color);
	});
	$('#canvas').mousemove(function (e) {
        console.log('mousemove called');
		if (drawObj.isDrawing) {
			drawObj.line.push({x: e.offsetX, y: e.offsetY});
            console.log('line length: '+drawObj.line.length);
			drawObj.drawLine();
		}
	})
    $('select').change(function() {
        var color = $('select option:selected').val();
        drawObj.setColor(color);
    });
};

var viewDrawingSession = function (drawObj) {
    console.log('viewDrawingSession client.js 142 called');
    socket.on('update-drawing', function(updatedLine) {
       drawObj.viewLine(updatedLine.line, updatedLine.color); 
    });
};	

var clearCanvas = function (drawObj) {
	console.log("client 150: clear Canvas reached");
	socket.on("clear-canvas", function () {
		options.canvas.width = options.canvas.width;
	});
};

var emitLine = function(line, color) {
    console.log('emitLine client.js 148 called');
    socket.emit('line-data', {line: line, color: color});
};
		
var Draw = function (options) {
	this.color = options.color || "black";
	this.line = [];
	this.ctx = options.ctx;
	this.isDrawing = false;
	this.canvas = options.canvas;
	};

Draw.prototype.startDraw = function (x, y) {
	this.line = [{x: x, y: y}];
	this.isDrawing = true;
};

Draw.prototype.drawLine = function () {
    console.log('drawLine called');
	var n=1;
	var start = this.line[0];
    this.ctx.beginPath();
	this.ctx.moveTo(start.x, start.y);
	for (n; n<this.line.length; n++) {
		this.ctx.lineTo(this.line[n].x, this.line[n].y);
	}
    this.ctx.strokeStyle = this.color;
	this.ctx.stroke();
};

Draw.prototype.viewLine = function(line, color) {
    console.log('viewLine client.js 178 called');
    this.line = line;
	this.color = color;
    this.drawLine();
};

Draw.prototype.setColor = function(color) {
    this.color = color;
};

var getCursorCoords = function (ctx) {
    $('#canvas').mousemove(function(e) {
        var x = e.offsetx, y = e.offsety;
        $('#status').html(x + " - " + y);
        ctx.moveto(x-1,y-1);
        ctx.lineto(x,y);
        ctx.stroke();
    });
    
};
