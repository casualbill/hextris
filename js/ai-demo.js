// AI智能演示功能核心逻辑
var aiDemoState = 0; // 0: 未激活, 1: 模型选择, 2: 模型加载, 3: AI游戏中
var currentAIModel = null;
var aiDecisionCount = 0;
var aiGameStartTime = 0;
var aiDecisionText = '';
var aiDecisionTextTimer = 0;

// 可用的WebLLM模型列表
var availableAIModels = [
    { name: 'LLaMA-2-7B', params: '7B' },
    { name: 'LLaMA-2-13B', params: '13B' },
    { name: 'Mistral-7B', params: '7B' },
    { name: 'Zephyr-7B', params: '7B' }
];

// 初始化AI演示功能
function initAIDemo() {
    // 这里可以添加WebLLM库的初始化代码
}

// 显示模型选择界面
function showAIModelSelection() {
    aiDemoState = 1;
    gameState = -1; // 暂停游戏
    
    // 清空覆盖层并添加模型选择界面
    var modelSelectionHTML = '<div class="centeredHeader unselectable">选择AI模型</div><div class="ai-model-list">';
    
    for (var i = 0; i < availableAIModels.length; i++) {
        var model = availableAIModels[i];
        modelSelectionHTML += '<div class="ai-model-item" onclick="selectAIModel(\'' + model.name + '\')">';
        modelSelectionHTML += '<div class="ai-model-name">' + model.name + '</div>';
        modelSelectionHTML += '<div class="ai-model-params">参数量: ' + model.params + '</div>';
        modelSelectionHTML += '</div>';
    }
    
    modelSelectionHTML += '</div><div class="ai-back-button" onclick="exitAIDemo()">返回主菜单</div>';
    
    $('.overlay').html(modelSelectionHTML);
    $('.overlay').fadeIn('1000', 'swing');
}

// 选择AI模型
function selectAIModel(modelName) {
    currentAIModel = modelName;
    showAIModelLoading();
}

// 显示模型加载界面
function showAIModelLoading() {
    aiDemoState = 2;
    
    var loadingHTML = '<div class="centeredHeader unselectable">加载AI模型</div>';
    loadingHTML += '<div class="ai-loading-progress"><div class="ai-progress-bar"></div></div>';
    loadingHTML += '<div class="ai-loading-percentage">0%</div>';
    loadingHTML += '<div class="ai-loading-model">模型: ' + currentAIModel + '</div>';
    
    $('.overlay').html(loadingHTML);
    
    // 模拟模型加载进度
    var progress = 0;
    var loadingInterval = setInterval(function() {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // 加载完成后自动开始AI游戏
            setTimeout(function() {
                startAIGame();
            }, 1000);
        }
        
        $('.ai-progress-bar').css('width', progress + '%');
        $('.ai-loading-percentage').text(Math.round(progress) + '%');
    }, 500);
}

// 开始AI游戏
function startAIGame() {
    aiDemoState = 3;
    aiDecisionCount = 0;
    aiGameStartTime = Date.now();
    aiDecisionText = '';
    aiDecisionTextTimer = 0;
    
    // 隐藏覆盖层并初始化游戏
    $('.overlay').fadeOut(150, function() {
        $('.overlay').html('');
    });
    
    init(1); // 初始化游戏
    gameState = 1; // 开始游戏
}

// AI决策函数
function makeAIDecision() {
    // 这里可以添加实际的WebLLM模型调用代码
    // 模拟AI决策：随机选择向左或向右旋转
    var decision = Math.random() > 0.5 ? 'left' : 'right';
    
    aiDecisionCount++;
    aiDecisionText = 'AI决策：' + (decision == 'left' ? '向左旋转' : '向右旋转');
    aiDecisionTextTimer = 60; // 显示1秒（60帧）
    
    // 执行旋转操作
    if (decision == 'left') {
        MainHex.rotate(-1);
    } else {
        MainHex.rotate(1);
    }
}

// 更新AI演示相关的UI元素
function updateAIDemoUI() {
    if (aiDemoState != 3) return;
    
    // 减少AI决策文本显示时间
    if (aiDecisionTextTimer > 0) {
        aiDecisionTextTimer--;
    } else {
        aiDecisionText = '';
    }
    
    // 绘制AI相关的UI元素
    drawAIDemoUI();
}

// 绘制AI演示相关的UI元素
function drawAIDemoUI() {
    if (aiDemoState != 3) return;
    
    // 右上角显示当前使用的模型名称
    renderText(trueCanvas.width - 100, 50, 20, "rgb(236, 240, 241)", 'AI模型: ' + currentAIModel);
    
    // 左上角显示实时统计信息
    var gameDuration = Math.floor((Date.now() - aiGameStartTime) / 1000);
    renderText(100, 50, 16, "rgb(236, 240, 241)", '分数: ' + score);
    renderText(100, 75, 16, "rgb(236, 240, 241)", '时长: ' + gameDuration + '秒');
    renderText(100, 100, 16, "rgb(236, 240, 241)", '决策次数: ' + aiDecisionCount);
    
    // 显示AI决策提示
    if (aiDecisionTextTimer > 0) {
        renderText(trueCanvas.width / 2, trueCanvas.height / 2 - 100, 24, "rgb(255, 215, 0)", aiDecisionText);
    }
    
    // 底部显示停止演示按钮
    renderText(trueCanvas.width / 2, trueCanvas.height - 50, 20, "rgb(231, 76, 60)", '停止演示', 'px Exo');
}

// 停止AI演示
function stopAIDemo() {
    aiDemoState = 0;
    currentAIModel = null;
    
    // 显示游戏结束界面
    gameState = 2;
    gameOverDisplay();
}

// 退出AI演示
function exitAIDemo() {
    aiDemoState = 0;
    currentAIModel = null;
    
    // 隐藏覆盖层并返回主菜单
    $('.overlay').fadeOut(150, function() {
        $('.overlay').html('');
    });
    
    setStartScreen();
}

// 检查是否点击了AI相关的UI元素
function checkAIDemoClick(x, y) {
    if (aiDemoState == 0) return false;
    
    // 检查是否点击了停止演示按钮
    if (aiDemoState == 3) {
        var buttonY = trueCanvas.height - 50;
        if (Math.abs(x - trueCanvas.width / 2) < 100 && Math.abs(y - buttonY) < 20) {
            stopAIDemo();
            return true;
        }
    }
    
    // 检查是否点击了AI智能演示按钮（主菜单）
    if (gameState == 0) {
        var buttonY = trueCanvas.height / 2 + gdy + 100 * settings.scale + 70;
        if (Math.abs(x - (trueCanvas.width / 2 + gdx + 5 * settings.scale)) < 100 && Math.abs(y - buttonY) < 20) {
            showAIModelSelection();
            return true;
        }
    }
    
    return false;
}