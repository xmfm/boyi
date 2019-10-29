function gameIndexInit(){
	var polys = new Sprite();
	polys.name = "polys";
	gameIndexSp.visible = false;
	gameIndexSp.addChild(polys);
	stage.addChild(gameIndexSp);
	gameIndexSp.zOrder = -1;
	
	tessellate(polys, stageWidth, stageHeight, 200, "#999");
	
	var width = 200, height = width * sqrt(3)/2;
	var button1 = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{gameStart('dani');}, "段位");
	button1.pos(width/2, height/2);
	var button2 = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{gameStart('compete');}, "赛季");
	button2.pos(width/2, height/2);
	var button3 = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{gameStart('robot');}, "人机");
	button3.pos(width/2, height/2);
	var button4 = getHexagonButton(width, ["#456","#564","#645"], ()=>{transSlip(gameIndexSp, indexSp)}, "退出");
	button4.pos(width/2, height/2);

	polys.getChildAt(3*7+1).addChild(button1);
	polys.getChildAt(2*7+1).addChild(button2);
	polys.getChildAt(4*7+1).addChild(button3);
	polys.getChildAt(10*7+5).addChild(button4);
	
	fiveSocket = io(window.location.protocol+'//'+window.location.host+'/five');
}
function gameStart(button){
	fiveSocket.emit('ready', {type: button, data: 'ok'});
	console.log('cl');
}