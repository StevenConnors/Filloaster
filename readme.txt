Filloaster - A smart coaster that keeps you always filled.

Main website: steven77723.github.io/Filloaster


Concept:


List of Files and their Description:

Main Folder: Consists of various folders and files. The files are crucial to the
project as these initiate the Node server and execute the routing and the 
starting of web sockets for the browser and the Arduino. A detailed description
of each file can be found at the top of each file respectively. However, to give
a brief over view of how it works, the user calles index.js. Then index.js
creates a routing method for each url which is mapped to a file in the project
folder. Then server.js is called and run, where it creates sockets to the 
Arduino and the browser. Server.js handles all computationally heavy tasks while
the other folders send flags to signal such tasks.


Pages Folder: Mainly consists of html files which are used when deploying the 
server. However, there are three that we'd like to focus on. 

The first is the main html file, main.html. This file is the website that we
first displayed during the demo and we've placed a lot of emphasis on design. 
This page can be seen at steven77723.github.io/Filloaster. 

The second html file that needs emphasis is restaurant.html. We designed this
page so that it resembles a live restaurant with customers and seats. For the 
sake of the demo, we only displayed a change in color of seating with respect
to the state of the glass (needs refill / not). However, the color can also be
white if there is nobody at the table. This page uses SocketIO to receive the 
information obtained from the Filloaster (Arduino).

The most important page in terms of the demo is interface.html. This file allows
us to visually see the information sent via the Arduino, such as the amount of
liquid in the glass, the weight of the full / empty / current glass, the type of
drink that is in the glass, and the state of the Filloaster. 

ArduinoCode Folder: Has one file, filloster.ino that handles everything related
to the Arduino. This file receives information regarding the weight of the
glass, the state of Filloaster, the NFC information (glass type and phone 
number), and sends flags to server.js where more computationally heavy items are
executed. The code implements a simple finite state machine which makes the code
cleaner and easier to read and understand. 

Case Design: Initially we we're going to 3d print a casing for the Arduino for
aesthetics reasons, but due to the restriction that the force of the glass needs
to be pressed directly in the center of the we decided not to print it for the 
demo. However within this folder is the 3d model of the casing.

Documents: Included are the documents / images / slides for the demo. We've also
included a circuitry diagram which people can use if they would like to recreate
Filloaster with their own hands. 

Node_Modules Folder: Simply put, the modules we used: socketio, serial port, and
Twilio.

