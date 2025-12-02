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

// 关卡进度管理
function getLevelProgress() {
	var levelProgress = localStorage.getItem("levelProgress");
	if (!levelProgress) {
		// 初始化关卡进度
		levelProgress = {
			completedLevels: 0,
			attemptedLevels: 0,
			scores: {},
			levelHighscores: []
		};
		// 前5关默认解锁
		for (var i = 1; i <= 5; i++) {
			levelProgress.scores[i] = 0;
		}
		localStorage.setItem("levelProgress", JSON.stringify(levelProgress));
	} else {
		levelProgress = JSON.parse(levelProgress);
	}
	return levelProgress;
}

function saveLevelProgress(levelProgress) {
	localStorage.setItem("levelProgress", JSON.stringify(levelProgress));
}

function updateLevelScore(level, score) {
	var levelProgress = getLevelProgress();
	var currentScore = levelProgress.scores[level] || 0;
	
	// 更新关卡最高分
	if (score > currentScore) {
		levelProgress.scores[level] = score;
		
		// 更新关卡模式总排行榜
		var added = false;
		for (var i = 0; i < levelProgress.levelHighscores.length; i++) {
			if (score > levelProgress.levelHighscores[i]) {
				levelProgress.levelHighscores.splice(i, 0, score);
				added = true;
				break;
			}
		}
		if (!added) {
			levelProgress.levelHighscores.push(score);
		}
		// 只保留前3名
		levelProgress.levelHighscores = levelProgress.levelHighscores.slice(0, 3);
	}
	
	// 更新尝试过的关卡
	if (level > levelProgress.attemptedLevels) {
		levelProgress.attemptedLevels = level;
	}
	
	// 更新完成的关卡
	var targetScore = level * 100;
	if (score >= targetScore && level > levelProgress.completedLevels) {
		levelProgress.completedLevels = level;
	}
	
	// 保存更新后的进度
	saveLevelProgress(levelProgress);
}

function getLevelTargetScore(level) {
	return level * 100;
}

function getLevelDifficulty(level) {
	// 关卡难度设置：第1关难度最低，后续关卡难度逐步提升
	// 难度影响方块生成速度和下落速度
	var difficulty = {
		creationSpeedModifier: 1.0,
		speedModifier: 1.0
	};
	
	// 每5关难度提升一次
	var difficultyTier = Math.floor((level - 1) / 5) + 1;
	
	// 难度提升会增加方块生成速度和下落速度
	// 速度越快，数值越小（因为是速度系数）
	var speedReductionPerTier = 0.1;
	var minSpeedModifier = 0.3;
	
	difficulty.creationSpeedModifier = Math.max(minSpeedModifier, 1.0 - (difficultyTier - 1) * speedReductionPerTier);
	difficulty.speedModifier = Math.max(minSpeedModifier, 1.0 - (difficultyTier - 1) * speedReductionPerTier);
	
	return difficulty;
}
