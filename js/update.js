
//remember to update history function to show the respective iter speeds
function updateGame(hex, wave, blocksArray, isPlayer1) {
	hex.dt = dt;
	if (gameState == 1) {
		wave.update();
		if (hex.ct - wave.prevTimeScored > 1000) {
			wave.prevTimeScored = hex.ct;
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
		}
		else if (!blocksArray[i].removed) {
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
				if (isPlayer1) {
					blockDestroyed(1);
				} else {
					blockDestroyed(2);
				}
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

//remember to update history function to show the respective iter speeds
function update(dt) {
	if (is2PlayerMode) {
		updateGame(MainHex1, wavegen1, blocks1, true);
		updateGame(MainHex2, wavegen2, blocks2, false);
	} else {
		MainHex.dt = dt;
		if (gameState == 1 && waveone) {
			waveone.update();
			if (MainHex.ct - waveone.prevTimeScored > 1000) {
				waveone.prevTimeScored = MainHex.ct;
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
			}
			else if (!blocks[i].removed) {
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
}
