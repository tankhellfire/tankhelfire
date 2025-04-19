class Pong{
  constructor(opt={}){
    this.players=[]
    this.host=opt.host
  }
  
  addPlayer(send){
    if(this.host)throw 'not host, can\'t addPlayer'
    

    let newPlayer=this.updatePlayer({id:Pong.FirstEmpty(this.players),send,game:this})
    newPlayer.send([Pong.sym.you,newPlayer])
    
    this.players.forEach(player=>{
      if(player==newPlayer)return newPlayer.send([Pong.sym.you,newPlayer])
      newPlayer.send([Pong.sym.updatePlayer,player])
    })
    
    
    return newPlayer
  }

  updatePlayer(data={},src){
    let player=this.players[data.id]??=new Pong.Player(data)
    player.x=data.x??player.x
    player.y=data.y??player.y

    if(this.host){
      if(src!==null)this.host.send([Pong.sym.updatePlayer,player])
    }else{
      this.players.forEach(targ=>{
        if(targ.id!==src&&targ.id!==player.id)targ.send([Pong.sym.updatePlayer,player])//targ!=player to stop banding
      })
    }
    
    return player
  }

  receive(data,src=null){
    console.log(data,src,this)
    if(this.host){
      if(data[0]==Pong.sym.updatePlayer)return this.updatePlayer(data[1],src)
      if(data[0]==Pong.sym.you){
        let player=this.updatePlayer(data[1],src)
        this.id=player.id
        return player
      }
    }else{
      if(data[0]==Pong.sym.updatePlayer)return this.updatePlayer(data[1],src)
    }
    console.error(`unknown`,data,this)
  }

  
  static Player=class{
    constructor({id,send,game,x,y}={}){
      if(typeof id!='number')return console.error('no id')
      this.id=id
      this.send=send??console.log
      this.receive=e=>(this.game=game).receive(e,this.id)
      this.x=x??0
      this.y=y??0
    }
  }
  
  static sym={
    updatePlayer:Symbol('updatePlayer'),
    you:Symbol('you'),
    playerMove:Symbol('playerMove')
  }
  
  static FirstEmpty=arr=>{
    for(let i=0;i<=arr.length;i++){
      if(arr[i]===undefined)return i
    }
  }

}

exports=Pong