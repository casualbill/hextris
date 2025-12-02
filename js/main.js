function scaleCanvas() {
	canvas.width = $(window).width();
	canvas.height = $(window).height();

	if (canvas.height > canvas.width) {
		settings.scale = (canvas.width / 800) * settings.baseScale;
	} else {
		settings.scale = (canvas.height / 800) * settings.baseScale;
	}

	trueCanvas = {
		width: canvas.width,
		height: canvas.height
	};

	if (window.devicePixelRatio) {
		var cw = $("#canvas").attr('width');
		var ch = $("#canvas").attr('height');

		$("#canvas").attr('width', cw * window.devicePixelRatio);
		$("#canvas").attr('height', ch * window.devicePixelRatio);
		$("#canvas").css('width', cw);
		$("#canvas").css('height', ch);

		trueCanvas = {
			width: cw,
			height: ch
		};

		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}
    setBottomContainer();
    set_score_pos();
}

function setBottomContainer() {
    var buttonOffset = $("#buttonCont").offset().top;
    var playOffset = trueCanvas.height / 2 + 100 * settings.scale;
    var delta = buttonOffset - playOffset - 29;
    if (delta < 0) {
        $("#bottomContainer").css("margin-bottom", "-" + Math.abs(delta) + "px");
    }
}

function set_score_pos() {
    $("#container").css('margin-top', '0');
    var middle_of_container = ($("#container").height()/2 + $("#container").offset().top);
    var top_of_bottom_container = $("#buttonCont").offset().top
    var igt = $("#highScoreInGameText")
    var igt_bottom = igt.offset().top + igt[0].offsetHeight
    var target_midpoint = (top_of_bottom_container + igt_bottom)/2
    var diff = (target_midpoint-middle_of_container)
    $("#container").css("margin-top",diff + "px");
}

function toggleDevTools() {
	$('#devtools').toggle();
}

function resumeGame() {
	gameState = 1;
	hideUIElements();
	$('#pauseBtn').show();
	$('#restartBtn').hide();
	importing = 0;
	startTime = Date.now();
	setTimeout(function() {
		if ((gameState == 1 || gameState == 2) && !$('#helpScreen').is(':visible')) {
			$('#openSideBar').fadeOut(150, "linear");
		}
	}, 7000);

	checkVisualElements(0);
}

function showMainMenu() {
	gameState = 0;
	$('#startBtn').show();
	$('#aiBtn').show();
	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#openSideBar').show();
}

function pause() {
	if (gameState === 1) {
		gameState = 0;
		showPauseMenu();
	} else if (gameState === 0) {
		gameState = 1;
		hidePauseMenu();
	}
}

function showPauseMenu() {
	// 显示暂停菜单
	var pauseMenuHTML = `
		<div id="pauseMenu" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center;">
			<div style="color: white; font-size: 36px; font-weight: bold; margin-bottom: 40px;">游戏暂停</div>
			<button id="resumeBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">继续游戏</button>
			<button id="restartBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #f1c40f; color: white; border: none; border-radius: 5px;">重新开始</button>
			<button id="mainMenuBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 5px;">返回主菜单</button>
		</div>
	`;
	
	$('body').append(pauseMenuHTML);
	
	// 绑定事件
	$('#resumeBtn').click(function() {
		gameState = 1;
		hidePauseMenu();
	});
	
	$('#restartBtn').click(function() {
		hidePauseMenu();
		if (window.aiMode) {
			startAIGame(window.aiDifficulty);
		} else {
			init();
		}
	});
	
	$('#mainMenuBtn').click(function() {
		hidePauseMenu();
		window.aiMode = false;
		gameState = 0;
		showMainMenu();
	});
}

function hidePauseMenu() {
	$('#pauseMenu').remove();
}

