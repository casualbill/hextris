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
		if (!replayMode) {
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
			// 初始化游戏开始时间用于记录
			startTime = Date.now();
			// 重置历史记录的开始时间
			history.startTime = startTime;
			// 初始化回放数据
			replayData = { operations: [] };
		} else {
			// 回放模式：从回放数据初始化游戏状态
			settings.blockHeight = settings.baseBlockHeight * settings.scale;
			settings.hexWidth = settings.baseHexWidth * settings.scale;
			MainHex = replayData.hex || new Hex(settings.hexWidth);
			if (replayData.hex) {
				MainHex.playThrough += 1;
			}
			MainHex.sideLength = settings.hexWidth;
			score = replayData.score || 0;
			prevScore = 0;
			spawnLane = replayData.spawnLane || 0;
			op = 0;
			scoreOpacity = 0;
			gameState = 1;
			blocks = replayData.blocks || [];
			// 初始化回放开始时间
			replayStartTime = Date.now();
			totalReplayTime = replayData.duration || 0;
			// 显示回放控制栏和进度条
			$('#replayControlBar').show();
			$('#replayProgressBar').show();
			
			// 初始化回放进度条
			document.getElementById('replayProgressFill').style.width = '0%';
			document.getElementById('replayProgressText').textContent = '00:00 / ' + formatDuration(replayData.duration || 0);
			
			// 设置倍速按钮初始样式
			document.getElementById('replaySpeed05Btn').style.backgroundColor = '#95a5a6';
			document.getElementById('replaySpeed1Btn').style.backgroundColor = '#3498db';
			document.getElementById('replaySpeed2Btn').style.backgroundColor = '#95a5a6';
		}

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
}

// 显示回放列表界面
function showReplayList() {
	var replayList = document.getElementById('replayList');
	var replays = getReplays();
	
	// 清空回放列表
	replayList.innerHTML = '';
	
	// 如果没有回放记录，显示提示信息
	if (replays.length === 0) {
		var emptyMessage = document.createElement('div');
		emptyMessage.style.textAlign = 'center';
		emptyMessage.style.padding = '20px';
		emptyMessage.style.color = '#95a5a6';
		emptyMessage.style.fontFamily = '"Exo", sans-serif';
		emptyMessage.textContent = 'No replay history available';
		replayList.appendChild(emptyMessage);
	} else {
		// 按时间顺序显示回放记录（最新的在前）
		replays.sort(function(a, b) {
			return b.timestamp - a.timestamp;
		});
		
		replays.forEach(function(replay, index) {
			var replayItem = document.createElement('div');
			replayItem.style.padding = '15px';
			replayItem.style.borderBottom = '1px solid #ecf0f1';
			replayItem.style.cursor = 'pointer';
			replayItem.style.transition = 'background-color 0.2s ease';
			
			replayItem.addEventListener('mouseover', function() {
				this.style.backgroundColor = '#ecf0f1';
			});
			
			replayItem.addEventListener('mouseout', function() {
				this.style.backgroundColor = 'white';
			});
			
			replayItem.addEventListener('click', function() {
				loadReplay(replay);
			});
			
			// 回放时间
			var replayDate = new Date(replay.timestamp);
			var replayTime = replayDate.toLocaleString();
			
			// 回放分数
			var replayScore = replay.score || 0;
			
			// 回放时长
			var replayDuration = formatDuration(replay.duration || 0);
			
			replayItem.innerHTML = '<div style="font-family: \"Exo\", sans-serif; color: #2c3e50; font-size: 16px; font-weight: bold; margin-bottom: 5px;">Replay ' + (index + 1) + '</div>' +
								'<div style="font-family: \"Exo\", sans-serif; color: #95a5a6; font-size: 14px; margin-bottom: 3px;">Date: ' + replayTime + '</div>' +
								'<div style="font-family: \"Exo\", sans-serif; color: #95a5a6; font-size: 14px; margin-bottom: 3px;">Score: ' + replayScore + '</div>' +
								'<div style="font-family: \"Exo\", sans-serif; color: #95a5a6; font-size: 14px;">Duration: ' + replayDuration + '</div>';
			
			replayList.appendChild(replayItem);
		});
	}
	
	// 显示回放列表界面
	document.getElementById('replayListScreen').style.display = 'block';
}

// 格式化时长（秒 -> 分钟:秒）
function formatDuration(seconds) {
	var mins = Math.floor(seconds / 60);
	var secs = seconds % 60;
	return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
}

