// functions that will be executed when 
// typeoff handle[pathname] === a function in requestHandlers.
// the handle and function are discribed in index.js

var fs = require('fs'),
server = require('./server');

function sendInterface(response) {
  console.log("Request handler 'interface' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/interface.html")
  response.end(html);
}

function sendDashboard(response) {
  console.log("Request handler 'dashboard' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/dashboard.html")
  response.end(html);
}

function sendLogin(response) {
  console.log("Request handler 'login' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/login.html")
  response.end(html);
}

function sendProfile(response) {
  console.log("Request handler 'profile' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/profile.html")
  response.end(html);
}


function sendMain(response) {
  console.log("Request handler 'main' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/main.html")
  response.end(html);
}

function sendRestaurant(response) {
  console.log("Request handler 'restaurant' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/restaurant.html")
  response.end(html);
}

function sendCSS(response) {
  console.log("Request handler 'CSS' was called.");
  response.writeHead(200, {"Content-Type": "text/css"});
  var css = fs.readFileSync(__dirname + "/pages/style.css")
  response.end(css);
}

function sendBsCustomCSS(response) {
  console.log("Request handler 'send BS customs CSS' was called.");
  response.writeHead(200, {"Content-Type": "text/css"});
  var css = fs.readFileSync(__dirname + "/bootstrap/css/custom.css")
  response.end(css);
}


function sendBsMinCSS(response) {
  console.log("Request handler 'send bs min CSS' was called.");
  response.writeHead(200, {"Content-Type": "text/css"});
  var css = fs.readFileSync(__dirname + "/bootstrap/css/bootstrap.min.css")
  response.end(css);
}

function sendBsRespondJS(response) {
  console.log("Request handler 'send bs response js' was called.");
  response.writeHead(200, {"Content-Type": "text/js"});
  var css = fs.readFileSync(__dirname + "/bootstrap/js/respond.js")
  response.end(css);
}

function sendBsMinJS(response) {
  console.log("Request handler 'send bs min js' was called.");
  response.writeHead(200, {"Content-Type": "text/js"});
  var css = fs.readFileSync(__dirname + "/bootstrap/js/bootstrap.min.js")
  response.end(css);
}

function sendLogo(response) {
  console.log("Request handler 'send bs min js' was called.");
  response.writeHead(200, {"Content-Type": "img"});
  var css = fs.readFileSync(__dirname + "/bootstrap/img/logo.png")
  response.end(css);
}

function sendFilloasterDesign(response) {
  console.log("Request handler 'sendFilloasterDesign' was called.");
  response.writeHead(200, {"Content-Type": "img"});
  var css = fs.readFileSync(__dirname + "/bootstrap/css/filloasterdesign.png")
  response.end(css);
}

function sendPrototype1(response) {
  console.log("Request handler 'sendPrototype1' was called.");
  response.writeHead(200, {"Content-Type": "img"});
  var css = fs.readFileSync(__dirname + "/bootstrap/css/prototype1.jpg")
  response.end(css);
}


function ajaxLogin(response) {
  console.log("Request handler 'ajaxlogin' was called.");
  response.writeHead(200, {"Content-Type": "text/php"});
  var css = fs.readFileSync(__dirname + "/ajax_login.php")
  response.end(css);
}


function sendSquares(response) {
  console.log("Request handler 'sendSquares' was called.");
  response.writeHead(200, {"Content-Type": "img"});
  var css = fs.readFileSync(__dirname + "/bootstrap/css/squares.png")
  response.end(css);
}

exports.sendRestaurant = sendRestaurant;
exports.sendMain = sendMain;
exports.sendProfile = sendProfile;
exports.sendLogin = sendLogin;
exports.sendDashboard = sendDashboard;
exports.sendRandompage = sendRandompage;
exports.sendInterface = sendInterface;
exports.sendCSS = sendCSS;
exports.sendBsCustomCSS = sendBsCustomCSS;
exports.sendBsMinCSS = sendBsMinCSS;
exports.sendBsRespondJS = sendBsRespondJS;
exports.sendBsMinJS = sendBsMinJS;
exports.sendLogo = sendLogo;
exports.sendFilloasterDesign = sendFilloasterDesign;
exports.sendPrototype1 = sendPrototype1;
exports.ajaxLogin = ajaxLogin;
exports.sendSquares = sendSquares;