function showDifficultySelection() {
	// 显示难度选择界面
	var difficultyHTML = `
		<div id="difficultyMenu" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center;">
			<div style="color: white; font-size: 36px; font-weight: bold; margin-bottom: 40px;">选择AI难度</div>
			<button id="easyBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">简单</button>
			<button id="mediumBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #f1c40f; color: white; border: none; border-radius: 5px;">中等</button>
			<button id="hardBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 5px;">困难</button>
			<button id="backBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #95a5a6; color: white; border: none; border-radius: 5px;">返回</button>
		</div>
	`;
	
	$('body').append(difficultyHTML);
	
	// 绑定事件
	$('#easyBtn').click(function() {
		hideDifficultyMenu();
		startAIGame('easy');
	});
	
	$('#mediumBtn').click(function() {
		hideDifficultyMenu();
		startAIGame('medium');
	});
	
	$('#hardBtn').click(function() {
		hideDifficultyMenu();
		startAIGame('hard');
	});
	
	$('#backBtn').click(function() {
		hideDifficultyMenu();
		showMainMenu();
	});
}

function hideDifficultyMenu() {
	$('#difficultyMenu').remove();
}

function startAIGame(difficulty) {
	window.aiMode = true;
	window.aiDifficulty = difficulty;
	
	// 初始化AI对战
	window.aiScore = 0;
	window.playerScore = 0;
	
	// 创建玩家和AI的六边形
	window.playerHex = new Hex(canvas.width / 4, canvas.height / 2, hexRadius);
	window.aiHex = new Hex(canvas.width * 3 / 4, canvas.height / 2, hexRadius);
	
	// 开始游戏
	gameState = 1;
	
	// 隐藏UI元素
	$('#startBtn').hide();
	$('#aiBtn').hide();
	$('#pauseBtn').show();
	$('#openSideBar').hide();
	
	// 启动AI
	startAI();
}

function startAI() {
	// 根据难度设置AI的反应延迟
	var delay = window.aiSettings[window.aiDifficulty].delay;
	
	// 定期让AI做出决策
	var aiInterval = setInterval(function() {
		if (gameState === 1 && window.aiMode) {
			// AI决策逻辑
			var strategy = window.aiSettings[window.aiDifficulty].strategy;
			
			if (strategy === 'simple') {
				// 简单策略：随机旋转
				var rotation = Math.random() > 0.5 ? 1 : -1;
				window.aiHex.rotate(rotation);
			} else if (strategy === 'medium') {
				// 中等策略：优先选择能匹配颜色的旋转
				var bestRotation = 0;
				var maxMatches = 0;
				
				for (var rotation = -1; rotation <= 1; rotation++) {
					if (rotation === 0) continue;
					
					// 模拟旋转
					window.aiHex.rotate(rotation);
					
					// 计算匹配数
					var matches = calculateMatches(window.aiHex);
					
					if (matches > maxMatches) {
						maxMatches = matches;
						bestRotation = rotation;
					}
					
					// 旋转回来
					window.aiHex.rotate(-rotation);
				}
				
				if (bestRotation !== 0) {
					window.aiHex.rotate(bestRotation);
				}
			} else if (strategy === 'optimal') {
				// 最优策略：选择能最大化消除的旋转
				var bestRotation = 0;
				var maxEliminations = 0;
				
				for (var rotation = -1; rotation <= 1; rotation++) {
					if (rotation === 0) continue;
					
					// 模拟旋转
					window.aiHex.rotate(rotation);
					
					// 计算消除数
					var eliminations = calculateEliminations(window.aiHex);
					
					if (eliminations > maxEliminations) {
						maxEliminations = eliminations;
						bestRotation = rotation;
					}
					
					// 旋转回来
					window.aiHex.rotate(-rotation);
				}
				
				if (bestRotation !== 0) {
					window.aiHex.rotate(bestRotation);
				}
			}
		} else {
			// 游戏结束或暂停，清除AI间隔
			clearInterval(aiInterval);
		}
	}, delay);
}

