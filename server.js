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
var drinkData = "Water";

//Twilio Auth
var twilio = require('twilio');
var client = new twilio.RestClient('AC5afd49b367bd857f5e4e3647cab78d83', '1cf4be2b2f749a85d7c469b798ffdb5c');

//total amount drank
var totalDrank;
var goodByeSent = false;

//Drinking Application:
var alcPercent = 0; //example 0.07
var alcoholSuggestion = 48 //in mL
var alcoholWarningSent = false;

//Recommendations

//Have my data (so what I already ordered) This should be an array.
//Have an existing trie.
var globalDB = [ ["Water",3], ["Beer",3],["Coke",2],["Red Wine",3],["Guiness",0],["Yueng",0],["SamAdams",0],["Sprite",0],["GingerAle",0],["ExpensiveWine",0],["okWine",0],["cheapWine",0] ]
//var myDB = [];
var myDB = ["Water"];

function sendSuggestions(){
	var rootFound = false;
	var index = 0;
	while (!rootFound)
	{
		//if root
		if (myDB[index]==globalDB[0][0])
		{
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
	for (var i = 0; i<numChild; i++)
	{
		if (globalDB[1+i][0] == child)
		{
			numSkip = sumGrandChild+numChild;
			numGrandChild = globalDB[1+i][1];
		}
		sumGrandChild = sumGrandChild + globalDB[1+i][1];

	}
	for (var j = 0; j < numGrandChild; j++)
	{
		grandChildren.push(globalDB[numSkip+j+1][0]);
	}
	console.log(grandChildren);
	recommendationTwilio(client,phoneNumber,grandChildren);
	return grandChildren;
}

function recommendationTwilio(client, phoneNumber, recs)
{
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
        from:'(530) 924-0498',
        body:body
    }, 
    function sendMessage() {
        console.log("recommendation message sent");
    });
}


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

			//printReceivedData(receivedData);

			// Read the Phone Number
			if (receivedData .indexOf('P') >= 0 && receivedData .indexOf('H') >= 0) 
			{
				console.log("Within Phone portion");
				phoneData = receivedData .substring(receivedData .indexOf('P') + 1, receivedData .indexOf('H'));
				phoneNumber = getPhoneNumber(phoneData);
				welcomeTwilio(client, phoneNumber);
				console.log("Phone portion Done!");
				receivedData = '';
			}
			//Read Drink
			if (receivedData .indexOf('N') >= 0 && receivedData .indexOf('C') >= 0) 
			{
				tagData = receivedData .substring(receivedData .indexOf('N') + 1, receivedData .indexOf('C'));
				receivedData = '';
				drinkData = setDrink(tagData);
				if ((drinkData!="") && (!drinkSent))
				{
					SocketIO_serialemitDrink(drinkData);
					drinkSent = true;
					//For the suggestions			
					myDB.push(drinkData);
					sendSuggestions();
				}
				//send suggestions of other drinks here
			}

			// Read the sensor Values
			if ( (receivedData .indexOf('E') >= 0) && (receivedData .indexOf('B') >= 0) && (receivedData .indexOf('E')>receivedData .indexOf('B')) ) 
			{
				sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
				receivedData = '';
				console.log(sendData);
				SocketIO_serialemitValue(sendData);
			}
			// Read the Filloaster State
			if (receivedData .indexOf('S') >= 0 && receivedData .indexOf('D') >= 0) 
			{
				stateData = receivedData .substring(receivedData .indexOf('S') + 1, receivedData .indexOf('D'));
				receivedData = '';
				SocketIO_serialemitState(stateData);
			}

			if (receivedData .indexOf('F') >= 0 && receivedData .indexOf('U') >= 0) 
			{
				stateData = receivedData .substring(receivedData .indexOf('F') + 1, receivedData .indexOf('U'));
				receivedData = '';
				SocketIO_serialemitFullGlass(stateData);
			}

			if (receivedData .indexOf('G') >= 0 && receivedData .indexOf('L') >= 0) 
			{
				stateData = receivedData .substring(receivedData .indexOf('G') + 1, receivedData .indexOf('L'));
				receivedData = '';
				SocketIO_serialemitCurrentGlass(stateData);
			}

			if (receivedData .indexOf('T') >= 0 && receivedData .indexOf('A') >= 0) 
			{
				stateData = receivedData .substring(receivedData .indexOf('T') + 1, receivedData .indexOf('A'));
				receivedData = '';

				//Don't drink too much!
				if (alcPercent * stateData > alcoholSuggestion){
					alcoholWarningTwilio(client, phoneNumber, totalDrank);
				}
				SocketIO_serialemitTotalAmount(stateData);
			}

			if (receivedData .indexOf('C') >= 0 && receivedData .indexOf('H') >= 0) 
			{
				stateData = receivedData .substring(receivedData .indexOf('C') + 1, receivedData .indexOf('H'));
				receivedData = '';
				SocketIO_serialemitElapsedTime(stateData);
			}

			if (receivedData .indexOf('U') >= 0 && receivedData .indexOf('R') >= 0) 
			{
				stateData = receivedData .substring(receivedData .indexOf('U') + 1, receivedData .indexOf('R'));
				receivedData = '';
				//If user left, send message
				if (stateData == "1"){
					goodByeTwilio(client, phoneNumber, totalDrank, drinkData);
				}
			}
		});
	});
}


