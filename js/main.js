var HEIGHT =  window.innerHeight;
var WIDTH = window.innerWidth;

let login = document.querySelector("button");
login.addEventListener("click", startGame);

function startGame(e){
  e.preventDefault();
  let name = document.querySelector("input").value;
  e.currentTarget.parentNode.remove();
  window.username = name;
  loadGame();
}

function loadGame() {
  window.game = new Phaser.Game(640, 640, Phaser.AUTO, document.getElementById('game'));

  //LOAD STATES
  // game.state.add('Login',loginState);
  game.state.add('Game',Game);

  //START FIRST STATE
  game.state.start('Game');
}
