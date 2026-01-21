
//remember to update history function to show the respective iter speeds
function update(dt) {
	if (gameMode === 0) {
		// 单人模式更新
		MainHex.dt = dt;
		if (gameState == 1) {
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
	} else {
		// 双人模式更新
		MainHex1.dt = dt;
		MainHex2.dt = dt;
		if (gameState == 1) {
			if (waveone1) waveone1.update();
			if (waveone2) waveone2.update();
		}
		var i, j, block;

		// 更新玩家1的游戏状态
		for (i = 0; i < blocks.length; i++) {
			MainHex1.doesBlockCollide(blocks[i]);
			if (!blocks[i].settled) {
				if (!blocks[i].initializing) blocks[i].distFromHex -= blocks[i].iter * dt * settings.scale;
			} else if (!blocks[i].removed) {
				blocks[i].removed = 1;
			}
		}

		for (i = 0; i < MainHex1.blocks.length; i++) {
			for (j = 0; j < MainHex1.blocks[i].length; j++) {
				if (MainHex1.blocks[i][j].checked ==1 ) {
					consolidateBlocks(MainHex1,MainHex1.blocks[i][j].attachedLane,MainHex1.blocks[i][j].getIndex());
					MainHex1.blocks[i][j].checked=0;
				}
			}
		}

		for (i = 0; i < MainHex1.blocks.length; i++) {
			var lowestDeletedIndex1 = 99;
			for (j = 0; j < MainHex1.blocks[i].length; j++) {
				block = MainHex1.blocks[i][j];
				if (block.deleted == 2) {
					MainHex1.blocks[i].splice(j,1);
					blockDestroyed();
					if (j < lowestDeletedIndex1) lowestDeletedIndex1 = j;
					j--;
				}
			}

			if (lowestDeletedIndex1 < MainHex1.blocks[i].length) {
				for (j = lowestDeletedIndex1; j < MainHex1.blocks[i].length; j++) {
					MainHex1.blocks[i][j].settled = 0;
				}
			}
		}

		for (i = 0; i < MainHex1.blocks.length; i++) {
			for (j = 0; j < MainHex1.blocks[i].length; j++) {
				block = MainHex1.blocks[i][j];
				MainHex1.doesBlockCollide(block, j, MainHex1.blocks[i]);

				if (!MainHex1.blocks[i][j].settled) {
					MainHex1.blocks[i][j].distFromHex -= block.iter * dt * settings.scale;
				}
			}
		}

		for(i = 0; i < blocks.length;i++){
			if (blocks[i].removed == 1) {
				blocks.splice(i,1);
				i--;
			}
		}

		// 更新玩家2的游戏状态
		for (i = 0; i < blocks2.length; i++) {
			MainHex2.doesBlockCollide(blocks2[i]);
			if (!blocks2[i].settled) {
				if (!blocks2[i].initializing) blocks2[i].distFromHex -= blocks2[i].iter * dt * settings.scale;
			} else if (!blocks2[i].removed) {
				blocks2[i].removed = 1;
			}
		}

		for (i = 0; i < MainHex2.blocks.length; i++) {
			for (j = 0; j < MainHex2.blocks[i].length; j++) {
				if (MainHex2.blocks[i][j].checked ==1 ) {
					consolidateBlocks(MainHex2,MainHex2.blocks[i][j].attachedLane,MainHex2.blocks[i][j].getIndex());
					MainHex2.blocks[i][j].checked=0;
				}
			}
		}

		for (i = 0; i < MainHex2.blocks.length; i++) {
			var lowestDeletedIndex2 = 99;
			for (j = 0; j < MainHex2.blocks[i].length; j++) {
				block = MainHex2.blocks[i][j];
				if (block.deleted == 2) {
					MainHex2.blocks[i].splice(j,1);
					blockDestroyed2();
					if (j < lowestDeletedIndex2) lowestDeletedIndex2 = j;
					j--;
				}
			}

			if (lowestDeletedIndex2 < MainHex2.blocks[i].length) {
				for (j = lowestDeletedIndex2; j < MainHex2.blocks[i].length; j++) {
					MainHex2.blocks[i][j].settled = 0;
				}
			}
		}

		for (i = 0; i < MainHex2.blocks.length; i++) {
			for (j = 0; j < MainHex2.blocks[i].length; j++) {
				block = MainHex2.blocks[i][j];
				MainHex2.doesBlockCollide(block, j, MainHex2.blocks[i]);

				if (!MainHex2.blocks[i][j].settled) {
					MainHex2.blocks[i][j].distFromHex -= block.iter * dt * settings.scale;
				}
			}
		}

		for(i = 0; i < blocks2.length;i++){
			if (blocks2[i].removed == 1) {
				blocks2.splice(i,1);
				i--;
			}
		}

		MainHex1.ct += dt;
		MainHex2.ct += dt;
	}
}
