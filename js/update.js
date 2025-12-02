
//remember to update history function to show the respective iter speeds
function update(dt) {
	MainHex.dt = dt;
	if (gameState == 1) {
		if (replayMode && !replayPaused) {
			// 回放模式：根据回放数据自动执行操作
			var elapsedTime = (Date.now() - replayStartTime) * replaySpeed;
			var currentOperation = replayData.operations[replayIndex];

			while (currentOperation && currentOperation.time <= elapsedTime) {
				// 执行当前操作
				switch (currentOperation.type) {
					case 'rotate':
						if (currentOperation.direction === 'left') {
							MainHex.rotate(1);
						} else {
							MainHex.rotate(-1);
						}
						break;
					case 'blockGenerated':
						// 在回放模式下，方块生成已经由waveone.update()处理
						break;
					case 'scoreChange':
						// 在回放模式下，分数变化已经由游戏逻辑处理
						break;
					case 'blockDestroyed':
						// 在回放模式下，方块消除已经由游戏逻辑处理
						break;
				}

				replayIndex++;
				currentOperation = replayData.operations[replayIndex];
			}

			// 更新回放进度
			updateReplayProgress();
		} else {
			// 正常模式：玩家操作
			waveone.update();
			if (MainHex.ct - waveone.prevTimeScored > 1000) {
				waveone.prevTimeScored = MainHex.ct;
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
				// 记录消除事件
				recordBlockDestroyed(i, j);
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
