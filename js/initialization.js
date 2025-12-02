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
			$('#aiBattleBtn').on('touchstart', aiBattleBtnHandler);
		} else {
			$('#startBtn').on('mousedown', startBtnHandler);
			$('#aiBattleBtn').on('mousedown', aiBattleBtnHandler);
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

		// Create AI difficulty selection screen
		function createDifficultyScreen() {
			var difficultyScreen = document.createElement('div');
			difficultyScreen.id = 'difficultyScreen';
			difficultyScreen.className = 'unselectable overlay';
			difficultyScreen.innerHTML = `
				<div style="font-size:5vw; margin-bottom:30px;">选择AI难度</div>
				<button id="easyBtn" style="font-size:3vw; padding:10px 30px; margin:10px; background:#2ecc71; color:white; border-radius:5px;">简单</button>
				<button id="mediumBtn" style="font-size:3vw; padding:10px 30px; margin:10px; background:#f1c40f; color:white; border-radius:5px;">中等</button>
				<button id="hardBtn" style="font-size:3vw; padding:10px 30px; margin:10px; background:#e74c3c; color:white; border-radius:5px;">困难</button>
				<button id="backToMenuBtn" style="font-size:2vw; padding:8px 20px; margin-top:20px; background:#95a5a6; color:white; border-radius:5px;">返回主菜单</button>
			`;
			document.body.appendChild(difficultyScreen);

			// Add event listeners
			$('#easyBtn').on('click touchstart', function() { startAIBattle('easy'); });
			$('#mediumBtn').on('click touchstart', function() { startAIBattle('medium'); });
			$('#hardBtn').on('click touchstart', function() { startAIBattle('hard'); });
			$('#backToMenuBtn').on('click touchstart', hideDifficultyScreen);
		}

		// Show difficulty selection screen
		function aiBattleBtnHandler() {
			if (!document.getElementById('difficultyScreen')) {
				createDifficultyScreen();
			}
			$('#difficultyScreen').show();
			$('#overlay').removeClass('faded');
		}

		// Hide difficulty selection screen
		function hideDifficultyScreen() {
			$('#difficultyScreen').hide();
			$('#overlay').addClass('faded');
		}

		// Start AI battle with selected difficulty
		window.startAIBattle = function(difficulty) {
	window.isAIBattle = true;
	window.AIDifficulty = difficulty;
	
	// Set AI reaction time based on difficulty
	switch(difficulty) {
		case 'easy':
			window.AIReactionTime = 300;
			break;
		case 'medium':
			window.AIReactionTime = 150;
			break;
		case 'hard':
			window.AIReactionTime = 50;
			break;
	}
	
	hideDifficultyScreen();
	init(1); // Start game with AI battle mode
	
	// Start AI controller
	startAIController();
}

function startAIController() {
	if (!window.isAIBattle) return;
	
	// AI decision loop
	window.AITimer = setInterval(() => {
		if (gameState !== 1 || window.AIHex.stunned) return;
		
		makeAIDecision();
	}, window.AIReactionTime);
}

function makeAIDecision() {
	var currentBlock = window.aiBlocks[0];
	if (!currentBlock) return;
	
	var bestRotation = getBestRotation(currentBlock);
	
	// Perform rotation
	if (bestRotation > 0) {
		// Rotate clockwise
		window.AIHex.rotate(1);
	} else if (bestRotation < 0) {
		// Rotate counter-clockwise
		window.AIHex.rotate(0);
	}
}

function getBestRotation(block) {
	var bestScore = -1;
	var bestRotation = 0;
	
	// Try all 6 possible rotations
	for (var rotation = 0; rotation < 6; rotation++) {
		var score = evaluateRotation(block, rotation);
		if (score > bestScore) {
			bestScore = score;
			bestRotation = rotation;
		}
	}
	
	// Return rotation direction
	if (bestRotation === 0) return 0;
	
	// Choose shortest rotation path
	if (bestRotation <= 3) {
		return bestRotation; // Clockwise
	} else {
		return bestRotation - 6; // Counter-clockwise
	}
}

function evaluateRotation(block, rotation) {
	var score = 0;
	var hex = window.AIHex;
	
	// Simulate rotation
	var originalRotation = block.rotation;
	block.rotation = rotation;
	
	// Calculate block position
	var radians = (block.rotation * 60 + 30) * (Math.PI / 180);
	var x = hex.x + (hex.size + settings.blockHeight / 2) * Math.cos(radians);
	var y = hex.y + (hex.size + settings.blockHeight / 2) * Math.sin(radians);
	
	// Find which side the block will land on
	var side = Math.floor((block.rotation) % 6);
	
	// Count existing blocks on that side
	var blockCount = hex.blocks[side].length;
	
	// Prefer sides with fewer blocks to avoid overflow
	score -= blockCount * 10;
	
	// Prefer matching colors
	if (blockCount > 0) {
		var lastBlock = hex.blocks[side][blockCount - 1];
		if (lastBlock.color === block.color) {
			score += 50; // Bonus for matching color
		}
	}
	
	// Difficulty based adjustments
	if (window.AIDifficulty === 'easy') {
		// Easy AI: Randomize decisions sometimes
		if (Math.random() > 0.7) {
			score += Math.random() * 100 - 50;
		}
	} else if (window.AIDifficulty === 'medium') {
		// Medium AI: Good strategy with some mistakes
		if (Math.random() > 0.9) {
			score += Math.random() * 100 - 50;
		}
	}
	// Hard AI: Perfect strategy
	
	// Restore original rotation
	block.rotation = originalRotation;
	
	return score;
}

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
