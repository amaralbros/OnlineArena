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

1. The first step in creating this project was to setup the server. Node/express were chosen to keep the project in Javascript, with a mounted Sockets server. Nodemon took care of automatically refreshing changes to the server, and it was all hosted on Heroku.

2. The second step was the render something the user could see. Phaser.js uses roughly the following paradigm to render games:  

  i. An init/preload function to load all necessary resources.

  ii. A create function to create all necessary objects, such as the map and player characters.

  iii. An update function that runs every few frames to handle things like movement.

The preload function took care of loading the map sheet (made using a third party software called Tiled) and the character sprite sheet. Now users were greeted with a nice little map when they entered the game!

3. The third step was to actually display a character, and give it the ability to move. On the create function, we initialized Phaser's physics system, an input system, and created a player.

To create a player, a Player.new factory function is invoked, and the player is placed randomly on the map, updating a PlayerMap hash with its coordinates.

The input system works by listening to keydown events for the left (or a) key, up (or w), etc. If any of these keys are pressed, the player object is given the status of "moving".

The update function checks for players on the PlayerMap, and if it sees any it renders their sprite at the correct location. It also checks for a player's "moving" status, and updates their velocity vectors according to they key that was pressed (ex: y+50 for the up key). This enabled the sprite to smoothly move to a given direction, using Phaser's physics system.

Now we have interactivity!

4. Enter multiplayerness. The basic system for multiplayer functionality in this project was:

⋅⋅1. Event from browser happens (player login, press key, etc). Browser sends an event to the socket client.

```
Client.askNewPlayer(window.username);
```

⋅⋅2. Socket client receives the event, and sends an update to the server.

```
askNewPlayer(username){
  this.socket.emit('newplayer', username);
}
```
⋅⋅3. Server performs any necessary logic, and sends an event back to the socket layer.
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

 4. The socket layer sends an event to the correct user.
 5. Game logic picks up the event, and updates the browser for the user.

For login,


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




Online Arena
- Setup heroku w/ node and sockets.io
	-Sticky sessions/multiple dynos?
- Login/logout functionality
- Movement function
-Server/client sync
- Sprite animations
