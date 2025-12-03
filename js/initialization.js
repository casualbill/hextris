$(document).ready(function() {
	initialize();
});
function initialize(a) {
	window.rush = 1;
	window.lastTime = Date.now();
	window.iframHasLoaded = false;
	window.colors = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"];
	window.hexColorsToTintedColors = {
		"#e74c3c": "rgb(241,163,155)",
		"#f1c40f": "rgb(246,223,133)",
		"#3498db": "rgb(151,201,235)",
		"#2ecc71": "rgb(150,227,183)"
	};

	window.rgbToHex = {
		"rgb(231,76,60)": "#e74c3c",
		"rgb(241,196,15)": "#f1c40f",
		"rgb(52,152,219)": "#3498db",
		"rgb(46,204,113)": "#2ecc71"
	};

	window.rgbColorsToTintedColors = {
		"rgb(231,76,60)": "rgb(241,163,155)",
		"rgb(241,196,15)": "rgb(246,223,133)",
		"rgb(52,152,219)": "rgb(151,201,235)",
		"rgb(46,204,113)": "rgb(150,227,183)"
	};

	window.hexagonBackgroundColor = 'rgb(236, 240, 241)';
	window.hexagonBackgroundColorClear = 'rgba(236, 240, 241, 0.5)';
	window.centerBlue = 'rgb(44,62,80)';
	window.angularVelocityConst = 4;
	window.scoreOpacity = 0;
	window.textOpacity = 0;
	window.prevGameState = undefined;
	window.op = 0;
	window.saveState = localStorage.getItem("saveState") || "{}";
	if (saveState !== "{}") {
		op = 1;
	}

	window.textShown = false;
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / framerate);
		};
	})();
	$('#clickToExit').bind('click', toggleDevTools);
	window.settings;
	// 回溯功能设置
	window.backtrackEnabled = true; // 回溯功能开关，默认开启
	window.backtrackMaxUses = 3;    // 每局游戏最多使用3次回溯
	window.backtrackCooldown = 10;  // 冷却时间10秒
	window.backtrackHistory = [];   // 回溯历史记录（最多保存30秒，每1秒记录一次）
	window.backtrackHistorySize = 30; // 历史记录最大条数
	window.backtrackTargetSeconds = 5; // 回溯到5秒前
	window.backtrackUses = 0;       // 当前已使用次数
	window.backtrackLastUseTime = 0;// 上次使用时间
	window.backtrackRecording = false; // 是否正在记录回溯数据
	window.backtrackRewinding = false; // 是否正在回放回溯动画
	window.backtrackRewindStartTime = 0; // 回溯动画开始时间
	window.backtrackRewindDuration = 1000; // 回溯动画持续时间（1秒）
	
	if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $('.rrssb-email').remove();
		settings = {
			os: "other",
			platform: "mobile",
			startDist: 227,
			creationDt: 60,
			baseScale: 1.4,
			scale: 1,
			prevScale: 1,
			baseHexWidth: 87,
			hexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 20,
			rows: 7,
			speedModifier: 0.73,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.73,
			comboTime: 310
		};
	} else {
		settings = {
			os: "other",
			platform: "nonmobile",
			baseScale: 1,
			startDist: 340,
			creationDt: 9,
			scale: 1,
			prevScale: 1,
			hexWidth: 65,
			baseHexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 15,
			rows: 8,
			speedModifier: 0.65,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.65,
			comboTime: 310
		};

	}
	if(/Android/i.test(navigator.userAgent)) {
		settings.os = "android";
	}

	if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
		settings.os="ios";
	}

	window.canvas = document.getElementById('canvas');
	window.ctx = canvas.getContext('2d');
	window.trueCanvas = {
		width: canvas.width,
		height: canvas.height
	};
	scaleCanvas();

	window.framerate = 60;
	window.history = {};
	window.score = 0;
	window.scoreAdditionCoeff = 1;
	window.prevScore = 0;
	window.numHighScores = 3;

	highscores = [];
	if (localStorage.getItem('highscores')) {
		try {
			highscores = JSON.parse(localStorage.getItem('highscores'));
		} catch (e) {
			highscores = [];
		}
	}
	window.blocks = [];
	window.MainHex;
	window.gdx = 0;
	window.gdy = 0;
	window.devMode = 0;
	window.lastGen = undefined;
	window.prevTimeScored = undefined;
	window.nextGen = undefined;
	window.spawnLane = 0;
	window.importing = 0;
	window.importedHistory = undefined;
	window.startTime = undefined;
	window.gameState;
	setStartScreen();
	if (a != 1) {
		window.canRestart = 1;
		window.onblur = function(e) {
			if (gameState == 1) {
				pause();
			}
		};
		$('#startBtn').off();
		if (settings.platform == 'mobile') {
			$('#startBtn').on('touchstart', startBtnHandler);
		} else {
			$('#startBtn').on('mousedown', startBtnHandler);
		}

		document.addEventListener('touchmove', function(e) {
			e.preventDefault();
		}, false);
		$(window).resize(scaleCanvas);
		$(window).unload(function() {

			if (gameState == 1 || gameState == -1 || gameState === 0) localStorage.setItem("saveState", exportSaveState());
			else localStorage.setItem("saveState", "{}");
		});

		addKeyListeners();
		(function(i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o), m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
		ga('create', 'UA-51272720-1', 'teamsnowman.github.io');
		ga('send', 'pageview');

		document.addEventListener("pause", handlePause, false);
		document.addEventListener("backbutton", handlePause, false);
		document.addEventListener("menubutton", handlePause, false); //menu button on android

		setTimeout(function() {
			if (settings.platform == "mobile") {
				try {
					document.body.removeEventListener('touchstart', handleTapBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('touchstart', handleTap, false);
				} catch (e) {

				}

				document.body.addEventListener('touchstart', handleTapBefore, false);
			} else {
				try {
					document.body.removeEventListener('mousedown', handleClickBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('mousedown', handleClick, false);
				} catch (e) {

				}

				document.body.addEventListener('mousedown', handleClickBefore, false);
			}
		}, 1);
	}
	
	// 创建回溯按钮
	createBacktrackButton();
}

// 创建回溯按钮元素
function createBacktrackButton() {
	// 只在按钮不存在时创建
	if ($('#backtrackBtn').length === 0) {
		$('body').append(
			'<div id="backtrackBtn" style="position:fixed;top:10px;right:10px;width:72px;height:72px;z-index:3002;cursor:pointer;background-color:rgba(52,152,219,0.8);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-family:Exo;font-size:18px;font-weight:bold;box-shadow:0 4px 8px rgba(0,0,0,0.2);transition:all 0.3s ease;" onclick="handleBacktrack()"></div>' +
			'<style>#backtrackBtn:hover{background-color:rgba(52,152,219,1);transform:scale(1.1);}#backtrackBtn.disabled{background-color:#ccc !important;cursor:not-allowed !important;transform:none !important;}</style>'
		);
	}
	
	// 初始化按钮显示状态
	updateBacktrackButton();
}

// 更新回溯按钮状态
function updateBacktrackButton() {
	var btn = $('#backtrackBtn');
	var now = Date.now();
	var timeSinceLastUse = (now - backtrackLastUseTime) / 1000;
	var isCooldown = timeSinceLastUse < backtrackCooldown;
	var hasMaxUses = backtrackUses >= backtrackMaxUses;
	var isDisabled = !backtrackEnabled || isCooldown || hasMaxUses;
	
	if (backtrackEnabled) {
		btn.show();
		if (isDisabled) {
			btn.addClass('disabled');
			if (isCooldown) {
				var cooldownLeft = Math.ceil(backtrackCooldown - timeSinceLastUse);
				btn.html('' + cooldownLeft);
			} else if (hasMaxUses) {
				btn.html('0/3');
			} else {
				btn.html('回溯');
			}
		} else {
			btn.removeClass('disabled');
			btn.html('' + (backtrackMaxUses - backtrackUses));
		}
	} else {
		btn.hide();
	}
}

// 开始记录回溯数据
function startBacktrackRecording() {
	if (!backtrackRecording && backtrackEnabled) {
		backtrackRecording = true;
		backtrackHistory = [];
		// 每秒记录一次状态
		backtrackInterval = setInterval( recordBacktrackState, 1000 );
	}
}

// 停止记录回溯数据
function stopBacktrackRecording() {
	if (backtrackRecording) {
		backtrackRecording = false;
		clearInterval(backtrackInterval);
	}
}

// 记录当前游戏状态到回溯历史
function recordBacktrackState() {
	// 保存游戏状态
	var state = {
		timestamp: Date.now(),
		MainHex: $.extend(true, {}, MainHex),
		blocks: $.extend(true, [], blocks),
		score: score,
		wavegen: waveone,
		gdx: gdx,
		gdy: gdy,
		gameState: gameState,
		startTime: startTime,
		mainHexCt: MainHex.ct,
		waveoneLastGen: waveone ? waveone.lastGen : 0,
		waveoneDt: waveone ? waveone.dt : 0,
		waveoneDifficulty: waveone ? waveone.difficulty : 1,
		waveoneNextGen: waveone ? waveone.nextGen : 2700,
		waveoneLast: waveone ? waveone.last : 0,
		waveoneCt: waveone ? waveone.ct : 0,
		waveonePrevTimeScored: waveone ? waveone.prevTimeScored : 0
	};
	
	// 深拷贝MainHex的blocks（包含Block对象）
	state.MainHex.blocks = [];
	for (var i = 0; i < MainHex.blocks.length; i++) {
		state.MainHex.blocks[i] = [];
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			state.MainHex.blocks[i][j] = $.extend(true, {}, MainHex.blocks[i][j]);
		}
	}
	
	// 深拷贝falling blocks
	state.blocks = [];
	for (var i = 0; i < blocks.length; i++) {
		state.blocks[i] = $.extend(true, {}, blocks[i]);
	}
	
	// 添加到历史记录
	backtrackHistory.push(state);
	
	// 确保历史记录不超过最大限制
	if (backtrackHistory.length > backtrackHistorySize) {
		backtrackHistory.shift();
	}
}

// 执行回溯
function handleBacktrack() {
	var now = Date.now();
	var timeSinceLastUse = (now - backtrackLastUseTime) / 1000;
	
	// 检查回溯是否可用
	if (!backtrackEnabled || 
		backtrackUses >= backtrackMaxUses || 
		timeSinceLastUse < backtrackCooldown ||
		backtrackRewinding ||
		backtrackHistory.length < backtrackTargetSeconds) {
		return;
	}
	
	// 找到5秒前的状态
	var targetTime = now - backtrackTargetSeconds * 1000;
	var targetState = null;
	
	for (var i = backtrackHistory.length - 1; i >= 0; i--) {
		if (backtrackHistory[i].timestamp <= targetTime) {
			targetState = backtrackHistory[i];
			break;
		}
	}
	
	if (!targetState) {
		return;
	}
	
	// 开始回溯
	backtrackUses++;
	backtrackLastUseTime = now;
	backtrackRewinding = true;
	backtrackRewindStartTime = now;
	
	// 保存当前状态用于过渡动画
	var currentState = {
		MainHex: $.extend(true, {}, MainHex),
		blocks: $.extend(true, [], blocks)
	};
	
	// 计算状态差异（当前状态到目标状态的变化）
	// 在这个简单版本中，我们直接设置游戏状态，并使用倒放动画效果
	setTimeout(function() {
		// 1秒后恢复到目标状态
		restoreGameState(targetState);
		backtrackRewinding = false;
		updateBacktrackButton();
	}, backtrackRewindDuration);
	
	// 更新按钮状态
	updateBacktrackButton();
}

// 恢复游戏状态
function restoreGameState(state) {
	// 恢复所有游戏状态
	MainHex = $.extend(true, {}, state.MainHex);
	blocks = [];
	
	// 恢复falling blocks
	for (var i = 0; i < state.blocks.length; i++) {
		var blockData = state.blocks[i];
		var block = new Block(blockData.fallingLane, blockData.color, blockData.iter, blockData.distFromHex);
		block.settled = blockData.settled;
		block.attachedLane = blockData.attachedLane;
		block.angle = blockData.angle;
		block.targetAngle = blockData.targetAngle;
		block.opacity = blockData.opacity;
		block.deleted = blockData.deleted;
		block.tint = blockData.tint;
		block.removed = blockData.removed;
		block.initializing = blockData.initializing;
		block.ict = blockData.ict;
		blocks.push(block);
	}
	
	// 恢复MainHex上的blocks
	MainHex.blocks = [];
	for (var i = 0; i < state.MainHex.blocks.length; i++) {
		MainHex.blocks[i] = [];
		for (var j = 0; j < state.MainHex.blocks[i].length; j++) {
			var blockData = state.MainHex.blocks[i][j];
			var block = new Block(blockData.fallingLane, blockData.color, blockData.iter, blockData.distFromHex);
			block.settled = 1;
			block.attachedLane = blockData.attachedLane;
			block.angle = blockData.angle;
			block.targetAngle = blockData.targetAngle;
			block.opacity = blockData.opacity;
			block.deleted = blockData.deleted;
			block.tint = blockData.tint;
			block.removed = blockData.removed;
			MainHex.blocks[i][j] = block;
		}
	}
	
	// 恢复其他状态
	score = state.score;
	waveone = state.wavegen;
	gdx = state.gdx;
	gdy = state.gdy;
	gameState = state.gameState;
	startTime = state.startTime;
	
	// 恢复MainHex.ct和waveone的时间相关属性
		MainHex.ct = state.mainHexCt;
		if (waveone) {
			waveone.lastGen = state.waveoneLastGen;
			waveone.dt = state.waveoneDt;
			waveone.difficulty = state.waveoneDifficulty;
			waveone.nextGen = state.waveoneNextGen;
			waveone.last = state.waveoneLast;
			waveone.ct = state.waveoneCt;
			waveone.prevTimeScored = state.waveonePrevTimeScored;
		}
}

function startBtnHandler() {
	setTimeout(function() {
		if (settings.platform == "mobile") {
			try {
				document.body.removeEventListener('touchstart', handleTapBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('touchstart', handleTap, false);
			} catch (e) {

			}

			document.body.addEventListener('touchstart', handleTap, false);
		} else {
			try {
				document.body.removeEventListener('mousedown', handleClickBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('mousedown', handleClick, false);
			} catch (e) {

			}

			document.body.addEventListener('mousedown', handleClick, false);
		}
	}, 5);

	if (!canRestart) return false;

	if ($('#openSideBar').is(':visible')) {
		$('#openSideBar').fadeOut(150, "linear");
	}

	if (importing == 1) {
		init(1);
		checkVisualElements(0);
	} else {
		resumeGame();
	}
}

function handlePause() {
	if (gameState == 1 || gameState == 2) {
		pause();
	}
}

function handleTap(e) {
	handleClickTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}

function handleClick(e) {
	handleClickTap(e.clientX, e.clientY);
}

function handleTapBefore(e) {
	var x = e.changedTouches[0].clientX;
	var y = e.changedTouches[0].clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}

function handleClickBefore(e) {
	var x = e.clientX;
	var y = e.clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}
