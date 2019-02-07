"use strict";
	window.onload = init;
	
	// GLOBALS
	var canvas,ctx,dragging=false,lineWidth,strokeStyle, currentTool, fillStyle, origin, topCanvas, topCtx;
	
	// CONSTANTS
	var DEFAULT_LINE_WIDTH = 3;	
	var DEFAULT_STROKE_STYLE = "red";
	var DEFAULT_FILL_STYLE = "red";
	
	var TOOL_PENCIL = "toolPencil";
	var TOOL_RECTANGLE = "toolRectangle";
    var TOOL_LINE = "toolLine";
	
	// FUNCTIONS
	function init(){
		// initialize some globals
		canvas = document.querySelector('#mainCanvas');
		ctx = canvas.getContext('2d');

		lineWidth = DEFAULT_LINE_WIDTH;
		strokeStyle = DEFAULT_STROKE_STYLE;
		fillStyle = DEFAULT_FILL_STYLE;
		currentTool = TOOL_PENCIL;
		origin = {};

		topCanvas = document.querySelector('#topCanvas');
		topCtx = topCanvas.getContext('2d');

		//set initial properties of the graphics context 
		topCtx.lineWidth = ctx.lineWidth = lineWidth;
		topCtx.strokeStyle = ctx.strokeStyle = strokeStyle;
		topCtx.fillStyle = ctx.fillStyle = fillStyle;
		topCtx.lineCap = ctx.lineCap = "round";
		topCtx.lineJoin = ctx.lineJoin = "round";

		drawGrid(ctx,'lightgray',10,10);
		
		//Hook up event listeners
		topCanvas.onmousedown = doMousedown;
		topCanvas.onmousemove = doMousemove;
		topCanvas.onmouseup = doMouseup;
		topCanvas.onmouseout = doMouseout;

		document.querySelector('#lineWidthChooser').onchange = doLineWidthChange;
		document.querySelector('#strokeStyleChooser').onchange = doStrokeStyleChange;
		document.querySelector('#clearButton').onclick = doClear;

		document.querySelector('#toolChooser').onchange = function(e){
			currentTool = e.target.value;
			console.log("currentTool=" + currentTool);
		}

		document.querySelector('#fillStyleChooser').onchange = function(e){
			fillStyle = e.target.value;
			console.log("fillStyle=" + fillStyle);
		}
	}
	
	function doLineWidthChange(e){
		lineWidth = e.target.value;
	}

	function doStrokeStyleChange(e){
		strokeStyle = e.target.value;
	}
	
	// EVENT CALLBACK FUNCTIONS
	function doMousedown(e){
		dragging = true;

		//get location of mouse in canvas coordinates
		var mouse = getMouse(e);

		switch(currentTool){
			case TOOL_PENCIL:
				ctx.beginPath();
				ctx.moveTo(mouse.x, mouse.y);
                break;
			case TOOL_RECTANGLE:
			case TOOL_LINE:
				origin.x = mouse.x;
				origin.y = mouse.y;
				break;
		}
	}
 
 	function doMousemove(e) {
 		//bail out if the mouse button is not down 
		if(!dragging) return;
		 
		 //get location of mouse in canvas coordinates 
		var mouse = getMouse(e);

		switch(currentTool){
			case TOOL_PENCIL: 
				ctx.strokeStyle = strokeStyle;
				ctx.lineWidth = lineWidth;
				ctx.lineTo(mouse.x,mouse.y);	
				ctx.stroke();
                break;
                
			case TOOL_RECTANGLE:
				var x = Math.min(mouse.x,origin.x);
				var y = Math.min(mouse.y, origin.y);
				var w = Math.abs(mouse.x - origin.x);
				var h = Math.abs(mouse.y - origin.y);

				topCtx.strokeStyle = strokeStyle;
				topCtx.fillStyle = fillStyle;
                topCtx.lineWidth = lineWidth;
						
				clearTopCanvas();

				topCtx.fillRect(x,y,w,h);
                topCtx.strokeRect(x,y,w,h);
                break;
                
			case TOOL_LINE:
				topCtx.strokeStyle = strokeStyle;
				topCtx.fillStyle = fillStyle;
				topCtx.lineWidth = lineWidth;
                
				clearTopCanvas();

				topCtx.beginPath();
				topCtx.moveTo(origin.x, origin.y);
				topCtx.lineTo(mouse.x, mouse.y);
				topCtx.stroke();
				break;
		 }
	}
	
	function doMouseup(e) {
		switch(currentTool){
			case TOOL_PENCIL:
				ctx.closePath();
				break;
			case TOOL_RECTANGLE:
			case TOOL_LINE:
				if(dragging){
					ctx.drawImage(topCanvas,0,0);
					clearTopCanvas();
				}
				break;
		}
		dragging = false;
	}
	
	// if the user drags out of the canvas
	function doMouseout(e) {
		switch(currentTool){
			case TOOL_PENCIL:
				ctx.closePath();
				break;
			case TOOL_RECTANGLE:
			case TOOL_LINE:
				if(dragging){
					clearTopCanvas();
				}
				break;
		}
		dragging = false;
	}
	
	function doClear(){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		drawGrid(ctx,'lightgray', 10, 10);
	}
	function clearTopCanvas(){
		topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
	}
	
	// UTILITY FUNCTIONS
	/*
	These utility functions do not depend on any global variables being in existence, 
	and produce no "side effects" such as changing ctx state variables.
	They are "pure functions" - see: http://en.wikipedia.org/wiki/Pure_function
	*/
	
	// Function Name: getMouse()
	// returns mouse position in local coordinate system of element
	// Author: Tony Jefferson
	// Last update: 3/1/2014
	function getMouse(e){
		var mouse = {}
		mouse.x = e.pageX - e.target.offsetLeft;
		mouse.y = e.pageY - e.target.offsetTop;
		return mouse;
	}
	
	/*
	Function Name: drawGrid()
	Description: Fills the entire canvas with a grid
	Last update: 9/1/2014
	*/
	function drawGrid(ctx, color, cellWidth, cellHeight){
		// save the current drawing state as it existed before this function was called
		ctx.save()
		
		// set some drawing state variables
		ctx.strokeStyle = color;
		ctx.fillStyle = '#ffffff';
		ctx.lineWidth = 0.5;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		
		// vertical lines all set!
		for (var x = cellWidth + 0.5; x < ctx.canvas.width; x += cellWidth) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, ctx.canvas.height);
			ctx.stroke();
		}

		//Need horizontal lines!
		for(var y = cellHeight + 0.5; y < ctx.canvas.height; y += cellHeight){
			ctx.beginPath();
			ctx.moveTo(0,y);
			ctx.lineTo(ctx.canvas.width,y);
			ctx.stroke();
		}
		
		// restore the drawing state
		ctx.restore();
	}	