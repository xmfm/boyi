var tileWidth = stage.width / 20, tileHeight = tileWidth * 4 / 3;//手牌大小
var scoreBoardSide = stage.width / 6;
var subTileWidth = scoreBoardSide / 6, subTileHeight = subTileWidth * 5 / 4;//非手牌大小

var tilesUrl_2d = "/static/tiles_2d.png";
var tiles_2d = null;

var testTiles = [11, 25, 41, 12, 13, 23, 45, 34, 23, 20, 23, 33, 11];//测试手牌

var tileUp = tileHeight / 3;//选定牌上浮

const ME = 0, RIGHT = 1, OPPO = 2, LEFT = 3;

var tileMask = new Sprite();
var tileRect = new Laya.Rectangle(0, 0, tileWidth, tileHeight);

class Tile {
	constructor(){
		this.sp = new Sprite();
		
	}
	
}

class Player {
    constructor(socket, tableSp, pos) {
		this.socket = socket;
		this.id = 0;
        this.name = '';
		this.level = 0;//等级段位
		this.point = 0;//点数
		this.tableSp = tableSp;//牌桌精灵
		this.sp = new Sprite();//玩家精灵
        this.handTiles = new Array();//手牌
        this.displayTiles = new Array();//副露牌
        this.discardTiles = new Array();//牌河
        this.score = 0;//分数
        this.wind = 0;//座位、东南西北
        this.pos = pos;//位置、本右对左
		this.turn = false;//轮到自己切牌
		this.ritchiTile = -1;//立直巡数，-1为未立直
		
        this.handTilesSp = new Sprite();//手牌精灵
        this.displayTilesSp = new Sprite();//副露牌精灵
		this.displayTilesSp.zOrder = -1;//为了不遮挡点击手牌
        this.discardTilesSp = new Sprite();//牌河精灵
		this.scoreBoardSp = tableSp.getChildByName('scoreBoard');//计分板精灵
		this.sp.rotation = -90 * this.pos;//根据座位进行旋转
        this.sp.addChildren(this.handTilesSp, this.displayTilesSp, this.discardTilesSp);
		
		this.handTilesSp.scaleX = this.displayTilesSp.scaleX = this.discardTilesSp.scaleX = subTileWidth / tileWidth;//默认缩小
		this.handTilesSp.scaleY = this.displayTilesSp.scaleY = this.discardTilesSp.scaleY = subTileHeight / tileHeight;//默认缩小
		this.handTilesSp.size(subTileWidth*14, subTileHeight);
		this.displayTilesSp.size(subTileWidth*16.6, subTileHeight);
		
		this.tableSp.addChild(this.sp);
		
		tileMask.graphics.drawRect(0, 0, tileWidth, tileHeight, '#000');

		switch(pos){//根据座位移动
			case ME:
				this.sp.pos(0, this.tableSp.height/2 + this.scoreBoardSp.height/2);
				this.sp.size(this.tableSp.width, this.tableSp.height - this.sp.y);
				break;
			case RIGHT:
				this.sp.pos(this.tableSp.width/2 + this.scoreBoardSp.width/2, this.tableSp.height);
				this.sp.size(this.tableSp.height, this.tableSp.width - this.sp.x);
				break;
			case OPPO:
				this.sp.pos(this.tableSp.width, this.tableSp.height/2 - this.scoreBoardSp.height/2);
				this.sp.size(this.tableSp.width, this.sp.y);
				break;
			case LEFT:
				this.sp.pos(this.tableSp.width/2 - this.scoreBoardSp.width/2, 0);
				this.sp.size(this.tableSp.height, this.sp.x);
				break;
		}
		this.handTilesSp.pos(this.sp.width/2-this.handTilesSp.width/2, this.sp.height-this.handTilesSp.height*1.2);
		this.displayTilesSp.pos(this.handTilesSp.x, this.handTilesSp.y);
		this.discardTilesSp.pos(this.sp.width/2-this.scoreBoardSp.width/2, 0);
		if(pos==ME){//主视角手牌放大
			this.handTilesSp.scale(1, 1);
			this.displayTilesSp.scale(1, 1);//待调整
			this.handTilesSp.width *= tileWidth/subTileWidth;
			this.displayTilesSp.width *= tileWidth/subTileWidth;
			this.handTilesSp.height = this.displayTilesSp.height = tileHeight;
			this.handTilesSp.x = this.displayTilesSp.x = this.sp.width/2 - this.handTilesSp.width/2;
			//this.displayTilesSp.x += this.displayTilesSp.width/2;
		}
    }
	//发牌
    deal(tiles, length=13) {
        if (tiles && tiles.length > 13) { console.error('服务器错误！'); return; }
        //var tiles_2d = Laya.loader.getRes(tilesUrl_2d);
		if(!tiles){tiles = new Array(length).fill(-1);}
        for (var i in tiles) {
			this.addTile(tiles[i]);
        }
    }
	//摸牌
	draw(tile){
		if(!tile){tile=-1;}
		this.addTile(tile, true);
		
	}
	//在手牌中加入新牌
	addTile(tile, draw = false, i = this.handTilesSp.numChildren){
		//tile: 新牌的种类 draw: 是否为在牌局进行中的摸牌 i: 加入位置，默认尾部
		var newTile = new Sprite();//创建新牌
		newTile.name = tile;
		if(tile%10==0){//是赤宝牌
			this.handTiles.push(tile+5);
			//newTile.name = tile+5;
			newTile.red = true;
		}else{//非赤宝牌
			this.handTiles.push(tile);
			//newTile.name = tile;
			newTile.red = false;
		}
		this.handTilesSp.addChild(newTile);
		if(draw){//摸牌右移半格
			newTile.pos(tileWidth * (i+0.5), 0);
		}else{
			newTile.pos(tileWidth * i, 0);
		}
		if(i != this.handTilesSp.numChildren-1){//在中间插入
			this.handTilesSp.setChildIndex(newTile, i);
		}
		if(tile == -1){//隐藏手牌
			newTile.graphics.drawTexture(tiles_2d, 40 % 10 * tileWidth, -floor(40 / 10 - 1) * tileHeight, tileWidth * 10, tileHeight * 4);
		}else{
			newTile.graphics.drawTexture(tiles_2d, -tile % 10 * tileWidth, -floor(tile / 10 - 1) * tileHeight, tileWidth * 10, tileHeight * 4);
		}
		newTile.size(tileWidth, tileHeight + tileUp);
		newTile.scrollRect = tileRect;
		newTile.mask = tileMask;
		if(this.pos==ME){//主视角手牌有鼠标交互
			var that = this;//轮到主视角切牌
			newTile.on('mouseover', newTile, function () {
				this.y = -tileUp;
				this.scrollRect.height = tileHeight + tileUp;
			});
			newTile.on('mouseout', newTile, function () {
				this.y = 0;
				this.scrollRect.height = tileHeight;
			});
			newTile.on('click', newTile, function () {
				if(that.turn){that.tileClick(this);}
			});
		}
	}
	//从手牌中移除一张给定种类的牌
	removeFromHand(tile){
		tile.off('mouseover');
        tile.off('mouseout');
        tile.off('click');
		this.handTilesSp.removeChild(tile);
		for(var i in this.handTiles){
			if(this.handTiles[i]==tile.name+tile.red*5){
				this.handTiles.splice(i, 1);
				break;
			}
		}
	}
	//手牌排序
	sort(){
		var fromList = [...this.handTiles];//排序前的手牌顺序（无赤）
		var fromSp = new Array();//排序前的手牌精灵
		var i, j, node;
		for(i in this.handTiles){//深复制手牌精灵
			fromSp[i] = this.handTilesSp.getChildAt(i);
		}
		this.handTiles.sort();//排序
		console.log(this.handTiles);
		for(i in this.handTiles){
			j = fromList.indexOf(this.handTiles[i]);
			fromList[j] = null;
			node = fromSp[j];
			if(node.x != tileWidth*i){
				Laya.Tween.to(node, {x:tileWidth*i}, 500, null, null, 0);
			}
			this.handTilesSp.setChildIndex(node, i);
		}
	}
	//切牌
	discard(tile, ritchi){
		var toScaleX = 1;
		var toScaleY = 1;
		var toRotation = 0;
		if(this.pos == ME){
			toScaleX = subTileWidth/tileWidth;
			toScaleY = subTileHeight/tileHeight;
		}
		var theX = this.discardTiles.length%6*subTileWidth;
		var theY = floor(this.discardTiles.length/6)*subTileHeight;
		if(this.ritchiTile >= 0 && floor(this.ritchiTile/6) == floor(this.discardTilesSp.numChildren/6)){
			theX += tileHeight - tileWidth;
		}
		if(ritchi){
			toRotation = -90;
			theY += tileHeight/2 + tileWidth/2;
			this.ritchiTile = this.discardTilesSp.numChildren;
		}
		var toX = this.discardTilesSp.x - this.handTilesSp.x + theX;
		var toY = this.discardTilesSp.y - this.handTilesSp.y + theY;
		Laya.Tween.to(tile, {scaleX:toScaleX, scaleY:toScaleY, x:toX, y:toY, rotation:toRotation}, 500, null, Laya.Handler.create(this, ()=>{
			this.handTilesSp.removeChild(tile);
			tile.pos(theX, theY).scale(1, 1);
			this.discardTilesSp.addChild(tile);
			
			this.removeFromHand(tile);
			this.discardTiles.push(tile.name+tile.red*5);
			this.naki([this.handTilesSp.getChildAt(1), this.handTilesSp.getChildAt(2)], this);
			this.sort();
		}), 0);
	}
	//点击手牌
    tileClick(tile) {
		this.discard(tile);
        this.socket.emit('discard', { act: 'discard', tile: tile.name });
		this.turn = false;
    }
	//鸣牌
    naki(tiles, player) {
		//tiles 接受被鸣牌的手牌；player 被鸣牌家
        var nakiSp = new Sprite();//此副露的精灵
		nakiSp.x = this.displayTilesSp.width - tiles.length*tileWidth - tileHeight;
		this.displayTilesSp.width = nakiSp.x;
		var fromSp = player.discardTilesSp;//被鸣牌所来自的牌河
		var tile = fromSp.getChildAt(fromSp.numChildren-1);//被鸣牌
		fromSp.removeChild(tile);
		this.displayTilesSp.addChild(nakiSp);
		tile.y = tileHeight;
		tile.rotation = -90;
        switch (player.pos) {
            case RIGHT:
			case ME:
				for(var i in tiles){
					this.removeFromHand(tiles[i]);
					tiles[i].x = tileWidth*i;
					nakiSp.addChild(tiles[i]);
				}
				tile.x = tileWidth*tiles.length;
				nakiSp.addChild(tile);
				break;
            case OPPO:
				tiles[0].x = 0;
				nakiSp.addChild(tiles[0]);
				tile.x = tileWidth;
				nakiSp.addChild(tile);
				for(var i=1; i<tiles.length; i++){
					this.removeFromHand(tiles[i]);
					tiles[i] = tileHeight+tileWidth*i;
					nakiSp.addChild(tile[i]);
				}
                break;
			case LEFT:
				tile.x = 0;
				nakiSp.addChild(tile);
				for(var i in tiles){
					this.removeFromHand(tiles[i]);
					tiles[i].x = tileHeight+tileWidth*i;
					nakiSp.addChild(tiles[i]);
				}
				break;
        }
		//this.sort();
    }
	//暗杠
    anGang(tiles) {
		var nakiSp = new Sprite();
		nakiSp.x = this.displayTilesSp.width - tiles.length*tileWidth;
		this.displayTilesSp.width = nakiSp.x;
		this.displayTilesSp.addChild(nakiSp);
		for(var i in tiles){
			this.removeFromHand(tiles[i]);
			tiles[i].x = tileWidth*i;
			nakiSp.addChild(tiles[i]);
		}
		//this.sort();
    }
	//加杠
    jiaGang(nakiSp, tile) {
		tile.y = tileHeight - tileWidth;
		tile.rotation = -90;
		this.removeFromHand(tile);
		var theTile;
		for(var i=0; i < nakiSp.numChildren; i++){
			if(nakiSp.getChildAt(i).y > 0){
				theTile = nakiSp.getChildAt(i);
				break;
			}
		}
		tile.x = theTile.x;
		nakiSp.addChild(tile);
		//this.sort();
    }
	start(){
		this.sort();
	}
}

