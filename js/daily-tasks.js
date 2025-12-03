// 日常任务系统

// 任务类型
const TaskTypes = {
    SCORE: 'score', // 完成指定分数
    CLEAR: 'clear', // 完成指定消除数量
    COMBO: 'combo', // 完成指定连击次数
    TIME: 'time', // 完成指定游戏时长
    GAMES: 'games'  // 完成指定游戏局数
};

// 任务模板
const TaskTemplates = [
    // 得分高手
    { type: TaskTypes.SCORE, name: '得分高手', target: 500, reward: '1000分' },
    { type: TaskTypes.SCORE, name: '得分达人', target: 1000, reward: '2000分' },
    { type: TaskTypes.SCORE, name: '得分大师', target: 2000, reward: '5000分' },
    
    // 消除达人
    { type: TaskTypes.CLEAR, name: '消除达人', target: 50, reward: '800分' },
    { type: TaskTypes.CLEAR, name: '消除专家', target: 100, reward: '1500分' },
    { type: TaskTypes.CLEAR, name: '消除大师', target: 200, reward: '3000分' },
    
    // 连击专家
    { type: TaskTypes.COMBO, name: '连击专家', target: 5, reward: '1200分' },
    { type: TaskTypes.COMBO, name: '连击大师', target: 10, reward: '2500分' },
    { type: TaskTypes.COMBO, name: '连击宗师', target: 15, reward: '5000分' },
    
    // 持久玩家
    { type: TaskTypes.TIME, name: '持久玩家', target: 600, reward: '1000分' }, // 10分钟
    { type: TaskTypes.TIME, name: '耐力达人', target: 1200, reward: '2000分' }, // 20分钟
    { type: TaskTypes.TIME, name: '耐力大师', target: 1800, reward: '3000分' }, // 30分钟
    
    // 游戏达人
    { type: TaskTypes.GAMES, name: '游戏达人', target: 3, reward: '900分' },
    { type: TaskTypes.GAMES, name: '游戏专家', target: 5, reward: '1500分' },
    { type: TaskTypes.GAMES, name: '游戏大师', target: 10, reward: '2500分' }
];

// 任务数据结构
class DailyTask {
    constructor(taskData) {
        this.id = taskData.id || Date.now().toString();
        this.type = taskData.type;
        this.name = taskData.name;
        this.target = taskData.target;
        this.reward = taskData.reward;
        this.progress = taskData.progress || 0;
        this.completed = taskData.completed || false;
    }
    
    // 更新任务进度
    updateProgress(amount) {
        if (this.completed) return;
        
        this.progress = Math.min(this.progress + amount, this.target);
        
        // 检查任务是否完成
        if (this.progress >= this.target) {
            this.completed = true;
            return true; // 任务已完成
        }
        
        return false; // 任务未完成
    }
    
    // 重置任务进度
    reset() {
        this.progress = 0;
        this.completed = false;
    }
}

// 日常任务管理器
class DailyTaskManager {
    constructor() {
        this.tasks = [];
        this.lastResetDate = null;
        this.dailyRefreshCount = 0;
        this.maxDailyRefresh = 1;
        
        this.stats = {
            todayCompleted: 0,
            totalCompleted: 0
        };
        
        this.loadData();
        this.checkAndResetTasks();
    }
    
