var HEIGHT =  window.innerHeight;
var WIDTH = window.innerWidth;

var Game = {};
var cursors;
var players;


Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
};

Game.create = function(){
    ///MAP CREATION
    Game.playerMap = {};
    game.physics.startSystem(Phaser.Physics.ARCADE);
    createMap();
    players = game.add.group();
    players.enableBody = true;
    players.physicsBodyType = Phaser.Physics.ARCADE


    ///INPUT HANDLING
    cursors = game.input.keyboard.createCursorKeys();

    ///CHECK FOR NEW PLAYERS
    Client.askNewPlayer();
};


function createMap(){
  var map = game.add.tilemap('map');
  map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
  var layer;
  for(var i = 0; i < map.layers.length; i++) {
      layer = map.createLayer(i);
  }
  layer.inputEnabled = true; // Allows clicking on the map
}

Game.update = function(){
  game.physics.arcade.collide(players, players);
  resetVelocity();
  if (Game.currentUser){move()};
  updateCurrentUserPos(Game.currentUser);

};

function resetVelocity(){
  Object.values(Game.playerMap).forEach((player)=>{
    if (Math.floor(player.body.velocity.x) > 0) {
      player.body.velocity.x -= 1;
    } else if (Math.floor(player.body.velocity.x) < 0) {
      player.body.velocity.x += 1;
    }
    if (Math.floor(player.body.velocity.y) > 0) {
      player.body.velocity.y -= 1;
    } else if (Math.floor(player.body.velocity.y) < 0) {
      player.body.velocity.y += 1;
    }
  });
}

function move(){

  // let directionVector = [0,0]
  var player = Game.playerMap[Game.currentUser.id];
  if (cursors.left.isDown)
  {
    // Client.socket.emit('requestMovement', {
    //   x: -50,
    //   y: 0
    // });
    player.body.velocity.x = -50;
  }
  else if (cursors.right.isDown)
  {
    // Client.socket.emit('requestMovement', {
    //   x: 50,
    //   y: 0
    // });
    player.body.velocity.x = 50;

  }

  if (cursors.up.isDown)
  {
    // Client.socket.emit('requestMovement', {
    //   x: 0,
    //   y: -50
    // });
    player.body.velocity.y = -50;

  }
  else if (cursors.down.isDown)
  {
    // Client.socket.emit('requestMovement', {
    //   x: 0,
    //   y: 50
    // });
    player.body.velocity.y = 50;

  }
}

function updateCurrentUserPos(user){
  if (user) {
    var pos = Game.playerMap[user.id];
    Client.socket.emit("updatePos", {x: pos.x, y: pos.y})
  }

}

Game.addNewPlayer = function(id,x,y){
  var player = game.add.sprite(x,y,'sprite');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.maxVelocity.x = 100;
  player.body.maxVelocity.y = 100;
  player.body.width = 25;
  player.body.height = 38;
  players.add(player);

  Game.playerMap[id] = player;
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};


///RECEIVES MOVE FROM CLIENT
// Game.movePlayer = function(id,data){
//     var player = Game.playerMap[id];
//     player.body.velocity.x = data.velocityX;
//     player.body.velocity.y = data.velocityY;
// };

Game.storeCurrentUser = function(player){
  Game.currentUser = player;
  console.log("currentUser", Game.currentUser);
}

Game.correctPos = function(player){
  debugger
  if (player && Game.playerMap && Game.playerMap[player.id]) {
      var playerToMove = Game.playerMap[player.id];
      Game.playerMap[player.id].x = player.x;
      Game.playerMap[player.id].y = player.y;
  }
};
