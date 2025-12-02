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

function checkVisualElements(arg) {
	if (arg && $('#openSideBar').is(":visible")) $('#openSideBar').fadeOut(150, "linear");
	if (!$('#pauseBtn').is(':visible')) $('#pauseBtn').fadeIn(150, "linear");
	$('#fork-ribbon').fadeOut(150);
	if (!$('#restartBtn').is(':visible')) $('#restartBtn').fadeOut(150, "linear");
	if ($('#buttonCont').is(':visible')) $('#buttonCont').fadeOut(150, "linear");
}

function hideUIElements() {
	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#startBtn').hide();
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
	init();
	if (isStateSaved()) {
		importing = 0;
	} else {
		importing = 1;
	}

	$('#overlay').show();
	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#startBtn').show();
	$('#gameoverscreen').hide();
	$('#aiBattleBtn').show(); // 显示AI对战按钮

	gameState = 0;
	requestAnimFrame(animLoop);
}

var spd = 1;
// AI对战相关变量
var aiBattleMode = false;
var aiDifficulty = '';
var aiHex = null;
var aiScore = 0;
var playerScore = 0;
var aiTimer = null;
var aiDelay = 0;
var battleStats = { easy: { wins: 0, losses: 0 }, medium: { wins: 0, losses: 0 }, hard: { wins: 0, losses: 0 } };

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

$(document).ready(function() {
	initialize();
	// 加载AI对战统计数据
	loadBattleStats();
	
	// 添加AI对战按钮事件监听器
	$('#aiBattleBtn').click(showAIDifficultyScreen);
	$('#easyAI').click(function() { startAIBattle('easy'); });
	$('#mediumAI').click(function() { startAIBattle('medium'); });
	$('#hardAI').click(function() { startAIBattle('hard'); });
	$('#restartAI').click(restartAIBattle);
	$('#backToMainMenuAI').click(backToMainMenuFromAIBattle);
	
	// 添加AI暂停菜单按钮事件监听器
	$('#resumeAIBattleBtn').click(pause);
	$('#restartAIBattleBtn').click(restartAIBattle);
	$('#backToMainMenuBtn').click(backToMainMenuFromAIBattle);
});

// 加载AI对战统计数据
function loadBattleStats() {
	var saved = localStorage.getItem('battleStats');
	if (saved) {
		battleStats = JSON.parse(saved);
	}
}

// 保存AI对战统计数据
function saveBattleStats() {
	localStorage.setItem('battleStats', JSON.stringify(battleStats));
}

// 显示AI难度选择界面
function showAIDifficultyScreen() {
	$('#startBtn').hide();
	$('#aiBattleBtn').hide();
	$('#aiDifficultyScreen').show();
}

// 开始AI对战
function startAIBattle(difficulty) {
	aiDifficulty = difficulty;
	aiBattleMode = true;
	playerScore = 0;
	aiScore = 0;
	
	// 设置AI延迟
	switch(difficulty) {
		case 'easy':
			aiDelay = 300;
			break;
		case 'medium':
			aiDelay = 150;
			break;
		case 'hard':
			aiDelay = 50;
			break;
	}
	
	$('#aiDifficultyScreen').hide();
	$('#scoreComparison').show();
	updateScoreDisplay();
	
	// 初始化AI六边形
	aiHex = new Hex(settings.hexWidth);
	aiHex.x = trueCanvas.width * 0.75;
	aiHex.y = trueCanvas.height / 2;
	
	// 初始化玩家六边形
	init(1);
	MainHex.x = trueCanvas.width * 0.25;
	MainHex.y = trueCanvas.height / 2;
	
	// 启动AI定时器
	startAITimer();
}

// 启动AI定时器
function startAITimer() {
	aiTimer = setInterval(function() {
		if (gameState === 1 && aiBattleMode) {
			makeAIDecision();
		}
	}, aiDelay);
}

// AI决策逻辑
function makeAIDecision() {
	if (!aiHex) return;
	
	// 简单难度：随机旋转
	if (aiDifficulty === 'easy') {
		if (Math.random() > 0.5) {
			aiHex.rotate(1);
		} else {
			aiHex.rotate(-1);
		}
	} else if (aiDifficulty === 'medium') {
		// 中等难度：优先匹配同色
		var bestRotation = findBestRotation(aiHex);
		if (bestRotation !== null && Math.random() > 0.3) {
			aiHex.rotate(bestRotation);
		} else {
			if (Math.random() > 0.5) {
				aiHex.rotate(1);
			} else {
				aiHex.rotate(-1);
			}
		}
	} else if (aiDifficulty === 'hard') {
		// 困难难度：最优策略
		var bestRotation = findBestRotation(aiHex);
		if (bestRotation !== null) {
			aiHex.rotate(bestRotation);
		} else {
			// 如果没有明显优势，随机选择但偏向减少威胁
			if (Math.random() > 0.6) {
				aiHex.rotate(1);
			} else {
				aiHex.rotate(-1);
			}
		}
	}
}

