Drawings = new Meteor.Collection();
Drawings.subscribe();

if (Meteor.is_client) {
  Template.hello.greeting = function () {
    return "Welcome to pictogroup.";
  };

  Template.hello.events = {
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        var ctx = initCanvas();
		var options = {ctx: ctx};
		var drawObj = new Draw(options);
        initDrawingSession(drawObj);
    }
  };
}
var initCanvas = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    return ctx;
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

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
