var fs = require('fs'),
http = require('http'),
socketio = require('socket.io'),
url = require("url"), 
SerialPort = require("serialport").SerialPort

var socketServer;
var serialPort;
var portName = '/dev/cu.usbmodem1411'; 
//The portName the address of an arduino
var sendData = "";

//Start server starts the server to run on.

// handle contains locations to browse to (vote and poll); pathnames.
function startServer(route,handle,debug)
{
	// on request event
	function onRequest(request, response) 
	{
	  // parse the requested url into pathname. pathname will be compared
	  // in route.js to handle (var content), if it matches the a page will 
	  // come up. Otherwise a 404 will be given. 
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
	initSocketIO(httpServer,debug);
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
		
		socketServer.on('update', function(data) 
		{
			socket.emit('updateData',{pollOneValue:data});
		});

		socket.on('buttonval', function(data) 
		{
			serialPort.write(data + 'E');
		});
		
		socket.on('sliderval', function(data) {
			serialPort.write(data + 'P');
		});
	});
}

// Listen to serial port

function SocketIO_serialemit(sendData)
{
	//console.log("serial emit: ",sendData);
	socketServer.emit('updateData',{pollOneValue:sendData});
      //socketServer.emit('update', sendData);
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

// Listen to serial port
function serialListener(debug) 
{
	var receivedData = "";
	serialPort = new SerialPort(portName, 
	{
		baudrate: 9600,
    // defaults for Arduino serial communication
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
	});

	serialPort.on("open", function () 
	{
		console.log('open serial communication');
		drink_notSet = true;
	    // Listens to incoming data
	    serialPort.on('data', function(data) 
	    {
	    	receivedData += data.toString();
	    	//
	    	if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0) 
	    	{
	    		sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
	    		receivedData = '';
	    		SocketIO_serialemit(sendData);
	    	}
	    	//Read NFC values
	    	if (receivedData .indexOf('N') >= 0 && receivedData .indexOf('C') >= 0 && drink_notSet) 
	    	{
	    		drinkData = receivedData .substring(receivedData .indexOf('N') + 1, receivedData .indexOf('C'));
	    		receivedData = '';
	    		if (drinkData!="")
	    		{
	    			drink_is = drinkData;
	    			SocketIO_serialemitDrink(drinkData);
	    			drink_notSet = false;
	    		}
	    	}

	    	if (drink_notSet == false)
	    	{
	    		SocketIO_serialemitDrink(drink_is);
	    	}


			//Display Filloaster State	    	
	    	if (receivedData .indexOf('S') >= 0 && receivedData .indexOf('D') >= 0) 
	    	{
	    		stateData = receivedData .substring(receivedData .indexOf('S') + 1, receivedData .indexOf('D'));
	    		SocketIO_serialemitState(stateData);
	    	}

	      // send the incoming data to browser with websockets.
	      //console.log("serial emit: ",sendData);
	      //socketServer.emit('update', sendData);

	      //console.log("Session: ",util.inspect(socketServer));
	      //console.log("Session: %j",socketServer);

	      //Dumper.alert(socketServer);
	  	});
	});
}

exports.start = startServer;