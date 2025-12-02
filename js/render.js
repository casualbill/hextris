function render() {
	if (gameState == 0) {
		// 渲染主菜单
		// 主菜单已经通过HTML/CSS显示，不需要额外渲染
	} else if (gameState == 1) {
		if (window.aiMode) {
			// AI对战模式渲染
			renderAIGame();
		} else {
			// 普通模式渲染
			renderNormalGame();
		}
	}
}

function renderNormalGame() {
	// 渲染普通游戏模式
	// 渲染主六边形
	MainHex.draw();
	
	// 渲染所有方块
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].draw();
	}
	
	// 渲染分数
	renderScore();
}

function renderAIGame() {
	// 渲染AI对战模式
	// 清除画布
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// 渲染玩家区域
	renderPlayerArea();
	
	// 渲染AI区域
	renderAIArea();
	
	// 渲染分数对比
	renderScoreComparison();
}

function renderScoreComparison() {
	// 渲染分数对比板
	ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	ctx.fillRect(canvas.width / 2 - 150, 20, 300, 60);
	
	ctx.fillStyle = 'white';
	ctx.font = 'bold 24px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('分数对比', canvas.width / 2, 45);
	ctx.fillText(window.playerScore + ' : ' + window.aiScore, canvas.width / 2, 70);
}

function renderPlayerArea() {
	// 渲染玩家六边形
	if (window.playerHex) {
		window.playerHex.render();
	}
	
	// 渲染玩家分数
	ctx.fillStyle = 'white';
	ctx.font = 'bold 36px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('玩家: ' + window.playerScore, canvas.width / 4, 50);
}

function renderAIArea() {
	// 渲染AI六边形
	if (window.aiHex) {
		window.aiHex.render();
	}
	
	// 渲染AI分数
	ctx.fillStyle = 'white';
	ctx.font = 'bold 36px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('AI: ' + window.aiScore, canvas.width * 3 / 4, 50);
}

function renderScoreComparison() {
	// 渲染分数对比板
	ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	ctx.fillRect(canvas.width / 2 - 150, 20, 300, 60);
	
	ctx.fillStyle = 'white';
	ctx.font = 'bold 24px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('分数对比', canvas.width / 2, 45);
	ctx.fillText(window.playerScore + ' : ' + window.aiScore, canvas.width / 2, 70);
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
