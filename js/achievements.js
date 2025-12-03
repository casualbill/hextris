// 成就系统

// 成就数据结构
var achievements = [
    { id: 'beginner', name: '初出茅庐', description: '单局分数达到100分', condition: (data) => data.currentScore >= 100, progress: (data) => Math.min(data.currentScore / 100, 1) },
    { id: 'accurate', name: '百发百中', description: '单局分数达到500分', condition: (data) => data.currentScore >= 500, progress: (data) => Math.min(data.currentScore / 500, 1) },
    { id: 'thousand', name: '千分达人', description: '单局分数达到1000分', condition: (data) => data.currentScore >= 1000, progress: (data) => Math.min(data.currentScore / 1000, 1) },
    { id: 'combo_newbie', name: '连击新手', description: '单次连击达到3次', condition: (data) => data.currentCombo >= 3, progress: (data) => Math.min(data.currentCombo / 3, 1) },
    { id: 'combo_master', name: '连击大师', description: '单次连击达到10次', condition: (data) => data.currentCombo >= 10, progress: (data) => Math.min(data.currentCombo / 10, 1) },
    { id: 'endurance', name: '持久战', description: '单局游戏时长达到5分钟', condition: (data) => data.gameTime >= 300, progress: (data) => Math.min(data.gameTime / 300, 1) },
    { id: 'clear_expert', name: '消除专家', description: '单局消除方块总数达到100个', condition: (data) => data.blocksCleared >= 100, progress: (data) => Math.min(data.blocksCleared / 100, 1) },
    { id: 'perfect_start', name: '完美开局', description: '游戏开始后前60秒内未失败', condition: (data) => data.gameTime >= 60, progress: (data) => Math.min(data.gameTime / 60, 1) },
    { id: 'extreme', name: '极限挑战', description: '单局分数达到5000分', condition: (data) => data.currentScore >= 5000, progress: (data) => Math.min(data.currentScore / 5000, 1) },
    { id: 'never_give_up', name: '永不放弃', description: '累计游戏局数达到50局', condition: (data) => data.totalGames >= 50, progress: (data) => Math.min(data.totalGames / 50, 1) },
    { id: 'legend', name: '万分传奇', description: '单局分数达到10000分', condition: (data) => data.currentScore >= 10000, progress: (data) => Math.min(data.currentScore / 10000, 1) },
    { id: 'combo_king', name: '连击之王', description: '单次连击达到20次', condition: (data) => data.currentCombo >= 20, progress: (data) => Math.min(data.currentCombo / 20, 1) },
    { id: 'marathon', name: '马拉松', description: '单局游戏时长达到15分钟', condition: (data) => data.gameTime >= 900, progress: (data) => Math.min(data.gameTime / 900, 1) },
    { id: 'clear_maniac', name: '消除狂人', description: '单局消除方块总数达到500个', condition: (data) => data.blocksCleared >= 500, progress: (data) => Math.min(data.blocksCleared / 500, 1) },
    { id: 'zero_mistake', name: '零失误', description: '单局游戏前1分钟内未失败', condition: (data) => data.gameTime >= 60, progress: (data) => Math.min(data.gameTime / 60, 1) },
    { id: 'hundred_games', name: '百局玩家', description: '累计游戏局数达到100局', condition: (data) => data.totalGames >= 100, progress: (data) => Math.min(data.totalGames / 100, 1) },
    { id: 'speed_king', name: '速度之王', description: '在难度达到30时存活超过1分钟', condition: (data) => data.difficulty >= 30 && data.gameTime >= 60, progress: (data) => { 
        const difficultyProgress = Math.min(data.difficulty / 30, 1); 
        const timeProgress = Math.min(data.gameTime / 60, 1); 
        return Math.min(difficultyProgress + timeProgress, 1); 
    } },
    { id: 'perfect_combo', name: '完美连击', description: '连续3次消除都达到5个或以上方块', condition: (data) => data.perfectComboStreak >= 3, progress: (data) => Math.min(data.perfectComboStreak / 3, 1) },
    { id: 'color_master', name: '颜色大师', description: '单局消除包含所有颜色的方块各至少10个', condition: (data) => data.colorsCleared.red >= 10 && data.colorsCleared.yellow >= 10 && data.colorsCleared.blue >= 10 && data.colorsCleared.green >= 10, progress: (data) => { 
        const redProgress = Math.min(data.colorsCleared.red / 10, 1); 
        const yellowProgress = Math.min(data.colorsCleared.yellow / 10, 1); 
        const blueProgress = Math.min(data.colorsCleared.blue / 10, 1); 
        const greenProgress = Math.min(data.colorsCleared.green / 10, 1); 
        return Math.min(redProgress + yellowProgress + blueProgress + greenProgress, 1) / 4; 
    } },
    { id: 'ultimate', name: '终极挑战', description: '单局分数达到20000分', condition: (data) => data.currentScore >= 20000, progress: (data) => Math.min(data.currentScore / 20000, 1) }
];

