const PAGE_PORT = 8080
const WEBSOCKET_PORT = 8081

let http = require('http')
let ws = require('nodejs-websocket')
let conns = []

ws.createServer(function (conn) {
  conns.push(conn)

  conn.on('text', function (str) {
    let msg = JSON.parse(str)
    this.room = msg.room
    this.nick = msg.nick || this.nick
    conns.filter(c => (c.room || '') == msg.room).map(c => c.sendText(str))
  })

  conn.on('close', function () {
    conns.splice(conns.indexOf(this), 1)

    conns.filter(c => (c.room || '') == this.room).map(c => c.sendText(JSON.stringify({
      nick: this.nick,
      room: this.room,
      msg: `<i>And I'm ... gone.</i>`
    })))
  })
}).listen(WEBSOCKET_PORT)

http.createServer((req, resp) => {
  resp.writeHead(200, {'Content-Type': 'text/html'})
  resp.end(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Chat</title>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
      </head>
      <body style="background: #ded">
        <div class="container">
          <h2>
            <a href="." class="btn btn-default pull-right">Reconnect</a>
            Chat <small></small>
          </h2>
          <div class="msgs form-group" style="width: 100%; height: 70vh; resize: none; border: solid 1px #ccc; border-radius: 5px; overflow-y: scroll; background: #fff; padding: 10px 20px"></div>
          <div class="form-group">
            <input type="text" class="form-control">
          </div>
        </div>
        <script>
          let params = (decodeURIComponent(window.location + '##')).split('#')
          let nick = params[1] || prompt('Choose your nickname:', 'Jasiek')
          let room = params[2] || prompt('Choose the room you want to talk in:', 'secret room')
          let ws = new WebSocket('ws://' + window.location.hostname + ':${WEBSOCKET_PORT}')
          document.location.href = '#' + nick + '#' + room
          $('small').html(nick + ' @ ' + room)

          ws.onmessage = msg => {
            let data = JSON.parse(msg.data)

            $('.msgs').append(\`<div>
              <strong>\${data.nick}: </strong> \${data.msg}
            </div>\`)
          }

          ws.onopen = () => ws.send(JSON.stringify({nick, room, msg: '<i>Just got in, so ...</i>'}))
          ws.onclose = () => confirm('Connection closed. Reload?') && location.reload()

          $('input').focus().keyup(function(e){
            if (e.which == 13) {
              ws.send(JSON.stringify({nick, room, msg: $(this).val()}))
              $(this).val('')
            }
          })
        </script>
      </body>
    </html>
  `)
}).listen(PAGE_PORT)

console.log(`Chat started at http://localhost:${PAGE_PORT}`)
