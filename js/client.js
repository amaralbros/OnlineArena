class Client {
  constructor(){
    this.socket = io.connect();

    this.socket.on('newplayer',(data)=>{
      Game.addNewPlayer(data.id,data.x,data.y, data.username);
    });

    this.socket.on('allplayers',(data)=>{
      for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y, data[i].username);
      }
    });

    this.socket.on('remove',(id)=>{
      Game.removePlayer(id);
    });

    this.socket.on('respondMovement',(data)=>{
      Game.movePlayer(data.id,data);
    });

    this.socket.on('currentUser', (player)=>{
      Game.storeCurrentUser(player);
    })

    this.socket.on('updateOnePos', (player)=>{
      Game.correctPos(player);
    })

    this.socket.on('updateOneOrientation', (player)=>{
      Game.correctOrientation(player);
    });

    this.socket.on('updateOneAttackAnimation', (player)=>{
      Game.correctAttackAnimation(player);
    });

    this.socket.on('updateOneHealth', (player)=>{
      Game.correctHealth(player);
    });
  }

  askNewPlayer(username){
    this.socket.emit('newplayer', username);
  }

  sendClick(x,y){
    this.socket.emit('click',{x:x,y:y});
  }
}

Client = new Client;
