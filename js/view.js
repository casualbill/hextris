// t: current time, b: begInnIng value, c: change In value, d: duration
function easeOutCubic(t, b, c, d) {
	return c * ((t = t / d - 1) * t * t + 1) + b;
}

function renderText(x, y, fontSize, color, text, font) {
	ctx.save();
	if (!font) {
		var font = '20px Exo';
	}

	fontSize *= settings.scale;
	ctx.font = fontSize + font;
	ctx.textAlign = 'center';
	ctx.fillStyle = color;
	ctx.fillText(text, x, y + (fontSize / 2) - 9 * settings.scale);
	ctx.restore();
}

function drawScoreboard() {
	if (scoreOpacity < 1) {
		scoreOpacity += 0.01;
		textOpacity += 0.01;
	}
	ctx.globalAlpha = textOpacity;
	var scoreSize = 50;
	var scoreString = String(score);
	if (scoreString.length == 6) {
		scoreSize = 43;
	} else if (scoreString.length == 7) {
		scoreSize = 35;
	} else if (scoreString.length == 8) {
		scoreSize = 31;
	} else if (scoreString.length == 9) {
		scoreSize = 27;
	}
	//if (rush ==1){
		var color = "rgb(236, 240, 241)";
	//}
    var fontSize = settings.platform == 'mobile' ? 35 : 30;
    var h = trueCanvas.height / 2 + gdy + 100 * settings.scale;
	if (gameState === 0) {
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy, 60, "rgb(236, 240, 241)", String.fromCharCode("0xf04b"), 'px FontAwesome');
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2.1 + gdy - 155 * settings.scale, 150, "#2c3e50", "Hextris");
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, h - 40, fontSize, "rgb(44,62,80)", 'Play!');
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, h + 10, fontSize, "rgb(44,62,80)", '关卡模式');
	} else if (gameState != 0 && textOpacity > 0) {
		textOpacity -= 0.05;
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy, 60, "rgb(236, 240, 241)", String.fromCharCode("0xf04b"), 'px FontAwesome');
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy - 155 * settings.scale, 150, "#2c3e50", "Hextris");
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, h - 50, fontSize, "rgb(44,62,80)", 'Play!');
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, h, fontSize, "rgb(44,62,80)", '关卡模式');
		ctx.globalAlpha = scoreOpacity;
		renderText(trueCanvas.width / 2 + gdx, trueCanvas.height / 2 + gdy, scoreSize, color, score);
	} else {
		ctx.globalAlpha = scoreOpacity;
		renderText(trueCanvas.width / 2 + gdx, trueCanvas.height / 2 + gdy, scoreSize, color, score);
	}

	ctx.globalAlpha = 1;
}

