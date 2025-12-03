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
	// 显示回溯按钮
	if (settings.backtrackEnabled) {
		$('#backtrackBtn').show();
	}
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
	// 初始化回溯相关变量
	window.backtrackStates = [];
	window.backtrackTimer = null;
	window.backtrackUses = 0;
	window.backtrackMaxUses = 3;
	window.backtrackCooldown = 0;
	window.backtrackCooldownTime = 10;
	window.isBacktracking = false;
	
	// 更新回溯按钮显示
	updateBacktrackButton();
	
	// 绑定回溯按钮点击事件
	$('#backtrackBtn').off('touchstart mousedown').on('touchstart mousedown', function(e) {
		e.preventDefault();
		e.stopPropagation(); // 阻止事件冒泡，避免触发六边形旋转
		if (!settings.backtrackEnabled || gameState !== 1 || isBacktracking) return;
		
		// 检查是否还有使用次数
		if (backtrackUses >= backtrackMaxUses) return;
		
		// 检查是否在冷却中
		if (backtrackCooldown > 0) return;
		
		// 执行回溯
		performBacktrack();
	});
	
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

// 保存游戏状态用于回溯
function saveBacktrackState() {
	if (!settings.backtrackEnabled || gameState !== 1 || isBacktracking) return;
	
	var state = {
		timestamp: Date.now(),
		hex: $.extend(true, {}, MainHex),
		blocks: $.extend(true, [], blocks),
		score: score,
		wavegen: waveone,
		gdx: gdx,
		gdy: gdy,
		comboTime: settings.comboTime,
		rush: rush,
		spawnLane: spawnLane
	};

	// 对对象进行深拷贝并缩放处理
	state.hex.blocks.map(function(a) {
		for (var i = 0; i < a.length; i++) {
			a[i] = $.extend(true, {}, a[i]);
		}
		a.map(descaleBlock);
	});

	for (var i = 0; i < state.blocks.length; i++) {
		state.blocks[i] = $.extend(true, {}, state.blocks[i]);
	}

	state.blocks.map(descaleBlock);
	
	// 添加到状态列表
	backtrackStates.push(state);
	
	// 只保留最近30秒的状态
	while (backtrackStates.length > 30) {
		backtrackStates.shift();
	}
}

// 开始记录回溯状态
function startBacktrackingRecording() {
	if (!settings.backtrackEnabled) return;
	
	// 先立即保存一次状态
	saveBacktrackState();
	
	// 每1秒保存一次状态
	if (backtrackTimer) clearInterval(backtrackTimer);
	backtrackTimer = setInterval(saveBacktrackState, 1000);
}



// 执行回溯功能
function performBacktrack() {
	// 增加使用次数
	backtrackUses++;
	updateBacktrackButton();
	
	// 开始冷却
	backtrackCooldown = backtrackCooldownTime;
	startBacktrackCooldown();
	
	// 查找5秒前的状态
	var targetTime = Date.now() - 5000;
	var targetState = null;
	
	for (var i = backtrackStates.length - 1; i >= 0; i--) {
		if (backtrackStates[i].timestamp <= targetTime) {
			targetState = backtrackStates[i];
			break;
		}
	}
	
	if (!targetState) {
		// 没有找到足够旧的状态
		return;
	}
	
	// 开始回溯动画
	startBacktrackAnimation(targetState);
}

// 更新回溯按钮显示
function updateBacktrackButton() {
	$('#backtrackCount').text(backtrackMaxUses - backtrackUses);
	
	if (backtrackUses >= backtrackMaxUses || backtrackCooldown > 0) {
		$('#backtrackBtn').addClass('backtrack-disabled');
	} else {
		$('#backtrackBtn').removeClass('backtrack-disabled');
	}
}

// 回溯冷却计时器
function startBacktrackCooldown() {
	var cooldownInterval = setInterval(function() {
		backtrackCooldown--;
		
		if (backtrackCooldown > 0) {
			$('#backtrackIcon').text(backtrackCooldown);
			$('#backtrackBtn').addClass('backtrack-disabled');
		} else {
			$('#backtrackIcon').text('↶');
			clearInterval(cooldownInterval);
			if (backtrackUses < backtrackMaxUses) {
				$('#backtrackBtn').removeClass('backtrack-disabled');
			}
		}
	}, 1000);
}

// 开始回溯动画
function startBacktrackAnimation(targetState) {
	isBacktracking = true;
	
	// 暂停游戏逻辑
	var originalGameState = gameState;
	gameState = -2; // 自定义回溯状态
	
	// 播放1秒倒放动画
	setTimeout(function() {
		// 恢复到目标状态
		restoreGameState(targetState);
		
		// 恢复游戏
		gameState = originalGameState;
		isBacktracking = false;
	}, 1000);
}

// 恢复游戏状态
function restoreGameState(state) {
	// 恢复分数
	score = state.score;
	prevScore = score;
	
	// 恢复六边形状态
	MainHex = $.extend(true, {}, state.hex);
	
	// 恢复方块状态
	blocks = [];
	for (var i = 0; i < state.blocks.length; i++) {
		var block = $.extend(true, {}, state.blocks[i]);
		block.distFromHex *= settings.scale;
		block.height = settings.blockHeight;
		blocks.push(block);
	}
	
	// 恢复其他游戏状态
	gdx = state.gdx;
	gdy = state.gdy;
	settings.comboTime = state.comboTime;
	rush = state.rush;
	spawnLane = state.spawnLane;
	waveone = state.wavegen;
	
	// 恢复六边形上的方块
	for (var i = 0; i < MainHex.blocks.length; i++) {
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			MainHex.blocks[i][j].height = settings.blockHeight;
			MainHex.blocks[i][j].settled = 0;
		}
	}
	
	// 更新颜色映射
	MainHex.blocks.map(function(i) {
		i.map(function(o) {
			if (rgbToHex[o.color]) {
				o.color = rgbToHex[o.color];
			}
		});
	});
}

// 清除回溯数据
function clearBacktrackData() {
	if (backtrackTimer) {
		clearInterval(backtrackTimer);
		backtrackTimer = null;
	}
	backtrackStates = [];
	backtrackUses = 0;
	backtrackCooldown = 0;
	isBacktracking = false;
}

function setStartScreen() {
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
		if ($('#backtrackBtn').is(':visible')) $('#backtrackBtn').fadeOut(150, "linear");
		if ($('#openSideBar').is(':visible')) $('.openSideBar').fadeOut(150, "linear");

		canRestart = 0;
		clearSaveState();
		// 清除回溯数据
		clearBacktrackData();
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
		
	case -2:
		// 回溯动画状态，只渲染不更新游戏逻辑
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
