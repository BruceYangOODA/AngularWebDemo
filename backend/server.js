const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuid_v4 } = require('uuid');
const SERVER_PORT = process.env.PORT || 3000;

const channel = require('./channel')
const model = require('./model')

const api = require('./api');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/api', api);

app.get('/', (req, res) => {
  console.log('get connected 3000')
  res.send('From 3000 route')
  res.end()
  //res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {

  socket.on('get-socket-id',()=>{
    io.to(socket.id).emit('get-socket-id', socket.id)
  })

  socket.on('create-room', (bundle) => {
    let roomId = uuid_v4()    
    model.createRoom(roomId, bundle, (newRoom)=>{      
      io.to(socket.id).emit('create-room', newRoom)
      if(newRoom) {
        socket.join(newRoom.id)
        io.sockets.emit('add-room', newRoom)
      }      
    })
  })

  socket.on('all-room', () => {
    model.getAllRoom((roomList) => io.to(socket.id).emit('all-room', roomList))    
  })

  socket.on('regist-user', (userData) => {
    model.registUser(userData, (user) => {
      io.to(socket.id).emit('regist-user', user)
    })
  })

  socket.on('login-user', (userData) => {
    model.loginUser(userData, (user) => {
      io.to(socket.id).emit('login-user', user)
    })
  })

  socket.on('join-room', (bundle) => {       
    model.addUsertoRoom(bundle, (room)=>{
      io.to(socket.id).emit('join-room', room)
      if(room) {
        socket.join(room.id)        
        socket.broadcast.to(room.id).emit('user-join-room', {id:bundle.userId, name:bundle.userName})
        io.sockets.emit('update-room', room)

        socket.on('disconnect',() =>{
          socket.broadcast.to(room.id).emit('user-left-room', socket.id)
          console.log('socket disconnect',socket.id)
        })
      }
    })    
  })

  socket.on('room-by-id', (roomId) =>{
    model.getRoomById(roomId, (room) => {
      io.to(socket.id).emit('room-by-id', room)
    })   
  })

  socket.on('offer-signal', (msg) =>{    
    io.to(msg.acceptId).emit('offer-signal', msg)
  })

  socket.on('accept-signal', (msg) =>{
    io.to(msg.offerId).emit('accept-signal', msg)
  })

  socket.on('disconnect', () => {
    console.log('disconnect',socket.id)
    socket.broadcast.emit('user-disconnected', socket.id)
    model.removeUserFromRoom(socket.id, (delRoomIds) =>{
      if(delRoomIds.length >0) {
        delRoomIds.forEach(id => io.sockets.emit('room-disconnected',id))
        model.removeRoom(delRoomIds)
      }      
    })
  })
});

server.listen(SERVER_PORT, () => {
  console.log('Server on ', SERVER_PORT);
});

