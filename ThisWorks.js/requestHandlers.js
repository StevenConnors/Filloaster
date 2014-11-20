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

function sendRandompage(response) {
  console.log("Request handler 'randompage' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/pages/randompage.html")
  response.end(html);
}
//Keep mimicking the functions above to make more routes for requests

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

exports.sendRestaurant = sendRestaurant;
exports.sendMain = sendMain;
exports.sendLogin = sendLogin;
exports.sendDashboard = sendDashboard;
exports.sendRandompage = sendRandompage;
exports.sendInterface = sendInterface;