class MJ {
    constructor(socket, name, msg) {
        this.sp = new Sprite();
		this.sp.size(stage.width, stage.height - subTileHeight);
        this.sp.name = name;
		this.scoreBoardSp = new Sprite();//计分板精灵
		this.scoreBoardSp.name = 'scoreBoard';
		this.scoreBoardSp.size(scoreBoardSide, scoreBoardSide);
		this.sp.addChild(this.scoreBoardSp);
        stage.addChild(this.sp);
        this.socket = socket;
        this.name = name;
		this.wind = msg['wind'];//本家座位
		this.dora_point = msg['dora_point'];//宝牌指示牌
		//创建四位玩家，东南西北顺
		this.players = [new Player(this.socket, this.sp, (4-this.wind)%4),
						new Player(this.socket, this.sp, (5-this.wind)%4),
						new Player(this.socket, this.sp, (6-this.wind)%4),
						new Player(this.socket, this.sp, (7-this.wind)%4)];
		for(var i in this.players){
			this.players[i].id = msg['player'+i]['id'];
			this.players[i].name = msg['player'+i]['name'];
			this.players[i].wind = msg['player'+i]['wind'];
			this.players[i].level = msg['player'+i]['level'];
			this.players[i].point = msg['player'+i]['point'];
		}
		//加载资源，完成后向服务器报告情况
		Laya.loader.load(tilesUrl_2d, Laya.Handler.create(this, () => {
			tiles_2d = Laya.loader.getRes(tilesUrl_2d);
			this.socket.emit('ready_ok', '');
		}));
		//收到服务器发来的其他玩家准备信息
		this.socket.on('ready_ok',(msg)=>{
			
		});
		this.socket.on('act', (msg)=>{
			
		});
		//发牌
		this.socket.on('deal', (msg)=>{
			for(i in this.players){
				if(i==this.wind){
					this.players[i].deal(msg['deal']);
					//this.players[i].deal(testTiles);
				}else{
					this.players[i].deal();
				}
			}
			this.players[this.wind].sort();
		});
		//摸牌
		this.socket.on('draw', (msg)=>{
			if(msg['draw']){
				this.players[this.wind].draw(msg['draw']);
				this.players[this.wind].turn = true;
			}else if(msg['player'] != null && msg['player'] != this.wind){
				this.players[msg['player']].draw();
			}
		});
		//切牌
		this.socket.on('discard', (msg)=>{
			var sp = this.players[msg['player']].handTilesSp;
			if(msg['player'] != this.wind){
				var i = sp.numChildren - 1;
				if(!msg['mo']){//手切时随机选一个位置
					i = floor(Math.random()*(sp.numChildren-2));
				}
				sp.removeChildAt(i);
				this.players[msg['player']].addTile(msg['tile'], msg['mo'], i);
			}
			this.players[msg['player']].discard(sp.getChildByName(msg['tile']));
		});
    }
}