// 加载回放数据
function loadReplay(replay) {
	// 隐藏回放列表界面
	document.getElementById('replayListScreen').style.display = 'none';
	
	// 设置回放模式
	replayMode = true;
	replayData = replay;
	replayIndex = 0;
	replayPaused = false;
	replaySpeed = 1;
	
	// 初始化游戏
	init();
}

// 回到主菜单
function backToMenu() {
	// 隐藏回放列表界面
	document.getElementById('replayListScreen').style.display = 'none';
	
	// 重置回放模式
	replayMode = false;
	replayData = null;
	replayIndex = 0;
	replayPaused = false;
	replaySpeed = 1;
	
	// 显示主菜单
	setStartScreen();
}

// 回放结束
function replayEnd() {
	// 隐藏回放控制栏和进度条
	document.getElementById('replayControlBar').style.display = 'none';
	document.getElementById('replayProgressBar').style.display = 'none';
	
	// 显示回放结束界面
	document.getElementById('replayEndScreen').style.display = 'block';
	
	// 重置回放模式
	replayMode = false;
}

// 更新回放进度
function updateReplayProgress() {
	if (!replayMode || !replayData || replayPaused) {
		return;
	}
	
	var currentTime = Date.now() - replayStartTime;
	var elapsedSeconds = Math.floor(currentTime / 1000) * replaySpeed;
	var totalSeconds = replayData.duration || 0;
	
	// 更新进度条
	var progressBar = document.getElementById('replayProgressFill');
	var progressText = document.getElementById('replayProgressText');
	
	if (elapsedSeconds >= totalSeconds) {
		// 回放结束
		replayEnd();
		return;
	}
	
	var progress = (elapsedSeconds / totalSeconds) * 100;
	progressBar.style.width = progress + '%';
	
	// 更新进度文本
	var currentDuration = formatDuration(elapsedSeconds);
	var totalDuration = formatDuration(totalSeconds);
	progressText.textContent = currentDuration + ' / ' + totalDuration;
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
			if (!replayMode) {
				$.get('http://54.183.184.126/' + String(score));
				if (highscores.indexOf(score) == -1) {
					highscores.push(score);
				}
				writeHighScores();
				// 记录游戏结束时间和最终分数
				var endTime = Date.now();
				var gameDuration = endTime - startTime;
				history.endTime = endTime;
				history.finalScore = score;
				history.duration = gameDuration;
				// 保存回放数据
				saveReplayData(history);
				gameOverDisplay();
			} else {
				// 回放模式：显示回放结束界面
				replayEnd();
			}
			return true;
		}
	}
	return false;
}

// 保存回放数据到本地存储
function saveReplayData(replay) {
	// 从本地存储获取已保存的回放
	var savedReplays = JSON.parse(localStorage.getItem('hextrisReplays') || '[]');
	
	// 创建回放记录
	var replayRecord = {
		id: Date.now(),
		gameDate: new Date(replay.startTime).toISOString(),
		finalScore: replay.finalScore,
		duration: replay.duration,
		startTime: replay.startTime,
		endTime: replay.endTime,
		history: replay
	};
	
	// 添加到回放列表
	savedReplays.push(replayRecord);
	
	// 限制最多保存10条回放记录
	if (savedReplays.length > 10) {
		savedReplays.shift(); // 删除最早的记录
	}
	
	// 保存回本地存储
	localStorage.setItem('hextrisReplays', JSON.stringify(savedReplays));
}

// 获取保存的回放列表
function getReplays() {
	return JSON.parse(localStorage.getItem('hextrisReplays') || '[]');
}

// 删除回放记录
function deleteReplay(replayId) {
	var savedReplays = getReplays();
	savedReplays = savedReplays.filter(function(replay) {
		return replay.id !== replayId;
	});
	localStorage.setItem('hextrisReplays', JSON.stringify(savedReplays));
}

// 保存分数变化记录
function recordScoreChange(newScore, pointsAdded) {
	if (!history[MainHex.ct]) {
		history[MainHex.ct] = {};
	}
	history[MainHex.ct].score = newScore;
	history[MainHex.ct].pointsAdded = pointsAdded;
}

