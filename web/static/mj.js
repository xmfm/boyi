var tileWidth = stageWidth / 20, tileHeight = tileWidth * 4 / 3;//手牌大小
var scoreboardSide = stageWidth / 6;
var subTileWidth = scoreboardSide / 6, subTileHeight = subTileWidth * 5 / 4;//非手牌大小

var touchedTile;

var tilesUrl_2d = "/static/tiles_2d.png";
var tiles_2d = null;

var testTiles = [11, 25, 41, 12, 13, 23, 45, 34, 23, 20, 23, 33, 11];

var player0, player1, player2, player3;

var tileUp = tileHeight / 3;

const ME = 0, RIGHT = 1, OPPO = 2, LEFT = 3;

var tileMask = new Sprite();
var tileRect = new Laya.Rectangle(0, 0, tileWidth, tileHeight);

class Tile {
	constructor(){
		this.sp = new Sprite();
		
	}
	
}

class Player {
    constructor(socket, sp, pos) {
		this.socket = socket;
        this.name = '';
		this.sp = sp;
        this.handTiles = new Array();
        this.displayTiles = new Array();
        this.discardTiles = new Array();
        this.score = 0;
        this.wind = 0;
        this.pos = pos;

        this.handTilesSp = new Sprite();
        this.displayTilesSp = new Sprite();
        this.discardTilesSp = new Sprite();
        this.sp.addChildren(this.handTilesSp, this.displayTilesSp, this.discardTilesSp);
		
		tileMask.graphics.drawRect(0, 0, tileWidth, tileHeight, '#000');

        switch (pos) {
            case ME:
                this.handTilesSp.x = tileWidth * 3;
                this.handTilesSp.y = stageHeight - tileHeight - tileHeight / 5;

                this.discardTilesSp.x = stageWidth / 2 - scoreboardSide / 2;
                this.discardTilesSp.y = stageHeight / 2 + scoreboardSide / 2 - subTileHeight;
                break;

            case RIGHT:
                this.handTilesSp.rotation = -90;
                this.handTilesSp.x = stageWidth - subTileHeight - subTileHeight / 5;
                this.handTilesSp.y = stageHeight - subTileWidth * 3 - tileHeight;
                this.handTilesSp.scale(subTileWidth / tileWidth, subTileHeight / tileHeight);

                this.discardTilesSp.rotation = -90;
                this.discardTilesSp.x = stageWidth / 2 + scoreboardSide / 2;
                this.discardTilesSp.y = stageHeight / 2 + scoreboardSide / 2 - subTileHeight;
                break;

            case OPPO:
                this.handTilesSp.rotation = 180;
                this.handTilesSp.x = stageWidth - tileWidth * 3 * 2;
                this.handTilesSp.y = subTileHeight + subTileHeight / 5;
                this.handTilesSp.scale(subTileWidth / tileWidth, subTileHeight / tileHeight);

                this.discardTilesSp.rotation = 180;
                this.discardTilesSp.x = stageWidth / 2 + scoreboardSide / 2;
                this.discardTilesSp.y = stageHeight / 2 - scoreboardSide / 2 - subTileHeight;
                break;

            case LEFT:
                this.handTilesSp.rotation = 90;
                this.handTilesSp.x = subTileHeight + subTileHeight / 5;
                this.handTilesSp.y = subTileWidth * 3;
                this.handTilesSp.scale(subTileWidth / tileWidth, subTileHeight / tileHeight);

                this.discardTilesSp.rotation = 90;
                this.discardTilesSp.x = stageWidth / 2 - scoreboardSide / 2;
                this.discardTilesSp.y = stageHeight / 2 - scoreboardSide / 2 - subTileHeight;
                break;
        }
    }
    deal(tiles) {
        //发牌
        if (tiles.length > 13) { console.error('服务器错误！'); return; }
        var i;
        //var tiles_2d = Laya.loader.getRes(tilesUrl_2d);
        for (i in tiles) {
            var newTile = new Sprite();
			newTile.name = tiles[i];
			if(tiles[i]%10==0){//是赤宝牌
				this.handTiles.push(tiles[i]+5);
				//newTile.name = tiles[i]+5;
				newTile.red = true;
			}else{//非赤宝牌
				this.handTiles.push(tiles[i]);
				//newTile.name = tiles[i];
				newTile.red = false;
			}
            this.handTilesSp.addChild(newTile);
            newTile.pos(tileWidth * i, 0);
            newTile.graphics.drawTexture(tiles_2d, -tiles[i] % 10 * tileWidth, -floor(tiles[i] / 10 - 1) * tileHeight, tileWidth * 10, tileHeight * 4);
            newTile.size(tileWidth, tileHeight + tileUp);
			newTile.scrollRect = tileRect;
			newTile.mask = tileMask;
			if(this.pos==ME){
				newTile.on('mouseover', newTile, function () {
					this.y = -tileUp;
					touchedTile = this;
					this.scrollRect.height = tileHeight + tileUp;
				});
				newTile.on('mouseout', newTile, function () {
					this.y = 0;
					this.scrollRect.height = tileHeight;
				});
				newTile.on('click', newTile, function () {
					touchedTile = this;
				});
				newTile.on('click', this, this.tileClick);
			}
        }
		console.log(this.handTilesSp.getChildByName(11));
    }
	sort(){
		var fromList = [...this.handTiles];
		var fromSp = new Array(this.handTiles);
		var i, j, node;
		for(i in this.handTiles){
			fromSp[i] = this.handTilesSp.getChildAt(i);
		}
		this.handTiles.sort();
		for(i in this.handTiles){
			j = fromList.indexOf(this.handTiles[i]);
			fromList[j] = null;
			node = fromSp[j];
			if(node.x != tileWidth*i){
				Laya.Tween.to(node, {x:tileWidth*i}, 500, null, null, 0);
				this.handTilesSp.setChildIndex(node, i);
			}
		}
	}
    tileOver() {

    }
    tileOut() {

    }
    tileClick() {
        this.handTilesSp.removeChild(touchedTile);
        this.discardTilesSp.addChild(touchedTile);

        this.handTiles.pop(touchedTile.name);
        this.discardTiles.push(touchedTile.name);

        touchedTile.off('mouseover');
        touchedTile.off('mouseout');
        touchedTile.off('click');

        touchedTile.scale(subTileWidth / tileWidth, subTileHeight / tileHeight).pos((this.discardTiles.length - 1) % 6 * subTileWidth, floor((this.discardTiles.length - 1) / 6) * subTileHeight);

        this.socket.emit('act', { act: 'discard', data: touchedTile.name });
    }
    naki(tiles, tile, pos, act) {
        var nakiSP = new Sprite();
        switch (pos) {
            case LEFT:
            case RIGHT:
            case OPPO:
                null
        }
    }
    anGang() {

    }
    jiaGang() {

    }
	start(){
		this.sort();
	}
}

class MJ {
    constructor(socket, name) {
        this.sp = new Sprite();
        this.sp.name = name;
        stage.addChild(this.sp);
        this.socket = socket;
        this.name = name;

        this.player0 = new Player(this.socket, this.sp, ME);
        this.player1 = new Player(this.socket, this.sp, RIGHT);
        this.player2 = new Player(this.socket, this.sp, OPPO);
        this.player3 = new Player(this.socket, this.sp, LEFT);
		Laya.loader.load(tilesUrl_2d, Laya.Handler.create(this, () => {
			tiles_2d = Laya.loader.getRes(tilesUrl_2d);
			this.socket.emit('ready_ok', '');
		}));

		this.socket.on('ready_ok',(msg)=>{
			//this.player0.deal(msg['hand']);
			
			this.player0.deal(testTiles);
			this.player1.deal(testTiles);
			this.player2.deal(testTiles);
			this.player3.deal(testTiles);
		});
    }
}