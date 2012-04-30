
var options = {};

var socket = io.connect('http://localhost:8000');

$("#start-drawing").click(function () {
        options = initCanvas();
		var drawObj = new Draw(options);
		$("select").removeClass("hidden");
		$("#clear-drawing").removeClass("hidden");
		$(this).addClass("hidden");
        initDrawingSession(drawObj);
    });

$("#clear-drawing").click(function () {
	options.canvas.width = options.canvas.width;
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