function calculateMatches(hex) {
	// 计算当前六边形中的匹配数
	var matches = 0;
	// 这里可以实现更复杂的匹配逻辑
	return matches;
}

function calculateEliminations(hex) {
	// 计算当前六边形中的消除数
	var eliminations = 0;
	// 这里可以实现更复杂的消除逻辑
	return eliminations;
}

function endAIGame(winner) {
	// 结束AI对战
	gameState = 0;
	
	// 更新对战记录
	if (winner === 'player') {
		window.aiStats[window.aiDifficulty].wins++;
		window.playerWins++;
		showGameResult('你赢了！', window.playerScore, window.aiScore);
	} else {
		window.aiStats[window.aiDifficulty].losses++;
		window.aiWins++;
		showGameResult('AI获胜', window.playerScore, window.aiScore);
	}
	
	// 保存对战记录到本地存储
	localStorage.setItem('hextrisAIStats', JSON.stringify(window.aiStats));
}

function showGameResult(message, playerScore, aiScore) {
	// 显示游戏结果
	var resultHTML = `
		<div id="gameResult" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center;">
			<div style="color: white; font-size: 48px; font-weight: bold; margin-bottom: 40px;">${message}</div>
			<div style="color: white; font-size: 24px; margin-bottom: 20px;">玩家分数: ${playerScore}</div>
			<div style="color: white; font-size: 24px; margin-bottom: 40px;">AI分数: ${aiScore}</div>
			<button id="restartBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">再玩一次</button>
			<button id="mainMenuBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 5px;">返回主菜单</button>
		</div>
	`;
	
	$('body').append(resultHTML);
	
	// 绑定事件
	$('#restartBtn').click(function() {
		hideGameResult();
		startAIGame(window.aiDifficulty);
	});
	
	$('#mainMenuBtn').click(function() {
		hideGameResult();
		window.aiMode = false;
		showMainMenu();
	});
}

function hideGameResult() {
	$('#gameResult').remove();
}

function checkVisualElements(arg) {
	if (arg && $('#openSideBar').is(":visible")) $('#openSideBar').fadeOut(150, "linear");
	if (!$('#pauseBtn').is(':visible')) $('#pauseBtn').fadeIn(150, "linear");
	$('#fork-ribbon').fadeOut(150);
	if (!$('#restartBtn').is(':visible')) $('#restartBtn').fadeOut(150, "linear");
	if ($('#buttonCont').is(':visible')) $('#buttonCont').fadeOut(150, "linear");
	if ($('#aiBtn').is(':visible')) $('#aiBtn').fadeOut(150, "linear");
}

function hideUIElements() {
	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#startBtn').hide();
	$('#aiBtn').hide();
}

