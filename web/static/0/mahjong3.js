$(function(){
	var tileWidth = stageWidth/20, tileHeight = tileWidth*4/3;//手牌大小
	var scoreboardSide = stageWidth/6;
	var subTileWidth = scoreboardSide/6, subTileHeight = subTileWidth*5/4;//非手牌大小
	
	var touchedTile;
	
	var tilesUrl_2d = "/static/tiles_2d.png";
	
	var testTiles = [11, 25, 41, 12, 13, 23, 45, 34, 23, 20, 23, 33, 11];
	
	var player0, player1, player2, player3;
	
	var tileUp = tileHeight/3;
	
	const ME = 0, RIGHT = 1, OPPO = 2, LEFT = 3;
	
	var tileMask = new Sprite();
	tileMask.graphics.drawRect(0, 0, tileWidth, tileHeight);
	var tileRect = new Laya.Rectangle(0, 0, tileWidth, tileHeight);
	
	const socket = io(window.location.protocol+'//'+window.location.host+'/mj');
	
	socket.on('connect', function(){
		init();
	});
	socket.on('disconnect', function(){
		alert('连接已断开！');
	});
	socket.on('start', function(msg){
		Laya.loader.load(tilesUrl_2d, Laya.Handler.create(this, ()=>{
		player0.deal(msg['hand']);
		}));
	});
		
	class Player{
		constructor(stage, pos){
			this.name = '';
			this.handTiles = new Array();
			this.displayTiles = new Array();
			this.discardTiles = new Array();
			this.score = 0;
			this.wind = 0;
			this.pos = pos;
			
			this.handTilesSp = new Sprite();
			this.displayTilesSp = new Sprite();
			this.discardTilesSp = new Sprite();
			stage.addChildren(this.handTilesSp, this.displayTilesSp, this.discardTilesSp);
			
			switch(pos){
				case ME:
					this.handTilesSp.x = tileWidth * 3;
					this.handTilesSp.y = stageHeight - tileHeight - tileHeight/5;
					
					this.discardTilesSp.x = stageWidth/2 - scoreboardSide/2;
					this.discardTilesSp.y = stageHeight/2 + scoreboardSide/2 - subTileHeight;
					break;
					
				case RIGHT:
					this.handTilesSp.rotation = -90;
					this.handTilesSp.x = stageWidth - subTileHeight - subTileHeight/5;
					this.handTilesSp.y = stageHeight - subTileWidth * 3 - tileHeight;
					this.handTilesSp.scale(subTileWidth/tileWidth, subTileHeight/tileHeight);
					
					this.discardTilesSp.rotation = -90;
					this.discardTilesSp.x = stageWidth/2 + scoreboardSide/2;
					this.discardTilesSp.y = stageHeight/2 + scoreboardSide/2 - subTileHeight;
					break;
					
				case OPPO:
					this.handTilesSp.rotation = 180;
					this.handTilesSp.x = stageWidth - tileWidth * 3 * 2;
					this.handTilesSp.y = subTileHeight + subTileHeight/5;
					this.handTilesSp.scale(subTileWidth/tileWidth, subTileHeight/tileHeight);
					
					this.discardTilesSp.rotation = 180;
					this.discardTilesSp.x = stageWidth/2 + scoreboardSide/2;
					this.discardTilesSp.y = stageHeight/2 - scoreboardSide/2 - subTileHeight;
					break;
					
				case LEFT:
					this.handTilesSp.rotation = 90;
					this.handTilesSp.x = subTileHeight + subTileHeight/5;
					this.handTilesSp.y = subTileWidth * 3;
					this.handTilesSp.scale(subTileWidth/tileWidth, subTileHeight/tileHeight);
					
					this.discardTilesSp.rotation = 90;
					this.discardTilesSp.x = stageWidth/2 - scoreboardSide/2;
					this.discardTilesSp.y = stageHeight/2 - scoreboardSide/2 - subTileHeight;
					break;
			}
		}
		deal(tiles){
			//发牌
			if(tiles.length > 13){alert('服务器错误！');return;}
			var i;
			var tiles_2d = Laya.loader.getRes(tilesUrl_2d);
			for (i in tiles){
				this.handTiles.push(tiles[i]);
				
				var newTile = new Sprite();
				newTile.name = tiles[i];
				this.handTilesSp.addChild(newTile);
				newTile.pos(tileWidth*i, 0);
				newTile.graphics.drawTexture(tiles_2d, -tiles[i]%10*tileWidth, -parseInt(tiles[i]/10-1)*tileHeight, tileWidth*10, tileHeight*4);
				newTile.scrollRect = tileRect;
				newTile.size(tileWidth, tileHeight + tileUp);
				
				newTile.mask = tileMask;
				
				newTile.on('mouseover', newTile, function(){
					this.y = -tileUp;
					touchedTile = this;
					this.scrollRect.height = tileHeight + tileUp;
				});
				newTile.on('mouseout', newTile, function(){
					this.y = 0;
					this.scrollRect.height = tileHeight;
				});
				newTile.on('click', newTile, function(){
					touchedTile = this;
				});
				newTile.on('click', this, this.tileClick);
			}
		}
		tileOver(){
		
		}
		tileOut(){
			
		}
		tileClick(){	
			this.handTilesSp.removeChild(touchedTile);
			this.discardTilesSp.addChild(touchedTile);
			
			this.handTiles.pop(touchedTile.name);
			this.discardTiles.push(touchedTile.name);
			
			touchedTile.off('mouseover');
			touchedTile.off('mouseout');
			touchedTile.off('click');
			
			touchedTile.scale(subTileWidth/tileWidth, subTileHeight/tileHeight).pos((this.discardTiles.length-1)%6*subTileWidth, parseInt((this.discardTiles.length-1)/6)*subTileHeight);
			
			socket.emit('act', {act: 'discard', data: touchedTile.name});
		}
		naki(tiles, tile, pos, act){
			var nakiSP = new Sprite();
			switch(pos){
				case LEFT:
				case RIGHT:
				case OPPO:
					null
			}
		}
		anGang(){
			
		}
		jiaGang(){
			
		}
		
	}
	
	function init(){
		player0 = new Player(stage, ME);
		player1 = new Player(stage, RIGHT);
		player2 = new Player(stage, OPPO);
		player3 = new Player(stage, LEFT);
	}
/* 	Laya.loader.load(tilesUrl_2d, Laya.Handler.create(this, ()=>{
		player0.deal(testTiles);
		player1.deal(testTiles);
		player2.deal(testTiles);
		player3.deal(testTiles);
		})); */


})