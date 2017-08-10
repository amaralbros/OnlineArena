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

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(PORT,function(){
    console.log('Listening on '+server.address().port);
});


server.lastPlayderID = 0; // Keep track of the last id assigned to a new player

io.on('connection',function(socket){

    socket.on('newplayer',function(){
        socket.player = {
            id: randomInt(0,9999999999999999999),
            x: randomInt(100,400),
            y: randomInt(100,400),
            velocityX: 0,
            velocityY: 0
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
          let player = {id: socket.player.id, x: Math.floor(pos.x), y:Math.floor(pos.y)};
          socket.broadcast.emit('updateOnePos',player);
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

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
