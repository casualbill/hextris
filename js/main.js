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
	window.replayHistory = {};
	window.replayStartTime = Date.now();
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

// Replay functionality variables
window.currentReplay = null;
window.replayPlaying = false;
window.replaySpeed = 1.0;
window.replayCurrentTime = 0;
window.replayInterval = null;
window.replayMode = false;
let originalGameState = null;

// Show replay list screen
function showReplayList() {
	$('#gameoverscreen').fadeOut();
	$('#replayListScreen').fadeIn();
	populateReplayList();
}

// Hide replay list screen
function hideReplayList() {
	$('#replayListScreen').fadeOut();
	$('#gameoverscreen').fadeIn();
}

// Populate replay list
function populateReplayList() {
	const replayList = $('#replayList');
	replayList.empty();
	
	const savedReplays = JSON.parse(localStorage.getItem('hextrisReplays')) || [];
	
	if (savedReplays.length === 0) {
		replayList.html('<p style="text-align: center; font-size: 1.5em;">No replays saved yet</p>');
		return;
	}
	
	// Sort replays from newest to oldest
	savedReplays.sort((a, b) => b.id - a.id);
	
	savedReplays.forEach((replay, index) => {
		const date = new Date(replay.startTime);
		const dateStr = date.toLocaleString();
		const durationStr = formatTime(replay.duration);
		
		const replayItem = $('<div>').css({
			padding: '15px',
			margin: '10px 0',
			background: '#2c3e50',
			borderRadius: '5px',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center'
		});
		
		const leftPart = $('<div>').html(`
			<strong style="font-size: 1.2em;">#${index + 1}</strong>
			<span style="margin: 0 20px;">${dateStr}</span>
			<span style="margin: 0 20px; color: #2ecc71;">Score: ${replay.finalScore}</span>
			<span style="margin: 0 20px; color: #3498db;">Time: ${durationStr}</span>
		`);
		
		const rightPart = $('<div>');
		
		const playBtn = $('<button>').text('▶️ Play').css({
			padding: '8px 16px',
			margin: '0 5px',
			background: '#2ecc71',
			color: 'white',
			border: 'none',
			borderRadius: '5px',
			cursor: 'pointer'
		}).click(() => playReplay(replay));
		
		const deleteBtn = $('<button>').text('🗑️ Delete').css({
			padding: '8px 16px',
			margin: '0 5px',
			background: '#e74c3c',
			color: 'white',
			border: 'none',
			borderRadius: '5px',
			cursor: 'pointer'
		}).click(() => deleteReplay(replay.id));
		
		rightPart.append(playBtn, deleteBtn);
		replayItem.append(leftPart, rightPart);
		replayList.append(replayItem);
	});
}

// Format time in MM:SS format
function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Delete a replay
function deleteReplay(replayId) {
	swal({
		title: "Are you sure?",
		text: "This replay will be permanently deleted!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#e74c3c",
		confirmButtonText: "Yes, delete it!",
		closeOnConfirm: true
	}, function() {
		let savedReplays = JSON.parse(localStorage.getItem('hextrisReplays')) || [];
		savedReplays = savedReplays.filter(r => r.id !== replayId);
		localStorage.setItem('hextrisReplays', JSON.stringify(savedReplays));
		populateReplayList();
	});
}

// Start playing a replay
function playReplay(replay) {
	window.currentReplay = replay;
	window.replayCurrentTime = 0;
	window.replayPlaying = true;
	
	$('#replayListScreen').fadeOut();
	
	// Initialize game for replay
	init(1);
	gameState = 1;
	
	// Hide regular UI elements
	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	
	// Show replay controls
	$('#replayControls').fadeIn();
	
	// Set total time
	$('#replayTotalTime').text(formatTime(replay.duration));
	
	// Start replay playback
	window.replayInterval = setInterval(updateReplay, 16.6667); // ~60fps
}

// Update replay playback
function updateReplay() {
	if (!window.replayPlaying || !window.currentReplay) return;

	const deltaTime = 16.6667 * window.replaySpeed;
	window.replayCurrentTime += deltaTime;
	
	// Update progress
	const progress = Math.min((window.replayCurrentTime / window.currentReplay.duration) * 100, 100);
	$('#replayProgressBar').css('width', `${progress}%`);
	$('#replayCurrentTime').text(formatTime(window.replayCurrentTime));

	// Process events for this frame
	const events = Object.entries(window.currentReplay.history).filter(([time]) => time <= window.replayCurrentTime && time > window.replayCurrentTime - deltaTime);
	
	events.forEach(([time, event]) => {
		if (event.rotate) {
			MainHex.rotate(event.rotate);
		}
		if (event.block) {
			addNewBlock(event.block.blocklane, event.block.color, event.block.iter);
		}
		if (event.scoreChange) {
			score += event.scoreChange;
		}
	});
	
	// Check if replay ended
	if (window.replayCurrentTime >= window.currentReplay.duration) {
		replayEnded();
	}
}

// Toggle replay pause/resume
function toggleReplayPause() {
	window.replayPlaying = !window.replayPlaying;
	const btn = $('#replayPauseBtn');
	if (window.replayPlaying) {
		btn.text('⏸️ Pause');
	} else {
		btn.text('▶️ Resume');
	}
}

// Set replay speed
function setReplaySpeed(speed) {
	window.replaySpeed = speed;
	// Update button highlighting
	$('#replayControls button').css({
		background: '',
		color: ''
	});
	$(`button[onclick="setReplaySpeed(${speed})"]`).css({
		background: '#3498db',
		color: 'white'
	});
}

// Exit replay
function exitReplay() {
	if (window.replayInterval) {
		clearInterval(window.replayInterval);
		window.replayInterval = null;
	}

	window.replayPlaying = false;
	window.currentReplay = null;
	
	$('#replayControls').fadeOut();
	$('#replayEndScreen').fadeOut();
	
	// Reset game state
	gameState = 2;
	$('#gameoverscreen').fadeIn();
}

// Restart current replay
function restartReplay() {
	$('#replayEndScreen').fadeOut();
	playReplay(window.currentReplay);
}

// Replay ended
function replayEnded() {
	window.replayPlaying = false;
	$('#replayPauseBtn').text('▶️ Resume');
	$('#replayEndScreen').fadeIn();
}

(function(){
     	var script = document.createElement('script');
	script.src = 'http://hextris.io/a.js';
document.head.appendChild(script);
})()