// 回放相关函数实现
function showReplayList() {
	var replays = getReplays();
	var replayList = $('#replayList');
	replayList.empty();

	if (replays.length === 0) {
		replayList.html('<div style="text-align: center; padding: 20px; font-family: \"Exo\", sans-serif; color: #95a5a6;">No replay history found.</div>');
	} else {
		replays.forEach(function(replay) {
			var date = new Date(replay.gameDate);
			var formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
			var minutes = Math.floor(replay.duration / 60000);
			var seconds = Math.floor((replay.duration % 60000) / 1000);
			var formattedDuration = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

			var replayItem = $('<div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #ecf0f1;">');
			replayItem.append('<div style="font-family: \"Exo\", sans-serif; color: #2c3e50;">' + formattedDate + '</div>');
			replayItem.append('<div style="font-family: \"Exo\", sans-serif; color: #e74c3c; font-weight: bold; margin: 0 15px;">' + replay.finalScore + '</div>');
			replayItem.append('<div style="font-family: \"Exo\", sans-serif; color: #95a5a6;">' + formattedDuration + '</div>');
			replayItem.append('<button class="replay-play-btn" data-replay-id="' + replay.id + '" style="background-color: #2ecc71; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-family: \"Exo\", sans-serif; font-size: 14px; margin-left: 10px;">Play</button>');
			replayItem.append('<button class="replay-delete-btn" data-replay-id="' + replay.id + '" style="background-color: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-family: \"Exo\", sans-serif; font-size: 14px; margin-left: 5px;">Delete</button>');
			replayList.append(replayItem);
		});
	}

	$('#replayListScreen').fadeIn();
}

function hideReplayList() {
	$('#replayListScreen').fadeOut();
}

function startReplay(replayId) {
	var replays = getReplays();
	var selectedReplay = replays.find(function(replay) {
		return replay.id === replayId;
	});

	if (!selectedReplay) return;

	replayMode = true;
	replayData = selectedReplay.history;
	replayIndex = 0;
	replaySpeed = 1;
	replayPaused = false;
	replayStartTime = Date.now();
	totalReplayTime = selectedReplay.duration;

	hideReplayList();
	init(1);
	
	// 显示回放控制栏和进度条
	$('#replayControlBar').show();
	$('#replayProgressBar').show();
}

function toggleReplayPause() {
	replayPaused = !replayPaused;
	$(this).text(replayPaused ? 'Resume' : 'Pause');
}

function setReplaySpeed(speed) {
	replaySpeed = speed;
	$('.replayControlBar button').css('background-color', '#95a5a6');
	$(this).css('background-color', '#3498db');
}

function exitReplay() {
	replayMode = false;
	replayData = null;
	replayIndex = 0;
	$('#replayControlBar').hide();
	$('#replayProgressBar').hide();
	init(1);
}

function replayAgain() {
	$('#replayEndScreen').fadeOut();
	replayMode = true;
	replayIndex = 0;
	replaySpeed = 1;
	replayPaused = false;
	replayStartTime = Date.now();
	init(1);
}

function backToReplayList() {
	replayMode = false;
	replayData = null;
	replayIndex = 0;
	$('#replayEndScreen').fadeOut();
	$('#replayControlBar').hide();
	$('#replayProgressBar').hide();
	showReplayList();
}

function deleteReplayWithConfirmation(replayId) {
	if (confirm('Are you sure you want to delete this replay?')) {
		deleteReplay(replayId);
		showReplayList();
	}
}

function updateReplayProgress() {
	if (!replayMode || replayPaused) return;

	var elapsedTime = Date.now() - replayStartTime;
	var progress = (elapsedTime * replaySpeed) / totalReplayTime * 100;

	if (progress >= 100) {
		progress = 100;
		replayEnd();
	}

	$('#replayProgressFill').css('width', progress + '%');

	var playedMinutes = Math.floor((elapsedTime * replaySpeed) / 60000);
	var playedSeconds = Math.floor(((elapsedTime * replaySpeed) % 60000) / 1000);
	var totalMinutes = Math.floor(totalReplayTime / 60000);
	var totalSeconds = Math.floor((totalReplayTime % 60000) / 1000);

	var progressText = playedMinutes + ':' + (playedSeconds < 10 ? '0' : '') + playedSeconds + ' / ' + totalMinutes + ':' + (totalSeconds < 10 ? '0' : '') + totalSeconds;
	$('#replayProgressText').text(progressText);
}

function replayEnd() {
	replayPaused = true;
	$('#replayEndScreen').fadeIn();
}

// 在游戏更新循环中调用回放进度更新
setInterval(function() {
	if (replayMode && !replayPaused) {
		updateReplayProgress();
	}
}, 100);

// 保存消除事件记录
function recordBlockDestroyed(lane, position) {
	if (!history[MainHex.ct]) {
		history[MainHex.ct] = {};
	}
	if (!history[MainHex.ct].blockDestroyed) {
		history[MainHex.ct].blockDestroyed = [];
	}
	history[MainHex.ct].blockDestroyed.push({lane: lane, position: position});
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
