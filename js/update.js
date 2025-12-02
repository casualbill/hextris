
//remember to update history function to show the respective iter speeds
function update(dt) {
	if (window.isAIBattle) {
		// Update both player and AI hexes
		window.PlayerHex.dt = dt;
		window.AIHex.dt = dt;

		if (gameState == 1) {
			window.playerWave.update();
			window.aiWave.update();

			if (window.PlayerHex.ct - window.playerWave.prevTimeScored > 1000) {
				window.playerWave.prevTimeScored = window.PlayerHex.ct;
			}
			if (window.AIHex.ct - window.aiWave.prevTimeScored > 1000) {
				window.aiWave.prevTimeScored = window.AIHex.ct;
			}
		}

		// Update player blocks
		updateGameArea(window.PlayerHex, window.playerBlocks, dt, true);
		// Update AI blocks
		updateGameArea(window.AIHex, window.aiBlocks, dt, false);

		// Update score display
		$('#playerScore').text(Math.floor(window.playerScore));
		$('#aiScore').text(Math.floor(window.aiScore));

		// Check game over conditions
		if (gameState === 1) {
			var playerLost = false;
			var aiLost = false;
			
			for (var i = 0; i < 6; i++) {
				if (window.PlayerHex.blocks[i].length >= settings.rows) {
					playerLost = true;
				}
				if (window.AIHex.blocks[i].length >= settings.rows) {
					aiLost = true;
				}
			}
			
			if (playerLost || aiLost) {
				endAIBattle(playerLost, aiLost);
			}
		}
	} else {
		// Normal game mode
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

		// Check game over
		if (gameState === 1) {
			for (var i = 0; i < 6; i++) {
				if (MainHex.blocks[i].length >= settings.rows) {
					gameOver();
					break;
				}
			}
		}
		MainHex.ct += dt;
	}
}

// Update a single game area (player or AI)
function updateGameArea(hex, blocksArray, dt, isPlayer) {
	var lowestDeletedIndex = 99;
	var i;
	var j;
	var block;

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
				// Update score
				if (isPlayer) {
					window.playerScore += 10 * window.scoreAdditionCoeff;
				} else {
					window.aiScore += 10 * window.scoreAdditionCoeff;
				}
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

function endAIBattle(playerLost, aiLost) {
	gameState = -1;
	
	// Stop AI controller
	if (window.AITimer) {
		clearInterval(window.AITimer);
		window.AITimer = null;
	}
	
	var playerWon = !playerLost && aiLost;
	var aiWon = !aiLost && playerLost;
	var draw = playerLost && aiLost;
	
	// Update local storage
	updateBattleRecord(playerWon);
	
	// Show result
	var resultText;
	var playerScore = Math.floor(window.playerScore);
	var aiScore = Math.floor(window.aiScore);
	
	if (playerWon) {
		resultText = `你赢了！\n玩家分数: ${playerScore} - AI分数: ${aiScore}`;
	} else if (aiWon) {
		resultText = `AI获胜！\n玩家分数: ${playerScore} - AI分数: ${aiScore}`;
	} else {
		resultText = `平局！\n玩家分数: ${playerScore} - AI分数: ${aiScore}`;
	}
	
	// Create result display
	var resultDiv = document.createElement('div');
	resultDiv.id = 'aiBattleResult';
	resultDiv.style.cssText = `
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(255, 255, 255, 0.95);
		padding: 30px;
		border-radius: 10px;
		font-size: 30px;
		text-align: center;
		z-index: 1000;
		color: #2c3e50;
		font-family: 'Arial', sans-serif;
	`;
	resultDiv.innerHTML = resultText;
	
	// Add buttons
	var restartBtn = document.createElement('button');
	restartBtn.textContent = '重新开始';
	restartBtn.style.cssText = `
		margin: 10px;
		padding: 10px 20px;
		font-size: 20px;
		cursor: pointer;
		background: #3498db;
		color: white;
		border: none;
		border-radius: 5px;
	`;
	restartBtn.addEventListener('click', () => {
		document.body.removeChild(resultDiv);
		startAIBattle(window.AIDifficulty);
	});
	
	var menuBtn = document.createElement('button');
	menuBtn.textContent = '返回主菜单';
	menuBtn.style.cssText = `
		margin: 10px;
		padding: 10px 20px;
		font-size: 20px;
		cursor: pointer;
		background: #e74c3c;
		color: white;
		border: none;
		border-radius: 5px;
	`;
	menuBtn.addEventListener('click', () => {
		document.body.removeChild(resultDiv);
		window.isAIBattle = false;
		resetGame();
		showMenu();
	});
	
	resultDiv.appendChild(document.createElement('br'));
	resultDiv.appendChild(restartBtn);
	resultDiv.appendChild(menuBtn);
	
	document.body.appendChild(resultDiv);
}

function updateBattleRecord(playerWon) {
	// Get existing records
	var records = JSON.parse(localStorage.getItem('hextrisAIBattleRecords')) || {};
	
	// Initialize difficulty record if not exists
	if (!records[window.AIDifficulty]) {
		records[window.AIDifficulty] = { wins: 0, losses: 0 };
	}
	
	// Update record
	if (playerWon) {
		records[window.AIDifficulty].wins++;
	} else {
		records[window.AIDifficulty].losses++;
	}
	
	// Save back to localStorage
	localStorage.setItem('hextrisAIBattleRecords', JSON.stringify(records));
}
