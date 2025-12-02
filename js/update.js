
//remember to update history function to show the respective iter speeds
function update(dt) {
	if (gameState == 1) {
		if (window.aiMode) {
			// AI对战模式更新
			updateAIGame(dt);
		} else {
			// 普通模式更新
			updateNormalGame(dt);
		}
	}
}

function updateNormalGame(dt) {
	// 更新普通游戏模式
	MainHex.update();
	
	// 更新所有方块
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].update();
	}
	
	// 检查方块碰撞
	checkCollisions();
	
	// 检查游戏结束
	checkGameOver();
}

function updateAIGame(dt) {
	// 更新玩家六边形
	if (window.playerHex) {
		window.playerHex.update(dt);
		
		// 检查玩家是否失败
		if (window.playerHex.isFailed()) {
			endAIGame('ai');
			return;
		}
	}
	
	// 更新AI六边形
	if (window.aiHex) {
		window.aiHex.update(dt);
		
		// 检查AI是否失败
		if (window.aiHex.isFailed()) {
			endAIGame('player');
			return;
		}
	}
	
	// 更新分数
	updateAIScores();
}

function updateGame(dt) {
	// 普通模式更新
	MainHex.dt = dt;
	waveone.update();
	if (MainHex.ct - waveone.prevTimeScored > 1000) {
		waveone.prevTimeScored = MainHex.ct;
	}
	var lowestDeletedIndex = 99;
	var i;
	var j;
	var block;

	var objectsToRemove = [];
	for (i = 0; i < blocks.length; i++) {
		MainHex.doesBlockCollide(blocks[i]);
		if (!blocks[i].settled) {
			if (!blocks[i].initializing) blocks[i].distFromHex -= blocks[i].iter * dt * settings.scale;
		} else if (!blocks[i].removed) {
			blocks[i].removed = 1;
		}
	}

	for (i = 0; i < MainHex.blocks.length; i++) {
		for (j = 0; j < MainHex.blocks[i].length; j++) {
			if (MainHex.blocks[i][j].checked == 1) {
				consolidateBlocks(MainHex, MainHex.blocks[i][j].attachedLane, MainHex.blocks[i][j].getIndex());
				MainHex.blocks[i][j].checked = 0;
			}
		}
	}

	for (i = 0; i < MainHex.blocks.length; i++) {
		lowestDeletedIndex = 99;
		for (j = 0; j < MainHex.blocks[i].length; j++) {
			block = MainHex.blocks[i][j];
			if (block.deleted == 2) {
				MainHex.blocks[i].splice(j, 1);
				blockDestroyed();
				if (j < lowestDeletedIndex) lowestDeletedIndex = j;
				j--;
			}
		}

		if (lowestDeletedIndex < MainHex.blocks[i].length) {
			for (j = lowestDeletedIndex; j < MainHex.blocks[i].length; j++) {
				MainHex.blocks[i][j].settled = 0;
			}
		}
	}

	for (i = 0; i < MainHex.blocks.length; i++) {
		for (j = 0; j < MainHex.blocks[i].length; j++) {
			block = MainHex.blocks[i][j];
			MainHex.doesBlockCollide(block, j, MainHex.blocks[i]);

			if (!MainHex.blocks[i][j].settled) {
				MainHex.blocks[i][j].distFromHex -= block.iter * dt * settings.scale;
			}
		}
	}

	for (i = 0; i < blocks.length; i++) {
		if (blocks[i].removed == 1) {
			blocks.splice(i, 1);
			i--;
		}
	}

	MainHex.ct += dt;
}

function updateAIScores() {
	// 更新玩家分数
	window.playerScore = window.playerHex ? window.playerHex.score : 0;
	
	// 更新AI分数
	window.aiScore = window.aiHex ? window.aiHex.score : 0;
}
