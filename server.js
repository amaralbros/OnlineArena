let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);
const PORT = process.env.PORT || 3000;

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(PORT,function(){
    console.log('Listening on '+server.address().port);
});

io.on('connection',function(socket){
    socket.on('newplayer',function(username){
        socket.player = {
            id: randomInt(0,9999999999999999999),
            username: username,
            x: randomInt(100,400),
            y: randomInt(100,400),
            velocityX: 0,
            velocityY: 0,
            stats: {
              health: 100,
              attack: 10,
              armor: 10,
              speed: 5,
              attackSpeed: 1
            }
        };
        socket.emit('allplayers',getAllPlayers());
        socket.emit('currentUser', socket.player);
        socket.broadcast.emit('newplayer',socket.player);

        ///RECEIVES MOVE FROM CLIENT, SENDS MOVE TO CLIENT
        socket.on('requestMovement', function(data){
          if (data.x !== 0) {
            socket.player.velocityX = data.x;
          }
          if (data.y !== 0) {
            socket.player.velocityY = data.y;
          }
          io.emit('respondMovement',socket.player);
        });

        //UPDATE EVERYONES MOVEMENT
        socket.on('updatePos', (pos)=>{
          let player = {id: socket.player.id, x: Math.floor(pos.x), y:Math.floor(pos.y), username: socket.player.username};
          socket.broadcast.emit('updateOnePos',player);
        });

        //UPDATE EVERYONES ORIENTATION
        socket.on('updateOrientation', (angle)=>{
          let player = {id: socket.player.id, angle: angle};
          socket.broadcast.emit('updateOneOrientation',player);
        });

        //SHOW ATTACK TO EVERT CLIENT
        socket.on('showAttack', ()=>{
          let player = socket.player;
          socket.broadcast.emit('updateOneAttackAnimation',player);
        });

        //HANDLE ATTACK LOGIC
        socket.on('handleAttack', (colliderId)=>{
          let player = socket.player;
          let attacked = getPlayerFromId(colliderId);
          //ATTACK FORMULA
          attacked.stats.health -= player.stats.attack;

          io.sockets.emit('updateOneHealth',attacked);
        });

        //HANDLE LOGOUT
        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });
});

function getAllPlayers(){
    let players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        let player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function getPlayerFromId(id){
  let result = null;
  Object.keys(io.sockets.connected).forEach(function(socketID){
      if (io.sockets.connected[socketID].player.id === id) {
        result = io.sockets.connected[socketID].player;
      }
  });
  return result;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
