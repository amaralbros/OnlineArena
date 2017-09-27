class Player {
  constructor(id,x,y, username){
    this.sprite = game.add.sprite(x,y,'sprite');
    this.sprite.id = id;
    this.username = username;

    //Username Lable
    var style = { font: "12px Helvetica", fill: "#ffffff" };
    this.label_name = game.add.text(this.sprite.x-16, this.sprite.y-45, username, style);
    this.sprite.label = this.label_name

    //animations
    this.sprite.animations.add('walk', [16,17,18,20,21,22,23], 4, true);
    this.sprite.animations.add('stand', [15], 4);
    this.sprite.animations.add('attack', [32,33,34], 8);
    this.sprite.anchor.setTo(0.5, 0.5);

    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.maxVelocity.x = 100;
    this.sprite.body.maxVelocity.y = 100;
    this.sprite.body.width = 30;
    this.sprite.body.height = 30;
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.bounce.setTo(1, 1);
    this.sprite.health = 100;
    this.sprite.attacking = false;
  }
}

class Game {
  init(){
    this.stage.disableVisibilityChange = true;
  }

  preload(){
    this.load.tilemap('map', 'assets/map/arenamap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles', 'assets/map/sprite_set.png',32,32);
    this.load.spritesheet('sprite','assets/sprites/troll.png', 48, 48, 40); // this will be the sprite of the players
  }

  create(){
    ///MAP CREATION
    this.playerMap = {};
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.createMap();

    //Add player info
    this.players = game.add.group();
    this.players.enableBody = true;
    this.players.physicsBodyType = Phaser.Physics.ARCADE;

    ///INPUT HANDLING
    this.createKeys()

    ///CHECK FOR NEW PLAYERS
    Client.askNewPlayer(window.username);
    this.lastPos = {x:0, y:0}
  }

  createMap(){
    let map = game.add.tilemap('map');
    map.addTilesetImage('arenamap', 'tiles'); // tilesheet is the key of the tileset in map's JSON file
    let layer;

    //create base layer
    let base = map.createLayer('Base');

    //create the collision layer
    let collisionLayer = map.createLayer('Collision');
    this.collisionLayer = collisionLayer;
    collisionLayer.visible = false;

    // set collision
    map.setCollisionByExclusion([], true, this.collisionLayer);
    map.setCollision(347)

    //  This resizes the game world to match the layer dimensions
    collisionLayer.resizeWorld();

    // creating the foreground layer last after all moving sprites
    // ensures that this layer will stay above during depth sorting
    map.createLayer('Foreground');

    base.inputEnabled = true; // Allows clicking on the map
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
    if (this.currentUser){
      game.physics.arcade.collide(this.players, this.collisionLayer)
      game.physics.arcade.collide(this.currentSprite, this.players, this.handleAttack, null, this);

      if (!this.currentSprite.attacking) {
        this.resetVelocity();
      }
      this.checkIfAlive();
      this.move();
      this.attack();
      this.updateCurrentUserPos(this.currentUser);
      this.updateOrientation();
    }
  }

  checkIfAlive(){
    Object.values(this.playerMap).forEach((player)=>{
      if (player.health <= 0){
        player.kill()
      }
    })
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
      if (Math.floor(player.body.velocity.y) === 0 && Math.floor(player.body.velocity.x) === 0 && !player.attacking ){
        player.animations.play('stand')
      }
      if (player.attacking) {
        player.animations.play('attack')
      }
    });
  }

  handleAttack(owner, collider){
    if (this.currentSprite.attacking && !collider.damaged){
        collider.damaged = true;
        game.time.events.add(Phaser.Timer.SECOND * 0.5, ()=> collider.damaged = false);
        Client.socket.emit("handleAttack", collider.id);
    }
  }
  attack(){
    let self = this;

    if ((this.keys.space.isDown || this.input.activePointer.isDown) && !this.currentSprite.attacking){
      this.currentSprite.attacking = true;
      this.currentSprite.animations.play('attack',4,true);
      game.time.events.add(Phaser.Timer.SECOND * 0.5, this.stopAttack, this);
      Client.socket.emit("showAttack")
    }
  }

  stopAttack(){
    this.currentSprite.attacking = false;
  }

  move(){
    let player = this.currentSprite;
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

  updateCurrentUserPos(user){
    if (user && this.playerMap[user.id]) {
      let x = this.playerMap[user.id].x;
      let y = this.playerMap[user.id].y;
      this.updateLabelPos(this.playerMap[user.id]);
      if (Math.floor(x) !== Math.floor(this.lastPos.x) || Math.floor(y) !== Math.floor(this.lastPos.y)) {
        let pos = this.playerMap[user.id];
        this.lastPos = {x:pos.x, y:pos.y}
        Client.socket.emit("updatePos", {x: pos.x, y: pos.y})
      }
    }
  }

  updateLabelPos(sprite) {
    sprite.label.x = sprite.x-16;
    sprite.label.y = sprite.y-45;
  }

  updateOrientation(){
    let currentAngle = game.physics.arcade.angleToPointer(this.currentSprite) - 1.5;
    this.currentSprite.rotation = currentAngle;

    if (Math.floor(currentAngle * 10) !== Math.floor(this.lastOrientation * 10)) {
      this.lastOrientation = currentAngle
      Client.socket.emit("updateOrientation", currentAngle)
    }
  }

  addNewPlayer(id,x,y, username){
    let player = new Player(id,x,y, username)
    this.players.add(player.sprite);
    this.playerMap[id] = player.sprite;
  }

  removePlayer(id){
    this.playerMap[id].destroy()
    this.playerMap[id].label.destroy();
    delete this.playerMap[id];
  }

  storeCurrentUser(player){
    this.currentUser = player;
    this.currentSprite = this.playerMap[player.id];

  }

  correctPos(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      game.physics.arcade.moveToXY(this.playerMap[player.id], player.x, player.y, 100, 100);
      this.updateLabelPos(this.playerMap[player.id]);
    }
  }

  correctHealth(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      let sprite = this.playerMap[player.id];
      sprite.health = player.stats.health;

      if (sprite.health <= 0) {
        sprite.kill();
      }
    }
  }

  correctOrientation(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      this.playerMap[player.id].rotation = player.angle;
    }
  }

  correctAttackAnimation(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      let sprite = this.playerMap[player.id]
      sprite.attacking = true;
      game.time.events.add(Phaser.Timer.SECOND * 0.5, ()=>{sprite.attacking = false}, this);
    }
  }
}

Game = new Game;
