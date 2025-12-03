// 成就系统数据
const achievements = [
    { id: 1, name: "初出茅庐", description: "单局分数达到100分", unlocked: false, progress: 0, maxProgress: 100, icon: "⭐" },
    { id: 2, name: "百发百中", description: "单局分数达到500分", unlocked: false, progress: 0, maxProgress: 500, icon: "🎯" },
    { id: 3, name: "千分达人", description: "单局分数达到1000分", unlocked: false, progress: 0, maxProgress: 1000, icon: "🏆" },
    { id: 4, name: "连击新手", description: "单次连击达到3次", unlocked: false, progress: 0, maxProgress: 3, icon: "⚡" },
    { id: 5, name: "连击大师", description: "单次连击达到10次", unlocked: false, progress: 0, maxProgress: 10, icon: "🔥" },
    { id: 6, name: "持久战", description: "单局游戏时长达到5分钟", unlocked: false, progress: 0, maxProgress: 300, icon: "⏱️" },
    { id: 7, name: "消除专家", description: "单局消除方块总数达到100个", unlocked: false, progress: 0, maxProgress: 100, icon: "🧩" },
    { id: 8, name: "完美开局", description: "游戏开始后前60秒内未失败", unlocked: false, progress: 0, maxProgress: 60, icon: "✨" },
    { id: 9, name: "极限挑战", description: "单局分数达到5000分", unlocked: false, progress: 0, maxProgress: 5000, icon: "🏔️" },
    { id: 10, name: "永不放弃", description: "累计游戏局数达到50局", unlocked: false, progress: 0, maxProgress: 50, icon: "💪" },
    { id: 11, name: "万分传奇", description: "单局分数达到10000分", unlocked: false, progress: 0, maxProgress: 10000, icon: "👑" },
    { id: 12, name: "连击之王", description: "单次连击达到20次", unlocked: false, progress: 0, maxProgress: 20, icon: "💥" },
    { id: 13, name: "马拉松", description: "单局游戏时长达到15分钟", unlocked: false, progress: 0, maxProgress: 900, icon: "🏃" },
    { id: 14, name: "消除狂人", description: "单局消除方块总数达到500个", unlocked: false, progress: 0, maxProgress: 500, icon: "🤪" },
    { id: 15, name: "零失误", description: "单局游戏前1分钟内未失败", unlocked: false, progress: 0, maxProgress: 60, icon: "🎖️" },
    { id: 16, name: "百局玩家", description: "累计游戏局数达到100局", unlocked: false, progress: 0, maxProgress: 100, icon: "🎮" },
    { id: 17, name: "速度之王", description: "在难度达到30时存活超过1分钟", unlocked: false, progress: 0, maxProgress: 60, icon: "🚀" },
    { id: 18, name: "完美连击", description: "连续3次消除都达到5个或以上方块", unlocked: false, progress: 0, maxProgress: 3, icon: "💎" },
    { id: 19, name: "颜色大师", description: "单局消除包含所有颜色的方块各至少10个", unlocked: false, progress: 0, maxProgress: 60, icon: "🎨" },
    { id: 20, name: "终极挑战", description: "单局分数达到20000分", unlocked: false, progress: 0, maxProgress: 20000, icon: "🏆" }
];

// 玩家统计数据
let playerStats = {
    totalGames: 0,
    highScore: 0,
    maxCombo: 0,
    maxDuration: 0,
    maxBlocksDestroyed: 0
};

// 单局游戏统计
let sessionStats = {
    score: 0,
    currentCombo: 0,
    maxSessionCombo: 0,
    blocksDestroyed: 0,
    startTime: 0,
    duration: 0,
    colorCounts: { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, cyan: 0 },
    streak5: 0,
    difficultyReached30: false,
    difficulty30SurvivalTime: 0
};

let unlockedThisSession = [];

// 初始化成就系统
function initAchievements() {
    loadAchievements();
    loadPlayerStats();
}

// 加载成就数据
function loadAchievements() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
        try {
            const savedAchievements = JSON.parse(saved);
            // 确保保存的是数组格式
            if (Array.isArray(savedAchievements)) {
                savedAchievements.forEach(ach => {
                    const index = achievements.findIndex(a => a.id === ach.id);
                    if (index !== -1) {
                        achievements[index].unlocked = ach.unlocked;
                        achievements[index].progress = ach.progress;
                    }
                });
            } else {
                // 如果格式不正确，重置成就数据
                console.warn('成就数据格式不正确，已重置');
                saveAchievements();
            }
        } catch (e) {
            // 解析失败时重置
            console.warn('成就数据解析失败，已重置');
            saveAchievements();
        }
    }
}

// 保存成就数据
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

// 加载玩家统计数据
function loadPlayerStats() {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
        playerStats = JSON.parse(saved);
    }
}

// 保存玩家统计数据
function savePlayerStats() {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
}

// 初始化单局统计
function initSessionStats() {
    sessionStats = {
        score: 0,
        currentCombo: 0,
        maxSessionCombo: 0,
        blocksDestroyed: 0,
        startTime: Date.now(),
        duration: 0,
        colorCounts: { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, cyan: 0 },
        streak5: 0,
        difficultyReached30: false,
        difficulty30SurvivalTime: 0
    };
    unlockedThisSession = [];
}

