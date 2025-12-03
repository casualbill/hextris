// 日常任务系统
var QuestSystem = {
    quests: [],
    dailyCompleted: 0,
    totalCompleted: 0,
    freeRefreshCount: 1,
    lastResetDate: null,
    questTypes: [
        { name: '得分高手', type: 'score', target: 500, reward: 100, description: '单局分数达到500分' },
        { name: '消除达人', type: 'clear', target: 50, reward: 80, description: '累计消除50个方块' },
        { name: '连击专家', type: 'combo', target: 5, reward: 120, description: '单次连击达到5次' },
        { name: '持久玩家', type: 'duration', target: 600, reward: 90, description: '累计游戏时长达到10分钟' },
        { name: '游戏达人', type: 'games', target: 3, reward: 70, description: '完成3局游戏' }
    ],
    
    // 初始化任务系统
    init: function() {
        this.loadData();
        this.checkReset();
        this.generateQuests();
    },
    
    // 加载本地存储的任务数据
    loadData: function() {
        var data = localStorage.getItem('questSystemData');
        if (data) {
            data = JSON.parse(data);
            this.dailyCompleted = data.dailyCompleted || 0;
            this.totalCompleted = data.totalCompleted || 0;
            this.freeRefreshCount = data.freeRefreshCount || 1;
            this.lastResetDate = data.lastResetDate;
            this.quests = data.quests || [];
        }
    },
    
    // 保存任务数据到本地存储
    saveData: function() {
        var data = {
            dailyCompleted: this.dailyCompleted,
            totalCompleted: this.totalCompleted,
            freeRefreshCount: this.freeRefreshCount,
            lastResetDate: this.lastResetDate,
            quests: this.quests
        };
        localStorage.setItem('questSystemData', JSON.stringify(data));
    },
    
    // 检查是否需要重置任务
    checkReset: function() {
        var today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            this.resetDailyQuests();
            this.lastResetDate = today;
            this.saveData();
        }
    },
    
    // 重置每日任务
    resetDailyQuests: function() {
        this.quests = [];
        this.dailyCompleted = 0;
        this.freeRefreshCount = 1;
    },
    
    // 生成3个随机任务
    generateQuests: function() {
        if (this.quests.length >= 3) return;
        
        var availableTypes = this.questTypes.slice();
        while (this.quests.length < 3 && availableTypes.length > 0) {
            var randomIndex = Math.floor(Math.random() * availableTypes.length);
            var questType = availableTypes.splice(randomIndex, 1)[0];
            
            this.quests.push({
                id: Date.now() + Math.random(),
                name: questType.name,
                type: questType.type,
                target: questType.target,
                progress: 0,
                completed: false,
                reward: questType.reward,
                description: questType.description
            });
        }
        
        this.saveData();
    },
    
    // 刷新未完成的任务
    refreshQuests: function() {
        if (this.freeRefreshCount <= 0) return false;
        
        this.freeRefreshCount--;
        
        // 替换未完成的任务
        for (var i = 0; i < this.quests.length; i++) {
            if (!this.quests[i].completed) {
                var randomIndex = Math.floor(Math.random() * this.questTypes.length);
                var questType = this.questTypes[randomIndex];
                
                this.quests[i] = {
                    id: Date.now() + Math.random(),
                    name: questType.name,
                    type: questType.type,
                    target: questType.target,
                    progress: 0,
                    completed: false,
                    reward: questType.reward,
                    description: questType.description
                };
            }
        }
        
        this.saveData();
        return true;
    },
    
    // 更新任务进度
    updateProgress: function(type, value) {
        for (var i = 0; i < this.quests.length; i++) {
            var quest = this.quests[i];
            if (!quest.completed && quest.type === type) {
                if (type === 'score') {
                    // 得分任务只记录单局最高分
                    quest.progress = Math.max(quest.progress, value);
                } else {
                    // 其他任务累加
                    quest.progress += value;
                }
                
                // 检查任务是否完成
                if (quest.progress >= quest.target) {
                    quest.progress = quest.target;
                    quest.completed = true;
                    this.dailyCompleted++;
                    this.totalCompleted++;
                    this.showQuestComplete(quest);
                }
            }
        }
        
        this.saveData();
    },
    
    // 显示任务完成提示
    showQuestComplete: function(quest) {
        // 创建提示元素
        var notification = $('<div id="questNotification" class="quest-notification">' +
            '<div class="quest-name">' + quest.name + '</div>' +
            '<div class="quest-complete-text">任务完成！</div>' +
            '<div class="quest-reward">获得 ' + quest.reward + ' 分奖励</div>' +
        '</div>');
        
        // 添加到页面
        $('body').append(notification);
        
        // 显示动画
        setTimeout(function() {
            notification.addClass('show');
        }, 100);
        
        // 3秒后自动隐藏
        setTimeout(function() {
            notification.removeClass('show');
            setTimeout(function() {
                notification.remove();
            }, 500);
        }, 3000);
    },
    
    // 获取下次重置时间
    getNextResetTime: function() {
        var now = new Date();
        var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow;
    },
    
    // 格式化重置倒计时
    formatCountdown: function() {
        var now = new Date();
        var nextReset = this.getNextResetTime();
        var diff = nextReset - now;
        
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return hours + '小时 ' + minutes + '分钟 ' + seconds + '秒';
    },
    
    // 重置单局游戏相关的任务进度
    resetGameSession: function() {
        // 重置得分任务的进度（因为得分任务是单局的）
        for (var i = 0; i < this.quests.length; i++) {
            if (this.quests[i].type === 'score' && !this.quests[i].completed) {
                this.quests[i].progress = 0;
            }
        }
        
        this.saveData();
    }
};

