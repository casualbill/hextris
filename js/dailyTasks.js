// 日常任务系统
function DailyTasks() {
    this.tasks = [];
    this.taskTypes = [
        {
            name: "得分高手",
            description: "单局分数达到{target}分",
            type: "score",
            targets: [500, 1000, 2000, 3000, 5000],
            reward: 10
        },
        {
            name: "消除达人",
            description: "累计消除{target}个方块",
            type: "blocksDestroyed",
            targets: [50, 100, 200, 300, 500],
            reward: 10
        },
        {
            name: "连击专家",
            description: "单次连击达到{target}次",
            type: "combo",
            targets: [5, 10, 15, 20, 25],
            reward: 15
        },
        {
            name: "持久玩家",
            description: "累计游戏时长达到{target}分钟",
            type: "playTime",
            targets: [10, 20, 30, 60, 120],
            reward: 15
        },
        {
            name: "游戏达人",
            description: "完成{target}局游戏",
            type: "gamesPlayed",
            targets: [3, 5, 10, 15, 20],
            reward: 10
        }
    ];
    this.stats = {
        currentScore: 0,
        totalBlocksDestroyed: 0,
        maxCombo: 0,
        totalPlayTime: 0,
        gamesPlayed: 0,
        currentCombo: 0
    };
    this.today = new Date().toDateString();
    this.refreshCount = 0;
    this.maxDailyRefreshes = 1;
    this.taskResetTime = null;
    this.taskCompletionSound = null;
    this.history = {
        totalTasksCompleted: 0,
        dailyTasksCompleted: 0,
        streak: 0,
        lastCompletedDate: null
    };
    this.gameStartTime = null;

    this.init = function() {
        this.loadData();
        this.checkDailyReset();
        this.setupEventListeners();
        this.startResetTimer();
        this.updateTaskDisplay();
    };

    this.loadData = function() {
        var savedData = localStorage.getItem('dailyTasks');
        if (savedData) {
            var data = JSON.parse(savedData);
            if (data.today === this.today) {
                this.tasks = data.tasks || [];
                this.refreshCount = data.refreshCount || 0;
            }
        }

        var savedStats = localStorage.getItem('taskStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }

        var savedHistory = localStorage.getItem('taskHistory');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }
    };

    this.saveData = function() {
        var data = {
            tasks: this.tasks,
            today: this.today,
            refreshCount: this.refreshCount
        };
        localStorage.setItem('dailyTasks', JSON.stringify(data));
        localStorage.setItem('taskStats', JSON.stringify(this.stats));
        localStorage.setItem('taskHistory', JSON.stringify(this.history));
    };

    this.checkDailyReset = function() {
        var lastResetDate = localStorage.getItem('lastTaskResetDate');
        var now = new Date();
        var todayStr = now.toDateString();

        if (!lastResetDate || lastResetDate !== todayStr) {
            this.dailyReset();
            localStorage.setItem('lastTaskResetDate', todayStr);
        }
    };

    this.dailyReset = function() {
        this.generateDailyTasks();
        this.refreshCount = 0;
        this.history.dailyTasksCompleted = 0;
        this.stats.currentScore = 0;
        this.stats.totalBlocksDestroyed = 0;
        this.stats.totalPlayTime = 0;
        this.stats.gamesPlayed = 0;
        this.stats.maxCombo = 0;
        this.stats.currentCombo = 0;
        this.saveData();
    };

    this.generateDailyTasks = function() {
        this.tasks = [];
        var selectedTypes = [];

        while (this.tasks.length < 3) {
            var randomIndex = Math.floor(Math.random() * this.taskTypes.length);
            var taskType = this.taskTypes[randomIndex];

            if (selectedTypes.indexOf(taskType.type) === -1) {
                selectedTypes.push(taskType.type);
                var target = taskType.targets[Math.floor(Math.random() * taskType.targets.length)];
                this.tasks.push({
                    id: Date.now() + Math.random(),
                    name: taskType.name,
                    description: taskType.description.replace('{target}', target),
                    type: taskType.type,
                    target: target,
                    progress: 0,
                    completed: false,
                    reward: taskType.reward,
                    claimed: false
                });
            }
        }

        this.saveData();
    };

    this.refreshTasks = function() {
        if (this.refreshCount >= this.maxDailyRefreshes) {
            alert('今日刷新次数已用完，请明天再试！');
            return;
        }

        var newTasks = [];
        var selectedTypes = [];

        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].completed) {
                newTasks.push(this.tasks[i]);
                selectedTypes.push(this.tasks[i].type);
            }
        }

        while (newTasks.length < 3) {
            var randomIndex = Math.floor(Math.random() * this.taskTypes.length);
            var taskType = this.taskTypes[randomIndex];

            if (selectedTypes.indexOf(taskType.type) === -1) {
                selectedTypes.push(taskType.type);
                var target = taskType.targets[Math.floor(Math.random() * taskType.targets.length)];
                newTasks.push({
                    id: Date.now() + Math.random(),
                    name: taskType.name,
                    description: taskType.description.replace('{target}', target),
                    type: taskType.type,
                    target: target,
                    progress: 0,
                    completed: false,
                    reward: taskType.reward,
                    claimed: false
                });
            }
        }

        this.tasks = newTasks;
        this.refreshCount++;
        this.saveData();
        this.updateTaskDisplay();
        alert('任务已刷新！今日剩余刷新次数：' + (this.maxDailyRefreshes - this.refreshCount));
    };

    this.updateStats = function(type, value) {
        switch(type) {
            case 'score':
                this.stats.currentScore = Math.max(this.stats.currentScore, value);
                break;
            case 'blocksDestroyed':
                this.stats.totalBlocksDestroyed += value;
                break;
            case 'combo':
                this.stats.currentCombo = value;
                this.stats.maxCombo = Math.max(this.stats.maxCombo, value);
                break;
            case 'playTime':
                this.stats.totalPlayTime += value;
                break;
            case 'gamesPlayed':
                this.stats.gamesPlayed++;
                break;
        }

        this.checkTaskProgress();
        this.saveData();
    };

    this.checkTaskProgress = function() {
        for (var i = 0; i < this.tasks.length; i++) {
            var task = this.tasks[i];
            if (task.completed) continue;

            var progress = 0;

            switch(task.type) {
                case 'score':
                    progress = Math.min(this.stats.currentScore, task.target);
                    break;
                case 'blocksDestroyed':
                    progress = Math.min(this.stats.totalBlocksDestroyed, task.target);
                    break;
                case 'combo':
                    progress = Math.min(this.stats.maxCombo, task.target);
                    break;
                case 'playTime':
                    progress = Math.min(this.stats.totalPlayTime, task.target);
                    break;
                case 'gamesPlayed':
                    progress = Math.min(this.stats.gamesPlayed, task.target);
                    break;
            }

            task.progress = progress;

            if (progress >= task.target && !task.completed) {
                task.completed = true;
                this.history.dailyTasksCompleted++;
                this.history.totalTasksCompleted++;
                this.showTaskCompletion(task);
            }
        }

        this.saveData();
        this.updateTaskDisplay();
    };

    this.showTaskCompletion = function(task) {
        var message = `任务完成！\n${task.name}\n获得 ${task.reward} 积分奖励！`;

        // 创建任务完成提示
        var completionDiv = $('<div class="task-completion">');
        completionDiv.html(`
            <div class="task-completion-header">任务完成！</div>
            <div class="task-completion-name">${task.name}</div>
            <div class="task-completion-reward">获得 ${task.reward} 积分</div>
        `);

        $('body').append(completionDiv);

        // 显示动画
        setTimeout(function() {
            completionDiv.addClass('show');
        }, 100);

        // 3秒后自动消失
        setTimeout(function() {
            completionDiv.removeClass('show');
            setTimeout(function() {
                completionDiv.remove();
            }, 300);
        }, 3000);
    };

    this.updateTaskDisplay = function() {
        // 更新主菜单的任务统计
        var completedToday = this.tasks.filter(task => task.completed).length;
        var totalToday = this.tasks.length;

        $('#taskStats').html(`今日任务：${completedToday}/${totalToday} | 累计完成：${this.history.totalTasksCompleted}`);

        // 更新任务列表界面
        if ($('#taskListScreen').is(':visible')) {
            this.renderTaskList();
        }
    };

    this.renderTaskList = function() {
        var taskListHtml = '';
        var completedToday = this.tasks.filter(task => task.completed).length;
        var totalToday = this.tasks.length;

        // 任务完成统计
        taskListHtml += `
            <div class="task-stats-header">
                <div class="task-completed-count">今日已完成：${completedToday}/${totalToday}</div>
                ${completedToday === totalToday ? '<div class="all-completed">今日任务全部完成！</div>' : ''}
            </div>
        `;

        // 任务列表
        for (var i = 0; i < this.tasks.length; i++) {
            var task = this.tasks[i];
            var progressPercent = (task.progress / task.target) * 100;
            var statusClass = task.completed ? 'completed' : '';

            taskListHtml += `
                <div class="task-item ${statusClass}" data-task-id="${task.id}">
                    <div class="task-name">${task.name}</div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">${task.progress}/${task.target}</div>
                    </div>
                    <div class="task-reward">奖励：${task.reward} 积分</div>
                    ${task.completed ? '<div class="task-status">已完成</div>' : ''}
                </div>
            `;
        }

        // 刷新按钮
        taskListHtml += `
            <div class="task-actions">
                <button id="refreshTasksBtn" class="task-btn ${this.refreshCount >= this.maxDailyRefreshes ? 'disabled' : ''}">
                    刷新任务 (剩余${this.maxDailyRefreshes - this.refreshCount}次)
                </button>
                <button id="backToMainBtn" class="task-btn">返回主菜单</button>
            </div>
        `;

        // 重置倒计时
        var timeUntilReset = this.getTimeUntilReset();
        taskListHtml += `
            <div class="task-reset-info">
                任务将在 ${timeUntilReset.hours} 小时 ${timeUntilReset.minutes} 分钟后重置
            </div>
        `;

        $('#taskListContent').html(taskListHtml);

        // 绑定按钮事件
        var self = this;
        $('#refreshTasksBtn').off().on('click', function() {
            if (!$(this).hasClass('disabled')) {
                self.refreshTasks();
            }
        });

        $('#backToMainBtn').off().on('click', function() {
            self.hideTaskList();
        });
    };

    this.getTimeUntilReset = function() {
        var now = new Date();
        var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        var diff = tomorrow - now;

        var hours = Math.floor(diff / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { hours: hours, minutes: minutes };
    };

    this.startResetTimer = function() {
        var self = this;
        setInterval(function() {
            self.checkDailyReset();
            if ($('#taskListScreen').is(':visible')) {
                self.renderTaskList();
            }
        }, 60000); // 每分钟检查一次
    };

    this.setupEventListeners = function() {
        // 主菜单任务按钮
        var self = this;
        $('#dailyTasksBtn').off().on('click', function() {
            self.showTaskList();
        });
    };

    this.showTaskList = function() {
        $('#taskListScreen').fadeIn(300);
        this.renderTaskList();
    };

    this.hideTaskList = function() {
        $('#taskListScreen').fadeOut(300);
    };

    // 游戏开始时调用
    this.onGameStart = function() {
        this.stats.currentScore = 0;
        this.stats.currentCombo = 0;
        this.gameStartTime = Date.now();
    };

    // 游戏结束时调用
    this.onGameEnd = function() {
        if (this.gameStartTime) {
            var playTime = (Date.now() - this.gameStartTime) / 60000; // 转换为分钟
            this.updateStats('playTime', playTime);
            this.updateStats('gamesPlayed', 1);
        }
    };

    // 得分更新时调用
    this.onScoreUpdate = function(newScore) {
        this.updateStats('score', newScore);
    };

    // 方块消除时调用
    this.onBlocksDestroyed = function(count) {
        this.updateStats('blocksDestroyed', count);
    };

    // 连击更新时调用
    this.onComboUpdate = function(comboCount) {
        this.updateStats('combo', comboCount);
    };

    // 初始化
    this.init();
}

// 全局初始化
(function() {
    if (typeof window.DailyTasks === 'undefined') {
        window.DailyTasks = new DailyTasks();
    }
})();