function printReceivedData(receivedData){
	state1 = (receivedData .indexOf('P') >= 0 && receivedData .indexOf('H') >= 0);

	state2 = (receivedData .indexOf('N') >= 0 && receivedData .indexOf('C') >= 0) ;
	state3 = ( (receivedData .indexOf('E') >= 0) && (receivedData .indexOf('B') >= 0) && (receivedData .indexOf('E')>receivedData .indexOf('B')) ) ;
	state4 = (receivedData .indexOf('S') >= 0 && receivedData .indexOf('D') >= 0) ;
	state5 = (receivedData .indexOf('F') >= 0 && receivedData .indexOf('U') >= 0) ;
	state6 = (receivedData .indexOf('G') >= 0 && receivedData .indexOf('L') >= 0) ;
	state7 = (receivedData .indexOf('T') >= 0 && receivedData .indexOf('A') >= 0) ;
	state8 = (receivedData .indexOf('C') >= 0 && receivedData .indexOf('H') >= 0) ;
	state9 = (receivedData .indexOf('U') >= 0 && receivedData .indexOf('R') >= 0) ;
	if (state1 || state2 || state3 || state4 || state5 || state6 || state7 || state8 || state9){
		console.log(receivedData);
	}
	return;
}


function getPhoneNumber(phoneData)
{
	if (phoneData == "4ADEFA433D80")
	{
		return '+14125157367';
	}
	return null;
}

function welcomeTwilio(client, phoneNumber)
{
    client.sms.messages.create({
        to: phoneNumber,
        from:'(530) 924-0498',
        body:"Welcome to 15-291. Please try our assortment of hardware that is paid by our professors."
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
	        from:'(530) 924-0498',
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
	        from:'(530) 924-0498',
	        body:"Please be careful in your alcohol consumption. Drinking and driving is prohibited."
	    }, 
	    function sendMessage() {
	        console.log("alcohol warning message sent");
	    });
	    alcoholWarningSent = true;
	}
}

function setDrink(tagData)
{
	if (tagData == "484F0A433D80") // the sticker
	{
		drinkData = "Coke";
	}
	//else if (tagData ==  "7413BBDF"){ //the big tag
	//	drinkData = "Coke";
	//}
	else if (tagData == "7413BBDF"){ //tag
		drinkData = "Beer";
		alcPercent = 10.07;
	}
	else
	{
		drinkData = "Coke";
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
}

function SocketIO_serialemitState(stateData)
{
	//console.log("state: ",stateData);
	socketServer.emit('updateState', {state:stateData});
}

function SocketIO_serialemitFullGlass(fullGlassData)
{
	//console.log("state: ",fullGlassData);
	socketServer.emit('updateFullGlass', {fullGlass:fullGlassData});
}

function SocketIO_serialemitCurrentGlass(currentGlassData)
{
	//console.log("state: ",currentGlassData);
	socketServer.emit('updateCurrentGlass', {currentGlass:currentGlassData});
}

function SocketIO_serialemitElapsedTime(elapsedData)
{
	//console.log("state: ",currentGlassData);
	socketServer.emit('updateElapsedData', {elapsed:elapsedData});
}

function SocketIO_serialemitTotalAmount(totalAmountData)
{
	//console.log("state: ",currentGlassData);
	totalDrank = totalAmountData;
	socketServer.emit('updateTotalAmount', {totalAmount:totalAmountData});
}

exports.start = startServer;

//Restaurant text Files