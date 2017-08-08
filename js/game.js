
var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
};

Game.create = function(){
    Game.playerMap = {};
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map
    Client.askNewPlayer();

    cursors = game.input.keyboard.createCursorKeys();

};

Game.update = function(){
  if (cursors.left.isDown)
  {
    Client.socket.emit('requestMovement', {
      x: -1,
      y: 0
    })
  }
  else if (cursors.right.isDown)
  {
    Client.socket.emit('requestMovement', {
      x: 1,
      y: 0
    })
  }

  if (cursors.up.isDown)
  {
    Client.socket.emit('requestMovement', {
      x: 0,
      y: -1
    })
  }
  else if (cursors.down.isDown)
  {
    Client.socket.emit('requestMovement', {
      x: 0,
      y: 1
    })
  }
}

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.movePlayer = function(id,data){
    var player = Game.playerMap[id];
    var tween = game.add.tween(player);
    tween.to({x:data.x,y:data.y}, 1);
    tween.start();
}

    

