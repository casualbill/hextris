// AI智能演示模块
window.AIDemo = (function() {
	// AI演示状态变量
	var isAIDemoActive = false;
	var currentModel = null;
	var aiDecisionCount = 0;
	var startTime = 0;
	var aiInterval = null;

	// 模型配置
	var modelConfigs = {
		model1: {
			name: '通用模型',
			size: '7B 参数',
			rotationDelay: 1000 // AI决策间隔时间（毫秒）
		},
		model2: {
			name: '轻量化模型',
			size: '3B 参数',
			rotationDelay: 800
		},
		model3: {
			name: '高性能模型',
			size: '13B 参数',
			rotationDelay: 600
		}
	};

	// 初始化AI演示
	function init() {
		// 绑定按钮事件
		$('#aiDemoBtn').on('click', openModelSelection);
		$('.ai-model-item').on('click', selectModel);
		$('#aiStopBtn').on('click', stopAIDemo);
	}

	// 打开模型选择界面
	function openModelSelection() {
		$('#startBtn').addClass('hidden');
		$('#aiDemoBtn').addClass('hidden');
		$('#aiModelSelection').removeClass('hidden');
	}

	// 选择模型并开始加载
	function selectModel() {
		var modelKey = $(this).data('model');
		currentModel = modelConfigs[modelKey];

		// 显示加载界面
		$('#aiModelSelection').addClass('hidden');
		$('#aiLoadingScreen').removeClass('hidden');

		// 模拟模型加载过程
		startModelLoading(modelKey);
	}

	// 模拟模型加载
	function startModelLoading(modelKey) {
		var progress = 0;
		var interval = setInterval(function() {
			progress += Math.random() * 15 + 5;
			if (progress > 100) progress = 100;

			$('.ai-loading-progress').css('width', progress + '%');
			$('.ai-loading-percentage').text(Math.round(progress) + '%');

			if (progress >= 100) {
				clearInterval(interval);
				setTimeout(function() {
					finishModelLoading();
				}, 500);
			}
		}, 300);
	}

	// 模型加载完成，开始AI演示
	function finishModelLoading() {
		$('#aiLoadingScreen').addClass('hidden');

		// 隐藏所有菜单UI
		$('#startBtn').addClass('hidden');
		$('#aiDemoBtn').addClass('hidden');
		$('#pauseBtn').hide();

		// 显示AI演示相关UI
		$('#aiStopBtn').removeClass('hidden');
		$('#aiModelName').removeClass('hidden').text('AI: ' + currentModel.name);
		$('#aiStats').removeClass('hidden');

		// 初始化游戏状态
		initAIGame();

		// 启动AI决策循环
		startAIDecisionLoop();
	}

	// 初始化AI游戏
	function initAIGame() {
		isAIDemoActive = true;
		aiDecisionCount = 0;
		startTime = Date.now();

		// 重置游戏
		init(1);
	}

	// 启动AI决策循环
	function startAIDecisionLoop() {
		aiInterval = setInterval(function() {
			if (isAIDemoActive && gameState == 1) {
				makeAIDecision();
			}
		}, currentModel.rotationDelay);
	}

	// AI做出决策（实际游戏逻辑）
	function makeAIDecision() {
		if (!MainHex || !isAIDemoActive) return;

		// 模拟AI决策逻辑
		// 实际项目中这里应该调用WebLLM模型的API
		var rotation = Math.random() > 0.5 ? 1 : -1; // 随机决定方向

		// 执行旋转
		MainHex.rotate(rotation);

		// 更新统计信息
		aiDecisionCount++;
		uaiStats();

		// 显示决策提示
		displayAIDecision(rotation);
	}

	// 更新AI统计信息
	function updateAIStats() {
		var currentScore = score;
		var gameTime = Math.floor((Date.now() - startTime) / 1000);

		$('#aiStats').html(
			'<div class="ai-stat-item">'
			+ '<span class="ai-stat-label">分数:</span>'
			+ '<span class="ai-stat-value">' + currentScore + '</span>'
			+ '</div>'
			+ '<div class="ai-stat-item">'
			+ '<span class="ai-stat-label">时长:</span>'
			+ '<span class="ai-stat-value">' + gameTime + 's</span>'
			+ '</div>'
			+ '<div class="ai-stat-item">'
			+ '<span class="ai-stat-label">决策:</span>'
			+ '<span class="ai-stat-value">' + aiDecisionCount + '次</span>'
			+ '</div>'
		);
	}

	// 显示AI决策提示
	function displayAIDecision(rotation) {
		var direction = rotation === 1 ? '向左' : '向右';
		var decisionText = 'AI决策：' + direction + '旋转';

		$('#aiDecisionText').text(decisionText).removeClass('hidden');

		// 1秒后隐藏提示
		setTimeout(function() {
			$('#aiDecisionText').addClass('hidden');
		}, 1000);
	}

	// 停止AI演示
	function stopAIDemo() {
		isAIDemoActive = false;

		// 清除AI决策循环
		if (aiInterval) {
			clearInterval(aiInterval);
			aiInterval = null;
		}

		// 隐藏AI演示UI
		$('#aiStopBtn').addClass('hidden');
		$('#aiModelName').addClass('hidden');
		$('#aiStats').addClass('hidden');
		$('#aiDecisionText').addClass('hidden');

		// 恢复游戏状态
		if (gameState == 1) {
			gameState = 2;
			gameOverDisplay();
		}

		// 显示主菜单
		setTimeout(function() {
			setStartScreen();
		}, 1000);
	}

	// 检查AI演示是否处于活动状态
	function isActive() {
		return isAIDemoActive;
	}

	// 暴露公共方法
	return {
		init: init,
		stopAIDemo: stopAIDemo,
		isActive: isActive,
		updateAIStats: updateAIStats
	};
})();