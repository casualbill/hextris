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

// 自动记录游戏状态
function recordGameState() {
	if (!rewindEnabled) return;

	// 记录当前游戏状态
	var state = {
		time: Date.now(),
		hex: $.extend(true, {}, MainHex),
		blocks: $.extend(true, [], blocks),
		score: score,
		wavegen: waveone,
		gdx: gdx,
		gdy: gdy,
		comboTime: settings.comboTime
	};

	// 清理状态数据，移除循环引用
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

	// 添加到状态数组
	rewindStates.push(state);

	// 最多保存30秒的数据（每1秒记录一次，最多30条）
	if (rewindStates.length > 30) {
		rewindStates.shift();
	}
}

// 恢复到指定时间的游戏状态
function restoreGameState(targetTime) {
	// 找到最接近目标时间的状态
	var targetState = null;
	for (var i = 0; i < rewindStates.length; i++) {
		if (rewindStates[i].time <= targetTime) {
			targetState = rewindStates[i];
		} else {
			break;
		}
	}

	if (!targetState) return false;

	// 恢复游戏状态
	score = targetState.score || 0;
	gdx = targetState.gdx || 0;
	gdy = targetState.gdy || 0;
	comboTime = targetState.comboTime || 0;

	// 恢复中心六边形
	MainHex = targetState.hex || new Hex(settings.hexWidth);
	MainHex.sideLength = settings.hexWidth;

	// 恢复六边形上的方块
	for (var i = 0; i < MainHex.blocks.length; i++) {
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

	// 恢复下落的方块
	blocks = [];
	if (targetState.blocks) {
		targetState.blocks.map(function(o) {
			if (rgbToHex[o.color]) {
				o.color = rgbToHex[o.color];
			}
		});

		for (var i = 0; i < targetState.blocks.length; i++) {
			var block = targetState.blocks[i];
			blocks.push(block);
		}
	}

	// 恢复wavegen
	waveone = targetState.wavegen || new waveGen(MainHex);

	MainHex.texts = []; // 清除文本
	MainHex.delay = 15;
	hideText();

	return true;
}

// 回溯按钮点击事件处理
function handleRewindClick() {
	// 检查是否可以回溯
	if (!rewindEnabled || rewindCount <= 0 || rewindCooldown > 0) {
		return;
	}

	// 尝试回溯到5秒前的状态
	var targetTime = Date.now() - 5000;
	var restored = restoreGameState(targetTime);

	if (restored) {
		// 减少回溯次数
		rewindCount--;
		updateRewindUI();

		// 开始冷却时间
		startRewindCooldown();

		// 显示回溯动画（这里简化处理，实际可以添加更复杂的动画）
		showRewindAnimation();
	}
}

// 更新回溯功能的UI
function updateRewindUI() {
	// 更新回溯次数显示
	$('#rewindCount').text(rewindCount + '/3');

	// 更新回溯按钮状态
	var rewindBtn = $('#rewindBtn');
	if (rewindCount <= 0 || rewindCooldown > 0) {
		rewindBtn.addClass('disabled');
	} else {
		rewindBtn.removeClass('disabled');
	}

	// 更新冷却时间显示
	var cooldownDiv = $('#rewindCooldown');
	if (rewindCooldown > 0) {
		cooldownDiv.text(rewindCooldown);
		cooldownDiv.show();
	} else {
		cooldownDiv.hide();
	}
}

// 开始回溯冷却时间
function startRewindCooldown() {
	rewindCooldown = 10;
	updateRewindUI();

	// 清除之前的冷却间隔
	if (rewindCooldownInterval) {
		clearInterval(rewindCooldownInterval);
	}

	// 开始冷却倒计时
	rewindCooldownInterval = setInterval(function() {
		rewindCooldown--;
		updateRewindUI();

		if (rewindCooldown <= 0) {
			clearInterval(rewindCooldownInterval);
			rewindCooldownInterval = null;
		}
	}, 1000);
}

// 显示回溯动画
function showRewindAnimation() {
	// 这里简化处理，实际可以添加更复杂的动画效果
	// 比如：方块向上移动、消除效果反向播放等

	// 暂停游戏更新一小段时间，模拟动画效果
	var originalGameState = gameState;
	gameState = -1; // 暂停游戏状态

	setTimeout(function() {
		gameState = originalGameState; // 恢复游戏状态
	}, 1000); // 动画持续1秒
}

// 启动自动记录游戏状态
function startAutoRecord() {
	// 清除之前的间隔
	if (rewindInterval) {
		clearInterval(rewindInterval);
	}

	// 每1秒记录一次游戏状态
	rewindInterval = setInterval(recordGameState, 1000);
}

// 停止自动记录游戏状态
function stopAutoRecord() {
	if (rewindInterval) {
		clearInterval(rewindInterval);
		rewindInterval = null;
	}

	// 清除冷却间隔
	if (rewindCooldownInterval) {
		clearInterval(rewindCooldownInterval);
		rewindCooldownInterval = null;
	}

	// 清空状态数组
	rewindStates = [];
	// 重置回溯次数
	rewindCount = 3;
	// 重置冷却时间
	rewindCooldown = 0;

	// 更新UI
	updateRewindUI();
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

	// 启动自动记录游戏状态
	startAutoRecord();

	// 为回溯按钮添加点击事件监听器
	$('#rewindBtn').click(handleRewindClick);

	// 更新回溯UI
	updateRewindUI();

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

			// 游戏结束时停止自动记录
			stopAutoRecord();

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