function drawLevelSelection() {
	// 清除画布
	clearGameBoard();
	
	// 获取关卡进度
	var levelProgress = getLevelProgress();
	
	// 渲染标题
	var titleFontSize = 80 * settings.scale;
	ctx.font = titleFontSize + 'px Exo';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#2c3e50';
	ctx.fillText('关卡选择', trueCanvas.width / 2, trueCanvas.height / 2 - 250 * settings.scale);
	
	// 渲染关卡网格
	var startX = trueCanvas.width / 2 - 200 * settings.scale;
	var startY = trueCanvas.height / 2 - 100 * settings.scale;
	var levelSize = 60 * settings.scale;
	var spacing = 80 * settings.scale;
	var columns = 6;
	
	for (var i = 0; i < 30; i++) {
		var level = i + 1;
		var column = i % columns;
		var row = Math.floor(i / columns);
		var x = startX + column * spacing;
		var y = startY + row * spacing;
		
		// 检查关卡是否解锁
		var isUnlocked = level <= 5 || (levelProgress.completedLevels >= level - 1);
		var isCompleted = levelProgress.completedLevels >= level;
		var isFailed = levelProgress.scores[level] === 0 && levelProgress.attemptedLevels >= level;
		
		// 绘制关卡背景
		ctx.beginPath();
		ctx.arc(x, y, levelSize / 2, 0, 2 * Math.PI);
		
		if (!isUnlocked) {
			// 未解锁关卡，绘制灰色背景
			ctx.fillStyle = '#bdc3c7';
		} else if (isCompleted) {
			// 已完成关卡，绘制绿色背景
			ctx.fillStyle = '#2ecc71';
		} else if (isFailed) {
			// 已失败关卡，绘制红色背景
			ctx.fillStyle = '#e74c3c';
		} else {
			// 未开始关卡，绘制蓝色背景
			ctx.fillStyle = '#3498db';
		}
		ctx.fill();
		
		// 绘制关卡边框
		ctx.beginPath();
		ctx.arc(x, y, levelSize / 2, 0, 2 * Math.PI);
		ctx.strokeStyle = '#2c3e50';
		ctx.lineWidth = 3 * settings.scale;
		ctx.stroke();
		
		// 绘制关卡编号
		var levelFontSize = 24 * settings.scale;
		ctx.font = levelFontSize + 'px Exo';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(level, x, y + levelFontSize / 4);
		
		// 绘制关卡状态图标
		if (!isUnlocked) {
			// 未解锁关卡，绘制锁定图标
			var lockFontSize = 20 * settings.scale;
			ctx.font = lockFontSize + 'px FontAwesome';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#ffffff';
			ctx.fillText(String.fromCharCode(0xf023), x, y + levelFontSize / 4 + lockFontSize + 5 * settings.scale);
		} else if (isCompleted) {
			// 已完成关卡，绘制最高分
			var highScore = levelProgress.scores[level] || 0;
			var scoreFontSize = 14 * settings.scale;
			ctx.font = scoreFontSize + 'px Exo';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#ffffff';
			ctx.fillText('最高分: ' + highScore, x, y + levelFontSize / 4 + scoreFontSize + 5 * settings.scale);
		}
	}
	
	// 渲染返回按钮
	var backButtonX = trueCanvas.width / 2;
	var backButtonY = trueCanvas.height / 2 + 250 * settings.scale;
	var backButtonWidth = 150 * settings.scale;
	var backButtonHeight = 50 * settings.scale;
	
	// 绘制返回按钮背景
	ctx.beginPath();
	ctx.rect(backButtonX - backButtonWidth / 2, backButtonY - backButtonHeight / 2, backButtonWidth, backButtonHeight);
	ctx.fillStyle = '#3498db';
	ctx.fill();
	
	// 绘制返回按钮边框
	ctx.beginPath();
	ctx.rect(backButtonX - backButtonWidth / 2, backButtonY - backButtonHeight / 2, backButtonWidth, backButtonHeight);
	ctx.strokeStyle = '#2c3e50';
	ctx.lineWidth = 3 * settings.scale;
	ctx.stroke();
	
	// 绘制返回按钮文本
	var backButtonFontSize = 20 * settings.scale;
	ctx.font = backButtonFontSize + 'px Exo';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('返回', backButtonX, backButtonY + backButtonFontSize / 4);
	
	// 添加关卡选择界面的点击事件
	canvas.addEventListener('click', handleLevelSelectionClick);
}

function handleLevelSelectionClick(e) {
	// 获取点击位置
	var rect = canvas.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	
	// 转换为游戏坐标系
	var gameX = x * (trueCanvas.width / rect.width);
	var gameY = y * (trueCanvas.height / rect.height);
	
	// 检查是否点击了返回按钮
	var backButtonX = trueCanvas.width / 2;
	var backButtonY = trueCanvas.height / 2 + 250 * settings.scale;
	var backButtonWidth = 150 * settings.scale;
	var backButtonHeight = 50 * settings.scale;
	
	if (gameX >= backButtonX - backButtonWidth / 2 &&
		gameX <= backButtonX + backButtonWidth / 2 &&
		gameY >= backButtonY - backButtonHeight / 2 &&
		gameY <= backButtonY + backButtonHeight / 2) {
		// 点击了返回按钮，返回主菜单
		canvas.removeEventListener('click', handleLevelSelectionClick);
		gameState = 0;
		return;
	}
	
	// 检查是否点击了关卡
	var startX = trueCanvas.width / 2 - 200 * settings.scale;
	var startY = trueCanvas.height / 2 - 100 * settings.scale;
	var levelSize = 60 * settings.scale;
	var spacing = 80 * settings.scale;
	var columns = 6;
	
	for (var i = 0; i < 30; i++) {
		var level = i + 1;
		var column = i % columns;
		var row = Math.floor(i / columns);
		var x = startX + column * spacing;
		var y = startY + row * spacing;
		
		// 计算点击位置与关卡中心的距离
		var distance = Math.sqrt((gameX - x) * (gameX - x) + (gameY - y) * (gameY - y));
		
		if (distance <= levelSize / 2) {
			// 点击了关卡，检查是否解锁
			var levelProgress = getLevelProgress();
			var isUnlocked = level <= 5 || (levelProgress.completedLevels >= level - 1);
			
			if (isUnlocked) {
				// 关卡已解锁，开始游戏
				canvas.removeEventListener('click', handleLevelSelectionClick);
				startLevelMode(level);
			}
			return;
		}
	}
}


