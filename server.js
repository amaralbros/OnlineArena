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

//Global object mapping player id's to their respective sockets
let playerSocketMap = {};

io.on('connection',function(socket){
    socket.on('newplayer',function(username){
        socket.player = {
            id: randomInt(0,9999999999999999999),
            username: username,
            x: randomInt(100,400),
            y: randomInt(100,400),
            angle: 0,
            stats: {
              health: 100,
              attack: 10,
              armor: 10,
              speed: 5,
              attackSpeed: 1
            }
        };
        //Maps a socket to a player id
        playerSocketMap[socket.player.id] = socket.player;

        socket.emit('allplayers',getAllPlayers());
        socket.emit('currentUser', socket.player);
        socket.broadcast.emit('newplayer',socket.player);

        ///RECEIVES POSITION FROM CLIENT, UPDATES EVERYONE'S GAME TO REFLECT THAT
        socket.on('updatePosFromClient', (pos)=>{
          // socket.player.x = Math.floor(pos.x);
          // socket.player.y = Math.floor(pos.y);
          socket.player.x = pos.x;
          socket.player.y = pos.y;
          socket.broadcast.emit('updatePosFromServer',socket.player);
        });

        //UPDATE EVERYONES ORIENTATION
        socket.on('updateOrientationFromClient', (angle)=>{
          socket.player.angle = angle;
          socket.broadcast.emit('updateOrientationFromServer',socket.player);
        });

        //SHOW ATTACK TO EVERT CLIENT
        socket.on('updateAttackAnimationFromClient', ()=>{
          socket.broadcast.emit('updateAttackAnimationFromServer',socket.player);
        });

        //HANDLE ATTACK LOGIC
        socket.on('handleAttackFromClient', (colliderId)=>{
          let attacked = playerSocketMap[String(colliderId)];
          //ATTACK FORMULA
          attacked.stats.health -= socket.player.stats.attack;

          io.sockets.emit('updateHealthFromServer',attacked);
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
