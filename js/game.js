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
    this.createKeys();

    ///CHECK FOR NEW PLAYERS
    Client.askNewPlayer(window.username); //change for user id later
    this.lastPos = {x:0, y:0};
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
    map.setCollision(347);

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
        this.handleVelocity();
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

  handleVelocity(){
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
      if (Math.floor(player.body.velocity.y) === 0 && Math.floor(player.body.velocity.x) === 0
      && !player.attacking ){
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
        Client.socket.emit('handleAttackFromClient', collider.id);
    }
  }
  attack(){
    let self = this;

    if ((this.keys.space.isDown || this.input.activePointer.isDown) && !this.currentSprite.attacking){
      this.currentSprite.attacking = true;
      this.currentSprite.animations.play('attack',4,true);
      game.time.events.add(Phaser.Timer.SECOND * 0.5, this.stopAttack, this);
      Client.socket.emit('updateAttackAnimationFromClient');
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
      if (Math.floor(x) !== Math.floor(this.lastPos.x)
      || Math.floor(y) !== Math.floor(this.lastPos.y)) {
        let pos = this.playerMap[user.id];
        this.lastPos = {x:pos.x, y:pos.y};
        Client.socket.emit('updatePosFromClient', {x: pos.x, y: pos.y});
      }
    }
  }

  updateLabelPos(sprite) {
    let x = sprite.x;
    let y = sprite.y;
    sprite.label.x = x-16;
    sprite.label.y = y-45;
    sprite.healthBar.setPosition(x-5, y-25);
  }

  updateOrientation(){
    let currentAngle = game.physics.arcade.angleToPointer(this.currentSprite) - 1.5;
    this.currentSprite.rotation = currentAngle;

    if (Math.floor(currentAngle * 10) !== Math.floor(this.lastOrientation * 10)) {
      this.lastOrientation = currentAngle
      Client.socket.emit('updateOrientationFromClient', currentAngle)
    }
  }

  addNewPlayer(id,x,y, username){
    let player = new Player(id,x,y, username)
    this.players.add(player.sprite);
    this.playerMap[id] = player.sprite;
  }

  removePlayer(id){
    if (this.playerMap[id]) {
      this.playerMap[id].label.destroy();
      this.playerMap[id].healthBar.kill();
      this.playerMap[id].kill()
      delete this.playerMap[id];
    }
  }

  storeCurrentUser(player){
    this.currentUser = player;
    this.currentSprite = this.playerMap[player.id];
  }

  correctPos(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      game.physics.arcade.moveToXY(this.playerMap[player.id], player.x, player.y, 100, 100);
      // var tween = game.add.tween(this.playerMap[player.id]).to({x:player.x,y:player.y},1000);
      // tween.start();
      this.updateLabelPos(this.playerMap[player.id]);
    }
  }

  correctHealth(player){
    if (player && this.playerMap && this.playerMap[player.id]) {
      let sprite = this.playerMap[player.id];
      sprite.health = player.stats.health;
      //change to current/total health
      sprite.healthBar.setPercent((sprite.health/100)*100);

      if (sprite.health <= 0) {
        sprite.healthBar.kill();
        sprite.label.destroy();
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
