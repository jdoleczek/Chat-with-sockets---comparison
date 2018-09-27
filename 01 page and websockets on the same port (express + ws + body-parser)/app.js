const PAGE_PORT = 8080

let WSServer = require('ws').Server
let server = require('http').createServer()
let express = require('express')
let bodyParser = require('body-parser')
let app = express().use(bodyParser.json())
let conns = []

app.get('/', (req, res) => res.send(`<!doctype html>
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
        let ws = new WebSocket('ws://' + ('' + window.location).split('/')[2])
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
  </html>`)
)

(new WSServer({server})).on('connection', function connection(ws) {
  conns.push(ws)

  ws.on('message', function incoming(message) {
    let msg = JSON.parse(message)
    this.room = msg.room
    this.nick = msg.nick || this.nick
    conns.filter(c => (c.room || '') == msg.room).map(c => c.send(message))
  })

  ws.on('close', function () {
    conns.splice(conns.indexOf(this), 1)

    conns.filter(c => (c.room || '') == this.room).map(c => c.send(JSON.stringify({
      nick: this.nick,
      room: this.room,
      msg: `<i>And I'm ... gone.</i>`
    })))
  })
})

server
  .on('request', app)
  .listen(PAGE_PORT)

console.log(`Chat started at http://localhost:${PAGE_PORT}`)
