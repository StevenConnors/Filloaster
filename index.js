var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var debug = true;

var handle = {}
handle["/"] = requestHandlers.sendMain;
handle["/interface"] = requestHandlers.sendInterface;
handle["/randompage"] = requestHandlers.sendRandompage;

handle["/dashboard"] = requestHandlers.sendDashboard;
handle["/login"] = requestHandlers.sendLogin;
handle["/main"] = requestHandlers.sendMain;
handle["/restaurant"] = requestHandlers.sendRestaurant;

handle["/style.css"] = requestHandlers.sendCSS;
handle["/bootstrap/css/bootstrap.min.css"] = requestHandlers.sendBsMinCSS;
handle["/bootstrap/css/custom.css"] = requestHandlers.sendBsCustomCSS;
handle["/bootstrap/js/respond.js"] = requestHandlers.sendBsRespondJS;
handle["/js/bootstrap.min.js"] = requestHandlers.sendBsMinJS;
handle["/img/logo.png"] = requestHandlers.sendLogo;
handle["/bootstrap/css/filloasterdesign.png"] = requestHandlers.sendFilloasterDesign;
handle["/bootstrap/css/prototype1.jpg"] = requestHandlers.sendPrototype1;


// Add additional links here using handle[/link] = requestHandlers.sendPathname;

server.start(router.route,handle,debug);