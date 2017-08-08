// const express = require('express');
// const socketIO = require('socket.io');
// const path = require('path');
// var app = express();
//
// const PORT = process.env.PORT || 3000;
// const INDEX = path.join(__dirname, 'index.html');
// // const MAIN = path.join(__dirname, 'js/main.js');
//
//
// // app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));
//
// // app.use('/css',express.static(__dirname + '/css'));
// // app.use('/js',express.static(__dirname + '/js'));
// // app.use('/assets',express.static(__dirname + '/assets'));
//
// app.get('/',function(req,res){
//     res.sendFile(__dirname+'/index.html');
// });
//
//
// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .use(express.static('public'))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`));
//
// const io = socketIO(server);
//
//
//
//
// setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//
//
// io.on('connection',function(socket){
//     socket.on('newplayer',function(){
//         socket.player = {
//             id: server.lastPlayderID++,
//             x: randomInt(100,400),
//             y: randomInt(100,400)
//         };
//         socket.emit('allplayers',getAllPlayers());
//         socket.broadcast.emit('newplayer',socket.player);
//
//         socket.on('click',function(data){
//             socket.player.x = data.x;
//             socket.player.y = data.y;
//             io.emit('move',socket.player);
//         });
//
//         socket.on('disconnect',function(){
//             io.emit('remove',socket.player.id);
//         });
//     });
// });
//
// function getAllPlayers(){
//     var players = [];
//     Object.keys(io.sockets.connected).forEach(function(socketID){
//         var player = io.sockets.connected[socketID].player;
//         if(player) players.push(player);
//     });
//     return players;
// }
//
// function randomInt (low, high) {
//     return Math.floor(Math.random() * (high - low) + low);
// }

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(8081,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);
});


server.lastPlayderID = 0; // Keep track of the last id assigned to a new player

io.on('connection',function(socket){

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };
        socket.emit('allplayers',getAllPlayers());
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('click',function(data){
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);
        });

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
