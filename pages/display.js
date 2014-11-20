// canvas request for all browsers
window.requestAnimFrame = (function(callback) 
{
	return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	window.oRequestAnimationFrame || 
	window.msRequestAnimationFrame ||
	function(callback) 
	{
		window.setTimeout(callback, 1000 / 30); // 30 frames per second
	};
})();

var iosocket;
var pollOneH = 0;
var poll1;
var text;
var potValue;
var prevPotValue;
var drink;
//var onOff = false; 
var toggleVal = 0;

function animation(poll1,text,drink)
{
	var canvas = document.getElementById("myCanvas");
	var content = canvas.getContext("2d");
	var color = "red";

	// clear canvas
	content.clearRect(0, 0, 460, 540);

	content.fillStyle = 'black';
	content.textAlign = 'center';
	content.font = '20pt Calibri';

	// make the wobbely values stop 
	if(pollOneH*2 > prevPotValue+2 || pollOneH*2 < prevPotValue-2)
	{
		prevPotValue = potValue;
		potValue = pollOneH*2;
	}

	console.log(drink)

	if (drink.localeCompare("Water"))
	{
		color = "blue";
	}
	else if (drink.localeCompare("Lemonade"))
	{
		color = "yellow";
	}
	else if (drink.localeCompare("Coke"))
	{
		color = "brown";
	}	  
	else if (drink.localeCompare("Russian Water"))
	{
		color = "black";
	}

	content.fillText('Potmeter value: ' + potValue, text.x, text.y);

	  // render graph 
	  content.fillStyle = color;
	  content.fillRect(poll1.x,(poll1.y-poll1.h),poll1.w,poll1.h);

	  content.fill();

	// request new frame
	requestAnimFrame(function() 
	{

		if(poll1.h < pollOneH)
		{
			poll1.h += (pollOneH - poll1.h)*.15;
		}
		else if(poll1.h > pollOneH)
		{
			poll1.h -= (poll1.h - pollOneH)*.15;
		}
		text.y = (poll1.y - poll1.h) - 5;
		animation(poll1,text,drink);
	});
}

function initSocketIO()
{
	iosocket = io.connect();
	iosocket.on('onconnection', function(value) 
	{
		pollOneH = value.pollOneValue/2; // recieve start poll value from server
		drink = value.drink; //which drink it is
		initPoll();
		initButton();

		// recieve changed values by other client from server
		iosocket.on('updateData', function (receivedData) 
		{
			pollOneH = receivedData.pollOneValue/2; // recieve start poll value from server
		});
		
		iosocket.on('updateDrink', function(drinkData)
		{
			drink = drinkData.drink;
		});
	});
}

function initPoll()
{
	poll1 = 
	{
		x: 10,
		y: 540,
		w: 440,
		h: 0
	}
	text = 
	{
		x:poll1.w/2,
		y:100
	}
	drink = "";
	potValue = pollOneH*2;
	prevPotValue = potValue;
	animation(poll1,text, drink);
}

function initButton()
{
	$( "#check" ).button();
}


window.onload = function() {
	initSocketIO();
};

$(document).ready(function() {
	$('#check').click(function() {
		toggleVal += 1;
		toggleVal %= 2;
		iosocket.emit('buttonval',toggleVal);
	});
});
