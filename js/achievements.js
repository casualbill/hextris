// 成就系统模块

// 定义所有成就
const achievements = [
    {
        id: 1,
        name: "初出茅庐",
        description: "单局分数达到100分",
        condition: (gameStats) => gameStats.score >= 100,
        unlocked: false,
        progress: 0,
        icon: "fa-star"
    },
    {
        id: 2,
        name: "百发百中",
        description: "单局分数达到500分",
        condition: (gameStats) => gameStats.score >= 500,
        unlocked: false,
        progress: 0,
        icon: "fa-target"
    },
    {
        id: 3,
        name: "千分达人",
        description: "单局分数达到1000分",
        condition: (gameStats) => gameStats.score >= 1000,
        unlocked: false,
        progress: 0,
        icon: "fa-trophy"
    },
    {
        id: 4,
        name: "连击新手",
        description: "单次连击达到3次",
        condition: (gameStats) => gameStats.maxCombo >= 3,
        unlocked: false,
        progress: 0,
        icon: "fa-fire"
    },
    {
        id: 5,
        name: "连击大师",
        description: "单次连击达到10次",
        condition: (gameStats) => gameStats.maxCombo >= 10,
        unlocked: false,
        progress: 0,
        icon: "fa-fire-alt"
    },
    {
        id: 6,
        name: "持久战",
        description: "单局游戏时长达到5分钟",
        condition: (gameStats) => gameStats.gameTime >= 5 * 60 * 1000,
        unlocked: false,
        progress: 0,
        icon: "fa-clock"
    },
    {
        id: 7,
        name: "消除专家",
        description: "单局消除方块总数达到100个",
        condition: (gameStats) => gameStats.totalBlocksCleared >= 100,
        unlocked: false,
        progress: 0,
        icon: "fa-bomb"
    },
    {
        id: 8,
        name: "完美开局",
        description: "游戏开始后前60秒内未失败",
        condition: (gameStats) => gameStats.gameTime >= 60 * 1000,
        unlocked: false,
        progress: 0,
        icon: "fa-rocket"
    },
    {
        id: 9,
        name: "极限挑战",
        description: "单局分数达到5000分",
        condition: (gameStats) => gameStats.score >= 5000,
        unlocked: false,
        progress: 0,
        icon: "fa-bolt"
    },
    {
        id: 10,
        name: "永不放弃",
        description: "累计游戏局数达到50局",
        condition: (globalStats) => globalStats.totalGames >= 50,
        unlocked: false,
        progress: 0,
        icon: "fa-heart",
        isGlobal: true
    },
    {
        id: 11,
        name: "万分传奇",
        description: "单局分数达到10000分",
        condition: (gameStats) => gameStats.score >= 10000,
        unlocked: false,
        progress: 0,
        icon: "fa-crown"
    },
    {
        id: 12,
        name: "连击之王",
        description: "单次连击达到20次",
        condition: (gameStats) => gameStats.maxCombo >= 20,
        unlocked: false,
        progress: 0,
        icon: "fa-fire-extinguisher"
    },
    {
        id: 13,
        name: "马拉松",
        description: "单局游戏时长达到15分钟",
        condition: (gameStats) => gameStats.gameTime >= 15 * 60 * 1000,
        unlocked: false,
        progress: 0,
        icon: "fa-running"
    },
    {
        id: 14,
        name: "消除狂人",
        description: "单局消除方块总数达到500个",
        condition: (gameStats) => gameStats.totalBlocksCleared >= 500,
        unlocked: false,
        progress: 0,
        icon: "fa-skull"
    },
    {
        id: 15,
        name: "零失误",
        description: "单局游戏前1分钟内未失败",
        condition: (gameStats) => gameStats.gameTime >= 60 * 1000,
        unlocked: false,
        progress: 0,
        icon: "fa-shield-alt"
    },
    {
        id: 16,
        name: "百局玩家",
        description: "累计游戏局数达到100局",
        condition: (globalStats) => globalStats.totalGames >= 100,
        unlocked: false,
        progress: 0,
        icon: "fa-gamepad",
        isGlobal: true
    },
    {
        id: 17,
        name: "速度之王",
        description: "在难度达到30时存活超过1分钟",
        condition: (gameStats) => gameStats.difficulty >= 30 && gameStats.gameTime >= 60 * 1000,
        unlocked: false,
        progress: 0,
        icon: "fa-tachometer-alt"
    },
    {
        id: 18,
        name: "完美连击",
        description: "连续3次消除都达到5个或以上方块",
        condition: (gameStats) => gameStats.streak >= 3,
        unlocked: false,
        progress: 0,
        icon: "fa-gem"
    },
    {
        id: 19,
        name: "颜色大师",
        description: "单局消除包含所有颜色的方块各至少10个",
        condition: (gameStats) => {
            const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71'];
            return colors.every(color => gameStats.colorCounts[color] >= 10);
        },
        unlocked: false,
        progress: 0,
        icon: "fa-palette"
    },
    {
        id: 20,
        name: "终极挑战",
        description: "单局分数达到20000分",
        condition: (gameStats) => gameStats.score >= 20000,
        unlocked: false,
        progress: 0,
        icon: "fa-medal"
    }
];

