function renderGame(hex, blocks, isPlayer1) {
	var i;
	for (i = 0; i < hex.blocks.length; i++) {
		for (var j = 0; j < hex.blocks[i].length; j++) {
			var block = hex.blocks[i][j];
			block.draw(true, j);
		}
	}
	for (i = 0; i < blocks.length; i++) {
		blocks[i].draw();
	}

	hex.draw();

	for (i = 0; i < hex.texts.length; i++) {
		var alive = hex.texts[i].draw();
		if(!alive){
			hex.texts.splice(i,1);
			i--;
		}
	}
}

function render() {
	var grey = '#bdc3c7';
	if (gameState === 0) {
		grey = "rgb(220, 223, 225)";
	}
	
	ctx.clearRect(0, 0, trueCanvas.width, trueCanvas.height);
	clearGameBoard();
	if (gameState === 1 || gameState === 2 || gameState === -1 || gameState === 0) {
		if (op < 1) {
			op += 0.01;
		}
		ctx.globalAlpha = op;
		
		if (gameMode === 1) {
			// 双人模式下绘制两个背景六边形
			drawPolygon(trueCanvas.width / 2 , trueCanvas.height / 2 - 150, 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
			drawPolygon(trueCanvas.width / 2 , trueCanvas.height / 2 + 150, 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
		} else {
			// 单人模式下绘制一个背景六边形
			drawPolygon(trueCanvas.width / 2 , trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
		}
		
		drawTimer();
		ctx.globalAlpha = 1;
	}

	// 渲染第一个游戏区域
	renderGame(MainHex, blocks, true);
	
	// 如果是双人模式，渲染第二个游戏区域
	if (gameMode === 1) {
		renderGame(MainHex2, blocks2, false);
	}

	// 绘制分数板
	if (gameState ==1 || gameState ==-1 || gameState === 0) {
		drawScoreboard();
	}

	// 渲染开始文本（只在单人模式下显示）
	if (gameMode === 0 && (MainHex.ct < 650 && (gameState !== 0) && !MainHex.playThrough)) {
		if (MainHex.ct > (650 - 50)) {
			ctx.globalAlpha = (50 - (MainHex.ct - (650 - 50)))/50;
		}

		if (MainHex.ct < 50) {
			ctx.globalAlpha = (MainHex.ct)/50;
		}

		renderBeginningText();
		ctx.globalAlpha = 1;
	}

	if (gameState == -1) {
		ctx.globalAlpha = 0.9;
		ctx.fillStyle = 'rgb(236,240,241)';
		ctx.fillRect(0, 0, trueCanvas.width, trueCanvas.height);
		ctx.globalAlpha = 1;
	}

	settings.prevScale = settings.scale;
	settings.hexWidth = settings.baseHexWidth * settings.scale;
	settings.blockHeight = settings.baseBlockHeight * settings.scale;
}

function renderBeginningText() {
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
	renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight-0*settings.scale, fontSize, '#2c3e50', input_text);
	renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight+33*settings.scale, fontSize, '#2c3e50', action_text);
    if (!mob) {
	    drawKey("",(trueCanvas.width)/2 + 2 * settings.scale-2.5,upperheight+38*settings.scale);
    }

	renderText((trueCanvas.width)/2 + 2 * settings.scale,lowerheight,fontSize, '#2c3e50', score_text);
}

function drawKey(key, x, y) {
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
