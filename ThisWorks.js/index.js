var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var debug = false;

var handle = {}
handle["/"] = requestHandlers.sendMain;
handle["/interface"] = requestHandlers.sendInterface;
handle["/randompage"] = requestHandlers.sendRandompage;

handle["/dashboard"] = requestHandlers.sendDashboard;
handle["/login"] = requestHandlers.sendLogin;
handle["/main"] = requestHandlers.sendMain;
handle["/restaurant"] = requestHandlers.sendRestaurant;


// Add additional links here using handle[/link] = requestHandlers.sendPathname;


server.start(router.route,handle,debug);