function clearGameBoard() {
	drawPolygon(trueCanvas.width / 2, trueCanvas.height / 2, 6, trueCanvas.width / 2, 30, hexagonBackgroundColor, 0, 'rgba(0,0,0,0)');
}

function drawPolygon(x, y, sides, radius, theta, fillColor, lineWidth, lineColor) {
	ctx.fillStyle = fillColor;
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = lineColor;

	ctx.beginPath();
	var coords = rotatePoint(0, radius, theta);
	ctx.moveTo(coords.x + x, coords.y + y);
	var oldX = coords.x;
	var oldY = coords.y;
	for (var i = 0; i < sides; i++) {
		coords = rotatePoint(oldX, oldY, 360 / sides);
		ctx.lineTo(coords.x + x, coords.y + y);
		oldX = coords.x;
		oldY = coords.y;
	}

	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.strokeStyle = 'rgba(0,0,0,0)';
}

function toggleClass(element, active) {
	if ($(element).hasClass(active)) {
		$(element).removeClass(active);
	} else {
		$(element).addClass(active);
	}
}

function showText(text) {
	var messages = {
		'paused': "<div class='centeredHeader unselectable'>Game Paused</div>",
		'pausedAndroid': "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='position:absolute;margin-left:-150px;left:50%;margin-top:20px;width:300px;font-size:16px;'><a href = 'https://play.google.com/store/apps/details?id=com.hextris.hextrisadfree' target='_blank'Want to support the developers? Don't like ads? Tap for Hextris ad-free!</a></div>",
		'pausediOS': "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='position:absolute;margin-left:-150px;left:50%;margin-top:20px;width:300px;font-size:16px;'><a href = 'https://itunes.apple.com/us/app/hextris-ad-free/id912895524?mt=8' target='_blank'>Want to support the developers? Don't like ads? Tap for Hextris ad-free!</a></div>",
		'pausedOther': "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='margin-top:10px;position:absolute;left:50%;margin-left:-190px;max-width:380px;font-size:18px;'><a href = 'http://hextris.github.io/' target='_blank'>Want to support the developers? Click here to buy one of the ad-free mobile versions!</a></div>",
		'start': "<div class='centeredHeader unselectable' style='line-height:80px;'>Press enter to start</div>",
		'levelComplete': "<div class='centeredHeader unselectable'>关卡完成!</div><div class='unselectable centeredSubHeader' style='margin-top:20px;'>得分: " + score + " / " + levelTargetScore + "</div><div class='unselectable centeredSubHeader' style='margin-top:40px;'>5秒后自动进入下一关...</div>",
		'allLevelsComplete': "<div class='centeredHeader unselectable'>恭喜你完成所有关卡!</div><div class='unselectable centeredSubHeader' style='margin-top:20px;'>你真是太厉害了!</div>",
		'levelFailed': "<div class='centeredHeader unselectable'>关卡失败</div><div class='unselectable centeredSubHeader' style='margin-top:20px;'>得分: " + score + " / " + levelTargetScore + "</div><div class='unselectable centeredSubHeader' style='margin-top:40px;'><button id='retryLevelBtn' class='gameBtn'>重新挑战</button><button id='backToLevelSelectionBtn' class='gameBtn'>返回关卡选择</button></div>"
	};

	if (text == 'paused') {
		// 关卡模式的暂停菜单
		if (typeof isLevelMode !== 'undefined' && isLevelMode) {
			messages['paused'] = "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='margin-top:40px;'><button id='resumeGameBtn' class='gameBtn'>继续游戏</button><button id='restartLevelBtn' class='gameBtn'>重新开始本关</button><button id='exitToLevelSelectionBtn' class='gameBtn'>返回关卡选择</button></div>";
			messages['pausedAndroid'] = messages['paused'];
			messages['pausediOS'] = messages['paused'];
			messages['pausedOther'] = messages['paused'];
		} else {
			// 普通模式的暂停菜单
			if (settings.os == 'android') {
				text = 'pausedAndroid'
			} else if (settings.os == 'ios') {
			    text = 'pausediOS'
			} else if (settings.platform == 'nonmobile') {
			    text = 'pausedOther'
			}
		}
	}

	if (text == 'gameover') {
	   //Clay('client.share.any', {text: 'Think you can beat my score of '+ score + ' in Super Cool Game?'})
		$("#gameoverscreen").fadeIn();
    	}
	$(".overlay").html(messages[text]);
	$(".overlay").fadeIn("1000", "swing");
	
	// 绑定关卡模式相关按钮的事件
	if (text == 'levelFailed') {
		$('#retryLevelBtn').on('click', function() {
			startLevelMode(currentLevel);
			hideText();
		});
		
		$('#backToLevelSelectionBtn').on('click', function() {
			enterLevelSelection();
			hideText();
		});
	} else if (text == 'paused' && typeof isLevelMode !== 'undefined' && isLevelMode) {
		$('#resumeGameBtn').on('click', function() {
			resumeGame();
			hideText();
		});
		
		$('#restartLevelBtn').on('click', function() {
			startLevelMode(currentLevel);
			hideText();
		});
		
		$('#exitToLevelSelectionBtn').on('click', function() {
			enterLevelSelection();
			hideText();
		});
	}

}