// 任务界面UI
var QuestUI = {
    
    // 显示任务列表
    showQuestList: function() {
        // 创建任务界面元素
        var questScreen = $('<div id="questScreen" class="quest-screen unselectable">' +
            '<div class="quest-header">' +
                '<div class="quest-title">日常任务</div>' +
                '<div class="quest-stats">' +
                    '<span>今日完成: ' + QuestSystem.dailyCompleted + '/3</span>' +
                    '<span>累计完成: ' + QuestSystem.totalCompleted + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="quest-list" id="questList"></div>' +
            '<div class="quest-footer">' +
                '<div class="refresh-btn" id="refreshQuestsBtn">' +
                    '刷新任务 <span class="refresh-count">(' + QuestSystem.freeRefreshCount + ')</span>' +
                '</div>' +
                '<div class="reset-countdown">' +
                    '下次重置: <span id="resetCountdown">' + QuestSystem.formatCountdown() + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="back-btn" id="backToMenuBtn">返回主菜单</div>' +
        '</div>');
        
        // 添加到页面
        $('body').append(questScreen);
        
        // 填充任务列表
        this.populateQuestList();
        
        // 绑定事件
        this.bindEvents();
        
        // 启动倒计时更新
        this.startCountdown();
    },
    
    // 填充任务列表
    populateQuestList: function() {
        var questList = $('#questList');
        questList.empty();
        
        QuestSystem.quests.forEach(function(quest) {
            var progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
            var questItem = $('<div class="quest-item" data-quest-id="' + quest.id + '">' +
                '<div class="quest-info">' +
                    '<div class="quest-name">' + quest.name + '</div>' +
                    '<div class="quest-description">' + quest.description + '</div>' +
                    '<div class="quest-reward">奖励: ' + quest.reward + ' 分</div>' +
                '</div>' +
                '<div class="quest-progress">' +
                    '<div class="progress-bar">' +
                        '<div class="progress-fill" style="width: ' + progressPercent + '%"></div>' +
                    '</div>' +
                    '<div class="progress-text">' + quest.progress + '/' + quest.target + '</div>' +
                '</div>' +
                '<div class="quest-status">' + (quest.completed ? '已完成' : '进行中') + '</div>' +
            '</div>');
            
            if (quest.completed) {
                questItem.addClass('completed');
            }
            
            questList.append(questItem);
        });
        
        // 检查是否所有任务都已完成
        if (QuestSystem.dailyCompleted >= 3) {
            questList.append('<div class="all-quests-completed">今日任务全部完成！</div>');
        }
    },
    
    // 绑定事件
    bindEvents: function() {
        // 返回主菜单
        $('#backToMenuBtn').on('click', function() {
            QuestUI.hideQuestList();
        });
        
        // 刷新任务
        $('#refreshQuestsBtn').on('click', function() {
            if (QuestSystem.refreshQuests()) {
                QuestUI.populateQuestList();
                $('#refreshQuestsBtn .refresh-count').text('(' + QuestSystem.freeRefreshCount + ')');
                
                if (QuestSystem.freeRefreshCount <= 0) {
                    $('#refreshQuestsBtn').addClass('disabled');
                }
            }
        });
        
        // 如果没有免费刷新次数，禁用按钮
        if (QuestSystem.freeRefreshCount <= 0) {
            $('#refreshQuestsBtn').addClass('disabled');
        }
    },
    
    // 隐藏任务列表
    hideQuestList: function() {
        $('#questScreen').remove();
        this.stopCountdown();
    },
    
    // 启动倒计时更新
    startCountdown: function() {
        this.countdownInterval = setInterval(function() {
            $('#resetCountdown').text(QuestSystem.formatCountdown());
        }, 1000);
    },
    
    // 停止倒计时更新
    stopCountdown: function() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    },
    
    // 更新任务界面显示
    updateQuestUI: function() {
        if ($('#questScreen').length > 0) {
            this.populateQuestList();
        }
    }
};

