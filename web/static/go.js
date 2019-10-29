class Go {
    constructor(socket, name, grid) {
        this.sp = new Sprite();
        this.boardSp = new Sprite();
        this.stoneSp = new Sprite();

        this.socket = socket;

        this.myTurn = false;
        if (grid) {
            this.grid = grid;
        } else if (name == 'five') {
            this.grid = 15;
        } else {
            this.grid = 19;
        }

        this.boardTop = stageHeight / 20; this.boardLeft = this.boardTop; this.boardBottom = stageHeight - this.boardTop; this.boardRight = stageHeight - this.boardLeft; this.gridStep = (this.boardRight - this.boardLeft) / (this.grid - 1); this.stoneR = this.gridStep * 3 / 7;//棋盘四周，棋盘线距离，棋子半径
        //buttonWidth, buttonHeight;
        this.notation = new Array();//棋谱
        this.board = new Array(this.grid).fill().map(x=>Array(this.grid).fill(0));//棋盘
/*         for (var i = 0; i < this.grid; i++) {
            this.board[i] = new Array();
            for (var j = 0; j < this.grid; j++) {
                this.board[i][j] = 0;
            }
        } */
        
        this.socket.on('oppo', (msg)=> {
            console.log('opp');
            if (!this.addStone(msg['move'][0], msg['move'][1])) {
                console.log('服务器错误！');
            }
            this.myTurn = true;
        });
        this.socket.on('history', function (msg) {
            for (i of msg['moves']) {
                this.addStone(i[0], i[1]);
            }
            if (this.notation.length % 2) {
                this.myTurn = true;
            }
            transPolys(name.substr(0, name.length-5), name);
        });
        this.socket.on('finish', function (msg) {
            if (msg['winer'] == 1) {
                console.log('黑棋胜');
            } else {
                console.log('白棋胜');
            }
            this.myTurn = false;
        });

        this.sp.addChild(this.boardSp);
        this.sp.addChild(this.stoneSp);
        this.drawBoard();
        //this.sp.addChild(newButton(1130, 540, 200, 50, '重新开始', this.reStart));
        //this.sp.addChild(newButton(1350, 540, 200, 50, '悔棋', this.reStart));
        //this.sp.addChild(newButton(1570, 540, 200, 50, '开始', this.start));
        //this.boardSp.on('click', this.boardSp, this.move);
        //this.sp.on('click', this.sp, ()=>{console.log('click');});
        this.boardSp.on('click', this, this.move);

        this.boardSp.size(stageWidth, stageHeight);
        this.stoneSp.size(stageWidth, stageWidth);

        this.sp.visible = false;
        this.sp.zOrder = -3;
        this.sp.name = name;
        stage.addChild(this.sp);
		
		this.socket.emit('ready_ok', { ok: 'ok' });
    }
    drawBoard() {
        //画棋盘线
        var sp = this.boardSp;
        for (var i = 0; i < this.grid; i++) {
            sp.graphics.drawLine(this.boardLeft, this.boardTop + i * this.gridStep, this.boardRight, this.boardTop + i * this.gridStep, "#000000", 2);
            sp.graphics.drawLine(this.boardLeft + i * this.gridStep, this.boardTop, this.boardLeft + i * this.gridStep, this.boardBottom, "#000000", 2);
        }
        //画星
        var boardMid = this.boardTop + Math.floor(this.grid / 2) * this.gridStep;
        var subTop = this.boardTop + 3 * this.gridStep;
        var subLeft = this.boardLeft + 3 * this.gridStep;
        var subBottom = this.boardBottom - 3 * this.gridStep;
        var subRight = this.boardRight - 3 * this.gridStep;
        function drawStar(x, y) {
            sp.graphics.drawCircle(x, y, 5, '#000000');
        }
        drawStar(subLeft, subTop);
        drawStar(subRight, subTop);
        drawStar(subLeft, subBottom);
        drawStar(subRight, subBottom);
        drawStar(boardMid, boardMid);
        if (this.grid >= 19) {
            drawStar(subLeft, boardMid);
            drawStar(subRight, boardMid);
            drawStar(boardMid, subTop);
            drawStar(boardMid, subBottom);
        }
    }
    drawStone(x, y, color) {
        //画棋子
        this.stoneSp.graphics.drawCircle(this.boardLeft + x * this.gridStep, this.boardTop + y * this.gridStep, this.stoneR, ['#ffffff', '#000000'][Number(color)]);
    }
    addStone(x, y) {//落子
        if (x >= 0 && x < this.grid && y >= 0 && y < this.grid && this.board[x][y] == 0) {
            console.log('add');
            this.notation.push([x, y]);
            this.board[x][y] = 1;
            this.drawStone(x, y, this.notation.length % 2);
            return true;
        }
        return false;
    }
    newButton(x, y, width, height, label, fn) {
        var newBtn = new Laya.Button();
        newBtn.label = label;
        newBtn.labelSize = height;
        newBtn.pos(x, y);
        newBtn.size(width, height);
        //newBtn.clickHandler = Laya.Handler.create(this, function(){fn();});
        newBtn.on('click', this, fn);
        return newBtn;
    }
    move() {
        var x = this.boardSp.mouseX;
        var y = this.boardSp.mouseY;
        console.log(x);
        console.log(y);
        console.log(this.myTurn);

        var i = Math.floor((x - this.boardLeft + this.gridStep / 2) / this.gridStep);
        var j = Math.floor((y - this.boardTop + this.gridStep / 2) / this.gridStep);
        console.log(i);
        console.log(j);
        if (this.myTurn && this.addStone(i, j)) {
            this.socket.emit('player', { move: [i, j] });
            this.myTurn = false;
        }
    }
    start() {
        this.boardInit();
        this.socket.emit('start', { data: 'start' });
    }
    reStart() {
        this.boardInit();
        this.socket.emit('start', { data: 'reStart' });
    }
    boardInit() {
        this.stoneSp.graphics.clear();
        var myTurn = false;
        this.notation = new Array();//棋谱
		this.board = new Array(this.grid).fill().map(x=>Array(this.grid).fill(0));
    }
}