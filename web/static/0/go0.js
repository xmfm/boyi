$(function(){
    var Sprite = Laya.Sprite;
	var boardSp = new Sprite();
	var stoneSp = new Sprite();
	
	var myTurn = false;
	var grid = 19;//路数
    if(window.location.pathname=='/five'){grid=15;}

	var stageWidth = 1920, stageHeight = 1080;
	var boardTop = stageHeight/20, boardLeft = boardTop, boardBottom = stageHeight-boardTop, boardRight = stageHeight-boardLeft, gridStep = (boardRight-boardLeft)/(grid-1), stoneR = gridStep*3/7;//棋盘四周，棋盘线距离，棋子半径
	var buttonWidth, buttonHeight;
	var notation = new Array();//棋谱
	var board = new Array();//棋盘
	for(var i=0;i<grid;i++){
		board[i]=new Array();
		for(var j=0;j<grid;j++){
			board[i][j]=0;
		}
	}
	
	const socket = io(window.location.protocol+'//'+window.location.host+window.location.pathname);//创建连接

	socket.on('connect',function(msg){
		init();
	});
	socket.on('disconnect',function(msg){
		alert('连接已断开！');
	});
	socket.on('opponent', function(msg) {
		if(!addStone(msg['move'][0], msg['move'][1])){
			alert('服务器错误！');
		}
		myTurn = true;
    });
	socket.on('history', function(msg) {
		for(i of msg['moves']){
			addStone(i[0], i[1]);
		}
		if(notation.length%2){
			myTurn = true;
		}
    });
    socket.on('finish', function(msg) {
        if(msg['winer'] == 1){
            alert('黑棋胜');
        }else{
            alert('白棋胜');
        }
    });
    (function(){
        //初始化舞台
        Laya.init(stageWidth, stageHeight);
		Laya.stage.bgColor  = '#aaaaaa';
		Laya.stage.alignH = 'center';
		Laya.stage.alignV = 'center';
		Laya.stage.frameRate = 'mouse';
		Laya.stage.scaleMode = 'showall';
		Laya.stage.addChild(boardSp);
		Laya.stage.addChild(stoneSp);
		drawBoard();
		Laya.stage.addChild(newButton(1130, 540, 200, 50, '重新开始', reStart));
		Laya.stage.addChild(newButton(1350, 540, 200, 50, '悔棋', reStart));
		Laya.stage.addChild(newButton(1570, 540, 200, 50, '开始', start));
		Laya.stage.on('click', this, move);
    })();
	function drawBoard(){
		//画棋盘线
		var sp = boardSp;
		for(var i=0; i < grid; i++){
			sp.graphics.drawLine(boardLeft, boardTop+i*gridStep, boardRight, boardTop+i*gridStep, "#000000", 2);
			sp.graphics.drawLine(boardLeft+i*gridStep, boardTop, boardLeft+i*gridStep, boardBottom, "#000000", 2);
		}
		//画星
		boardMid = boardTop+Math.floor(grid/2)*gridStep;
		subTop = boardTop+3*gridStep;
		subLeft = boardLeft+3*gridStep;
		subBottom = boardBottom-3*gridStep;
		subRight = boardRight-3*gridStep;
		function drawStar(x, y){
			sp.graphics.drawCircle(x, y, 5, '#000000');
		}
		drawStar(subLeft, subTop);
		drawStar(subRight, subTop);
		drawStar(subLeft, subBottom);
		drawStar(subRight, subBottom);
		drawStar(boardMid, boardMid);
        if(grid>=19){
           	drawStar(subLeft, boardMid);
		    drawStar(subRight, boardMid);
	    	drawStar(boardMid, subTop);
	    	drawStar(boardMid, subBottom);
        }
	}
	function drawStone(x, y, color){
		//画棋子
		stoneSp.graphics.drawCircle(boardLeft+x*gridStep, boardTop+y*gridStep, stoneR, ['#ffffff', '#000000'][Number(color)]);
	}
	function addStone(x, y){//落子
		if(x>=0&&x<grid&&y>=0&&y<grid&&board[x][y]==0){
			notation.push([x, y]);
			board[x][y]=1;
			drawStone(x, y, notation.length%2);
			return true;
		}
		return false;
	}
	function newButton(x, y, width, height, label, fn){
		newBtn = new Laya.Button();
		newBtn.label = label;
		newBtn.labelSize = height;
		newBtn.pos(x, y);
		newBtn.size(width, height);
		//newBtn.clickHandler = Laya.Handler.create(this, function(){fn();});
		newBtn.on('click', this, fn);
		return newBtn;
	}
	function move(e){
		var x = Laya.stage.mouseX;
		var y = Laya.stage.mouseY;
		i = Math.floor((x - boardLeft + gridStep/2) / gridStep);
		j = Math.floor((y - boardTop + gridStep/2) / gridStep);
		if(myTurn && addStone(i, j)){
			socket.emit('player', {move: [i, j]});
			myTurn = false;
		}
	}
	function start(){
		init();
		socket.emit('start', {data: 'start'});
	}
	function reStart(){
		init();
		socket.emit('start',{data: 'reStart'});
	}
	function init(){
		stoneSp.graphics.clear();
		var myTurn = false;
		notation = new Array();//棋谱
		board = new Array();//棋盘
		for(var i=0;i<grid;i++){
			board[i]=new Array();
			for(var j=0;j<grid;j++){
				board[i][j]=0;
			}
		}
	}
})