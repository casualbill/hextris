function render() {
	var grey = '#bdc3c7';
	if (gameState === 0) {
		grey = "rgb(220, 223, 225)";
	}
	
	ctx.clearRect(0, 0, trueCanvas.width, trueCanvas.height);
	
	// 主菜单状态下，无论当前gameMode是什么，都显示单人模式的主菜单界面
	if (gameState === 0) {
		// 单人模式主菜单渲染
		clearGameBoard();
		if (op < 1) {
			op += 0.01;
		}
		ctx.globalAlpha = op;
		drawPolygon(trueCanvas.width / 2 , trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
		drawTimer();
		ctx.globalAlpha = 1;

		// 在主菜单状态下，MainHex可能还没有初始化
		if (MainHex && MainHex.blocks) {
			var i;
			for (i = 0; i < MainHex.blocks.length; i++) {
				for (var j = 0; j < MainHex.blocks[i].length; j++) {
					var block = MainHex.blocks[i][j];
					block.draw(true, j);
				}
			}
			for (i = 0; i < blocks.length; i++) {
				blocks[i].draw();
			}

			MainHex.draw();
			drawScoreboard();

			for (i = 0; i < MainHex.texts.length; i++) {
				var alive = MainHex.texts[i].draw();
				if(!alive){
					MainHex.texts.splice(i,1);
					i--;
				}
			}
		}

		// 显示主菜单文本（包括游戏模式选择）
		renderBeginningText();
		ctx.globalAlpha = 1;
	} else if (gameMode === 0) {
		// 单人游戏进行中渲染
		clearGameBoard();
		if (gameState === 1 || gameState === 2 || gameState === -1) {
			if (op < 1) {
				op += 0.01;
			}
			ctx.globalAlpha = op;
			drawPolygon(trueCanvas.width / 2 , trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
			drawTimer();
			ctx.globalAlpha = 1;
		}

		var i;
		for (i = 0; i < MainHex.blocks.length; i++) {
			for (var j = 0; j < MainHex.blocks[i].length; j++) {
				var block = MainHex.blocks[i][j];
				block.draw(true, j);
			}
		}
		for (i = 0; i < blocks.length; i++) {
			blocks[i].draw();
		}

		MainHex.draw();
		if (gameState ==1 || gameState ==-1) {
			drawScoreboard();
		}

		for (i = 0; i < MainHex.texts.length; i++) {
			var alive = MainHex.texts[i].draw();
			if(!alive){
				MainHex.texts.splice(i,1);
				i--;
			}
		}

		if ((MainHex.ct < 650 && !MainHex.playThrough)) {
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
	} else {
		// 双人对战模式进行中渲染 - 左右分割
		var halfWidth = trueCanvas.width / 2;
		
		// 玩家1左侧渲染
		ctx.save();
		ctx.translate(0, 0);
		clearGameBoard1();
		if (gameState === 1 || gameState === 2 || gameState === -1) {
			if (op < 1) {
				op += 0.01;
			}
			ctx.globalAlpha = op;
			drawPolygon(halfWidth / 2 , trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
			drawTimer();
			ctx.globalAlpha = 1;
		}

		var i;
		for (i = 0; i < MainHex1.blocks.length; i++) {
			for (var j = 0; j < MainHex1.blocks[i].length; j++) {
				var block = MainHex1.blocks[i][j];
				block.draw(true, j, 1);
			}
		}
		for (i = 0; i < blocks.length; i++) {
			blocks[i].draw(1);
		}

		MainHex1.draw(1);
		if (gameState ==1 || gameState ==-1) {
			drawScoreboard(1);
		}

		for (i = 0; i < MainHex1.texts.length; i++) {
			var alive = MainHex1.texts[i].draw(1);
			if(!alive){
				MainHex1.texts.splice(i,1);
				i--;
			}
		}

		if ((MainHex1.ct < 650 && !MainHex1.playThrough)) {
			if (MainHex1.ct > (650 - 50)) {
				ctx.globalAlpha = (50 - (MainHex1.ct - (650 - 50)))/50;
			}

			if (MainHex1.ct < 50) {
				ctx.globalAlpha = (MainHex1.ct)/50;
			}

			ctx.globalAlpha = 1;
		}
		ctx.restore();
		
		// 玩家2右侧渲染
		ctx.save();
		ctx.translate(halfWidth, 0);
		clearGameBoard2();
		if (gameState === 1 || gameState === 2 || gameState === -1) {
			if (op < 1) {
				op += 0.01;
			}
			ctx.globalAlpha = op;
			drawPolygon(halfWidth / 2 , trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
			drawTimer();
			ctx.globalAlpha = 1;
		}

		for (i = 0; i < MainHex2.blocks.length; i++) {
			for (var j = 0; j < MainHex2.blocks[i].length; j++) {
				var block = MainHex2.blocks[i][j];
				block.draw(true, j, 2);
			}
		}
		for (i = 0; i < blocks2.length; i++) {
			blocks2[i].draw(2);
		}

		MainHex2.draw(2);
		if (gameState ==1 || gameState ==-1) {
			drawScoreboard(2);
		}

		for (i = 0; i < MainHex2.texts.length; i++) {
			var alive = MainHex2.texts[i].draw(2);
			if(!alive){
				MainHex2.texts.splice(i,1);
				i--;
			}
		}

		if ((MainHex2.ct < 650 && !MainHex2.playThrough)) {
			if (MainHex2.ct > (650 - 50)) {
				ctx.globalAlpha = (50 - (MainHex2.ct - (650 - 50)))/50;
			}

			if (MainHex2.ct < 50) {
				ctx.globalAlpha = (MainHex2.ct)/50;
			}

			ctx.globalAlpha = 1;
		}
		ctx.restore();
		
		// 分割线
		ctx.fillStyle = '#2c3e50';
		ctx.fillRect(halfWidth - 2, 0, 4, trueCanvas.height);
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
    
    // 单人游戏选项 - 使用醒目的红色
    renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight-60*settings.scale, fontSize + 10, '#ff0000', '单人游戏');
    
    // 双人游戏选项 - 使用醒目的蓝色，确保清晰可见
    renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight-20*settings.scale, fontSize + 10, '#0000ff', '2人对战');
    
    // 控制说明
    if (gameMode === 0) {
        renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight+33*settings.scale, fontSize, '#2c3e50', input_text);
        renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight+66*settings.scale, fontSize, '#2c3e50', action_text);
        if (!mob) {
            drawKey("",(trueCanvas.width)/2 + 2 * settings.scale-2.5,upperheight+71*settings.scale);
        }
    } else {
        // 双人游戏控制说明
        renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight+33*settings.scale, fontSize, '#2c3e50', '玩家1：方向键控制');
        renderText((trueCanvas.width)/2 + 2 * settings.scale,upperheight+66*settings.scale, fontSize, '#2c3e50', '玩家2：WASD键控制');
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