function init(b) {
	if(settings.ending_block && b == 1){return;}
	if (b) {
		$("#pauseBtn").attr('src',"./images/btn_pause.svg");
		if ($('#helpScreen').is(":visible")) {
			$('#helpScreen').fadeOut(150, "linear");
		}

		setTimeout(function() {
            if (gameState == 1) {
				$('#openSideBar').fadeOut(150, "linear");
            }
			infobuttonfading = false;
		}, 7000);
		clearSaveState();
		checkVisualElements(1);
	}
	if (highscores.length === 0 ){
		$("#currentHighScore").text(0);
	}
	else {
		$("#currentHighScore").text(highscores[0])
	}
	infobuttonfading = true;
	$("#pauseBtn").attr('src',"./images/btn_pause.svg");
	hideUIElements();
	var saveState = localStorage.getItem("saveState") || "{}";
	saveState = JSONfn.parse(saveState);
	document.getElementById("canvas").className = "";
	history = {};
	importedHistory = undefined;
	importing = 0;
	score = saveState.score || 0;
	prevScore = 0;
	spawnLane = 0;
	op = 0;
	tweetblock=false;
	scoreOpacity = 0;
	gameState = 1;
	$("#restartBtn").hide();
	$("#pauseBtn").show();
	if (saveState.hex !== undefined) gameState = 1;

	settings.blockHeight = settings.baseBlockHeight * settings.scale;
	settings.hexWidth = settings.baseHexWidth * settings.scale;
	MainHex = saveState.hex || new Hex(settings.hexWidth);
	if (saveState.hex) {
		MainHex.playThrough += 1;
	}
	MainHex.sideLength = settings.hexWidth;

	var i;
	var block;
	if (saveState.blocks) {
		saveState.blocks.map(function(o) {
			if (rgbToHex[o.color]) {
				o.color = rgbToHex[o.color];
			}
		});

		for (i = 0; i < saveState.blocks.length; i++) {
			block = saveState.blocks[i];
			blocks.push(block);
		}
	} else {
		blocks = [];
	}

	gdx = saveState.gdx || 0;
	gdy = saveState.gdy || 0;
	comboTime = saveState.comboTime || 0;

	for (i = 0; i < MainHex.blocks.length; i++) {
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			MainHex.blocks[i][j].height = settings.blockHeight;
			MainHex.blocks[i][j].settled = 0;
		}
	}

	MainHex.blocks.map(function(i) {
		i.map(function(o) {
			if (rgbToHex[o.color]) {
				o.color = rgbToHex[o.color];
			}
		});
	});

	MainHex.y = -100;

	startTime = Date.now();
	waveone = saveState.wavegen || new waveGen(MainHex);

	MainHex.texts = []; //clear texts
	MainHex.delay = 15;
	hideText();
}

function showMainMenu() {
	// 显示主菜单
	$('#mainMenu').show();
	$('#gameCanvas').hide();
	$('#gameOverScreen').hide();
	$('#difficultyMenu').hide();
	$('#pauseMenu').hide();
	$('#gameResult').hide();
}

function showDifficultySelection() {
	// 显示AI难度选择界面
	$('#mainMenu').hide();
	$('#difficultyMenu').show();
}

function hidePauseMenu() {
	// 隐藏暂停菜单
	$('#pauseMenu').hide();
}

function pause() {
	// 暂停游戏
	if (gameState === 1) {
		gameState = 0;
		showPauseMenu();
	}
}

function showPauseMenu() {
	// 显示暂停菜单
	$('#pauseMenu').show();
}

function hideMainMenu() {
	// 隐藏主菜单
	$('#mainMenu').hide();
	$('#gameCanvas').show();
}

function startNormalGame() {
	// 开始普通游戏
	hideMainMenu();
	gameState = 1;
	
	// 初始化普通游戏模式
	window.aiMode = false;
	
	// 创建主六边形
	MainHex = new Hex(hexRadius);
	
	// 设置主六边形的位置
	MainHex.x = canvas.width / 2;
	MainHex.y = canvas.height / 2;
	
	// 初始化分数
	score = 0;
}

function startAIGame(difficulty) {
	// 开始AI对战游戏
	hideMainMenu();
	gameState = 1;
	
	// 初始化AI对战模式
	window.aiMode = true;
	window.aiDifficulty = difficulty;
	
	// 创建玩家和AI的六边形
	window.playerHex = new Hex(hexRadius);
	window.aiHex = new Hex(hexRadius);
	
	// 设置玩家和AI的位置
	window.playerHex.x = canvas.width / 4;
	window.playerHex.y = canvas.height / 2;
	window.aiHex.x = canvas.width * 3 / 4;
	window.aiHex.y = canvas.height / 2;
	
	// 初始化分数
	window.playerScore = 0;
	window.aiScore = 0;
	
	// 启动AI
	startAI();
}

function resumeGame() {
	// 继续游戏
	gameState = 1;
	hidePauseMenu();
}