// 游戏统计数据
let gameStats = {
    score: 0,
    maxCombo: 0,
    gameTime: 0,
    totalBlocksCleared: 0,
    difficulty: 0,
    streak: 0,
    colorCounts: {
        '#f1c40f': 0,
        '#e74c3c': 0,
        '#3498db': 0,
        '#2ecc71': 0
    }
};

// 全局统计数据
let globalStats = {
    totalGames: 0,
    allTimeHighScore: 0,
    maxCombo: 0,
    longestGameTime: 0
};

// 成就系统初始化
function initAchievements() {
    loadAchievements();
    loadGlobalStats();
    createAchievementsUI();
    attachAchievementsEvents();
}

// 加载成就数据
function loadAchievements() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
        try {
            const savedAchievements = JSON.parse(saved);
            // 确保savedAchievements是数组类型
            if (Array.isArray(savedAchievements)) {
                achievements.forEach(achievement => {
                    const savedAchievement = savedAchievements.find(a => a.id === achievement.id);
                    if (savedAchievement) {
                        achievement.unlocked = savedAchievement.unlocked;
                        achievement.progress = savedAchievement.progress;
                    }
                });
            } else {
                console.warn('本地存储的成就数据格式不正确，已重置');
                localStorage.removeItem('achievements');
            }
        } catch (e) {
            console.error('加载成就数据失败:', e);
            localStorage.removeItem('achievements');
        }
    }
}

// 保存成就数据
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

// 加载全局统计数据
function loadGlobalStats() {
    const saved = localStorage.getItem('globalStats');
    if (saved) {
        globalStats = JSON.parse(saved);
    }
}

// 保存全局统计数据
function saveGlobalStats() {
    localStorage.setItem('globalStats', JSON.stringify(globalStats));
}

// 更新游戏统计数据
function updateGameStats(newStats) {
    // 处理需要累加的统计项
    for (const key in newStats) {
        if (key === 'totalBlocksCleared') {
            gameStats[key] = (gameStats[key] || 0) + newStats[key];
        } else if (key === 'score') {
            gameStats[key] = (gameStats[key] || 0) + newStats[key];
        } else if (key === 'streak') {
            // 连击数特殊处理，如果是重置则设为0，否则累加
            if (newStats[key] === 0) {
                gameStats[key] = 0;
            } else {
                gameStats[key] = (gameStats[key] || 0) + newStats[key];
                // 更新最大连击
                if (gameStats[key] > gameStats.maxCombo) {
                    gameStats.maxCombo = gameStats[key];
                }
            }
        } else if (key === 'blocksClearedByColor') {
            // 颜色消除数累加
            if (!gameStats.blocksClearedByColor) {
                gameStats.blocksClearedByColor = {};
            }
            for (const color in newStats.blocksClearedByColor) {
                gameStats.blocksClearedByColor[color] = (gameStats.blocksClearedByColor[color] || 0) + newStats.blocksClearedByColor[color];
            }
        } else {
            // 其他统计项直接覆盖
            gameStats[key] = newStats[key];
        }
    }
    checkAchievements();
}

// 重置单局游戏统计数据
function resetGameStats() {
    gameStats = {
        score: 0,
        maxCombo: 0,
        gameTime: 0,
        totalBlocksCleared: 0,
        difficulty: 0,
        streak: 0,
        colorCounts: {
            '#f1c40f': 0,
            '#e74c3c': 0,
            '#3498db': 0,
            '#2ecc71': 0
        }
    };
}

// 检查成就解锁条件
function checkAchievements() {
    const newAchievements = [];
    
    achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            let unlocked = false;
            
            if (achievement.isGlobal) {
                unlocked = achievement.condition(globalStats);
            } else {
                unlocked = achievement.condition(gameStats);
            }
            
            if (unlocked) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        }
    });
    
    if (newAchievements.length > 0) {
        saveAchievements();
        showAchievementNotifications(newAchievements);
    }
}

// 显示成就解锁通知
function showAchievementNotifications(achievements) {
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <i class="fas ${achievement.icon}"></i>
                <div class="achievement-notification-content">
                    <h3>成就解锁！</h3>
                    <p>${achievement.name}</p>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // 触发动画
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(-50%) translateY(-50%) scale(1)';
            }, 10);
            
            // 3秒后消失
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(-50%) scale(0.9)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, index * 100);
    });
}

// 创建成就系统UI
function createAchievementsUI() {
    // 添加成就按钮到主菜单
    const achievementsBtn = document.createElement('div');
    achievementsBtn.id = 'achievementsBtn';
    achievementsBtn.innerHTML = '<i class="fas fa-award"></i> 成就';
    document.body.appendChild(achievementsBtn);
    
    // 创建成就列表界面
    const achievementsScreen = document.createElement('div');
    achievementsScreen.id = 'achievementsScreen';
    achievementsScreen.className = 'unselectable';
    achievementsScreen.innerHTML = `
        <div class="achievements-header">
            <h1>成就</h1>
            <button class="achievements-back" onclick="hideAchievements()">返回</button>
        </div>
        <div class="achievements-filters">
            <button class="filter-btn active" data-filter="all">全部</button>
            <button class="filter-btn" data-filter="unlocked">已解锁</button>
            <button class="filter-btn" data-filter="locked">未解锁</button>
        </div>
        <div id="achievementsList" class="achievements-list"></div>
    `;
    document.body.appendChild(achievementsScreen);
}

