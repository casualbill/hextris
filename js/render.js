function renderUI() {
	// 创建临时2D画布用于渲染UI
	var uiCanvas = document.createElement('canvas');
	uiCanvas.width = window.innerWidth;
	uiCanvas.height = window.innerHeight;
	var uiCtx = uiCanvas.getContext('2d');
	
	// 缩放处理
	if (window.devicePixelRatio) {
		uiCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}
	
	var grey = '#bdc3c7';
	if (gameState === 0) {
		grey = "rgb(220, 223, 225)";
	}
	
	uiCtx.clearRect(0, 0, trueCanvas.width, trueCanvas.height);
	
	if (gameState === 1 || gameState === 2 || gameState === -1 || gameState === 0) {
		if (op < 1) {
			op += 0.01;
		}
		uiCtx.globalAlpha = op;
		drawPolygon(uiCtx, trueCanvas.width / 2 , trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
		drawTimer(uiCtx);
		uiCtx.globalAlpha = 1;
	}

	if (gameState ==1 || gameState ==-1 || gameState === 0) {
		drawScoreboard(uiCtx);
	}

	for (var i = 0; i < MainHex.texts.length; i++) {
		var alive = MainHex.texts[i].draw(uiCtx);
		if(!alive){
			MainHex.texts.splice(i,1);
			i--;
		}
	}

	if ((MainHex.ct < 650 && (gameState !== 0) && !MainHex.playThrough)) {
		if (MainHex.ct > (650 - 50)) {
			uiCtx.globalAlpha = (50 - (MainHex.ct - (650 - 50)))/50;
		}

		if (MainHex.ct < 50) {
			uiCtx.globalAlpha = (MainHex.ct)/50;
		}

		renderBeginningText(uiCtx);
		uiCtx.globalAlpha = 1;
	}

	if (gameState == -1) {
		uiCtx.globalAlpha = 0.9;
		uiCtx.fillStyle = 'rgb(236,240,241)';
		uiCtx.fillRect(0, 0, trueCanvas.width, trueCanvas.height);
		uiCtx.globalAlpha = 1;
	}

	settings.prevScale = settings.scale;
	settings.hexWidth = settings.baseHexWidth * settings.scale;
	settings.blockHeight = settings.baseBlockHeight * settings.scale;
	
	// 将UI画布绘制到Three.js渲染结果上
	renderer.domElement.getContext('2d').drawImage(uiCanvas, 0, 0);
}

function renderBeginningText(ctx) {
	var upperheight = (trueCanvas.height/2) - ((settings.rows * settings.blockHeight) * (2/Math.sqrt(3))) * (5/6);
	var lowerheight = (trueCanvas.height/2) + ((settings.rows * settings.blockHeight) * (2/Math.sqrt(3))) * (11/16);
    var text = '';
    var mob, fontSize;
    if(/mobile|Mobile|iOS|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        mob = true;
        input_text = 'Tap the screen\'s left and right'
        action_text = 'sides to rotate the hexagon'
        score_text = 'Match 3+ blocks to score'
        fontSize = 35
    } else {
        mob = false
        input_text = 'Use the right and left arrow keys'
        action_text = 'to rotate the hexagon'
        score_text = 'Match 3+ blocks to score!'
        fontSize = 27
    }
	renderText(ctx, (trueCanvas.width)/2 + 2 * settings.scale,upperheight-0*settings.scale, fontSize, '#2c3e50', input_text);
	renderText(ctx, (trueCanvas.width)/2 + 2 * settings.scale,upperheight+33*settings.scale, fontSize, '#2c3e50', action_text);
    if (!mob) {
	    drawKey(ctx, "",(trueCanvas.width)/2 + 2 * settings.scale-2.5,upperheight+38*settings.scale);
    }

	renderText(ctx, (trueCanvas.width)/2 + 2 * settings.scale,lowerheight,fontSize, '#2c3e50', score_text);
}

function drawKey(ctx, key, x, y) {
	ctx.save();
	switch (key) {
		case "left":
			ctx.translate(x, y + settings.scale * 13);
			ctx.rotate(3.14159);
			ctx.font = "20px Fontawesome";
			ctx.scale(settings.scale, settings.scale);
			ctx.fillText(String.fromCharCode("0xf04b"), 0, 0);
			break;
		case "right":
			ctx.font = "20px Fontawesome";
			ctx.translate(x , y + settings.scale * 27.5);
			ctx.scale(settings.scale, settings.scale);
			ctx.fillText(String.fromCharCode("0xf04b"), 0, 0);
			break;
		
		default:
			drawKey("left", x - 5, y);
			drawKey("right", x + 5, y);
	}
	ctx.restore();
}