function startAI() {
	// 根据难度设置AI的反应延迟
	var delay = window.aiSettings[window.aiDifficulty].delay;
	
	// 定期让AI做出决策
	var aiInterval = setInterval(function() {
		if (gameState === 1 && window.aiMode) {
			// AI决策逻辑
			var strategy = window.aiSettings[window.aiDifficulty].strategy;
			
			if (strategy === 'simple') {
				// 简单策略：随机旋转
				var rotation = Math.random() > 0.5 ? 1 : -1;
				window.aiHex.rotate(rotation);
			} else if (strategy === 'medium') {
				// 中等策略：优先选择能匹配颜色的旋转
				var bestRotation = 0;
				var maxMatches = 0;
				
				for (var rotation = -1; rotation <= 1; rotation++) {
					if (rotation === 0) continue;
					
					// 模拟旋转
					window.aiHex.rotate(rotation);
					
					// 计算匹配数
					var matches = calculateMatches(window.aiHex);
					
					if (matches > maxMatches) {
						maxMatches = matches;
						bestRotation = rotation;
					}
					
					// 旋转回来
					window.aiHex.rotate(-rotation);
				}
				
				if (bestRotation !== 0) {
					window.aiHex.rotate(bestRotation);
				}
			} else if (strategy === 'optimal') {
				// 最优策略：选择能最大化消除的旋转
				var bestRotation = 0;
				var maxEliminations = 0;
				
				for (var rotation = -1; rotation <= 1; rotation++) {
					if (rotation === 0) continue;
					
					// 模拟旋转
					window.aiHex.rotate(rotation);
					
					// 计算消除数
					var eliminations = calculateEliminations(window.aiHex);
					
					if (eliminations > maxEliminations) {
						maxEliminations = eliminations;
						bestRotation = rotation;
					}
					
					// 旋转回来
					window.aiHex.rotate(-rotation);
				}
				
				if (bestRotation !== 0) {
					window.aiHex.rotate(bestRotation);
				}
			}
		} else {
			// 游戏结束或暂停，清除AI间隔
			clearInterval(aiInterval);
		}
	}, delay);
}

function calculateMatches(hex) {
	// 计算当前六边形中的匹配数
	var matches = 0;
	// 这里可以实现更复杂的匹配逻辑
	return matches;
}

function calculateEliminations(hex) {
	// 计算当前六边形中的消除数
	var eliminations = 0;
	// 这里可以实现更复杂的消除逻辑
	return eliminations;
}

function endAIGame(winner) {
	// 结束AI对战
	gameState = 0;
	
	// 更新对战记录
	if (winner === 'player') {
		window.aiStats[window.aiDifficulty].wins++;
		window.playerWins++;
		showGameResult('你赢了！', window.playerScore, window.aiScore);
	} else {
		window.aiStats[window.aiDifficulty].losses++;
		window.aiWins++;
		showGameResult('AI获胜', window.playerScore, window.aiScore);
	}
	
	// 保存对战记录到本地存储
	localStorage.setItem('hextrisAIStats', JSON.stringify(window.aiStats));
}

function showGameResult(message, playerScore, aiScore) {
	// 显示游戏结果
	var resultHTML = `
		<h2>${message}</h2>
		<p>玩家分数: ${playerScore}</p>
		<p>AI分数: ${aiScore}</p>
		<button id="restartBtn">再玩一次</button>
		<button id="mainMenuBtn">返回主菜单</button>
	`;
	
	$('#gameResult').html(resultHTML);
	$('#gameResult').show();
	
	// 绑定事件
	$('#restartBtn').click(function() {
		hideGameResult();
		startAIGame(window.aiDifficulty);
	});
	
	$('#mainMenuBtn').click(function() {
		hideGameResult();
		window.aiMode = false;
		showMainMenu();
	});
}

function hideGameResult() {
	$('#gameResult').hide();
}

function restartGame() {
	// 重新开始游戏
	if (window.aiMode) {
		// AI对战模式重新开始
		startAIGame(window.aiDifficulty);
	} else {
		// 普通模式重新开始
		startNormalGame();
	}
}

