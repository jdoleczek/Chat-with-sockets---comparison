const PAGE_PORT = 8080

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var conns = []

app.get('/', (req, res) => res.send(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="description" content="">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Chat</title>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
      <script src="/socket.io/socket.io.js"></script>
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
        let socket = io()
        let params = (decodeURIComponent(window.location + '##')).split('#')
        let nick = params[1] || prompt('Choose your nickname:', 'Jasiek')
        let room = params[2] || prompt('Choose the room you want to talk in:', 'secret room')
        document.location.href = '#' + nick + '#' + room
        $('small').html(nick + ' @ ' + room)

        socket.on('msg', data => {
          $('.msgs').append(\`<div>
            <strong>\${data.nick}: </strong> \${data.msg}
          </div>\`)
        })

        socket.emit('msg', {nick, room, msg: '<i>Just got in, so ...</i>'})

        $('input').focus().keyup(function(e){
          if (e.which == 13 && $(this).val()) {
            socket.emit('msg', {nick, room, msg: $(this).val()})
            $(this).val('')
          }
        })
      </script>
    </body>
  </html>`)
)

io.on('connection', function(socket){
  conns.push(socket)

  socket.on('msg', msg => {
    socket.room = msg.room
    socket.nick = msg.nick || socket.nick
    conns.filter(c => (c.room || '') == msg.room).map(c => c.emit('msg', msg))
  })

  socket.on('disconnect', function(){
    conns.splice(conns.indexOf(socket), 1)

    conns.filter(c => (c.room || '') == socket.room).map(c => c.emit('msg', {
      nick: socket.nick,
      room: socket.room,
      msg: `<i>And I'm ... gone.</i>`,
    }))
  })
})

http.listen(PAGE_PORT)
console.log(`Chat started at http://localhost:${PAGE_PORT}`)
