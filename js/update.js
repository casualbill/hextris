
//remember to update history function to show the respective iter speeds
function update(dt) {
	MainHex.dt = dt;
	if (gameState == 1) {
		waveone.update();
		if (MainHex.ct - waveone.prevTimeScored > 1000) {
			waveone.prevTimeScored = MainHex.ct;
		}

		// 能量自动恢复（游戏未暂停时）
		if (settings.energyEnabled && gameState === 1) {
			var currentTime = Date.now();
			if (currentTime - settings.lastEnergyRegen >= settings.energyRegenInterval) {
				settings.energy += settings.energyRegenRate;
				// 确保能量不超过上限
				if (settings.energy > settings.energyMax) {
					settings.energy = settings.energyMax;
				}
				settings.lastEnergyRegen = currentTime;
			}
		}
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
			if (MainHex.blocks[i][j].checked ==1 ) {
				consolidateBlocks(MainHex,MainHex.blocks[i][j].attachedLane,MainHex.blocks[i][j].getIndex());
				MainHex.blocks[i][j].checked=0;
			}
		}
	}

	for (i = 0; i < MainHex.blocks.length; i++) {
		lowestDeletedIndex = 99;
		for (j = 0; j < MainHex.blocks[i].length; j++) {
			block = MainHex.blocks[i][j];
			if (block.deleted == 2) {
				MainHex.blocks[i].splice(j,1);
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

	for(i = 0; i < blocks.length;i++){
		if (blocks[i].removed == 1) {
			blocks.splice(i,1);
			i--;
		}
	}

	MainHex.ct += dt;
}