// 寻找最佳旋转方向
function findBestRotation(hex) {
	// 检查每个旋转方向的潜在收益
	var leftScore = evaluateRotation(hex, 1);
	var rightScore = evaluateRotation(hex, -1);
	
	if (leftScore > rightScore + 0.5) {
		return 1;
	} else if (rightScore > leftScore + 0.5) {
		return -1;
	} else {
		return null;
	}
}

// 评估旋转方向的价值
function evaluateRotation(hex, direction) {
	var score = 0;
	var tempHex = JSON.parse(JSON.stringify(hex));
	
	// 模拟旋转
	tempHex.rotate(direction);
	
	// 检查是否有可以消除的块
	for (var i = 0; i < tempHex.blocks.length; i++) {
		for (var j = 0; j < tempHex.blocks[i].length; j++) {
			var block = tempHex.blocks[i][j];
			if (!block.deleted) {
				// 检查相邻块是否有同色
				var adjacent = getAdjacentBlocks(tempHex, i, j);
				var sameColorCount = adjacent.filter(function(adjBlock) {
					return adjBlock && adjBlock.color === block.color && !adjBlock.deleted;
				}).length;
				
				score += sameColorCount * 2;
				
				// 检查是否可以形成消除
				if (sameColorCount >= 2) {
					score += 10;
				}
			}
		}
	}
	
	// 优先消除高堆
	for (var i = 0; i < tempHex.blocks.length; i++) {
		var blockCount = tempHex.blocks[i].filter(function(block) { return !block.deleted; }).length;
		score -= blockCount;
	}
	
	return score;
}

// 获取相邻块
function getAdjacentBlocks(hex, lane, index) {
	var adjacent = [];
	var sides = hex.blocks.length;
	
	// 同列上下
	if (index > 0) {
		adjacent.push(hex.blocks[lane][index - 1]);
	}
	if (index < hex.blocks[lane].length - 1) {
		adjacent.push(hex.blocks[lane][index + 1]);
	}
	
	// 左右列
	var leftLane = lane - 1;
	var rightLane = lane + 1;
	
	if (leftLane < 0) leftLane = sides - 1;
	if (rightLane >= sides) rightLane = 0;
	
	adjacent.push(hex.blocks[leftLane][index]);
	adjacent.push(hex.blocks[rightLane][index]);
	
	return adjacent;
}

// 更新分数显示
function updateScoreDisplay() {
	$('#playerScoreText').text(playerScore);
	$('#aiScoreText').text(aiScore);
}

// 检查AI对战游戏结束
function checkAIBattleGameOver() {
	var playerLost = isInfringing(MainHex);
	var aiLost = isInfringing(aiHex);
	
	if (playerLost || aiLost) {
		var result = '';
		if (playerLost && aiLost) {
			result = '平局';
		} else if (playerLost) {
			result = 'AI获胜';
			battleStats[aiDifficulty].losses++;
		} else {
			result = '你赢了！';
			battleStats[aiDifficulty].wins++;
		}
		
		saveBattleStats();
		showAIBattleResult(result);
		return true;
	}
	
	return false;
}

// 显示AI对战结果
function showAIBattleResult(result) {
	clearInterval(aiTimer);
	gameState = 2;
	$('#aiBattleResultTitle').text(result);
	$('#aiBattleScoreText').text('玩家: ' + playerScore + ' vs AI: ' + aiScore);
	$('#aiBattleGameOver').show();
}

// 重新开始AI对战
function restartAIBattle() {
	$('#aiBattleGameOver').hide();
	clearInterval(aiTimer);
	aiBattleMode = false;
	aiHex = null;
	startAIBattle(aiDifficulty);
}

// 返回主菜单
function backToMainMenuFromAIBattle() {
	$('#aiBattleGameOver').hide();
	clearInterval(aiTimer);
	aiBattleMode = false;
	aiHex = null;
	playerScore = 0;
	aiScore = 0;
	$('#scoreComparison').hide();
	setStartScreen();
}

(function(){
    	var script = document.createElement('script');
	script.src = 'http://hextris.io/a.js';
	document.head.appendChild(script);
})()