// 玩家数据
var playerData = {
    currentScore: 0,
    currentCombo: 0,
    gameTime: 0,
    blocksCleared: 0,
    totalGames: 0,
    difficulty: 0,
    perfectComboStreak: 0,
    colorsCleared: {
        red: 0,
        yellow: 0,
        blue: 0,
        green: 0
    }
};

// 已解锁的成就
var unlockedAchievements = [];

// 初始化成就系统
function initAchievements() {
    // 从本地存储加载已解锁的成就
    if (localStorage.getItem('unlockedAchievements')) {
        unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements'));
    }
    
    // 从本地存储加载玩家数据
    if (localStorage.getItem('playerData')) {
        var savedData = JSON.parse(localStorage.getItem('playerData'));
        playerData.totalGames = savedData.totalGames || 0;
    }
    
    // 创建成就列表界面
    createAchievementsUI();
}

// 创建成就列表界面
function createAchievementsUI() {
    // 创建成就按钮
    var achievementsBtn = $('<button id="achievementsBtn" class="menuBtn">成就</button>');
    achievementsBtn.on('click', showAchievementsScreen);
    $('#buttonCont').append(achievementsBtn);
    
    // 创建成就界面
    var achievementsScreen = $('<div id="achievementsScreen" class="overlay"></div>');
    var achievementsContent = $('<div class="achievementsContent"></div>');
    
    // 创建筛选选项
    var filterContainer = $('<div class="filterContainer"></div>');
    var allFilter = $('<button class="filterBtn active">全部</button>');
    var unlockedFilter = $('<button class="filterBtn">已解锁</button>');
    var lockedFilter = $('<button class="filterBtn">未解锁</button>');
    
    allFilter.on('click', function() { filterAchievements('all'); });
    unlockedFilter.on('click', function() { filterAchievements('unlocked'); });
    lockedFilter.on('click', function() { filterAchievements('locked'); });
    
    filterContainer.append(allFilter);
    filterContainer.append(unlockedFilter);
    filterContainer.append(lockedFilter);
    
    // 创建成就列表
    var achievementsList = $('<div class="achievementsList"></div>');
    
    // 添加返回按钮
    var backBtn = $('<button id="backToMenuBtn" class="menuBtn">返回</button>');
    backBtn.on('click', hideAchievementsScreen);
    
    achievementsContent.append(filterContainer);
    achievementsContent.append(achievementsList);
    achievementsContent.append(backBtn);
    achievementsScreen.append(achievementsContent);
    
    $('body').append(achievementsScreen);
    
    // 初始化成就列表
    updateAchievementsList();
}

// 显示成就界面
function showAchievementsScreen() {
    $('#achievementsScreen').fadeIn();
}

// 隐藏成就界面
function hideAchievementsScreen() {
    $('#achievementsScreen').fadeOut();
}

// 筛选成就
function filterAchievements(filter) {
    // 更新筛选按钮状态
    $('.filterBtn').removeClass('active');
    $(this).addClass('active');
    
    // 更新成就列表
    updateAchievementsList(filter);
}

// 更新成就列表
function updateAchievementsList(filter) {
    var achievementsList = $('.achievementsList');
    achievementsList.empty();
    
    achievements.forEach(function(achievement) {
        var isUnlocked = unlockedAchievements.indexOf(achievement.id) !== -1;
        
        // 根据筛选条件显示成就
        if (filter) {
            if (filter === 'unlocked' && !isUnlocked) return;
            if (filter === 'locked' && isUnlocked) return;
        }
        
        // 创建成就项
        var achievementItem = $('<div class="achievementItem ' + (isUnlocked ? 'unlocked' : 'locked') + '"></div>');
        
        // 成就图标
        var icon = $('<div class="achievementIcon"></div>');
        achievementItem.append(icon);
        
        // 成就信息
        var info = $('<div class="achievementInfo"></div>');
        var name = $('<div class="achievementName">' + achievement.name + '</div>');
        var description = $('<div class="achievementDescription">' + achievement.description + '</div>');
        var progress = $('<div class="achievementProgress"></div>');
        
        // 进度条
        var progressBar = $('<div class="progressBar"></div>');
        var progressFill = $('<div class="progressFill"></div>');
        var progressText = $('<div class="progressText"></div>');
        
        if (isUnlocked) {
            progressFill.css('width', '100%');
            progressText.text('已解锁');
        } else {
            var progressValue = achievement.progress(playerData);
            progressFill.css('width', progressValue * 100 + '%');
            progressText.text(Math.round(progressValue * 100) + '%');
        }
        
        progressBar.append(progressFill);
        progress.append(progressBar);
        progress.append(progressText);
        
        info.append(name);
        info.append(description);
        info.append(progress);
        
        achievementItem.append(info);
        achievementsList.append(achievementItem);
    });
}

