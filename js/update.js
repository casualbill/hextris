
//remember to update history function to show the respective iter speeds
function updateGame(hex, blocks, waveone, dt) {
	hex.dt = dt;
	if (gameState == 1) {
		waveone.update();
		if (hex.ct - waveone.prevTimeScored > 1000) {
			waveone.prevTimeScored = hex.ct;
		}
	}
	var lowestDeletedIndex = 99;
	var i;
	var j;
	var block;

	var objectsToRemove = [];
	for (i = 0; i < blocks.length; i++) {
		hex.doesBlockCollide(blocks[i]);
		if (!blocks[i].settled) {
			if (!blocks[i].initializing) blocks[i].distFromHex -= blocks[i].iter * dt * settings.scale;
		} else if (!blocks[i].removed) {
			blocks[i].removed = 1;
		}
	}

	for (i = 0; i < hex.blocks.length; i++) {
		for (j = 0; j < hex.blocks[i].length; j++) {
			if (hex.blocks[i][j].checked ==1 ) {
				consolidateBlocks(hex,hex.blocks[i][j].attachedLane,hex.blocks[i][j].getIndex());
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

	for(i = 0; i < blocks.length;i++){
		if (blocks[i].removed == 1) {
			blocks.splice(i,1);
			i--;
		}
	}

	hex.ct += dt;
}

function update(dt) {
	// 更新第一个游戏区域
	updateGame(MainHex, blocks, waveone, dt);
	
	// 如果是双人模式，更新第二个游戏区域
	if (gameMode === 1) {
		updateGame(MainHex2, blocks2, waveone2, dt);
	}
}
