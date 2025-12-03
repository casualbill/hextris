// AI Demo Module
window.aiDemo = {
    enabled: false,
    currentModel: null,
    llmWorker: null,
    decisionCount: 0,
    startTime: null,
    timerInterval: null,

    // WebLLM Models List
    availableModels: [
        { name: "Llama 3 Instruct 8B", size: "8B parameters", modelId: "Llama-3-8B-Instruct-q4f32_1-MLC" },
        { name: "Llama 3 Instruct 70B", size: "70B parameters", modelId: "Llama-3-70B-Instruct-q4f32_1-MLC" },
        { name: "Mistral 7B Instruct", size: "7B parameters", modelId: "Mistral-7B-Instruct-v0.3-q4f32_1-MLC" },
        { name: "Phi-2", size: "2.7B parameters", modelId: "Phi-2-q4f32_1-MLC" },
        { name: "Qwen 7B Chat", size: "7B parameters", modelId: "Qwen-7B-Chat-q4f32_1-MLC" }
    ],

    init: function() {
        // Bind event listeners
        $('#aiDemoBtn').on('click', this.showModelSelection.bind(this));
        $('#stopDemoBtn').on('click', this.stopDemo.bind(this));
    },

    showModelSelection: function() {
        $('#aiDemoBtn').hide();
        $('#startBtn').hide();
        
        const modelList = $('#modelList');
        modelList.empty();

        this.availableModels.forEach(model => {
            const modelItem = $('<div>').addClass('model-item');
            modelItem.append($('<div>').addClass('model-name').text(model.name));
            modelItem.append($('<div>').addClass('model-size').text(model.size));
            modelItem.on('click', () => this.loadModel(model));
            modelList.append(modelItem);
        });

        $('#modelSelectionScreen').fadeIn();
    },

    loadModel: function(model) {
        $('#modelSelectionScreen').fadeOut();
        $('#loadingScreen').fadeIn();

        this.currentModel = model;
        $('#aiModelName').text(model.name);

        // Import WebLLM
        import('https://esm.run/@mlc-ai/web-llm').then(webllm => {
            const progressCallback = (report) => {
                const progress = report.progress * 100;
                $('#loadingProgressFill').css('width', progress + '%');
                $('#loadingPercentage').text(Math.round(progress) + '%');
            };

            const engine = new webllm.MLCEngine();
            engine.reload(model.modelId, progressCallback).then(() => {
                this.llmWorker = engine;
                this.startDemo();
            }).catch(err => {
                sweetAlert({
                    title: "模型加载失败",
                    text: "请重试",
                    type: "error",
                    confirmButtonText: "重新加载"
                }, () => {
                    this.showModelSelection();
                });
            });
        });
    },

    startDemo: function() {
        $('#loadingScreen').fadeOut();
        
        // Hide main menu elements
        $('#aiDemoBtn').hide();
        $('#startBtn').hide();
        
        // Show AI demo UI
        $('#aiStats').show();
        $('#aiModelName').show();
        $('#stopDemoBtn').show();

        // Initialize game
        init(1);
        this.enabled = true;
        this.decisionCount = 0;
        this.startTime = Date.now();

        // Start timer update
        this.timerInterval = setInterval(() => this.updateStats(), 1000);

        // Start AI decision making
        this.startAIDecisionLoop();
    },

    startAIDecisionLoop: function() {
        if (!this.enabled) return;

        setTimeout(() => {
            if (this.enabled && gameState === 1) {
                this.makeAIDecision();
            }
            this.startAIDecisionLoop();
        }, 1000);
    },

    makeAIDecision: function() {
        if (!this.enabled || !this.llmWorker) return;

        // Get current game state
        const gameStatePrompt = this.getGameStatePrompt();

        // Generate decision
        this.llmWorker.generate(gameStatePrompt, undefined, (progress) => {
            if (progress.finished) {
                const response = progress.text.trim();
                this.executeDecision(response);
            }
        });
    },

    getGameStatePrompt: function() {
        const prompt = `你是Hextris游戏的AI玩家，请根据当前游戏状态做出最优决策。
游戏规则：六边形可以向左或向右旋转，目标是让相同颜色的方块连成线来消除得分。
当前游戏状态：
- 当前分数: ${score}
- 六边形方块布局: ${JSON.stringify(MainHex.blocks)}
- 当前下落方块: ${blocks.length > 0 ? JSON.stringify(blocks[0]) : '无'}

请只回复"向左旋转"或"向右旋转"，不要添加其他任何解释。`;

        return prompt;
    },

    executeDecision: function(decision) {
        this.decisionCount++;

        if (decision.includes("向左旋转")) {
            MainHex.rotate(1);
            this.showDecisionPrompt("AI决策：向左旋转");
        } else if (decision.includes("向右旋转")) {
            MainHex.rotate(-1);
            this.showDecisionPrompt("AI决策：向右旋转");
        } else {
            // Fallback to random decision
            const randomDecision = Math.random() > 0.5 ? 1 : -1;
            MainHex.rotate(randomDecision);
            this.showDecisionPrompt(`AI决策：${randomDecision === 1 ? "向左旋转" : "向右旋转"}`);
        }
    },

    showDecisionPrompt: function(text) {
        const promptElement = $('#aiDecisionPrompt');
        promptElement.text(text);
        promptElement.show();

        setTimeout(() => {
            promptElement.hide();
        }, 1000);
    },

    updateStats: function() {
        if (!this.enabled) return;

        // Update score
        $('#aiScore').text(score);

        // Update time
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        $('#aiTime').text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        // Update decision count
        $('#aiDecisions').text(this.decisionCount);
    },

    stopDemo: function() {
        this.enabled = false;
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Hide AI demo UI
        $('#aiStats').hide();
        $('#aiModelName').hide();
        $('#stopDemoBtn').hide();
        $('#aiDecisionPrompt').hide();

        // Stop game
        gameState = 0;

        // Show main menu
        setStartScreen();
    },

    gameOver: function() {
        this.enabled = false;
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        sweetAlert({
            title: "演示结束",
            text: `最终分数: ${score}\n游戏时长: ${timeStr}\nAI决策次数: ${this.decisionCount}`,
            type: "success",
            confirmButtonText: "重新开始",
            showCancelButton: true,
            cancelButtonText: "返回主菜单"
        }, (isConfirm) => {
            if (isConfirm) {
                this.loadModel(this.currentModel);
            } else {
                this.stopDemo();
            }
        });
    }
};

