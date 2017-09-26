var HEIGHT =  window.innerHeight;
var WIDTH = window.innerWidth;

var game = new Phaser.Game(640, 640, Phaser.AUTO, document.getElementById('game'));


//LOAD STATES
game.state.add('Game',Game);

//START FIRST STATE
game.state.start('Game');
