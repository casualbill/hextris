function render() {
	var grey = '#bdc3c7';
	if (gameState === 0) {
		grey = "rgb(220, 223, 225)";
	}
	
	ctx.clearRect(0, 0, trueCanvas.width, trueCanvas.height);
	clearGameBoard();
	
	// 多人对战模式渲染
	if (typeof multiplayerState !== 'undefined' && multiplayerState.isMultiplayer && multiplayerState.currentRoom) {
		const players = multiplayerState.currentRoom.players;
		const playerCount = players.length;
		
		// 根据玩家数量布局
		let layout = { cols: 1, rows: 1 };
		if (playerCount === 2) {
			layout = { cols: 2, rows: 1 };
		} else if (playerCount === 3) {
			layout = { cols: 2, rows: 2 };
		} else if (playerCount >= 4) {
			layout = { cols: 2, rows: 2 };
		}
		
		const cellWidth = trueCanvas.width / layout.cols;
		const cellHeight = trueCanvas.height / layout.rows;
		
		players.forEach((player, index) => {
			const col = index % layout.cols;
			const row = Math.floor(index / layout.cols);
			const x = col * cellWidth + cellWidth / 2;
			const y = row * cellHeight + cellHeight / 2;
			
			// 保存当前上下文状态
			ctx.save();
			
			// 设置缩放以适应单元格
			const scale = Math.min(cellWidth, cellHeight) / 800 * settings.baseScale;
			ctx.translate(x, y);
			ctx.scale(scale, scale);
			
			// 绘制游戏区域
			if (player.isAlive) {
				ctx.globalAlpha = op < 1 ? op : 1;
				drawPolygon(0, 0, 6, (settings.rows * settings.baseBlockHeight) * (2/Math.sqrt(3)) + settings.baseHexWidth, 30, grey, false,6);
				drawTimer();
				ctx.globalAlpha = 1;
				
				// 绘制方块（这里需要修改为使用玩家的游戏数据）
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
				drawScoreboard(player.score);
			} else {
				// 玩家已失败，显示灰色遮罩
				ctx.globalAlpha = 0.7;
				ctx.fillStyle = '#7f8c8d';
				ctx.fillRect(-cellWidth / 2 / scale, -cellHeight / 2 / scale, cellWidth / scale, cellHeight / scale);
				ctx.globalAlpha = 1;
				renderText(0, 0, 30, '#ecf0f1', '已失败');
			}
			
			// 绘制玩家昵称
			renderText(0, -cellHeight / 2 / scale + 20, 18, '#2c3e50', player.nickname);
			
			// 恢复上下文状态
			ctx.restore();
		});
	} else {
		// 单人模式渲染
		if (gameState === 1 || gameState === 2 || gameState === -1 || gameState === 0) {
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
		if (gameState ==1 || gameState ==-1 || gameState === 0) {
			drawScoreboard();
		}

	for (i = 0; i < MainHex.texts.length; i++) {
		var alive = MainHex.texts[i].draw();
		if(!alive){
			MainHex.texts.splice(i,1);
			i--;
		}
	}

	if ((MainHex.ct < 650 && (gameState !== 0) && !MainHex.playThrough)) {
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
