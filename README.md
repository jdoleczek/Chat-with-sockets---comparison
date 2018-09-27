# Chat with sockets - comparison
Three implementations of one file chat application with websockets and socket.io .

  01. [Page and websockets on different ports (nodejs-websocket)](00%20page%20and%20websockets%20on%20different%20ports%20(nodejs-websocket)/app.js)
  02. [Page and websockets on the same port (express + ws + body-parser)](01%20page%20and%20websockets%20on%20the%20same%20port%20(express%20+%20ws%20+%20body-parser)/app.js)
  03. [Just page on one port (express + socket.io)](02%20just%20page%20on%20one%20portv(express%20+%20socket.io)/app.js)

Each one is a bit different than the others, and has it's own pros and cons.

### Run chat demo
#### Example

    clone https://github.com/jdoleczek/Chat-with-sockets---comparison.git
    cd Chat-with-sockets---comparison
    cd "00 page and websockets on different ports (nodejs-websocket)"
    npm i
    npm start

Then open in your browser http://localhost:8080 .
