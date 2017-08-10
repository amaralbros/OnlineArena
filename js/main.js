var HEIGHT =  window.innerHeight;
var WIDTH = window.innerWidth;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, document.getElementById('game'));
//LOAD STATES
game.state.add('Game',Game);

//START FIRST STATE
game.state.start('Game');
