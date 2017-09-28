# King of the Hill

King of the Hill (KOTH) is an online, synchronous multiplayer game. It is built purely with Javascript, using the Phaser.js library for HTML Canvas rendering on the frontend, a Node server with Express.js, and Sockets.io for client-server communications. The purpose of this project was to explore how multiplayer games work.

[KOTH ONLINE](https://koth.herokuapp.com/ "Live Version")

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

Online Arena
- Setup heroku w/ node and sockets.io
	-Sticky sessions/multiple dynos?
- Login/logout functionality
- Movement function
-Server/client sync
- Sprite animations
