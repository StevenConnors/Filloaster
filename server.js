var fs = require('fs'),
http = require('http'),
socketio = require('socket.io'),
url = require("url"), 
SerialPort = require("serialport").SerialPort

var socketServer;
var serialPort;

var portName = '/dev/cu.usbmodem1411'; 
//var portName = '/dev/cu.Bluetooth-Incoming-Port'; 
//var portName = '/dev/cu.HC-05-DevB';
//Comment portName when not using arduino

var sendData = "";
var phoneData = ""; //will be in form +14125157367

//Twilio Auth
var twilio = require('twilio');
var client = new twilio.RestClient('AC5afd49b367bd857f5e4e3647cab78d83', '1cf4be2b2f749a85d7c469b798ffdb5c');

//Start server starts the server to run on.
// handle contains locations to browse to (vote and poll); pathnames.
function startServer(route,handle,debug)
{
	// on request event
	function onRequest(request, response) 
	{
	  var pathname = url.parse(request.url).pathname; 
	  console.log("Request for " + pathname + " received");
	  var content = route(handle,pathname,response,request,debug);
	}
	
	var httpServer = http.createServer(onRequest).listen(1337, function()
	{
		console.log("Listening at: http://localhost:1337");
		console.log("Server is up");
	}); 
	serialListener(debug);
	//Comment seriallistenre when not using arduino

	initSocketIO(httpServer,debug);
}


function welcomeTwilio(client, phoneNumber)
{
    client.sms.messages.create({
        to: phoneNumber,
        from:'(530) 924-0498',
        body:"Welcome to 15-291. Please try our assortment of hardware that is paid by our professors."
    }, 
    function sendMessage() {
        console.log("message sent");
    });
}

function initSocketIO(httpServer,debug)
{
	socketServer = socketio.listen(httpServer);
	if(debug == false)
	{
		socketServer.set('log level', 1); // socket IO debug off
	}
	socketServer.on('connection', function (socket) 
	{
		console.log("user connected");
		socket.emit('onconnection', {pollOneValue:sendData});
	});
}

// Listen to serial port
function serialListener(debug) 
{
	drinkSent = false;
	var receivedData = "";
	serialPort = new SerialPort(portName, 
	{
		baudrate: 9600,　// defaults for Arduino serial communication
		dataBits: 8,
		parity: 'none',
		stopBits: 1,
		flowControl: false
	});

	serialPort.on("open", function () 
	{
		console.log('open serial communication');
		// Listens to incoming data
		serialPort.on('data', function(data) 
		{
			receivedData += data.toString();

			// Read the Phone Number
			if (receivedData .indexOf('P') >= 0 && receivedData .indexOf('H') >= 0) 
			{
				console.log("Within Phone portion");
				phoneData = receivedData .substring(receivedData .indexOf('P') + 1, receivedData .indexOf('H'));
				receivedData = '';
				phoneNumber = getPhoneNumber(phoneData);
				welcomeTwilio(client, phoneNumber);
				console.log(" Phone portion Done!");
			}
			//Read NFC values
			if (receivedData .indexOf('N') >= 0 && receivedData .indexOf('C') >= 0) 
			{
				tagData = receivedData .substring(receivedData .indexOf('N') + 1, receivedData .indexOf('C'));
				receivedData = '';
				drinkData = setDrink(tagData);
				console.log(tagData);
				if ((drinkData!="") && (!drinkSent))
				{
					SocketIO_serialemitDrink(drinkData);
					drinkSent = true;
					console.log(drinkData);
				}
			}
			// Read the sensor Values
			if (receivedData .indexOf('B') >= 0 && receivedData .indexOf('E') >= 0) 
			{
				sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
				receivedData = '';
				SocketIO_serialemitValue(sendData);
			}
			// Read the Filloaster State
			/*if (receivedData .indexOf('S') >= 0 && receivedData .indexOf('T') >= 0) 
			{
				sendData = receivedData .substring(receivedData .indexOf('S') + 1, receivedData .indexOf('T'));
				receivedData = '';
				SocketIO_serialemitValue(sendData);
			}*/




		});
	});
}

function getPhoneNumber(phoneData)
{
	if (phoneData == "4ADEFA433D80")
	{
		return '+14125157367';
	}
	return null;
}

function setDrink(tagData)
{
	if (tagData == "484F0A433D80") // the sticker
	{
		drinkData = "Water";
	}
	else if (tagData ==  "7413BBDF"){ //the big tag
		drinkData = "Coke";
	}
	else if (tagData == "EA412B"){ //tag
		drinkData = "Beer";
	}
	else
	{
		drinkData = "";
	}
	return drinkData;
}

function SocketIO_serialemitValue(sendData)
{
	console.log('Value:', sendData); 
	socketServer.emit('updateData',{pollOneValue:sendData});
}

function SocketIO_serialemitDrink(drinkData)
{
	//Information about drink is passed here//
	console.log("Drink: ",drinkData);
	socketServer.emit('updateDrink',{drink:drinkData});
	  //socketServer.emit('update', sendData);
}

function SocketIO_serialemitState(stateData)
{
	console.log("state: ",stateData);
	  //socketServer.emit('update', sendData);
}

exports.start = startServer;



//Restaurant text Files








