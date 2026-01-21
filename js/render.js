function render() {
	var grey = '#bdc3c7';
	if (gameState === 0) {
		grey = "rgb(220, 223, 225)";
	}
	
	ctx.clearRect(0, 0, trueCanvas.width, trueCanvas.height);
	clearGameBoard();
	
	if (is2PlayerMode) {
		// 2-player mode rendering
		var halfWidth = trueCanvas.width / 2;
		
		// Player 1 (left side)
		if (gameState === 1 || gameState === 2 || gameState === -1 || gameState === 0) {
			if (op < 1) {
				op += 0.01;
			}
			ctx.globalAlpha = op;
			drawPolygon(halfWidth / 2, trueCanvas.height / 2, 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false, 6);
			ctx.globalAlpha = 1;
		}
		
		// Draw Player 1's blocks
		var i;
		for (i = 0; i < MainHex1.blocks.length; i++) {
			for (var j = 0; j < MainHex1.blocks[i].length; j++) {
				var block = MainHex1.blocks[i][j];
				block.draw(true, j, trueCanvas.width / 4);
			}
		}
		for (i = 0; i < blocks1.length; i++) {
			blocks1[i].draw(trueCanvas.width / 4);
		}
		
		MainHex1.x = trueCanvas.width / 4;
		MainHex1.draw();
		
		// Draw Player 1's score and combo
		drawPlayerScore(1, halfWidth / 2, trueCanvas.height / 2 - (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) * 0.8);
		
		// Player 2 (right side)
		if (gameState === 1 || gameState === 2 || gameState === -1 || gameState === 0) {
			ctx.globalAlpha = op;
			drawPolygon(halfWidth + halfWidth / 2, trueCanvas.height / 2, 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false, 6);
			drawTimer();
			ctx.globalAlpha = 1;
		}
		
		// Draw Player 2's blocks
		for (i = 0; i < MainHex2.blocks.length; i++) {
			for (var j = 0; j < MainHex2.blocks[i].length; j++) {
				var block = MainHex2.blocks[i][j];
				block.draw(true, j, trueCanvas.width * 3 / 4);
			}
		}
		for (i = 0; i < blocks2.length; i++) {
			blocks2[i].draw(trueCanvas.width * 3 / 4);
		}
		
		MainHex2.x = trueCanvas.width * 3 / 4;
		MainHex2.draw();
		
		// Draw Player 2's score and combo
		drawPlayerScore(2, halfWidth + halfWidth / 2, trueCanvas.height / 2 - (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) * 0.8);
		
		// Draw dividing line
		ctx.beginPath();
		ctx.moveTo(halfWidth, 0);
		ctx.lineTo(halfWidth, trueCanvas.height);
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#bdc3c7';
		ctx.stroke();
		
		// Draw player labels
		ctx.fillStyle = '#2c3e50';
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Player 1', halfWidth / 2, 30);
		ctx.fillText('Player 2', halfWidth + halfWidth / 2, 30);
		
		// Draw texts for both players
		for (i = 0; i < MainHex1.texts.length; i++) {
			var alive = MainHex1.texts[i].draw();
			if(!alive){
				MainHex1.texts.splice(i,1);
				i--;
			}
		}
		
		for (i = 0; i < MainHex2.texts.length; i++) {
			var alive = MainHex2.texts[i].draw();
			if(!alive){
				MainHex2.texts.splice(i,1);
				i--;
			}
		}
		
		// Draw beginning text if needed
		if ((MainHex1.ct < 650 && (gameState !== 0) && !MainHex1.playThrough) || (MainHex2.ct < 650 && (gameState !== 0) && !MainHex2.playThrough)) {
			if (MainHex1.ct > (650 - 50)) {
				ctx.globalAlpha = (50 - (MainHex1.ct - (650 - 50)))/50;
			}
			
			if (MainHex1.ct < 50) {
				ctx.globalAlpha = (MainHex1.ct)/50;
			}
			
		renderBeginningText();
		ctx.globalAlpha = 1;
	}
	} else {
		// Single player mode rendering (original code)
		if (gameState === 1 || gameState === 2 || gameState === -1 || gameState === 0) {
			if (op < 1) {
				op += 0.01;
			}
			ctx.globalAlpha = op;
			drawPolygon(trueCanvas.width / 2, trueCanvas.height / 2, 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false, 6);
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
		if (gameState == 1 || gameState == -1 || gameState === 0) {
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

function drawPlayerScore(playerNum, x, y) {
	ctx.save();
	ctx.font = 'bold 36px Arial';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#2c3e50';
	
	var score = playerNum === 1 ? score1 : score2;
	ctx.fillText(score, x, y);
	
	// Draw combo if any
	if (scoreAdditionCoeff > 1) {
		ctx.font = '24px Arial';
		ctx.fillStyle = '#e74c3c';
		ctx.fillText('x' + scoreAdditionCoeff, x, y + 30);
	}
	
	ctx.restore();
}