    // 加载本地存储的数据
    loadData() {
        const savedData = localStorage.getItem('dailyTasksData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // 加载任务
                if (data.tasks) {
                    this.tasks = data.tasks.map(taskData => new DailyTask(taskData));
                }
                
                // 加载重置日期
                if (data.lastResetDate) {
                    this.lastResetDate = new Date(data.lastResetDate);
                }
                
                // 加载刷新次数
                if (data.dailyRefreshCount) {
                    this.dailyRefreshCount = data.dailyRefreshCount;
                }
                
                // 加载统计数据
                if (data.stats) {
                    this.stats = data.stats;
                }
            } catch (e) {
                console.error('加载日常任务数据失败:', e);
            }
        }
    }
    
    // 保存数据到本地存储
    saveData() {
        const data = {
            tasks: this.tasks,
            lastResetDate: this.lastResetDate,
            dailyRefreshCount: this.dailyRefreshCount,
            stats: this.stats
        };
        
        localStorage.setItem('dailyTasksData', JSON.stringify(data));
    }
    
    // 检查是否需要重置任务
    checkAndResetTasks() {
        const today = new Date();
        const isNewDay = !this.lastResetDate || 
                         today.getDate() !== this.lastResetDate.getDate() ||
                         today.getMonth() !== this.lastResetDate.getMonth() ||
                         today.getFullYear() !== this.lastResetDate.getFullYear();
        
        if (isNewDay) {
            this.resetTasks();
        }
    }
    
    // 重置日常任务
    resetTasks() {
        // 生成新的3个任务
        this.tasks = this.generateRandomTasks(3);
        
        // 重置刷新次数
        this.dailyRefreshCount = 0;
        
        // 更新重置日期
        this.lastResetDate = new Date();
        
        // 重置今日完成数
        this.stats.todayCompleted = 0;
        
        // 保存数据
        this.saveData();
    }
    
    // 生成随机任务
    generateRandomTasks(count) {
        const tasks = [];
        const usedIndices = new Set();
        
        for (let i = 0; i < count; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * TaskTemplates.length);
            } while (usedIndices.has(randomIndex));
            
            usedIndices.add(randomIndex);
            tasks.push(new DailyTask(TaskTemplates[randomIndex]));
        }
        
        return tasks;
    }
    
    // 刷新未完成的任务
    refreshTasks() {
        if (this.dailyRefreshCount >= this.maxDailyRefresh) {
            return false; // 今日刷新次数已用完
        }
        
        // 保留已完成的任务
        const completedTasks = this.tasks.filter(task => task.completed);
        
        // 生成新的未完成任务
        const newTasksCount = 3 - completedTasks.length;
        const newTasks = this.generateRandomTasks(newTasksCount);
        
        // 合并任务
        this.tasks = [...completedTasks, ...newTasks];
        
        // 增加刷新次数
        this.dailyRefreshCount++;
        
        // 保存数据
        this.saveData();
        
        return true; // 刷新成功
    }
    
    // 更新任务进度
    updateTaskProgress(type, amount) {
        let completedTasks = [];
        
        this.tasks.forEach(task => {
            if (task.type === type && !task.completed) {
                const isCompleted = task.updateProgress(amount);
                if (isCompleted) {
                    completedTasks.push(task);
                    this.stats.todayCompleted++;
                    this.stats.totalCompleted++;
                    
                    // 发放奖励
                    this.giveReward(task);
                }
            }
        });
        
        // 保存数据
        this.saveData();
        
        return completedTasks;
    }
    
    // 发放奖励
    giveReward(task) {
        // 这里可以根据任务类型发放不同的奖励
        // 目前只实现分数奖励
        if (task.reward.includes('分')) {
            const scoreReward = parseInt(task.reward);
            score += scoreReward;
        }
        
        // 显示任务完成提示
        this.showTaskCompleteNotification(task);
    }
    
    // 显示任务列表
    showTaskList() {
        // 创建任务列表界面
        const taskListContainer = document.createElement('div');
        taskListContainer.className = 'task-list-container';
        taskListContainer.innerHTML = `
            <div class='task-list-header'>
                <h2>日常任务</h2>
                <button class='close-btn' onclick='window.dailyTaskManager.closeTaskList()'>×</button>
            </div>
            <div class='task-list-content'>
                <div class='task-list-stats'>
                    <p>今日完成: ${this.stats.todayCompleted} / 3</p>
                    <p>总共完成: ${this.stats.totalCompleted}</p>
                </div>
                <div class='task-list'>
                    ${this.tasks.map(task => `
                        <div class='task-item ${task.completed ? 'completed' : ''}'>
                            <div class='task-info'>
                                <h3>${task.name}</h3>
                                <p>${this.getTaskTypeLabel(task.type)}: ${task.progress} / ${task.target}</p>
                                <p>奖励: ${task.reward}</p>
                            </div>
                            <div class='task-status'>
                                ${task.completed ? '✓ 已完成' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class='task-list-actions'>
                    <button class='refresh-btn' onclick='window.dailyTaskManager.refreshTasks()'>
                        刷新任务 (${this.dailyRefreshCount} / ${this.maxDailyRefresh})
                    </button>
                </div>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(taskListContainer);

        // 显示动画
        setTimeout(() => {
            taskListContainer.classList.add('show');
        }, 10);
    }

    // 关闭任务列表
    closeTaskList() {
        const taskListContainer = document.querySelector('.task-list-container');
        if (taskListContainer) {
            taskListContainer.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(taskListContainer);
            }, 300);
        }
    }

    // 获取任务类型标签
    getTaskTypeLabel(type) {
        switch (type) {
            case TaskTypes.SCORE:
                return '分数';
            case TaskTypes.CLEAR:
                return '消除数量';
            case TaskTypes.COMBO:
                return '连击次数';
            case TaskTypes.TIME:
                return '游戏时长';
            case TaskTypes.GAMES:
                return '游戏局数';
            default:
                return '未知类型';
        }
    }

    // 显示任务完成提示
    showTaskCompleteNotification(task) {
        // 创建提示元素
        const notification = document.createElement('div');
        notification.className = 'task-complete-notification';
        notification.innerHTML = `
            <h3>${task.name}</h3>
            <p>任务完成！</p>
            <p>奖励：${task.reward}</p>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 获取下次重置时间
    getNextResetTime() {
        const now = new Date();
        const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        return nextReset;
    }
    
    // 获取任务完成统计
    getTaskStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const allCompleted = completedTasks >= totalTasks;
        
        return {
            total: totalTasks,
            completed: completedTasks,
            allCompleted: allCompleted
        };
    }
}

// 初始化日常任务管理器
window.dailyTaskManager = new DailyTaskManager();

// 任务完成提示的CSS样式
const taskNotificationStyles = `
    .task-complete-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: rgba(255, 255, 255, 0.95);
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        z-index: 1000;
        transition: transform 0.3s ease;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    }
    
    .task-complete-notification.show {
        transform: translate(-50%, -50%) scale(1);
    }
    
    .task-complete-notification h3 {
        color: #2c3e50;
        margin: 0 0 10px 0;
        font-size: 20px;
    }
    
    .task-complete-notification p {
        color: #34495e;
        margin: 5px 0;
        font-size: 16px;
    }