// 更新单局分数
function updateSessionScore(newScore) {
    sessionStats.score = newScore;
    
    // 更新成就进度
    updateAchievementProgress(1, Math.min(newScore, 100));
    updateAchievementProgress(2, Math.min(newScore, 500));
    updateAchievementProgress(3, Math.min(newScore, 1000));
    updateAchievementProgress(9, Math.min(newScore, 5000));
    updateAchievementProgress(11, Math.min(newScore, 10000));
    updateAchievementProgress(20, Math.min(newScore, 20000));
}

// 更新连击数
function updateCombo(comboMultiplier) {
    sessionStats.currentCombo = comboMultiplier;
    sessionStats.maxSessionCombo = Math.max(sessionStats.maxSessionCombo, comboMultiplier);
    
    updateAchievementProgress(4, Math.min(comboMultiplier, 3));
    updateAchievementProgress(5, Math.min(comboMultiplier, 10));
    updateAchievementProgress(12, Math.min(comboMultiplier, 20));
}

// 更新消除方块数
function updateBlocksDestroyed(count, color) {
    sessionStats.blocksDestroyed += count;
    
    // 更新颜色计数
    const colorName = getColorName(color);
    if (colorName && sessionStats.colorCounts[colorName] !== undefined) {
        sessionStats.colorCounts[colorName] += count;
    }
    
    // 更新完美连击
    if (count >=5) {
        sessionStats.streak5 = Math.min(sessionStats.streak5 +1, 3);
    } else {
        sessionStats.streak5 = 0;
    }
    
    updateAchievementProgress(7, Math.min(sessionStats.blocksDestroyed, 100));
    updateAchievementProgress(14, Math.min(sessionStats.blocksDestroyed, 500));
    updateAchievementProgress(18, sessionStats.streak5);
    
    // 更新颜色大师成就
    const colorProgress = Object.values(sessionStats.colorCounts).reduce((total, val) => total + Math.min(val, 10), 0);
    updateAchievementProgress(19, colorProgress);
}

// 更新游戏时长
function updateSessionDuration() {
    if (sessionStats.startTime === 0) return;
    
    sessionStats.duration = Math.floor((Date.now() - sessionStats.startTime) / 1000);
    
    updateAchievementProgress(6, Math.min(sessionStats.duration, 300));
    updateAchievementProgress(8, Math.min(sessionStats.duration, 60));
    updateAchievementProgress(13, Math.min(sessionStats.duration, 900));
    updateAchievementProgress(15, Math.min(sessionStats.duration, 60));
    
    // 更新速度之王成就
    if (sessionStats.difficultyReached30) {
        sessionStats.difficulty30SurvivalTime = Math.min(sessionStats.duration - sessionStats.difficulty30StartTime, 60);
        updateAchievementProgress(17, sessionStats.difficulty30SurvivalTime);
    }
}

// 更新难度达到30
function updateDifficultyReached30() {
    if (!sessionStats.difficultyReached30) {
        sessionStats.difficultyReached30 = true;
        sessionStats.difficulty30StartTime = Math.floor((Date.now() - sessionStats.startTime) / 1000);
    }
}

// 更新成就进度
function updateAchievementProgress(id, progress) {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;
    
    achievement.progress = Math.max(achievement.progress, progress);
    
    if (achievement.progress >= achievement.maxProgress) {
        unlockAchievement(id);
    }
}

// 解锁成就
function unlockAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    unlockedThisSession.push(achievement);
    saveAchievements();
    showAchievementNotification(achievement);
}

// 游戏结束时更新统计数据
function onGameEnd() {
    playerStats.totalGames += 1;
    playerStats.highScore = Math.max(playerStats.highScore, sessionStats.score);
    playerStats.maxCombo = Math.max(playerStats.maxCombo, sessionStats.maxSessionCombo);
    playerStats.maxDuration = Math.max(playerStats.maxDuration, sessionStats.duration);
    playerStats.maxBlocksDestroyed = Math.max(playerStats.maxBlocksDestroyed, sessionStats.blocksDestroyed);
    
    // 更新累计游戏局数成就
    updateAchievementProgress(10, Math.min(playerStats.totalGames, 50));
    updateAchievementProgress(16, Math.min(playerStats.totalGames, 100));
    
    savePlayerStats();
    saveAchievements();
}

// 获取颜色名称
function getColorName(color) {
    const colorMap = {
        '#ff3b30': 'red',
        '#007aff': 'blue',
        '#4cd964': 'green',
        '#ffcc00': 'yellow',
        '#af52de': 'purple',
        '#5ac8fa': 'cyan'
    };
    return colorMap[color] || null;
}

// 显示成就解锁通知
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.id = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">成就解锁！</div>
            <div class="achievement-name">${achievement.name}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
}

// 获取解锁的成就数量
function getUnlockedCount() {
    return achievements.filter(a => a.unlocked).length;
}

// 筛选成就
function filterAchievements(filter) {
    switch(filter) {
        case 'unlocked':
            return achievements.filter(a => a.unlocked);
        case 'locked':
            return achievements.filter(a => !a.unlocked);
        default:
            return achievements;
    }
}

// 获取本局解锁的成就
function getUnlockedThisSession() {
    return unlockedThisSession;
}