// 在主菜单添加任务按钮
function addQuestButton() {
    var questBtn = $('<div id="questBtn" class="menu-btn">日常任务</div>');
    $('body').append(questBtn);
    
    // 绑定点击事件
    questBtn.on('click', function() {
        QuestUI.showQuestList();
    });
    
    // 样式定位（根据游戏现有UI调整）
    questBtn.css({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        marginTop: '150px',
        width: '200px',
        height: '50px',
        backgroundColor: '#3498db',
        color: 'white',
        textAlign: 'center',
        lineHeight: '50px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '20px',
        fontFamily: 'Exo',
        opacity: '0'
    });
    
    // 在主菜单显示时显示按钮
    $(document).on('gameStateChange', function(e, state) {
        if (state === 0) {
            questBtn.fadeIn(500);
        } else {
            questBtn.fadeOut(500);
        }
    });
}

// 任务系统样式
var questStyles = `
    .quest-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    }
    
    .quest-header {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .quest-title {
        font-size: 40px;
        color: white;
        margin-bottom: 10px;
        font-family: 'Exo';
    }
    
    .quest-stats {
        font-size: 16px;
        color: #bdc3c7;
        font-family: 'Exo';
    }
    
    .quest-stats span {
        margin: 0 15px;
    }
    
    .quest-list {
        width: 100%;
        max-width: 600px;
        margin-bottom: 30px;
    }
    
    .quest-item {
        background-color: #2c3e50;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }
    
    .quest-item.completed {
        background-color: #27ae60;
        opacity: 0.8;
    }
    
    .quest-info {
        flex: 1;
        margin-right: 20px;
    }
    
    .quest-name {
        font-size: 20px;
        color: white;
        margin-bottom: 5px;
        font-family: 'Exo';
    }
    
    .quest-description {
        font-size: 14px;
        color: #bdc3c7;
        margin-bottom: 5px;
        font-family: 'Exo';
    }
    
    .quest-reward {
        font-size: 14px;
        color: #f39c12;
        font-family: 'Exo';
    }
    
    .quest-progress {
        flex: 0 0 200px;
        margin-right: 20px;
    }
    
    .progress-bar {
        width: 100%;
        height: 20px;
        background-color: #34495e;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 5px;
    }
    
    .progress-fill {
        height: 100%;
        background-color: #3498db;
        transition: width 0.3s ease;
    }
    
    .quest-item.completed .progress-fill {
        background-color: #27ae60;
    }
    
    .progress-text {
        text-align: center;
        font-size: 12px;
        color: #bdc3c7;
        font-family: 'Exo';
    }
    
    .quest-status {
        flex: 0 0 80px;
        text-align: center;
        font-size: 14px;
        color: white;
        font-family: 'Exo';
    }
    
    .quest-footer {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .refresh-btn {
        display: inline-block;
        padding: 10px 20px;
        background-color: #f39c12;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        font-family: 'Exo';
        margin-bottom: 15px;
        transition: all 0.3s ease;
    }
    
    .refresh-btn:hover:not(.disabled) {
        background-color: #e67e22;
    }
    
    .refresh-btn.disabled {
        background-color: #7f8c8d;
        cursor: not-allowed;
    }
    
    .reset-countdown {
        font-size: 14px;
        color: #bdc3c7;
        font-family: 'Exo';
    }
    
    .back-btn {
        padding: 10px 20px;
        background-color: #34495e;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        font-family: 'Exo';
        transition: all 0.3s ease;
    }
    
    .back-btn:hover {
        background-color: #2c3e50;
    }
    
    .all-quests-completed {
        text-align: center;
        font-size: 20px;
        color: #27ae60;
        padding: 20px;
        background-color: #2c3e50;
        border-radius: 10px;
        font-family: 'Exo';
    }
    
    .quest-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    .quest-notification.show {
        opacity: 1;
    }
    
    .quest-name {
        font-size: 24px;
        margin-bottom: 10px;
        font-family: 'Exo';
    }
    
    .quest-complete-text {
        font-size: 20px;
        margin-bottom: 10px;
        color: #27ae60;
        font-family: 'Exo';
    }
    
    .quest-reward {
        font-size: 16px;
        color: #f39c12;
        font-family: 'Exo';
    }
    
    .menu-btn {
        position: absolute;
        z-index: 100;
    }
`;

// 添加样式到页面
function addQuestStyles() {
    var styleSheet = $('<style>' + questStyles + '</style>');
    $('head').append(styleSheet);
}

// 游戏状态改变事件
function triggerGameStateChange(state) {
    $(document).trigger('gameStateChange', [state]);
}

// 初始化任务系统
$(document).ready(function() {
    addQuestStyles();
    addQuestButton();
    QuestSystem.init();
});