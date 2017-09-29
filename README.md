# King of the Hill

King of the Hill (KOTH) is an online, synchronous multiplayer game. It is built purely with Javascript, using the Phaser.js library for HTML Canvas rendering on the frontend, a Node server with Express.js, and Sockets.io for client-server communications. The purpose of this project was to explore how multiplayer games work.

[Live Version](https://koth.herokuapp.com/ "Live Version")

## Features and Functionality

The game supports:
 <ol>
   <li>Login/Logout Functionality</li>
   <li>Animation Rendering for character sprites and map tiles</li>
   <li>Username and health bar display</li>
   <li>Movement and Direction</li>
   <li>Attacking and damage</li>
 </ol>

All in real time, synchronized amongst clients.

## Process

### Step 1: Server Setup
The first step in creating this project was to setup the server. Node/express/sockets.io were chosen to keep the project purely in Javascript. Nodemon took care of automatically refreshing changes to the server, and it was all hosted on Heroku.

### Step 2: Initial Loading
The second step was the render something the user could see. Phaser.js uses roughly the following paradigm to render games:  
1. An init/preload function to load all necessary resources.
2. A create function to create all necessary objects, such as the map and player characters.
3. An update function that runs every few frames to handle things like movement.

* The preload function took care of loading the map sheet (made using a third party software called Tiled) and the character sprite sheet. Now users were greeted with a nice little map when they entered the game!

### Step 3: Character & Input
The third step was to actually display a character, and give it the ability to move. On the create function, we initialized Phaser's physics system, an input system, and created a player.
* To create a player, a Player.new factory function is invoked, and the player is placed randomly on the map, updating a PlayerMap hash with its coordinates.
* The input system works by listening to keydown events for the left (or a) key, up (or w), etc. If any of these keys are pressed, the player object is given the status of "moving".
* The update function checks for players on the PlayerMap, and if it sees any it renders their sprite at the correct location. It also checks for a player's "moving" status, and updates their velocity vectors according to they key that was pressed (ex: y+50 for the up key).

Now we have interactivity!

### Step 4: Multiplayer
Enter multiplayerness. The basic system for multiplayer functionality in this project was:

1. Event from browser happens (player login, press key, etc). Browser sends an event to the socket client.
```
Client.askNewPlayer(window.username);
```
2. Socket client receives the event, and sends an update to the server.
```
askNewPlayer(username){
  this.socket.emit('newplayer', username);
}
```
This event lets the server know that a new player has connected, passing in his username.
3. Server performs any necessary logic, and sends an event back to the socket layer.
```
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
```
Server creates the players (for now, randomly generating ID's & location, and a static stats list; will change once database is implemented). It tells the recently connected user to "fetch" all users (allplayers event), tells the browser who the current user is (currentUser event), and emits to any connected socket that a new player has logged in (newplayer event).

 4. The socket layer sends an event to the correct user.
 ```
    this.socket.on('allplayers',(data)=>{
      for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y, data[i].username);
      }
    });

    this.socket.on('currentUser', (player)=>{
      Game.storeCurrentUser(player);
    })
```
For each connected player, the game adds a player object. It also keeps track of who the current user is.

 5. Game logic picks up the event, and updates the browser for the user.
 ```
  addNewPlayer(id,x,y, username){
    let player = new Player(id,x,y, username)
    this.players.add(player.sprite);
    this.playerMap[id] = player.sprite;
  }
  storeCurrentUser(player){
    this.currentUser = player;
    this.currentSprite = this.playerMap[player.id];
  }
```
The game saves a player's object, which includes information like spritesheet, name, health bar, id, and its position in the map. It adds the player to "players" group, which will handle things like collision.

For logging out, a similar process is used:
```
  removePlayer(id){
    if (this.playerMap[id]) {
      this.playerMap[id].label.destroy();
      this.playerMap[id].healthBar.kill();
      this.playerMap[id].kill()
      delete this.playerMap[id];
    }
  }
  ```
This function, on the client side, removes a player and associated labels when a user logouts. A similar function is used to remove a player when he is killed.

### Step 4: Adding to the Game: Movement, Direction, and Attack

The following steps involved adding functionality for direction, movement, and attack. The update function summarizes well how this was implemented:
```
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
```
* The collision functions handle the logic of collision between two players or player and map object. We will abstract away from this as Phaser handles it pretty well.
* The next step is to render the correct animation for the character. If the character is attacking or moving, we should show the right animation.
* We check if the character is alive: if its not, we logout the user and update the map.
* The updateCurrentUserPos, and updateOrientation handle the client-server communication. It keeps track of a player's current x,y position, and a last x,y position (from a frame ago). If they are significantly different, the client tells the server to update its player positions, and everyone's map is updated to reflect that change. A similar process was used to implement orientation.
```
  updateCurrentUserPos(user){
    if (user && this.playerMap[user.id]) {
      let x = this.playerMap[user.id].x;
      let y = this.playerMap[user.id].y;
      this.updateLabelPos(this.playerMap[user.id]);
      if (Math.floor(x) !== Math.floor(this.lastPos.x)
      || Math.floor(y) !== Math.floor(this.lastPos.y)) {
        let pos = this.playerMap[user.id];
        this.lastPos = {x:pos.x, y:pos.y};
        Client.socket.emit("updatePos", {x: pos.x, y: pos.y});
      }
    }
  }
  ```

* The handleVelocity function handles movement and animation:
```
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
      && !player.attacking){
        player.animations.play('stand')
      }
      if (player.attacking) {
        player.animations.play('attack')
      }
    });
  }
  ```
It updates the velocity to decrease it over time, so movement is smooth, and shows the correct animation if the player is not moving or is attacking.

Finally, attack handling is done by detecting collision between two sprites and if they are currently attacking. If so, we update the server to reflect health changes.

### Step 5: Future Implementations

This game is currently a work in progress. The next steps are to add authentication for login, and a database backend to keep track of player's stats, like level and attack power. For now, it sets the necessary infrastructure to add on to. 