// 附加事件监听器
function attachAchievementsEvents() {
    // 成就按钮点击事件
    document.getElementById('achievementsBtn').addEventListener('click', showAchievements);
    
    // 筛选按钮事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            filterAchievements(filter);
        });
    });
}

// 显示成就列表
function showAchievements() {
    renderAchievementsList();
    document.getElementById('achievementsScreen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('achievementsScreen').style.opacity = '1';
    }, 10);
}

// 隐藏成就列表
function hideAchievements() {
    document.getElementById('achievementsScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('achievementsScreen').style.display = 'none';
    }, 300);
}

// 渲染成就列表
function renderAchievementsList() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item';
        achievementItem.dataset.id = achievement.id;
        
        const statusClass = achievement.unlocked ? 'unlocked' : 'locked';
        const iconColor = achievement.unlocked ? `color: #${getColorFromIcon(achievement.icon)}` : 'color: #ccc';
        
        achievementItem.innerHTML = `
            <div class="achievement-icon" style="${iconColor}">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                <div class="achievement-status ${statusClass}">
                    ${achievement.unlocked ? '已解锁' : '未解锁'}
                </div>
            </div>
        `;
        
        list.appendChild(achievementItem);
    });
}

// 过滤成就列表
function filterAchievements(filter) {
    const items = document.querySelectorAll('.achievement-item');
    
    items.forEach(item => {
        const achievement = achievements.find(a => a.id == item.dataset.id);
        
        if (filter === 'all') {
            item.style.display = 'flex';
        } else if (filter === 'unlocked' && achievement.unlocked) {
            item.style.display = 'flex';
        } else if (filter === 'locked' && !achievement.unlocked) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 从图标获取颜色
function getColorFromIcon(icon) {
    const colors = {
        'fa-star': 'f1c40f',
        'fa-target': 'e74c3c',
        'fa-trophy': '3498db',
        'fa-fire': '2ecc71',
        'fa-fire-alt': 'e67e22',
        'fa-clock': '95a5a6',
        'fa-bomb': '34495e',
        'fa-rocket': 'e74c3c',
        'fa-bolt': 'f39c12',
        'fa-heart': 'e74c3c',
        'fa-crown': 'f1c40f',
        'fa-fire-extinguisher': '3498db',
        'fa-running': '2ecc71',
        'fa-skull': '95a5a6',
        'fa-shield-alt': '3498db',
        'fa-gamepad': 'f39c12',
        'fa-tachometer-alt': '2ecc71',
        'fa-gem': 'e91e63',
        'fa-palette': '9c27b0',
        'fa-medal': 'f1c40f'
    };
    
    return colors[icon] || '3498db';
}

// 游戏结束后更新全局统计数据
function updateGlobalStatsAfterGame() {
    globalStats.totalGames++;
    if (gameStats.score > globalStats.allTimeHighScore) {
        globalStats.allTimeHighScore = gameStats.score;
    }
    if (gameStats.maxCombo > globalStats.maxCombo) {
        globalStats.maxCombo = gameStats.maxCombo;
    }
    if (gameStats.gameTime > globalStats.longestGameTime) {
        globalStats.longestGameTime = gameStats.gameTime;
    }
    
    saveGlobalStats();
    checkAchievements();
}

// 在游戏结束界面显示新解锁的成就
function showNewAchievementsOnGameOver() {
    const newAchievements = achievements.filter(a => 
        a.unlocked && 
        !a.isGlobal && 
        a.condition(gameStats)
    );
    
    if (newAchievements.length > 0) {
        const gameOverScreen = document.getElementById('gameoverscreen');
        const newAchievementsDiv = document.createElement('div');
        newAchievementsDiv.id = 'newAchievements';
        newAchievementsDiv.innerHTML = `
            <div class="new-achievements-header">
                <h3>新解锁成就：${newAchievements.length}个</h3>
            </div>
            <div class="new-achievements-list">
                ${newAchievements.map(a => `
                    <div class="new-achievement-item">
                        <i class="fas ${a.icon}" style="color: #${getColorFromIcon(a.icon)}"></i>
                        <span>${a.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        gameOverScreen.insertBefore(newAchievementsDiv, gameOverScreen.firstChild);
    }
}

// 导出必要的函数
window.initAchievements = initAchievements;
window.updateGameStats = updateGameStats;
window.resetGameStats = resetGameStats;
window.updateGlobalStatsAfterGame = updateGlobalStatsAfterGame;
window.showNewAchievementsOnGameOver = showNewAchievementsOnGameOver;
window.showAchievements = showAchievements;
window.hideAchievements = hideAchievements;