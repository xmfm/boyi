(function()
{
    var Sprite  = Laya.Sprite;
    var Stage   = Laya.Stage;
    var Texture = Laya.Texture;
    var Browser = Laya.Browser;
    var Handler = Laya.Handler;
    var WebGL   = Laya.WebGL;

    var url = '/static/tiles.png';

    (function()
    {
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        
		Laya.loader.load(url, Handler.create(this, showApe));
    })();
    function showApe()
    {
		var ape0 = new Sprite();
		ape0.pos(100, 100);
		ape0.size(100, 100);
        var t = Laya.loader.getRes(url);
        var ape = new Sprite();
        ape.graphics.drawTexture(t, -71, -107);
        Laya.stage.addChild(ape0);
		ape0.addChild(ape);
        ape.pos(0, 0);
		ape.size(200, 200);
		ape.zOrder = 100;
		ape.scrollRect = new Laya.Rectangle(0, 0, 71, 107);
		ape0.on('mouseover', this, function(){ape.y = -30;});
		ape0.on('mouseout', this, function(){ape.y = 0;});
		//ape.on('mouseover', this, function(){ape.y = -30;});
		//ape.on('mouseout', this, function(){ape.y = 0;});
    }
})();