$(function(){
	function canvasInt(){
		stageWidth = 1920, stageHeight = 1080;//牌桌大小
	
		Laya.init(stageWidth, stageHeight);
		Laya.stage.bgColor  = '#999';
		Laya.stage.alignH = 'center';
		Laya.stage.alignV = 'center';
		Laya.stage.frameRate = 'mouse';
		Laya.stage.scaleMode = 'showall';
		Laya.stage.screenMode = "horizontal";
		Laya.Stat.show(0,0);
		
		stage = Laya.stage;
		Sprite = Laya.Sprite;
		Text = Laya.Text;
		TextInput = Laya.TextInput;
		Handler = Laya.Handler;
		
		sqrt = Math.sqrt;
		ceil = Math.ceil;
		
		indexSp = new Sprite();
		gameIndexSp = new Sprite();
		go1Sp = new Sprite();
	}
	function loginInt(){
		loginSp = new Sprite();
		loginSp.width = stageWidth/5;
		loginSp.height = stageHeight/2;
		loginSp.pivotX = loginSp.width/2;
		loginSp.pivotY = loginSp.height/2;
		loginSp.x = stageWidth/2;
		loginSp.y = stageHeight/2;
		stage.addChild(loginSp);
		
		var nameInput = new TextInput();
		loginSp.addChild(nameInput);
		nameInput.width = stageWidth/5;
		nameInput.height = stageHeight/20;
		nameInput.maxChars = 10;
		nameInput.prompt = '昵称';
		nameInput.promptColor = '#888';
		nameInput.fontSize = nameInput.height*4/5;
		nameInput.bgColor = '#aaa';
		
		var pwInput = new TextInput();
		loginSp.addChild(pwInput);
		pwInput.width = stageWidth/5;
		pwInput.height = stageHeight/20;
		pwInput.y = stageHeight/10;
		pwInput.maxChars = 10;
		pwInput.prompt = '密码';
		pwInput.promptColor = '#888';
		pwInput.type = 'password';
		pwInput.fontSize = pwInput.height*4/5;
		pwInput.bgColor = '#aaa';
		
		var loginButton = new Text();
		loginSp.addChild(loginButton);
		loginButton.text = '登入';
		loginButton.fontSize = stageHeight/25;
		loginButton.width = loginSp.width;
		loginButton.pivotX = loginSp.pivotX;
		loginButton.x = loginSp.width/2;
		loginButton.y = stageHeight/5;
		loginButton.align = 'center';
		loginButton.color = "#abc";
		loginButton.on('mouseover', loginButton, function(){this.color="#bca";});
		loginButton.on('mouseout', loginButton, function(){this.color="#abc";});
		loginButton.on('mousedown', loginButton, function(){this.color="#cab";});
		loginButton.on('mouseup', loginButton, function(){this.color="#bca";});
		loginButton.on('click', this, ()=>{loginPost(nameInput.text, pwInput.text);});
	}
	function loginPost(id, pw){
		loginSocket.emit('login', {username:id, password:pw});
	}
	
	loginSocket = io(window.location.protocol+'//'+window.location.host);
	loginSocket.on('connect', function(){
		canvasInt();
	});
	loginSocket.on('logined', function(msg){
		if(msg['logined']=='yes'){
			indexInit();
			gameIndexInit();
			go1IndexInit();
		}else{
			loginInt();
		}
	});
	loginSocket.on('disconnect', ()=>{alert('连接已断开');});
	loginSocket.on('login', function(msg){
		if(msg['login']=='ok'){
			loginSp.visible = false;
			
			indexInit();
			gameIndexInit();
			go1IndexInit();
			
			$.post('/', {user_id: msg['user_id']}, function(data,status){alert(data['ok']);})
		}else{
			
		}
	});
})