`;

// 任务列表界面的CSS样式
const taskListStyles = `
    .task-list-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .task-list-container.show {
        opacity: 1;
    }

    .task-list-container .task-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .task-list-container .task-list-header h2 {
        color: #2c3e50;
        margin: 0;
        font-size: 24px;
    }

    .task-list-container .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #2c3e50;
        padding: 0 10px;
    }

    .task-list-container .task-list-content {
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    }

    .task-list-container .task-list-stats {
        margin-bottom: 20px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
    }

    .task-list-container .task-list-stats p {
        color: #2c3e50;
        margin: 5px 0;
        font-size: 14px;
    }

    .task-list-container .task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border: 1px solid #e9ecef;
        border-radius: 5px;
        margin-bottom: 10px;
        transition: background 0.3s ease;
    }

    .task-list-container .task-item:hover {
        background: #f8f9fa;
    }

    .task-list-container .task-item.completed {
        background: #d4edda;
        border-color: #c3e6cb;
    }

    .task-list-container .task-info h3 {
        color: #2c3e50;
        margin: 0 0 5px 0;
        font-size: 16px;
    }

    .task-list-container .task-info p {
        color: #34495e;
        margin: 5px 0;
        font-size: 14px;
    }

    .task-list-container .task-status {
        color: #28a745;
        font-weight: bold;
        font-size: 14px;
    }

    .task-list-container .task-list-actions {
        margin-top: 20px;
        text-align: center;
    }

    .task-list-container .refresh-btn {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s ease;
    }

    .task-list-container .refresh-btn:hover {
        background: #0056b3;
    }
`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = taskNotificationStyles + taskListStyles;
document.head.appendChild(styleSheet);