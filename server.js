/*
All information regarding the state of Filloaster, whether received through the
browser or from the Arduino is passed into here. Arduino information is passed
via serial port and the browser information is connected via local host.
Sockets are created here so that the information from the Arduino can be passed 
into the browser in real time. 

In addition, any computationally heavy work is done within here and not in the
Arduino or browser. One example is the Twilio module. We raise a flag in the 
browser / Arduino, which this server.js recognizes and executes the necessary
action.

*/

var fs = require('fs'),
http = require('http'),
socketio = require('socket.io'),
url = require("url"), 
SerialPort = require("serialport").SerialPort

var socketServer;
var serialPort;
var portName = '/dev/cu.usbmodem1411'; 
//var portName = '/dev/cu.HC-05-DevB';
//Use 2nd portName if using Bluetooth

//Twilio Auth
var twilio = require('twilio');
var client = new twilio.RestClient('Key', 'PW');

//Declaring globals
var sendData = "";
var phoneData = ""; //will be in form +1ABCDEFGHIJ
var drinkData = "Water";
//total amount drank
var totalDrank;
var goodByeSent = false;

//Drinking Application:
var alcPercent = 0; //example 0.07
var alcoholSuggestion = 48 //in mL of pure alcohol (4 shots worth)
var alcoholWarningSent = false;

//Recommendation Application
//Have an existing example trie.
var globalDB = [ ["Water",3], ["Beer",3],["Coke",2],["Red Wine",3],
					["Guiness",0],["Yueng",0],["SamAdams",0],["Sprite",0],
					["GingerAle",0],["ExpensiveWine",0],["okWine",0],
					["cheapWine",0] ];
var myDB = ["Water"]; //for example


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
	//Comment seriallistener when not using arduino
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
	});
}

/*Listens to serial communication with the Arduino. As arduino spits out chars 
and numbers, the following parses it so that with a given combination, it
branches out and executes different portions of code. Each handler has 
function format of SocketIO_serialEmitXXXXX();
*/
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
			//rD is short for receivedData
			rD += data.toString();
			// Read the Phone Number
			if (rD .indexOf('P') >= 0 && rD .indexOf('H') >= 0) 
			{
				console.log("Within Phone portion");
				phoneData = rD .substring(rD .indexOf('P') + 1, rD .indexOf('H'));
				phoneNumber = getPhoneNumber(phoneData);
				welcomeTwilio(client, phoneNumber);
				console.log("Phone portion Done!");
				rD = '';
			}
			//Read Drink
			if (rD .indexOf('N') >= 0 && rD .indexOf('C') >= 0) 
			{
				tagData = rD .substring(rD .indexOf('N') + 1, rD .indexOf('C'));
				rD = '';
				drinkData = setDrink(tagData);
				if ((drinkData!="") && (!drinkSent))
				{
					SocketIO_serialemitDrink(drinkData);
					drinkSent = true;
					//Provides suggestions
					myDB.push(drinkData);
					sendSuggestions();
				}
			}
			// Read the sensor Values
			if ((rD .indexOf('E') >= 0) && (rD .indexOf('B') >= 0) && \
					(rD .indexOf('E')>rD .indexOf('B'))) 
			{
				sendData = rD .substring(rD .indexOf('B') + 1, rD .indexOf('E'));
				rD = '';
				console.log(sendData);
				SocketIO_serialemitValue(sendData);
			}
			// Read the Filloaster State
			if (rD .indexOf('S') >= 0 && rD .indexOf('D') >= 0) 
			{
				stateData = rD .substring(rD .indexOf('S') + 1, rD .indexOf('D'));
				rD = '';
				SocketIO_serialemitState(stateData);
			}
			//Read FullGlass Values
			if (rD .indexOf('F') >= 0 && rD .indexOf('U') >= 0) 
			{
				stateData = rD .substring(rD .indexOf('F') + 1, rD .indexOf('U'));
				rD = '';
				SocketIO_serialemitFullGlass(stateData);
			}
			//Read current glass values
			if (rD .indexOf('G') >= 0 && rD .indexOf('L') >= 0) 
			{
				stateData = rD .substring(rD .indexOf('G') + 1, rD .indexOf('L'));
				rD = '';
				SocketIO_serialemitCurrentGlass(stateData);
			}
			//read total amount drunk
			if (rD .indexOf('T') >= 0 && rD .indexOf('A') >= 0) 
			{
				stateData = rD .substring(rD .indexOf('T') + 1, rD .indexOf('A'));
				rD = '';
				//checks amount of alcohol
				if (alcPercent * stateData > alcoholSuggestion){
					alcoholWarningTwilio(client, phoneNumber, totalDrank);
				}
				SocketIO_serialemitTotalAmount(stateData);
			}
			//read elapsed time
			if (rD .indexOf('C') >= 0 && rD .indexOf('H') >= 0) 
			{
				stateData = rD .substring(rD .indexOf('C') + 1, rD .indexOf('H'));
				rD = '';
				SocketIO_serialemitElapsedTime(stateData);
			}
			//read if user left
			if (rD .indexOf('U') >= 0 && rD .indexOf('R') >= 0) 
			{
				stateData = rD .substring(rD .indexOf('U') + 1, rD .indexOf('R'));
				rD = '';
				//If user left, send message
				if (stateData == "1"){
					goodByeTwilio(client, phoneNumber, totalDrank, drinkData);
				}
			}
		});
	});
}

