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
	} else {
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
	op = 0;
	tweetblock=false;
	scoreOpacity = 0;
	// 不要在这里将gameState设置为1，因为setStartScreen()函数会将它设置为0
	$("#restartBtn").hide();
	$("#pauseBtn").show();
	
	settings.blockHeight = settings.baseBlockHeight * settings.scale;
	settings.hexWidth = settings.baseHexWidth * settings.scale;
	
	if (gameMode === 0) {
		// 单人游戏初始化
		score = saveState.score || 0;
		prevScore = 0;
		spawnLane = 0;
		// 只有在明确选择游戏模式并开始游戏时才设置gameState为1，而不是自动从保存状态加载
		// if (saveState.hex !== undefined) gameState = 1;
		
		MainHex = new Hex(settings.hexWidth);
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
		
		waveone = saveState.wavegen || new waveGen(MainHex);
		
	} else {
		// 双人游戏初始化
		score = 0;
		score2 = 0;
		prevScore = 0;
		spawnLane1 = 0;
		spawnLane2 = 0;
		
		// 初始化玩家1
		MainHex1 = new Hex(settings.hexWidth);
		MainHex1.sideLength = settings.hexWidth;
		MainHex1.y = -100;
		blocks = [];
		gdx1 = 0;
		gdy1 = 0;
		
		// 初始化玩家2
		MainHex2 = new Hex(settings.hexWidth);
		MainHex2.sideLength = settings.hexWidth;
		MainHex2.y = -100;
		blocks2 = [];
		gdx2 = 0;
		gdy2 = 0;
		
		// 创建两个独立的波生成器
		waveone1 = new waveGen(MainHex1);
		waveone2 = new waveGen(MainHex2);
	}

	startTime = Date.now();
	
	// 清除文本并设置延迟
	if (gameMode === 0) {
		MainHex.texts = [];
		MainHex.delay = 15;
	} else {
		MainHex1.texts = [];
		MainHex1.delay = 15;
		MainHex2.texts = [];
		MainHex2.delay = 15;
	}
	
	// 开始游戏，设置游戏状态为1
	if (b) {
		gameState = 1;
	}
	
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
	// 调用init(false)确保不立即开始游戏
	init(false);
	
	// 清除保存状态，确保主菜单正确显示
	clearSaveState();
	importing = 1;

	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#startBtn').show();

	// 明确设置游戏状态为主菜单
	gameState = 0;
	requestAnimFrame(animLoop);
	
	// 添加游戏模式选择的点击事件
	$('#canvas').off('click').on('click', function(e) {
		if (gameState === 0) {
			var rect = canvas.getBoundingClientRect();
			var clickY = (e.clientY - rect.top) / settings.scale;
			var upperheight = (trueCanvas.height/2) - ((settings.rows * settings.blockHeight) * (2/Math.sqrt(3))) * (5/6);
			var fontSize = settings.platform == 'mobile' ? 45 : 37;
			
			// 检测点击的是单人游戏还是双人游戏
			if (clickY > upperheight - 60*settings.scale - fontSize && 
			    clickY < upperheight - 60*settings.scale + fontSize) {
			    // 选择单人游戏
			    gameMode = 0;
			    init(1);
			} else if (clickY > upperheight - 20*settings.scale - fontSize && 
			           clickY < upperheight - 20*settings.scale + fontSize) {
			    // 选择双人游戏
			    gameMode = 1;
			    init(1);
			}
		}
	});
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
			if (gameMode === 0) {
				// 单人模式延迟检查
				if(!MainHex.delay) {
					update(dt);
				}
				else{
					MainHex.delay--;
				}
			} else {
				// 双人模式延迟检查
				if(!MainHex1.delay && !MainHex2.delay) {
					update(dt);
				}
				else{
					if(MainHex1.delay) MainHex1.delay--;
					if(MainHex2.delay) MainHex2.delay--;
				}
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
	if (gameMode === 0) {
		// 单人模式游戏结束检查
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
	} else {
		// 双人对战模式游戏结束检查
		var player1Lost = isInfringing(MainHex1);
		var player2Lost = isInfringing(MainHex2);
		
		if (player1Lost || player2Lost) {
			// 记录分数
			if (highscores.indexOf(score) == -1) {
				highscores.push(score);
			}
			if (highscores.indexOf(score2) == -1) {
				highscores.push(score2);
			}
			writeHighScores();
			
			// 显示游戏结束界面
			gameOverDisplay();
			return true;
		}
		return false;
	}
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
