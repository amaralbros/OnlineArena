class Player {
  constructor(id,x,y, username){
    this.sprite = game.add.sprite(x,y,'sprite');
    this.sprite.id = id;
    this.username = username;

    //Username Lable
    var style = { font: "12px Helvetica", fill: "#ffffff" };
    this.label_name = game.add.text(this.sprite.x-16, this.sprite.y-45, username, style);
    this.sprite.label = this.label_name

    //HealthBar
  	var barConfig = {
    width: 40,
    height: 7,
    x: this.sprite.x-5,
    y: this.sprite.y-25,
    bg: {
      color: '#651828'
    },
    bar: {
      color: 'green'
    },
    animationDuration: 200,
    flipped: false
    };
  	this.healthBar = new HealthBar(game, barConfig);
    this.sprite.healthBar = this.healthBar;

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
