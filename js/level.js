// 关卡模式相关逻辑

// 关卡数据结构
var levels = [];
for (var i = 1; i <= 30; i++) {
    levels.push({
        id: i,
        targetScore: i * 100,
        speedModifier: 0.65 + (i - 1) * 0.02, // 难度递增
        creationSpeedModifier: 0.65 + (i - 1) * 0.02
    });
}

// 关卡进度数据
var levelProgress = {
    currentLevel: 1,
    completedLevels: [],
    levelScores: {}, // 每个关卡的最高分
    levelState: {} // 关卡状态：未开始/已完成/已失败
};

// 关卡模式状态
var levelMode = {
    active: false,
    currentLevelData: null,
    targetScore: 0
};

// 初始化关卡进度
function initLevelProgress() {
    var savedProgress = localStorage.getItem('levelProgress');
    if (savedProgress) {
        levelProgress = JSON.parse(savedProgress);
    } else {
        // 初始化前5个关卡为未开始状态
        for (var i = 1; i <= 5; i++) {
            levelProgress.levelState[i] = 'not_started';
        }
        // 保存初始进度
        saveLevelProgress();
    }
}

// 保存关卡进度
function saveLevelProgress() {
    localStorage.setItem('levelProgress', JSON.stringify(levelProgress));
}

// 进入关卡模式
function enterLevelMode() {
    levelMode.active = true;
    showLevelSelect();
}

// 显示关卡选择界面
function showLevelSelect() {
    // 这里需要实现关卡选择界面的HTML和CSS
    // 暂时用alert代替
    alert('关卡选择界面');
}

// 开始指定关卡
function startLevel(levelId) {
    if (!isLevelUnlocked(levelId)) {
        alert('该关卡未解锁');
        return;
    }
    
    levelProgress.currentLevel = levelId;
    levelMode.currentLevelData = levels[levelId - 1];
    levelMode.targetScore = levelMode.currentLevelData.targetScore;
    
    // 设置关卡难度
    settings.speedModifier = levelMode.currentLevelData.speedModifier;
    settings.creationSpeedModifier = levelMode.currentLevelData.creationSpeedModifier;
    
    // 初始化游戏
    init();
}

// 检查关卡是否解锁
function isLevelUnlocked(levelId) {
    if (levelId <= 5) return true; // 前5个关卡默认解锁
    return levelProgress.completedLevels.indexOf(levelId - 1) !== -1;
}

// 检查是否达到关卡目标分数
function checkLevelComplete() {
    if (!levelMode.active) return;
    
    if (score >= levelMode.targetScore) {
        // 关卡完成
        gameState = 2;
        showLevelComplete();
        
        // 更新关卡进度
        if (levelProgress.completedLevels.indexOf(levelProgress.currentLevel) === -1) {
            levelProgress.completedLevels.push(levelProgress.currentLevel);
        }
        
        // 更新关卡最高分
        if (!levelProgress.levelScores[levelProgress.currentLevel] || 
            score > levelProgress.levelScores[levelProgress.currentLevel]) {
            levelProgress.levelScores[levelProgress.currentLevel] = score;
        }
        
        levelProgress.levelState[levelProgress.currentLevel] = 'completed';
        saveLevelProgress();
        
        // 5秒后自动进入下一关
        setTimeout(function() {
            var nextLevel = levelProgress.currentLevel + 1;
            if (nextLevel <= 30) {
                startLevel(nextLevel);
            } else {
                // 所有关卡完成
                alert('恭喜你完成了所有关卡！');
                exitLevelMode();
            }
        }, 5000);
    }
}

// 显示关卡完成提示
function showLevelComplete() {
    alert('关卡完成！');
}

// 关卡失败
function levelFailed() {
    if (!levelMode.active) return;
    
    // 更新关卡状态为已失败
    levelProgress.levelState[levelProgress.currentLevel] = 'failed';
    saveLevelProgress();
    
    // 显示关卡失败提示
    alert('关卡失败');
    
    // 这里需要实现关卡失败后的界面，允许重新挑战或返回关卡选择
}

// 退出关卡模式
function exitLevelMode() {
    levelMode.active = false;
    levelMode.currentLevelData = null;
    levelMode.targetScore = 0;
    
    // 恢复默认难度
    settings.speedModifier = 0.65;
    settings.creationSpeedModifier = 0.65;
}

// 关卡模式暂停菜单
function showLevelPauseMenu() {
    // 这里需要实现关卡模式的暂停菜单，包含继续游戏、重新开始本关、返回关卡选择三个选项
    alert('关卡模式暂停菜单');
}

// 初始化关卡模式
initLevelProgress();