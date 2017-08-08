var HEIGHT =  window.innerHeight;
var WIDTH = window.innerWidth;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');
