function go1IndexInit(){
	boardSp = new Sprite();
	stoneSp = new Sprite();
	
	myTurn = false;
	grid = 19;//路数
    grid=15;

	boardTop = stageHeight/20, boardLeft = boardTop, boardBottom = stageHeight-boardTop, boardRight = stageHeight-boardLeft, gridStep = (boardRight-boardLeft)/(grid-1), stoneR = gridStep*3/7;//棋盘四周，棋盘线距离，棋子半径
	//buttonWidth, buttonHeight;
	notation = new Array();//棋谱
	board = new Array();//棋盘
	for(var i=0;i<grid;i++){
		board[i]=new Array();
		for(var j=0;j<grid;j++){
			board[i][j]=0;
		}
	}
	//boardInit();
	fiveSocket.on('start', function(msg){
		transPolys(gameIndexSp, go1Sp);
		console.log('re');
		fiveSocket.emit('ready_ok', {ok: 'ok'});
		if(msg['color']==1){
			myTurn = true;
		}
	});
	fiveSocket.on('oppo', function(msg) {
		console.log('opp');
		if(!addStone(msg['move'][0], msg['move'][1])){
			console.log('服务器错误！');
		}
		myTurn = true;
    });
	fiveSocket.on('history', function(msg) {
		for(i of msg['moves']){
			addStone(i[0], i[1]);
		}
		if(notation.length%2){
			myTurn = true;
		}
		transPolys(gameIndexSp, go1Sp);
    });
    fiveSocket.on('finish', function(msg) {
        if(msg['winer'] == 1){
            alert('黑棋胜');
        }else{
            alert('白棋胜');
        }
		myTurn = false;
    });
    
	go1Sp.addChild(boardSp);
	go1Sp.addChild(stoneSp);
	drawBoard();
	//go1Sp.addChild(newButton(1130, 540, 200, 50, '重新开始', go1ReStart));
	//go1Sp.addChild(newButton(1350, 540, 200, 50, '悔棋', go1ReStart));
	//go1Sp.addChild(newButton(1570, 540, 200, 50, '开始', go1Start));
	//boardSp.on('click', boardSp, move);
	//go1Sp.on('click', go1Sp, ()=>{console.log('click');});
	boardSp.on('click', boardSp, move);
	
	boardSp.size(stageWidth, stageHeight);
	stoneSp.size(stageWidth, stageWidth);
	
	go1Sp.visible = false;
	go1Sp.zOrder = -3;
	stage.addChild(go1Sp);
}    
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
		console.log('add');
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
function move(){
	var x = boardSp.mouseX;
	var y = boardSp.mouseY;
	console.log(x);
	console.log(y);
	console.log(myTurn);
	
	i = Math.floor((x - boardLeft + gridStep/2) / gridStep);
	j = Math.floor((y - boardTop + gridStep/2) / gridStep);
	console.log(i);
	console.log(j);
	if(myTurn && addStone(i, j)){
		fiveSocket.emit('player', {move: [i, j]});
		myTurn = false;
	}
}
function go1Start(){
	boardInit();
	fiveSocket.emit('start', {data: 'start'});
}
function go1ReStart(){
	boardInit();
	fiveSocket.emit('start',{data: 'reStart'});
}
function boardInit(){
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