// Initialize AI demo when document is ready
$(document).ready(function() {
    aiDemo.init();
});

// Override game over function to handle AI demo
const originalGameOverDisplay = gameOverDisplay;
gameOverDisplay = function() {
    if (aiDemo.enabled) {
        aiDemo.gameOver();
    } else {
        originalGameOverDisplay();
    }
};

// Block user input during AI demo
const originalHandleClickTap = handleClickTap;
handleClickTap = function(x, y) {
    if (!aiDemo.enabled) {
        originalHandleClickTap(x, y);
    }
};

// Block keyboard input during AI demo
const originalAddKeyListeners = addKeyListeners;
addKeyListeners = function() {
    originalAddKeyListeners();
    
    // Override key listeners to block input during AI demo
    keypress.register_combo({
        keys: "left",
        on_keydown: function() {
            if (MainHex && gameState !== 0 && !aiDemo.enabled) {
                MainHex.rotate(1);
            }
        }
    });

    keypress.register_combo({
        keys: "right",
        on_keydown: function() {
            if (MainHex && gameState !== 0 && !aiDemo.enabled) {
                MainHex.rotate(-1);
            }
        }
    });

    keypress.register_combo({
        keys: "a",
        on_keydown: function() {
            if (MainHex && gameState !== 0 && !aiDemo.enabled) {
                MainHex.rotate(1);
            }
        }
    });

    keypress.register_combo({
        keys: "d",
        on_keydown: function() {
            if (MainHex && gameState !== 0 && !aiDemo.enabled) {
                MainHex.rotate(-1);
            }
        }
    });
};