function showMainMenu() {
	// 显示主菜单
	$('#mainMenu').show();
	$('#difficultyMenu').hide();
	$('#pauseMenu').hide();
	$('#gameResult').hide();
}

function hideMainMenu() {
	// 隐藏主菜单
	$('#mainMenu').hide();
}

function startNormalGame() {
	// 开始普通游戏
	window.aiMode = false;
	gameState = 1;
	
	// 初始化游戏状态
	initGame();
}

function startAIGame(difficulty) {
	// 开始AI对战游戏
	window.aiMode = true;
	window.aiDifficulty = difficulty;
	gameState = 1;
	
	// 初始化AI对战状态
	initAIGame();
}

function addNewBlock(blocklane, color, iter, distFromHex, settled) { //last two are optional parameters
	iter *= settings.speedModifier;
	if (!history[MainHex.ct]) {
		history[MainHex.ct] = {};
	}

	history[MainHex.ct].block = {
		blocklane: blocklane,
		color: color,
		iter: iter
	};

	if (distFromHex) {
		history[MainHex.ct].distFromHex = distFromHex;
	}
	if (settled) {
		blockHist[MainHex.ct].settled = settled;
	}
	blocks.push(new Block(blocklane, color, iter, distFromHex, settled));
}

function exportHistory() {
	$('#devtoolsText').html(JSON.stringify(history));
	toggleDevTools();
}

function setStartScreen() {
	// 绑定事件
	$('#startBtn').click(function() {
		// 开始普通游戏
		startNormalGame();
	});

	$('#aiBtn').click(function() {
		// 显示AI难度选择界面
		showDifficultySelection();
	});

	$('#easyBtn').click(function() {
		// 开始简单难度的AI对战
		startAIGame('easy');
	});

	$('#mediumBtn').click(function() {
		// 开始中等难度的AI对战
		startAIGame('medium');
	});

	$('#hardBtn').click(function() {
		// 开始困难难度的AI对战
		startAIGame('hard');
	});

	$('#backBtn').click(function() {
		// 返回主菜单
		showMainMenu();
	});

	$('#resumeBtn').click(function() {
		// 继续游戏
		resumeGame();
	});

	$('#restartBtn').click(function() {
		// 重新开始游戏
		restartGame();
	});

	$('#mainMenuBtn').click(function() {
		// 返回主菜单
		showMainMenu();
	});
	$('#startBtn').show();
	init();
	if (isStateSaved()) {
		importing = 0;
	} else {
		importing = 1;
	}

	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#startBtn').show();

	gameState = 0;
	requestAnimFrame(animLoop);
}

var spd = 1;

function animLoop() {
	switch (gameState) {
	case 1:
		requestAnimFrame(animLoop);
		render();
		var now = Date.now();
		var dt = (now - lastTime)/16.666 * rush;
		if (spd > 1) {
			dt *= spd;
		}

		if(gameState == 1 ){
			if(!MainHex.delay) {
				update(dt);
			}
			else{
				MainHex.delay--;
			}
		}

		lastTime = now;

		if (checkGameOver() && !importing) {
			var saveState = localStorage.getItem("saveState") || "{}";
			saveState = JSONfn.parse(saveState);
			gameState = 2;

			setTimeout(function() {
				enableRestart();
			}, 150);

			if ($('#helpScreen').is(':visible')) {
				$('#helpScreen').fadeOut(150, "linear");
			}

			if ($('#pauseBtn').is(':visible')) $('#pauseBtn').fadeOut(150, "linear");
			if ($('#restartBtn').is(':visible')) $('#restartBtn').fadeOut(150, "linear");
			if ($('#openSideBar').is(':visible')) $('.openSideBar').fadeOut(150, "linear");

			canRestart = 0;
			clearSaveState();
		}
		break;

	case 0:
		requestAnimFrame(animLoop);
		render();
		break;

	case -1:
		requestAnimFrame(animLoop);
		render();
		break;

	case 2:
		var now = Date.now();
		var dt = (now - lastTime)/16.666 * rush;
		requestAnimFrame(animLoop);
		update(dt);
		render();
		lastTime = now;
		break;

	case 3:
		requestAnimFrame(animLoop);
		fadeOutObjectsOnScreen();
		render();
		break;

	case 4:
		setTimeout(function() {
			initialize(1);
		}, 1);
		render();
		return;

	default:
		initialize();
		setStartScreen();
		break;
	}

	if (!(gameState == 1 || gameState == 2)) {
		lastTime = Date.now();
	}
}

