function exportSaveState() {
	var state = {};

	if(gameState == 1 || gameState == -1 || (gameState === 0 && localStorage.getItem('saveState') !== undefined)) {
		state = {
			hex: $.extend(true, {}, MainHex),
			blocks: $.extend(true, [], blocks),
			score: score,
			wavegen: waveone,
			gdx: gdx,
			gdy: gdy,
			comboTime:settings.comboTime
		};

		state.hex.blocks.map(function(a){
			for (var i = 0; i < a.length; i++) {
				a[i] = $.extend(true, {}, a[i]);
			}

			a.map(descaleBlock);
		});

		for (var i = 0; i < state.blocks.length; i++) {
			state.blocks[i] = $.extend(true, {}, state.blocks[i]);
		}

		state.blocks.map(descaleBlock);
	}

	localStorage.setItem('highscores', JSON.stringify(highscores));

	return JSONfn.stringify(state);
}

function descaleBlock(b) {
	b.distFromHex /= settings.scale;
}

function writeHighScores() {
		highscores.sort(
		function(a,b){
			a = parseInt(a, 10);
			b = parseInt(b, 10);
			if (a < b) {
				return 1;
			} else if (a > b) {
				return -1;
			}else {
				return 0;
			}
		}
	);
	highscores = highscores.slice(0,3);
	localStorage.setItem("highscores", JSON.stringify(highscores));
}

function clearSaveState() {
	localStorage.setItem("saveState", "{}");
}

function isStateSaved() {
	return localStorage.getItem("saveState") != "{}" && localStorage.getItem("saveState") != undefined;
}

// Level mode save state functions
function saveLevelProgress() {
	var levelProgress = {
		completedLevels: completedLevels,
		levelHighScores: levelHighScores
	};
	localStorage.setItem("levelProgress", JSON.stringify(levelProgress));
}

function loadLevelProgress() {
	var saved = localStorage.getItem("levelProgress");
	if(saved) {
		var levelProgress = JSON.parse(saved);
		completedLevels = levelProgress.completedLevels || [1,2,3,4,5];
		levelHighScores = levelProgress.levelHighScores || {};
	} else {
		// Default: first 5 levels unlocked
		completedLevels = [1,2,3,4,5];
		levelHighScores = {};
	}
}

function saveLevelHighScore(level, score) {
	if(!levelHighScores[level] || score > levelHighScores[level]) {
		levelHighScores[level] = score;
		saveLevelProgress();
	}
}

function completeLevel(level) {
	if(completedLevels.indexOf(level) === -1) {
		completedLevels.push(level);
		completedLevels.sort(function(a,b) { return a - b; });
		saveLevelProgress();
	}
}

function isLevelUnlocked(level) {
	if(level <= 5) return true;
	return completedLevels.indexOf(level - 1) !== -1;
}

function isLevelCompleted(level) {
	return completedLevels.indexOf(level) !== -1;
}
