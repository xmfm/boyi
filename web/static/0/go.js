$(function(){
    $('body').prepend('<canvas>');
	var canvas = $('canvas')[0];
	var ctx = canvas.getContext('2d');
	var ev2 = event || window.event;

	var myTurn = true;
	var grid = 19;//路数
    if(window.location.pathname=='/five'){grid=15;}

	var canvasTop, canvasLeft;
	var top, left, bottom, right, step, stoneR;//棋盘四周，棋盘线距离，棋子半径
	var buttonWidth, buttonHeight;
	var notation = new Array();//棋谱
	var board = new Array();//棋盘
	for(var i=0;i<grid;i++){
		board[i]=new Array();
		for(var j=0;j<grid;j++){
			board[i][j]=0;
		}
	}

	window.onload=window.onresize=redraw;

	const socket = io(window.location.protocol+'//'+window.location.host+window.location.pathname);//创建连接

	socket.on('opponent', function(msg) {
		if(!addStone(msg['move'][0], msg['move'][1])){
			alert('服务器错误！');
		}
		myTurn = true;
    });
	socket.on('history', function(msg) {
		for(i in msg['moves']){
			addStone(msg['moves'][i][0], msg['moves'][i][1]);
		}
    });

	function redraw(){//重绘
		canvas.width = Math.min(window.innerWidth, window.innerHeight*16/9);
		canvas.height = canvas.width*9/16;
		canvasTop = (window.innerHeight-canvas.height)/2;
		canvasLeft = (window,innerWidth-canvas.width)/2;
		canvas.style.marginTop = canvas.style.marginBottom = canvasTop+'px';
		canvas.style.marginLeft = canvas.style.marginRight = canvasLeft+'px';
		top = canvas.height/20;
		left = top;
		bottom = canvas.height - top;
		right = bottom;
		step = (canvas.height - left - left)/(grid-1);
		stoneR = step * 3 / 7;
		drawBoard();
	}
	function drawBoard(){
		//画棋盘线
		ctx.beginPath();
        ctx.clearRect(0,0,canvas.height,canvas.height);
        ctx.fillStyle = "#aaaaaa";
        ctx.fillRect(0,0,canvas.height,canvas.height);
		for(var i=0; i < grid; i++){
			ctx.moveTo(top + i * step, left);
            ctx.lineTo(top + i * step, right);
            //ctx.stroke();
            ctx.moveTo(top, left + i * step);
            ctx.lineTo(bottom, left + i * step);
            //ctx.stroke();
		}
		ctx.stroke();
		//画星
		ctx.fillStyle = "#000000";
		mid = top+Math.floor(grid/2)*step;
		subTop = top+3*step;
		subLeft = left+3*step;
		subBottom = bottom-3*step;
		subRight = right-3*step;
		function drawStar(x, y){
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2*Math.PI);
			ctx.fill();
		}

		drawStar(subLeft, subTop);
		drawStar(subRight, subTop);
		drawStar(subLeft, subBottom);
		drawStar(subRight, subBottom);
		drawStar(mid, mid);
        if(grid>=19){
           	drawStar(subLeft, mid);
		    drawStar(subRight, mid);
	    	drawStar(mid, subTop);
	    	drawStar(mid, subBottom);
        }
		//画棋子
		for(i in notation){
			drawStone(notation[i][0], notation[i][1], i%2)
		}
	}
	function drawStone(x, y, color){//画棋子
		if(color){ctx.fillStyle = "#ffffff";}else{ctx.fillStyle = "#000000";}
		ctx.beginPath();
		ctx.arc(left+x*step, top+y*step, stoneR, 0, 2*Math.PI);
		ctx.fill();
	}
	function addStone(x, y){//落子
		if(x>=0&&x<grid&&y>=0&&y<grid&&board[x][y]==0){
			notation.push([x, y]);
			board[x][y]=1;
			drawStone(x, y, (notation.length-1)%2);
			return true;
		}
		return false;
	}
	function addButton(subX, subY, width, height, txt, func){
		ctx.fillRect(canvasLeft+canvas.height+subX, canvasTop+subY, width, height);
		ctx.fillText(txt, canvasLeft+canvas.height+subX, canvasTop+subY);
		canvas.addEventListener('click', function(e){
			var x = e.pageX-canvasLeft-canvas.height;
			var y = e.pageY-canvasTop;
			if(x>subX && x<subX+width && y>subY && y<subY+height){
				func();
			}
		});
	}
	canvas.addEventListener('click', function(e){
		var x = e.pageX - canvasLeft;
		var y = e.pageY - canvasTop;

		i = Math.floor((x - left + step/2) / step);
		j = Math.floor((y - top + step/2) / step);
		if(myTurn && addStone(i, j)){
			socket.emit('player', {move: [i, j]});
			myTurn = false;
		}
	});
})