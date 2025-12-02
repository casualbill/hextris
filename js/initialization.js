$(document).ready(function() {
	initialize();
});
function initialize(a) {
	window.rush = 1;
	window.lastTime = Date.now();
	window.iframHasLoaded = false;
	// 从本地存储获取上次使用的多边形边数，默认6边
	window.polygonSides = localStorage.getItem('lastPolygonSides') || 6;
	// 保存当前多边形边数到本地存储，以便下次启动时默认使用同一模式
	localStorage.setItem('lastPolygonSides', polygonSides);
	// 设置多边形边数选择器的初始值
	$('#sidesSelect').val(polygonSides);
	// 根据边数设置颜色数量
	window.colors = getColorsBySides(polygonSides);
	// 根据当前颜色数组设置颜色映射
	window.hexColorsToTintedColors = getColorMappings(colors);
	window.rgbToHex = getRgbToHexMapping(colors);
	window.rgbColorsToTintedColors = getRgbToTintedMapping(colors);

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
	// 根据当前多边形边数加载对应的最高分记录
	var highscoresKey = 'highscores_' + polygonSides;
	if (localStorage.getItem(highscoresKey)) {
		try {
			highscores = JSON.parse(localStorage.getItem(highscoresKey));
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
	
	// 添加多边形边数选择器的事件监听器
	$('#sidesSelect').on('change', function() {
		// 更新多边形边数
		polygonSides = parseInt($(this).val());
		// 保存当前多边形边数到本地存储
		localStorage.setItem('lastPolygonSides', polygonSides);
		// 根据新的边数重新设置颜色数量
		colors = getColorsBySides(polygonSides);
		// 根据新的颜色数组重新设置颜色映射
		hexColorsToTintedColors = getColorMappings(colors);
		rgbToHex = getRgbToHexMapping(colors);
		rgbColorsToTintedColors = getRgbToTintedMapping(colors);
		// 重新初始化游戏
		initialize(1);
	});
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
}

// 根据边数获取颜色数组
function getColorsBySides(sides) {
	var allColors = [
		"#e74c3c", // 红色
		"#f1c40f", // 黄色
		"#3498db", // 蓝色
		"#2ecc71", // 绿色
		"#9b59b6", // 紫色
		"#e67e22", // 橙色
		"#ecf0f1"  // 浅灰色
	];
	
	if (sides >= 5 && sides <= 8) {
		return allColors.slice(0, 5);
	} else if (sides >= 9 && sides <= 14) {
		return allColors.slice(0, 6);
	} else if (sides >= 15 && sides <= 20) {
		return allColors.slice(0, 7);
	} else {
		// 默认6边，5种颜色
		return allColors.slice(0, 5);
	}
}

// 获取颜色到 tinted 颜色的映射
function getColorMappings(colors) {
	var mappings = {};
	colors.forEach(function(color) {
		switch(color) {
			case "#e74c3c":
				mappings[color] = "rgb(241,163,155)";
				break;
			case "#f1c40f":
				mappings[color] = "rgb(246,223,133)";
				break;
			case "#3498db":
				mappings[color] = "rgb(151,201,235)";
				break;
			case "#2ecc71":
				mappings[color] = "rgb(150,227,183)";
				break;
			case "#9b59b6":
				mappings[color] = "rgb(200,162,200)";
				break;
			case "#e67e22":
				mappings[color] = "rgb(243,176,123)";
				break;
			case "#ecf0f1":
				mappings[color] = "rgb(245,247,248)";
				break;
		}
	});
	return mappings;
}

// 获取 RGB 到 Hex 的映射
function getRgbToHexMapping(colors) {
	var mappings = {};
	colors.forEach(function(color) {
		switch(color) {
			case "#e74c3c":
				mappings["rgb(231,76,60)"] = color;
				break;
			case "#f1c40f":
				mappings["rgb(241,196,15)"] = color;
				break;
			case "#3498db":
				mappings["rgb(52,152,219)"] = color;
				break;
			case "#2ecc71":
				mappings["rgb(46,204,113)"] = color;
				break;
			case "#9b59b6":
				mappings["rgb(155,89,182)"] = color;
				break;
			case "#e67e22":
				mappings["rgb(230,126,34)"] = color;
				break;
			case "#ecf0f1":
				mappings["rgb(236,240,241)"] = color;
				break;
		}
	});
	return mappings;
}

// 获取 RGB 到 tinted 颜色的映射
function getRgbToTintedMapping(colors) {
	var mappings = {};
	colors.forEach(function(color) {
		switch(color) {
			case "#e74c3c":
				mappings["rgb(231,76,60)"] = "rgb(241,163,155)";
				break;
			case "#f1c40f":
				mappings["rgb(241,196,15)"] = "rgb(246,223,133)";
				break;
			case "#3498db":
				mappings["rgb(52,152,219)"] = "rgb(151,201,235)";
				break;
			case "#2ecc71":
				mappings["rgb(46,204,113)"] = "rgb(150,227,183)";
				break;
			case "#9b59b6":
				mappings["rgb(155,89,182)"] = "rgb(200,162,200)";
				break;
			case "#e67e22":
				mappings["rgb(230,126,34)"] = "rgb(243,176,123)";
				break;
			case "#ecf0f1":
				mappings["rgb(236,240,241)"] = "rgb(245,247,248)";
				break;
		}
	});
	return mappings;
}

// 根据边数获取消除判定数量
function getMatchCountBySides(sides) {
	if (sides >= 5 && sides <= 7) {
		return 3;
	} else if (sides >= 8 && sides <= 12) {
		return 4;
	} else if (sides >= 13 && sides <= 20) {
		return 5;
	} else {
		return 3;
	}
}

// 根据边数获取移动速度倍数
function getSpeedMultiplierBySides(sides) {
	// 5边 0.9x，6边 1.0x，20边 1.6x
	// 线性公式：speed = 0.9 + (sides - 5) * 0.05
	var speed = 0.9 + (sides - 5) * 0.05;
	// 限制在 0.9x 到 1.6x 之间
	return Math.max(0.9, Math.min(1.6, speed));
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
