
//remember to update history function to show the respective iter speeds
function update(dt) {
	// 更新玩家1的游戏
	updatePlayer(MainHex, blocks, waveone, dt);
	
	// 更新玩家2的游戏（如果是2人模式）
	if (currentGameMode === GameMode.TWO_PLAYER) {
		updatePlayer(player2.hex, player2.blocks, player2.wavegen, dt);
	}
}

// 通用玩家更新函数
function updatePlayer(hex, blocksArray, wavegen, dt) {
	hex.dt = dt;
	if (gameState == 1) {
		wavegen.update();
		if (hex.ct - wavegen.prevTimeScored > 1000) {
			wavegen.prevTimeScored = hex.ct;
		}
	}
	var lowestDeletedIndex = 99;
	var i;
	var j;
	var block;

	var objectsToRemove = [];
	for (i = 0; i < blocksArray.length; i++) {
		hex.doesBlockCollide(blocksArray[i]);
		if (!blocksArray[i].settled) {
			if (!blocksArray[i].initializing) blocksArray[i].distFromHex -= blocksArray[i].iter * dt * settings.scale;
		} else if (!blocksArray[i].removed) {
			blocksArray[i].removed = 1;
		}
	}

	for (i = 0; i < hex.blocks.length; i++) {
		for (j = 0; j < hex.blocks[i].length; j++) {
			if (hex.blocks[i][j].checked ==1 ) {
				consolidateBlocks(hex, hex.blocks[i][j].attachedLane, hex.blocks[i][j].getIndex());
				hex.blocks[i][j].checked=0;
			}
		}
	}

	for (i = 0; i < hex.blocks.length; i++) {
		lowestDeletedIndex = 99;
		for (j = 0; j < hex.blocks[i].length; j++) {
			block = hex.blocks[i][j];
			if (block.deleted == 2) {
				hex.blocks[i].splice(j,1);
				blockDestroyed();
				if (j < lowestDeletedIndex) lowestDeletedIndex = j;
				j--;
			}
		}

		if (lowestDeletedIndex < hex.blocks[i].length) {
			for (j = lowestDeletedIndex; j < hex.blocks[i].length; j++) {
				hex.blocks[i][j].settled = 0;
			}
		}
	}

	for (i = 0; i < hex.blocks.length; i++) {
		for (j = 0; j < hex.blocks[i].length; j++) {
			block = hex.blocks[i][j];
			hex.doesBlockCollide(block, j, hex.blocks[i]);

			if (!hex.blocks[i][j].settled) {
				hex.blocks[i][j].distFromHex -= block.iter * dt * settings.scale;
			}
		}
	}

	for(i = 0; i < blocksArray.length;i++){
		if (blocksArray[i].removed == 1) {
			blocksArray.splice(i,1);
			i--;
		}
	}

	hex.ct += dt;
}
