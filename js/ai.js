// AI对战模块
window.aiMode = false;
window.aiDifficulty = 'easy'; // easy, medium, hard
window.aiHex = null;
window.playerHex = null;
window.aiScore = 0;
window.playerScore = 0;
window.aiWins = 0;
window.playerWins = 0;

// AI难度设置
window.aiSettings = {
    easy: { delay: 300, strategy: 'simple' },
    medium: { delay: 150, strategy: 'medium' },
    hard: { delay: 50, strategy: 'optimal' }
};

// AI对战记录
window.aiStats = {
    easy: { wins: 0, losses: 0 },
    medium: { wins: 0, losses: 0 },
    hard: { wins: 0, losses: 0 }
};

function initAIStats() {
    // 从本地存储加载AI对战记录
    var savedStats = localStorage.getItem('hextrisAIStats');
    if (savedStats) {
        window.aiStats = JSON.parse(savedStats);
    }
}

function saveAIStats() {
    // 保存AI对战记录到本地存储
    localStorage.setItem('hextrisAIStats', JSON.stringify(window.aiStats));
}

function startAIGame(difficulty) {
    window.aiMode = true;
    window.aiDifficulty = difficulty;
    window.aiScore = 0;
    window.playerScore = 0;
    
    // 创建两个六边形，左侧为玩家，右侧为AI
    window.playerHex = new Hex(settings.hexWidth);
    window.aiHex = new Hex(settings.hexWidth);
    
    // 设置位置
    window.playerHex.x = trueCanvas.width / 4;
    window.playerHex.y = trueCanvas.height / 2;
    window.aiHex.x = trueCanvas.width * 3 / 4;
    window.aiHex.y = trueCanvas.height / 2;
    
    // 初始化AI
    initAI();
    
    // 开始游戏
    gameState = 1;
    startTime = Date.now();
}

function initAI() {
    // 启动AI控制循环
    aiControlLoop();
}

function aiControlLoop() {
    if (!window.aiMode || gameState !== 1) return;
    
    // 根据难度获取延迟
    var delay = window.aiSettings[window.aiDifficulty].delay;
    
    // AI决策
    makeAIDecision();
    
    // 下一次决策
    setTimeout(aiControlLoop, delay);
}

function makeAIDecision() {
    var strategy = window.aiSettings[window.aiDifficulty].strategy;
    
    switch(strategy) {
        case 'simple':
            simpleAIStrategy();
            break;
        case 'medium':
            mediumAIStrategy();
            break;
        case 'optimal':
            optimalAIStrategy();
            break;
    }
}

function simpleAIStrategy() {
    // 简单策略：随机旋转
    if (Math.random() < 0.3) {
        window.aiHex.rotate(Math.random() < 0.5 ? 1 : -1);
    }
}

function mediumAIStrategy() {
    // 中等策略：根据当前方块位置和颜色选择最优旋转
    var currentBlock = window.aiHex.blocks[window.aiHex.position][window.aiHex.blocks[window.aiHex.position].length - 1];
    if (currentBlock) {
        var color = currentBlock.color;
        
        // 寻找相同颜色的列
        for (var i = 0; i < window.aiHex.sides; i++) {
            var lane = (window.aiHex.position + i) % window.aiHex.sides;
            if (window.aiHex.blocks[lane].length > 0) {
                var lastBlock = window.aiHex.blocks[lane][window.aiHex.blocks[lane].length - 1];
                if (lastBlock.color === color) {
                    // 旋转到该列
                    var rotateAmount = i - window.aiHex.position;
                    if (rotateAmount < 0) rotateAmount += window.aiHex.sides;
                    if (rotateAmount > 3) rotateAmount -= window.aiHex.sides;
                    
                    if (rotateAmount !== 0) {
                        window.aiHex.rotate(rotateAmount);
                        return;
                    }
                }
            }
        }
        
        // 如果没有找到相同颜色，随机旋转
        if (Math.random() < 0.5) {
            window.aiHex.rotate(Math.random() < 0.5 ? 1 : -1);
        }
    }
}

function optimalAIStrategy() {
    // 最优策略：分析所有可能的旋转并选择最佳选项
    var bestRotation = 0;
    var bestScore = -1;
    
    // 尝试所有可能的旋转（0-5）
    for (var rotation = 0; rotation < window.aiHex.sides; rotation++) {
        var score = evaluateRotation(rotation);
        if (score > bestScore) {
            bestScore = score;
            bestRotation = rotation;
        }
    }
    
    // 执行最佳旋转
    if (bestRotation !== window.aiHex.position) {
        var rotateAmount = bestRotation - window.aiHex.position;
        if (rotateAmount < 0) rotateAmount += window.aiHex.sides;
        if (rotateAmount > 3) rotateAmount -= window.aiHex.sides;
        
        if (rotateAmount !== 0) {
            window.aiHex.rotate(rotateAmount);
        }
    }
}

function evaluateRotation(rotation) {
    // 评估旋转的得分
    var score = 0;
    
    // 检查是否有相同颜色的方块可以匹配
    var currentBlock = window.aiHex.blocks[window.aiHex.position][window.aiHex.blocks[window.aiHex.position].length - 1];
    if (currentBlock) {
        var color = currentBlock.color;
        
        // 检查目标列的最后一个方块颜色
        if (window.aiHex.blocks[rotation].length > 0) {
            var lastBlock = window.aiHex.blocks[rotation][window.aiHex.blocks[rotation].length - 1];
            if (lastBlock.color === color) {
                score += 10; // 颜色匹配加分
            }
        }
        
        // 检查列的高度，优先选择较短的列
        score -= window.aiHex.blocks[rotation].length * 2;
        
        // 检查是否有形成消除的可能
        if (window.aiHex.blocks[rotation].length >= 2) {
            var secondLastBlock = window.aiHex.blocks[rotation][window.aiHex.blocks[rotation].length - 2];
            if (secondLastBlock.color === color) {
                score += 20; // 可能形成消除加分
            }
        }
    }
    
    return score;
}

