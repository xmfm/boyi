class Index {
    constructor() {
        this.sp = new Sprite();
        this.polys = new Sprite();
        this.polys.name = "polys";
        this.sp.addChild(this.polys);
        this.sp.name = 'index';
        stage.addChild(this.sp);

        tessellate(this.polys, stage.width, stage.height, 200, "#aaa");
        var width = 200, height = width * sqrt(3) / 2;
        var mjButton = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => {
            this.mjIndex = new GameIndex('mj');
            transPolys('index', 'mjIndex');
        }, "麻将", 'mj');
        mjButton.pos(width / 2, height / 2);
        var fiveButton = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => {
            this.fiveIndex = new GameIndex('five');
            transPolys('index', 'fiveIndex');
        }, "五子棋", 'five');
        fiveButton.pos(width / 2, height / 2);
        var sixButton = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => {
            this.sixIndex = new GameIndex('six');
            transPolys('index', 'sixIndex');
        }, "六子棋", 'six');
        sixButton.pos(width / 2, height / 2);
        var goButton = getHexagonButton(width, ["#abc", "#bca", "#cab"], () => {
            this.goIndex = new GameIndex('go');
            transPolys('index', 'goIndex');
        }, "围棋", 'go');
        goButton.pos(width / 2, height / 2);

        this.polys.getChildAt(3 * 7 + 1).addChild(mjButton);
        this.polys.getChildAt(2 * 7 + 1).addChild(fiveButton);
        this.polys.getChildAt(4 * 7 + 1).addChild(sixButton);
        this.polys.getChildAt(3 * 7 + 2).addChild(goButton);
    }


}