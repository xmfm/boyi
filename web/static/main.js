var prefix = '<script src=\"/static/';
var suffix = '.js\"></script>';
$('body').append(prefix+'tools'+suffix, prefix+'login'+suffix, prefix+'index'+suffix,
                 prefix+'gameIndex'+suffix, prefix+'go'+suffix, prefix+'mj'+suffix,);
$(function(){
	Laya.init(stageWidth, stageHeight);
	Laya.stage.bgColor = '#999';
	Laya.stage.alignH = 'center';
	Laya.stage.alignV = 'center';
	Laya.stage.frameRate = 'mouse';
	Laya.stage.scaleMode = 'showall';
	Laya.stage.screenMode = "horizontal";
	Laya.Stat.show(0, 0);

	var socket = io();
	socket.on('connect', () => { console.log('已连接'); });
	socket.on('disconnect', () => { console.log('连接已断开'); });
	var login;
	var index;
	socket.on('logined', function (msg) {
		if (msg['logined'] == 'yes') {
			index = new Index();
		} else {
			login = new Login(socket);
		}
	});
	socket.on('login', function (msg) {
		if (msg['login'] == 'ok') {
			login.sp.visible = false;
			index = new Index();
			$.post('/', { user_id: msg['user_id'] }, function (data, status) { console.log(data['ok']); })
		} else {
			console.log('登录失败');
		}
	});
})