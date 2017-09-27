var loginState = {
	create: function (){
    let p = document.createElement("p");
    p.innerHTML = "HELLO";
    let main = document.querySelector("#game");
    main.append(p);

		// var nameLabel = game.add.text(160, 80, "Click anywhere to start", {
		// 	font: '14px Space Mono', fill: '#ffffff'
		// });
		// game.input.activePointer.capture = true;


	},
	update: function(){
		if (game.input.activePointer.isDown) {
      game.state.start('Game');
		}
	}
}
