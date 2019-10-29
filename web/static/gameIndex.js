class GameIndex {
    constructor(name) {
        this.sp = new Sprite();
        this.name = name;
        var polys = new Sprite();
        polys.name = "polys";
        this.sp.visible = false;
        this.sp.addChild(polys);
        this.sp.name = name+'Index';
        stage.addChild(this.sp);
        this.sp.zOrder = -1;

        tessellate(polys, stageWidth, stageHeight, 200, "#999");

        var width = 200, height = width * sqrt(3) / 2;
        var button1 = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => { this.ready('dani'); }, "段位", 'dani');
        button1.pos(width / 2, height / 2);
        var button2 = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => { this.ready('compete'); }, "赛季", 'compete');
        button2.pos(width / 2, height / 2);
        var button3 = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => { this.ready('robot'); }, "人机", 'robot');
        button3.pos(width / 2, height / 2);
        var button4 = getHexagonButton(width, ["#456", "#564", "#645"], () => { transSlip(name+'Index', 'index') }, "退出", 'exit');
        button4.pos(width / 2, height / 2);

        polys.getChildAt(3 * 7 + 1).addChild(button1);
        polys.getChildAt(2 * 7 + 1).addChild(button2);
        polys.getChildAt(4 * 7 + 1).addChild(button3);
        polys.getChildAt(10 * 7 + 5).addChild(button4);

        this.socket = io('/' + name);
        this.socket.on('start', (msg)=>{
            if (this.name == 'mj') {
                this.game = new MJ(this.socket, this.name);
                transPolys(this.sp.name, this.name, ()=>{this.game.player0.start();});
				//this.socket.emit('ready_ok', { ok: 'ok' });
            } else {
                this.game = new Go(this.socket, this.name);
                transPolys(this.sp.name, this.name);
                //this.socket.emit('ready_ok', { ok: 'ok' });
                if (msg['color'] == 1) {
                    this.game.myTurn = true;
                }
            }
        });
    }
    start(msg) {
        if (this.name == 'mj') {
            this.game = new MJ(this.socket, this.name);
            transPolys(this.sp.name, this.name);
        } else {
            this.game = new Go(this.socket, this.name);
            transPolys(this.sp.name, this.name);
            this.socket.emit('ready_ok', { ok: 'ok' });
            if (msg['color'] == 1) {
                this.game.myTurn = true;
            }
        }
    }
    ready(button) {
        this.socket.emit('ready', { type: button, data: 'ok' });
        console.log('cl');
    }
}