function checkAIGameOver() {
    // 检查AI游戏是否结束
    if (!window.aiMode) return;
    
    // 检查玩家是否失败
    if (checkGameOver(window.playerHex)) {
        endAIGame('ai');
        return true;
    }
    
    // 检查AI是否失败
    if (checkGameOver(window.aiHex)) {
        endAIGame('player');
        return true;
    }
    
    return false;
}

function checkGameOver(hex) {
    // 检查单个六边形是否游戏结束
    for (var i = 0; i < hex.sides; i++) {
        if (hex.blocks[i].length > settings.rows) {
            return true;
        }
    }
    return false;
}

function endAIGame(winner) {
    // 结束AI对战游戏
    window.aiMode = false;
    gameState = 2;
    
    // 更新对战记录
    if (winner === 'player') {
        window.aiStats[window.aiDifficulty].wins++;
        window.playerWins++;
    } else {
        window.aiStats[window.aiDifficulty].losses++;
        window.aiWins++;
    }
    
    // 保存对战记录
    saveAIStats();
    
    // 显示游戏结束界面
    showAIGameOverScreen(winner);
}

function showAIGameOverScreen(winner) {
    // 显示AI对战游戏结束界面
    var message = winner === 'player' ? '你赢了！' : 'AI获胜';
    var playerScore = window.playerScore;
    var aiScore = window.aiScore;
    
    // 创建游戏结束界面
    var gameOverHTML = `
        <div id="aiGameOverScreen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="color: white; font-size: 48px; font-weight: bold; margin-bottom: 20px;">${message}</div>
            <div style="color: white; font-size: 24px; margin-bottom: 10px;">玩家分数: ${playerScore}</div>
            <div style="color: white; font-size: 24px; margin-bottom: 30px;">AI分数: ${aiScore}</div>
            <button id="aiRestartBtn" style="padding: 15px 30px; font-size: 18px; margin: 10px; cursor: pointer; background: #3498db; color: white; border: none; border-radius: 5px;">重新开始</button>
            <button id="aiMainMenuBtn" style="padding: 15px 30px; font-size: 18px; margin: 10px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 5px;">返回主菜单</button>
        </div>
    `;
    
    $('body').append(gameOverHTML);
    
    // 绑定事件
    $('#aiRestartBtn').click(function() {
        $('#aiGameOverScreen').remove();
        startAIGame(window.aiDifficulty);
    });
    
    $('#aiMainMenuBtn').click(function() {
        $('#aiGameOverScreen').remove();
        window.aiMode = false;
        gameState = 0;
        showMainMenu();
    });
}

function showAIDifficultyScreen() {
    // 显示AI难度选择界面
    var difficultyHTML = `
        <div id="aiDifficultyScreen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="color: white; font-size: 36px; font-weight: bold; margin-bottom: 40px;">选择AI难度</div>
            <button id="aiEasyBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 5px;">简单</button>
            <button id="aiMediumBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #f1c40f; color: white; border: none; border-radius: 5px;">中等</button>
            <button id="aiHardBtn" style="padding: 20px 40px; font-size: 24px; margin: 15px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 5px;">困难</button>
            <button id="aiBackBtn" style="padding: 15px 30px; font-size: 18px; margin-top: 30px; cursor: pointer; background: #34495e; color: white; border: none; border-radius: 5px;">返回主菜单</button>
        </div>
    `;
    
    $('body').append(difficultyHTML);
    
    // 绑定事件
    $('#aiEasyBtn').click(function() {
        $('#aiDifficultyScreen').remove();
        startAIGame('easy');
    });
    
    $('#aiMediumBtn').click(function() {
        $('#aiDifficultyScreen').remove();
        startAIGame('medium');
    });
    
    $('#aiHardBtn').click(function() {
        $('#aiDifficultyScreen').remove();
        startAIGame('hard');
    });
    
    $('#aiBackBtn').click(function() {
        $('#aiDifficultyScreen').remove();
        showMainMenu();
    });
}

function updateAIScores() {
    // 更新AI对战分数显示
    if (window.aiMode) {
        // 玩家分数
        var playerBlocks = 0;
        for (var i = 0; i < window.playerHex.sides; i++) {
            playerBlocks += window.playerHex.blocks[i].length;
        }
        window.playerScore = playerBlocks * 10;
        
        // AI分数
        var aiBlocks = 0;
        for (var i = 0; i < window.aiHex.sides; i++) {
            aiBlocks += window.aiHex.blocks[i].length;
        }
        window.aiScore = aiBlocks * 10;
    }
}

function drawAIScoreBoard() {
    // 绘制AI对战分数对比板
    if (!window.aiMode) return;
    
    var centerX = trueCanvas.width / 2;
    var centerY = 50;
    
    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(centerX - 200, centerY - 25, 400, 50);
    
    // 玩家分数
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 24px Exo';
    ctx.textAlign = 'left';
    ctx.fillText('玩家: ' + window.playerScore, centerX - 150, centerY + 8);
    
    // AI分数
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'right';
    ctx.fillText('AI: ' + window.aiScore, centerX + 150, centerY + 8);
    
    // 分隔线
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 1, centerY - 20);
    ctx.lineTo(centerX - 1, centerY + 20);
    ctx.stroke();
}

// 初始化AI对战记录
initAIStats();