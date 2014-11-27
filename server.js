var fs = require('fs'),
http = require('http'),
socketio = require('socket.io'),
url = require("url"), 
SerialPort = require("serialport").SerialPort

var socketServer;
var serialPort;

//var portName = '/dev/cu.usbmodem1411'; 
//Comment portName when not using arduino
//The portName the address of an arduino
var sendData = "";

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

	//serialListener(debug);
	//Comment seriallistenre when not using arduino

	initSocketIO(httpServer,debug);
}


function callTwilio()
{
    // Load the twilio module
    var twilio = require('twilio');
     
    // Create a new REST API client to make authenticated requests against the
    // twilio back end
    var client = new twilio.RestClient('AC5afd49b367bd857f5e4e3647cab78d83', '1cf4be2b2f749a85d7c469b798ffdb5c');
     
    // Pass in parameters to the REST API using an object literal notation. The
    // REST client will handle authentication and response serialzation for you.
    client.sms.messages.create({
        to:'+14125157367',
        from:'(530) 924-0498',
        body:'Stop Drinking BRO'
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
			if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0) 
			{
				sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
				receivedData = '';
			}
			SocketIO_serialemit(sendData);

			//Read NFC values
			if (receivedData .indexOf('N') >= 0 && receivedData .indexOf('C') >= 0) 
			{
				drinkData = receivedData .substring(receivedData .indexOf('N') + 1, receivedData .indexOf('C'));
				receivedData = '';
				console.log(drinkData);
				/*if (drinkData!="")
				{
					drink_is = drinkData;
					SocketIO_serialemitDrink(drinkData);
				}*/
			}
		});
	});
}

function SocketIO_serialemit(sendData)
{
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