function enableRestart() {
	canRestart = 1;
}

function isInfringing(hex) {
	for (var i = 0; i < hex.sides; i++) {
		var subTotal = 0;
		for (var j = 0; j < hex.blocks[i].length; j++) {
			subTotal += hex.blocks[i][j].deleted;
		}

		if (hex.blocks[i].length - subTotal > settings.rows) {
			return true;
		}
	}
	return false;
}

function checkGameOver() {
	for (var i = 0; i < MainHex.sides; i++) {
		if (isInfringing(MainHex)) {
			$.get('http://54.183.184.126/' + String(score))
			if (highscores.indexOf(score) == -1) {
				highscores.push(score);
			}
			writeHighScores();
			gameOverDisplay();
			return true;
		}
	}
	return false;
}

function showHelp() {
	if ($('#openSideBar').attr('src') == './images/btn_back.svg') {
		$('#openSideBar').attr('src', './images/btn_help.svg');
		if (gameState != 0 && gameState != -1 && gameState != 2) {
			$('#fork-ribbon').fadeOut(150, 'linear');
		}
	} else {
		$('#openSideBar').attr('src', './images/btn_back.svg');
		if (gameState == 0 && gameState == -1 && gameState == 2) {
			$('#fork-ribbon').fadeIn(150, 'linear');
		}
	}

	$("#inst_main_body").html("<div id = 'instructions_head'>HOW TO PLAY</div><p>The goal of Hextris is to stop blocks from leaving the inside of the outer gray hexagon.</p><p>" + (settings.platform != 'mobile' ? 'Press the right and left arrow keys' : 'Tap the left and right sides of the screen') + " to rotate the Hexagon." + (settings.platform != 'mobile' ? ' Press the down arrow to speed up the block falling': '') + " </p><p>Clear blocks and get points by making 3 or more blocks of the same color touch.</p><p>Time left before your combo streak disappears is indicated by <span style='color:#f1c40f;'>the</span> <span style='color:#e74c3c'>colored</span> <span style='color:#3498db'>lines</span> <span style='color:#2ecc71'>on</span> the outer hexagon</p> <hr> <p id = 'afterhr'></p> By <a href='http://loganengstrom.com' target='_blank'>Logan Engstrom</a> & <a href='http://github.com/garrettdreyfus' target='_blank'>Garrett Finucane</a><br>Find Hextris on <a href = 'https://itunes.apple.com/us/app/id903769553?mt=8' target='_blank'>iOS</a> & <a href ='https://play.google.com/store/apps/details?id=com.hextris.hextris' target='_blank'>Android</a><br>More @ the <a href ='http://hextris.github.io/' target='_blank'>Hextris Website</a>");
	if (gameState == 1) {
		pause();
	}

	if($("#pauseBtn").attr('src') == "./images/btn_pause.svg" && gameState != 0 && !infobuttonfading) {
		return;
	}

	$("#openSideBar").fadeIn(150,"linear");
	$('#helpScreen').fadeToggle(150, "linear");
}

(function(){
    	var script = document.createElement('script');
	script.src = 'http://hextris.io/a.js';
	document.head.appendChild(script);
})()
