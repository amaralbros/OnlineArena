class Game {
  init(){
    this.stage.disableVisibilityChange = true;
  }

  preload(){
    this.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    this.load.spritesheet('sprite','assets/sprites/troll.png', 48, 48, 40); // this will be the sprite of the players
  }

  create(){
    this.playerMap = {};
    ///MAP CREATION
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.createMap();
    this.players = game.add.group();
    this.players.enableBody = true;
    this.players.physicsBodyType = Phaser.Physics.ARCADE;

    ///INPUT HANDLING
    this.createKeys()

    ///CHECK FOR NEW PLAYERS
    Client.askNewPlayer();
    this.lastPos = {x:0, y:0}
    this.attacking = false;
  }


  createMap(){
    let map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    let layer;

    for(let i = 0; i < map.layers.length; i++) {
      layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map
  }

  createKeys(){
    this.keys = {};
    this.keys.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.keys.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.keys.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.keys.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
    this.keys.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    this.cursors = game.input.keyboard.createCursorKeys();
  }

  update(){
    game.physics.arcade.collide(this.players, this.players);
    if (this.currentUser){

      if (!this.attacking) {
        this.resetVelocity();
      }

      this.move();
      this.attack();
      this.updateCurrentUserPos(this.currentUser);
      this.updateOrientation();
    }
  }

  resetVelocity(){
    Object.values(this.playerMap).forEach((player)=>{
      if (Math.floor(player.body.velocity.x) > 0) {
        player.body.velocity.x -= 1;
        player.animations.play('walk');
      } else if (Math.floor(player.body.velocity.x) < 0) {
        player.body.velocity.x += 1;
        player.animations.play('walk');
      }
      if (Math.floor(player.body.velocity.y) > 0) {
        player.body.velocity.y -= 1;
        player.animations.play('walk');
      } else if (Math.floor(player.body.velocity.y) < 0) {
        player.body.velocity.y += 1;
        player.animations.play('walk');
      }
      if (Math.floor(player.body.velocity.y) === 0 && Math.floor(player.body.velocity.x) === 0 && !this.attacking ){
        player.animations.play('stand')
      }
    });
  }

  move(){
    let player = this.playerMap[this.currentUser.id];
    if (this.cursors.left.isDown || this.keys.a.isDown)
    {
      player.body.velocity.x = -50;
    }
    else if (this.cursors.right.isDown || this.keys.d.isDown)
    {
      player.body.velocity.x = 50;
    }
    if (this.cursors.up.isDown || this.keys.w.isDown)
    {
      player.body.velocity.y = -50;
    }
    else if (this.cursors.down.isDown || this.keys.s.isDown)
    {
      player.body.velocity.y = 50;
    }
  }

  attack(){
    let self = this;
    let player = this.playerMap[this.currentUser.id];

    if ((this.keys.space.isDown || this.input.activePointer.isDown) && !this.attacking){
      this.attacking = true;
      player.animations.play('attack');
      console.log("attacked");
      // ATTACK LOGIC
      game.time.events.add(Phaser.Timer.SECOND * 0.5, this.stopAttack, this)
    }
  }

  stopAttack(){
    this.attacking = false;
  }

  updateCurrentUserPos(user){
    if (user && this.playerMap[user.id]) {
      let x = this.playerMap[user.id].x
      let y = this.playerMap[user.id].y
      if (Math.floor(x) !== Math.floor(this.lastPos.x) || Math.floor(y) !== Math.floor(this.lastPos.y)) {
        let pos = this.playerMap[user.id];
        this.lastPos = {x:pos.x, y:pos.y}
        Client.socket.emit("updatePos", {x: pos.x, y: pos.y})
      }
    }
  }

  updateOrientation(){
    let currentAngle = game.physics.arcade.angleToPointer(this.playerMap[this.currentUser.id]) - 1.5;
    this.playerMap[this.currentUser.id].rotation = currentAngle;

    if (Math.floor(currentAngle * 10) !== Math.floor(this.lastOrientation * 10)) {
      this.lastOrientation = currentAngle
      Client.socket.emit("updateOrientation", currentAngle)
    }
  }

  addNewPlayer(id,x,y){
    let player = game.add.sprite(x,y,'sprite');

    player.animations.add('walk', [16,17,18,20,21,22,23], 4, true);
    player.animations.add('stand', [15], 4);
    player.animations.add('attack', [32,33,34], 8);

    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.x = 100;
    player.body.maxVelocity.y = 100;
    player.body.width = 30;
    player.body.height = 30;
    player.body.collideWorldBounds = true;
    player.body.bounce.setTo(1, 1);
    player.health = 100; ////CHANGE

    //Make hitboxes
    setInterval(function () {
    game.debug.body(player)
    }, 10);



    this.players.add(player);
    this.playerMap[id] = player;
  }

  removePlayer(id){
    this.playerMap[id].destroy();
    delete this.playerMap[id];
  }

  storeCurrentUser(player){
    this.currentUser = player;
    console.log("currentUser", this.currentUser);
  }

  correctPos(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      game.physics.arcade.moveToXY(this.playerMap[player.id], player.x, player.y, 100, 100);
    }
  }

  correctOrientation(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      this.playerMap[player.id].rotation = player.angle;
    }
  }
}

Game = new Game;