// 更新玩家数据
function updatePlayerData(data) {
    // 更新当前游戏数据
    if (data.currentScore !== undefined) playerData.currentScore = data.currentScore;
    if (data.currentCombo !== undefined) playerData.currentCombo = data.currentCombo;
    if (data.gameTime !== undefined) playerData.gameTime = data.gameTime;
    if (data.blocksCleared !== undefined) playerData.blocksCleared = data.blocksCleared;
    if (data.difficulty !== undefined) playerData.difficulty = data.difficulty;
    if (data.perfectComboStreak !== undefined) playerData.perfectComboStreak = data.perfectComboStreak;
    if (data.colorsCleared !== undefined) {
        Object.assign(playerData.colorsCleared, data.colorsCleared);
    }
    
    // 检查成就解锁
    checkAchievements();
}

// 检查成就解锁
function checkAchievements() {
    var newlyUnlocked = [];
    
    achievements.forEach(function(achievement) {
        if (unlockedAchievements.indexOf(achievement.id) === -1) {
            if (achievement.condition(playerData)) {
                // 解锁成就
                unlockedAchievements.push(achievement.id);
                newlyUnlocked.push(achievement);
                
                // 保存到本地存储
                localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
            }
        }
    });
    
    // 如果有新解锁的成就，显示提示
    if (newlyUnlocked.length > 0) {
        showAchievementUnlockNotification(newlyUnlocked);
    }
}

// 显示成就解锁提示
function showAchievementUnlockNotification(achievements) {
    var notificationContainer = $('<div id="achievementNotification" class="notification"></div>');
    
    achievements.forEach(function(achievement) {
        var notification = $('<div class="achievementNotificationItem"></div>');
        var icon = $('<div class="notificationIcon"></div>');
        var content = $('<div class="notificationContent"></div>');
        var title = $('<div class="notificationTitle">成就解锁！</div>');
        var name = $('<div class="notificationName">' + achievement.name + '</div>');
        
        content.append(title);
        content.append(name);
        notification.append(icon);
        notification.append(content);
        notificationContainer.append(notification);
    });
    
    $('body').append(notificationContainer);
    notificationContainer.fadeIn();
    
    // 3秒后自动消失
    setTimeout(function() {
        notificationContainer.fadeOut(function() {
            notificationContainer.remove();
        });
    }, 3000);
}

// 游戏结束时更新玩家数据
function updatePlayerDataOnGameEnd() {
    // 增加累计游戏局数
    playerData.totalGames++;
    
    // 保存玩家数据到本地存储
    localStorage.setItem('playerData', JSON.stringify({
        totalGames: playerData.totalGames
    }));
    
    // 重置当前游戏数据
    resetCurrentGameData();
}

// 重置当前游戏数据
function resetCurrentGameData() {
    playerData.currentScore = 0;
    playerData.currentCombo = 0;
    playerData.gameTime = 0;
    playerData.blocksCleared = 0;
    playerData.difficulty = 0;
    playerData.perfectComboStreak = 0;
    playerData.colorsCleared = {
        red: 0,
        yellow: 0,
        blue: 0,
        green: 0
    };
}

// 获取已解锁的成就数量
function getUnlockedAchievementsCount() {
    return unlockedAchievements.length;
}

// 获取总成就数量
function getTotalAchievementsCount() {
    return achievements.length;
}

// 导出成就数据
function exportAchievementsData() {
    return {
        unlockedAchievements: unlockedAchievements,
        playerData: playerData
    };
}

// 导入成就数据
function importAchievementsData(data) {
    if (data.unlockedAchievements) {
        unlockedAchievements = data.unlockedAchievements;
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    }
    
    if (data.playerData) {
        playerData = Object.assign(playerData, data.playerData);
        localStorage.setItem('playerData', JSON.stringify({
            totalGames: playerData.totalGames
        }));
    }
    
    // 更新成就列表
    updateAchievementsList();
}

// 初始化成就系统
initAchievements();