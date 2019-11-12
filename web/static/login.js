class Login {
    constructor(socket) {
        this.socket = socket;
        this.sp = new Sprite();
        this.sp.width = stage.width / 5;
        this.sp.height = stage.height / 2;
        this.sp.pivotX = this.sp.width / 2;
        this.sp.pivotY = this.sp.height / 2;
        this.sp.x = stage.width / 2;
        this.sp.y = stage.height / 2;
        this.sp.name = 'login';
        stage.addChild(this.sp);

        this.nameInput = new TextInput();
        this.sp.addChild(this.nameInput);
        this.nameInput.width = stage.width / 5;
        this.nameInput.height = stage.height / 20;
        this.nameInput.maxChars = 10;
        this.nameInput.prompt = '昵称';
        this.nameInput.promptColor = '#888';
        this.nameInput.fontSize = this.nameInput.height * 4 / 5;
        this.nameInput.bgColor = '#aaa';

        this.pwInput = new TextInput();
        this.sp.addChild(this.pwInput);
        this.pwInput.width = stage.width / 5;
        this.pwInput.height = stage.height / 20;
        this.pwInput.y = stage.height / 10;
        this.pwInput.maxChars = 10;
        this.pwInput.prompt = '密码';
        this.pwInput.promptColor = '#888';
        this.pwInput.type = 'password';
        this.pwInput.fontSize = this.pwInput.height * 4 / 5;
        this.pwInput.bgColor = '#aaa';

        this.loginButton = new Laya.Text();
        this.sp.addChild(this.loginButton);
        this.loginButton.text = '登入';
        this.loginButton.fontSize = stage.height / 25;
        this.loginButton.width = this.sp.width;
        this.loginButton.pivotX = this.sp.pivotX;
        this.loginButton.x = this.sp.width / 2;
        this.loginButton.y = stage.height / 5;
        this.loginButton.align = 'center';
        this.loginButton.color = "#abc";
        this.loginButton.on('mouseover', this.loginButton, function () { this.color = "#bca"; });
        this.loginButton.on('mouseout', this.loginButton, function () { this.color = "#abc"; });
        this.loginButton.on('mousedown', this.loginButton, function () { this.color = "#cab"; });
        this.loginButton.on('mouseup', this.loginButton, function () { this.color = "#bca"; });
        this.loginButton.on('click', this, () => { this.socket.emit('login', { username: this.nameInput.text, password: this.pwInput.text }); });

    }
}