function getPoly(points, width, height, color){
	var newPoly = new Sprite();
	newPoly.pivotX = width/2;
	newPoly.pivotY = height/2;
	newPoly.graphics.drawPoly(0, 0, points, color, "#aa0", 0);
	hitArea = new Laya.HitArea();
	hitArea.hit = newPoly.graphics;
	newPoly.hitArea = hitArea;
	return newPoly;
}
function getPolyButton(points, width, height, colors, click){
	var newButton = new Sprite();
	var lineColor = "#aaa";
	var lineWidth = 8;
	newButton.graphics.drawPoly(0, 0, points, colors[0], lineColor, lineWidth);
	hitArea = new Laya.HitArea();
	hitArea.hit = newButton.graphics;
	newButton.hitArea = hitArea;
	newButton.pivotX = width/2;
	newButton.pivotY = height/2;
	newButton.on('mouseover', newButton, function(){
		this.graphics.drawPoly(0, 0, points, colors[1], lineColor, lineWidth);
		Laya.Tween.to(this,{scaleX:0.9,scaleY:0.9},300,Laya.Ease.strongIn,null,0);
	});
	newButton.on('mouseout', newButton, function(){
		this.graphics.drawPoly(0, 0, points,colors[0], lineColor, lineWidth);
		Laya.Tween.to(this,{scaleX:1,scaleY:1},300,Laya.Ease.strongOut,null,0);
	});
	newButton.on('mousedown', newButton, function(){
		this.graphics.drawPoly(0, 0, points, colors[2], lineColor, lineWidth);
	});
	newButton.on('mouseup', newButton, function(){
		this.graphics.drawPoly(0, 0, points, colors[1], lineColor, lineWidth);
	});
	newButton.on('click', newButton, function(){
		click();
	});
	return newButton;
}
function getHexagon(width, color){
	var height = width * sqrt(3)/2;
	var newHexagon = getPoly([width/4,0, width*3/4,0, width,height/2, width*3/4,height, width/4,height, 0,height/2], width, height, color);
	return newHexagon;
}
function getHexagonButton(width, colors, click, label, name){
	var height = width * sqrt(3)/2;
	var newButton = getPolyButton([width/4,0, width*3/4,0, width,height/2, width*3/4,height, width/4,height, 0,height/2], width, height, colors, click);
	if(label.length==2){
		var char1 = new Laya.Text();
		char1.text = label[0];
		char1.fontSize = width/3;
		char1.x = width/8;
		char1.y = height/8;
		var char2 = new Text();
		char2.text = label[1];
		char2.fontSize = width/3;
		char2.x = width-char2.fontSize-width/8;
		char2.y = height-char2.fontSize-height/8;
		newButton.addChild(char1);
		newButton.addChild(char2);
	}else if(label.length==3){
		var char1 = new Text();
		char1.text = label[0];
		char1.fontSize = width/3.3;
		char1.x = width/4;
		char1.y = height/20;
		var char2 = new Laya.Text();
		char2.text = label[1];
		char2.fontSize = width/3.3;
		char2.x = width-char2.textWidth-width/6;
		char2.y = height/2-char2.textHeight/2;
		var char3 = new Laya.Text();
		char3.text = label[2];
		char3.fontSize = width/3.3;
		char3.x = width/4;
		char3.y = height-char2.textHeight-height/20;
		newButton.addChild(char1);
		newButton.addChild(char2);
		newButton.addChild(char3);
	}else{
		var newLabel = new Text();
		newLabel.text = label;
		newLabel.fontSize = width/6;
		newLabel.y = height/2-newLabel.fontSize/2;
		newButton.addChild(newLabel);
	}
	newButton.name = name;
	return newButton;
}
function tessellate(parent, floorWidth, floorHeight, width, color){
	var height = width * sqrt(3)/2;
	for(var j=0;j<=Math.ceil(floorHeight/(height/2));j++){
		for(var i=0;i<Math.ceil(floorWidth/(width*3/2));i++){
			var hexagon = getHexagon(width, color);
			var x,y; 
			if(j%2==0){x=width*3/4+i*width*3/2;}else{x=i*width*3/2;}
			y=j*height/2;
			hexagon.pos(x, y);
			parent.addChild(hexagon);
		}
	}
}
function transPolys(fromSp, toSp){
	toSp.visible = true;
	var polys = fromSp.getChildByName('polys');
	var cl = null;
	for(var i=0; i<polys.numChildren; i++){
		if(i==polys.numChildren-1){cl=new Handler(this, ()=>{fromSp.visible=false;});}
		Laya.Tween.to(polys.getChildAt(i),{scaleX:0,scaleY:0},1000,Laya.Ease.strongIn,cl,distance(polys.parent, polys.getChildAt(i))>>2);
	}
}
function transSlip(fromSp, toSp){
	toSp.visible = true;
	var polys = toSp.getChildByName('polys');
	toSp.x = stageWidth;
	for(var i=0; i<polys.numChildren; i++){
		polys.getChildAt(i).scale(1, 1);
	}
	Laya.Tween.to(toSp, {x:0}, 1000, Laya.Ease.strongInOut,new Handler(this, ()=>{fromSp.visible=false;}),0);
}
function distance(node1, node2){
	return sqrt((node1.x-node2.x)**2+(node1.y-node2.y)**2);
}
function indexInit(){
	var polys = new Sprite();
	polys.name = "polys";
	indexSp.addChild(polys);
	stage.addChild(indexSp);
	
	tessellate(polys, stageWidth, stageHeight, 200, "#aaa");
	var width = 200, height = width * sqrt(3)/2;
	var mjButton = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{transPolys(indexSp, gameIndexSp);}, "麻将", 'mj');
	mjButton.pos(width/2, height/2);
	var fiveButton = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{transPolys(indexSp, gameIndexSp);}, "五子棋", 'five');
	fiveButton.pos(width/2, height/2);
	var sixButton = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{transPolys(indexSp, gameIndexSp);}, "六子棋", 'six');
	sixButton.pos(width/2, height/2);
	var goButton = getHexagonButton(width, ["#abc","#bca","#cab"], ()=>{transPolys(indexSp, gameIndexSp);}, "围棋", 'go');
	goButton.pos(width/2, height/2);

	polys.getChildAt(3*7+1).addChild(mjButton);
	polys.getChildAt(2*7+1).addChild(fiveButton);
	polys.getChildAt(4*7+1).addChild(sixButton);
	polys.getChildAt(3*7+2).addChild(goButton);
}