function setMainMenu() {
	gameState = 4;
	canRestart = false;
	setTimeout(function() {
		canRestart = 's';
	}, 500);
	$('#restartBtn').hide();
	if ($("#pauseBtn").replace(/^.*[\\\/]/, '') == "btn_pause.svg") {
		$("#pauseBtn").attr("src","./images/btn_resume.svg");
	} else {
		$("#pauseBtn").attr("src","./images/btn_pause.svg");
	}
}

function hideText() {
	$(".overlay").fadeOut(150, function() {
		$(".overlay").html("");
	})
}

function gameOverDisplay() {
	settings.ending_block=false;
	Cookies.set("visited",true);
	var c = document.getElementById("canvas");
	c.className = "blur";
	updateHighScores();
	if (highscores.length === 0 ){
		$("#currentHighScore").text(0);
	}
	else {
		$("#currentHighScore").text(highscores[0])
	}
	$("#gameoverscreen").fadeIn();
	$("#buttonCont").fadeIn();
	$("#container").fadeIn();
	$("#socialShare").fadeIn();
	$("#restart").fadeIn();
    set_score_pos();
}

function updateHighScores (){
    $("#cScore").text(score);
    $("#1place").text(highscores[0]);
    $("#2place").text(highscores[1]);
    $("#3place").text(highscores[2]);
}

var pausable = true;
function pause(o) {
    if (gameState == 0 || gameState == 2 || !pausable) {
        return;
    }

	pausable = false;
	writeHighScores();
	var message;
	if (o) {
		message = '';
	} else {
		message = 'paused';
	}

	var c = document.getElementById("canvas");
	if (gameState == -1) {
		$('#fork-ribbon').fadeOut(300, 'linear');
		$('#restartBtn').fadeOut(300, "linear");
		$('#buttonCont').fadeOut(300, "linear");
		if ($('#helpScreen').is(':visible')) {
			$('#helpScreen').fadeOut(300, "linear");
		}

		$("#pauseBtn").attr("src", "./images/btn_pause.svg");
		$('.helpText').fadeOut(300, 'linear');
		$('#overlay').fadeOut(300, 'linear');
		hideText();
		setTimeout(function() {
			gameState = prevGameState;
			pausable =true;
		}, 400);
	} else if (gameState != -2 && gameState !== 0 && gameState !== 2) {
		$('#restartBtn').fadeIn(300, "linear");
		$('#buttonCont').fadeIn(300, "linear");
		$('.helpText').fadeIn(300, 'linear');
		if (message == 'paused') {
			showText(message);
		}
		$('#fork-ribbon').fadeIn(300, 'linear');
		$("#pauseBtn").attr("src","./images/btn_resume.svg");
		$('#overlay').fadeIn(300, 'linear');
		prevGameState = gameState;
		setTimeout(function() {
		    pausable = true;
		}, 400);
		gameState = -1;
	}
}