/* Iterate through the trie in the DB and return the possible drinks that a user
would like. Then send that data via Twilio. */
function sendSuggestions(){
	var rootFound = false;
	var index = 0;
	//Find the root node
	while (!rootFound){
		if (myDB[index] == globalDB[0][0]){
			var temp = myDB[0];
			myDB[0] = myDB[index];
			myDB[index] = temp;
			rootFound = true;
		}
		index++;
	}
	//Get child 
	var child = myDB[1];
	var numChild = globalDB[0][1]; //3
	var sumGrandChild = 0;
	var numSkip = 0;
	var grandChildren = [];
	//Find where starting location is
	for (var i = 0; i<numChild; i++)
	{
		if (globalDB[1+i][0] == child)
		{
			numSkip = sumGrandChild+numChild;
			numGrandChild = globalDB[1+i][1];
		}
		sumGrandChild = sumGrandChild + globalDB[1+i][1];

	}
	//retrieve grandChildren
	for (var j = 0; j < numGrandChild; j++)
	{
		grandChildren.push(globalDB[numSkip+j+1][0]);
	}
	//send Message via Twilio
	recommendationTwilio(client,phoneNumber,grandChildren);
	return;
}

function setDrink(tagData)
{
	return tagData.read();
}

//Functions regarding Twilio
function getPhoneNumber(phoneData)
{
	if (phoneData != "")
	{
		return phoneData;
	}
	return null;
}

function welcomeTwilio(client, phoneNumber)
{
	client.sms.messages.create({
		to: phoneNumber,
		from:TwilioNumber,
		body:"Welcome to 15-291. Please try our assortment of hardware that\
				is paid by our professors."
	}, 
	function sendMessage() {
		console.log("welcome message sent");
	});
}

function goodByeTwilio(client, phoneNumber, totalDrank, drinkData)
{
	if (!(goodByeSent)){
		body1 = "Thank you for coming to 15-291. At your meal you drank ";
		body2 = "mL of ";
		body3 = ". We look forward to your next visit.";
		body = body1.concat(totalDrank,body2,drinkData,body3);

		client.sms.messages.create({
			to: phoneNumber,
			from:TwilioNumber,
			body:body
		}, 
		function sendMessage() {
			console.log("good bye message sent");
		});
		goodByeSent = true;
	}
}

function alcoholWarningTwilio(client, phoneNumber, totalDrank)
{
	if (!(alcoholWarningSent)){
		client.sms.messages.create({
			to: phoneNumber,
			from:TwilioNumber,
			body:"Please be careful in your alcohol consumption. Drinking and \
			driving is prohibited."
		}, 
		function sendMessage() {
			console.log("alcohol warning message sent");
		});
		alcoholWarningSent = true;
	}
}

function recommendationTwilio(client, phoneNumber, recs)
{
	//create body message
	body = "Here are some recommendations of drinks based upon your choices: ";
	for (var i = 0; i<recs.length;i++)
	{
		drink = recs[i];
		if (i < recs.length-1) 
		{
			string = drink.concat(", ");
		}
		else
		{
			string = "and ".concat(drink,".");
		}
		body = body.concat(string);
	}

	client.sms.messages.create({
		to: phoneNumber,
		from:TwilioNumber,
		body:body
	}, 
	function sendMessage() {
		console.log("recommendation message sent");
	});
}

function SocketIO_serialemitValue(sendData)
{
	console.log('Value:', sendData); 
	socketServer.emit('updateData',{pollOneValue:sendData});
}

function SocketIO_serialemitDrink(drinkData)
{
	console.log("Drink: ",drinkData);
	socketServer.emit('updateDrink',{drink:drinkData});
}

function SocketIO_serialemitState(stateData)
{
	socketServer.emit('updateState', {state:stateData});
}

function SocketIO_serialemitFullGlass(fullGlassData)
{
	socketServer.emit('updateFullGlass', {fullGlass:fullGlassData});
}

function SocketIO_serialemitCurrentGlass(currentGlassData)
{
	socketServer.emit('updateCurrentGlass', {currentGlass:currentGlassData});
}

function SocketIO_serialemitElapsedTime(elapsedData)
{
	socketServer.emit('updateElapsedData', {elapsed:elapsedData});
}

function SocketIO_serialemitTotalAmount(totalAmountData)
{
	totalDrank = totalAmountData;
	socketServer.emit('updateTotalAmount', {totalAmount:totalAmountData});
}

exports.start = startServer;
