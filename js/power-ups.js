// 道具管理系统

// 道具类型枚举
const PowerUpType = {
    COLOR_CLEAR: 'color_clear',
    SLOW_TIME: 'slow_time',
    AREA_CLEAR: 'area_clear'
};

// 道具配置
const PowerUpConfig = {
    [PowerUpType.COLOR_CLEAR]: {
        color: '#FFD700', // 金色
        glowColor: '#FFA500',
        cooldown: 30,
        name: '颜色消除'
    },
    [PowerUpType.SLOW_TIME]: {
        color: '#00BFFF', // 蓝色
        glowColor: '#00FFFF',
        cooldown: 20,
        name: '时间减缓'
    },
    [PowerUpType.AREA_CLEAR]: {
        color: '#FF4444', // 红色
        glowColor: '#FF6666',
        cooldown: 40,
        name: '区域清除'
    }
};

// 道具状态
let powerUpState = {
    [PowerUpType.COLOR_CLEAR]: { owned: false, cooldown: 0 },
    [PowerUpType.SLOW_TIME]: { owned: false, cooldown: 0 },
    [PowerUpType.AREA_CLEAR]: { owned: false, cooldown: 0 }
};

// 道具效果计时器
let slowTimeActive = false;
let slowTimeEndTime = 0;

// 重置道具状态
function resetPowerUps() {
    powerUpState = {
        [PowerUpType.COLOR_CLEAR]: { owned: false, cooldown: 0 },
        [PowerUpType.SLOW_TIME]: { owned: false, cooldown: 0 },
        [PowerUpType.AREA_CLEAR]: { owned: false, cooldown: 0 }
    };
    slowTimeActive = false;
    slowTimeEndTime = 0;
    updatePowerUpButtons();
}

// 随机生成道具类型
function getRandomPowerUpType() {
    const types = Object.values(PowerUpType);
    return types[Math.floor(Math.random() * types.length)];
}

// 检查是否生成道具（10%概率）
function shouldGeneratePowerUp() {
    return Math.random() < 0.1;
}

// 应用时间减缓效果
function applySlowTime() {
    if (!powerUpState[PowerUpType.SLOW_TIME].owned || powerUpState[PowerUpType.SLOW_TIME].cooldown > 0) return;
    
    slowTimeActive = true;
    slowTimeEndTime = Date.now() + 5000; // 5秒效果
    
    powerUpState[PowerUpType.SLOW_TIME].owned = false;
    powerUpState[PowerUpType.SLOW_TIME].cooldown = PowerUpConfig[PowerUpType.SLOW_TIME].cooldown;
    
    updatePowerUpButtons();
}

// 应用颜色消除效果
function applyColorClear() {
    if (!powerUpState[PowerUpType.COLOR_CLEAR].owned || powerUpState[PowerUpType.COLOR_CLEAR].cooldown > 0) return;
    
    // 找到最外层方块的颜色
    const outermostColor = findOutermostColor();
    if (outermostColor) {
        // 消除所有相同颜色的方块
        clearBlocksByColor(outermostColor);
    }
    
    powerUpState[PowerUpType.COLOR_CLEAR].owned = false;
    powerUpState[PowerUpType.COLOR_CLEAR].cooldown = PowerUpConfig[PowerUpType.COLOR_CLEAR].cooldown;
    
    updatePowerUpButtons();
}

// 应用区域清除效果
function applyAreaClear() {
    if (!powerUpState[PowerUpType.AREA_CLEAR].owned || powerUpState[PowerUpType.AREA_CLEAR].cooldown > 0) return;
    
    // 消除中心六边形上的所有方块
    clearAllStackedBlocks();
    
    powerUpState[PowerUpType.AREA_CLEAR].owned = false;
    powerUpState[PowerUpType.AREA_CLEAR].cooldown = PowerUpConfig[PowerUpType.AREA_CLEAR].cooldown;
    
    updatePowerUpButtons();
}

// 找到最外层方块的颜色
function findOutermostColor() {
    for (let lane = 0; lane < MainHex.sides; lane++) {
        const stack = MainHex.blocks[lane];
        if (stack.length > 0) {
            const outermostBlock = stack[stack.length - 1];
            return outermostBlock.color;
        }
    }
    return null;
}

// 清除指定颜色的方块
function clearBlocksByColor(color) {
    for (let lane = 0; lane < MainHex.sides; lane++) {
        const stack = MainHex.blocks[lane];
        for (let i = stack.length - 1; i >= 0; i--) {
            const block = stack[i];
            if (block.color === color && !block.deleted) {
                block.deleted = 1;
            }
        }
    }
    // 触发连击检查
    comboTime = 1.25;
}

// 清除所有堆叠的方块
function clearAllStackedBlocks() {
    let clearedCount = 0;
    
    for (let lane = 0; lane < MainHex.sides; lane++) {
        const stack = MainHex.blocks[lane];
        clearedCount += stack.length;
        
        for (let i = stack.length - 1; i >= 0; i--) {
            const block = stack[i];
            block.deleted = 1;
        }
    }
    
    // 按每个方块10分计算分数
    if (clearedCount > 0) {
        score += clearedCount * 10;
        prevScore = score;
    }
}

// 更新道具按钮状态
function updatePowerUpButtons() {
    for (const type in PowerUpType) {
        const state = powerUpState[PowerUpType[type]];
        const button = $(`#powerup-${PowerUpType[type]}`);
        
        if (state.cooldown > 0) {
            button.addClass('cooldown');
            button.find('.cooldown-timer').text(Math.ceil(state.cooldown));
        } else if (state.owned) {
            button.removeClass('cooldown');
            button.find('.cooldown-timer').text('');
        } else {
            button.addClass('unavailable');
            button.find('.cooldown-timer').text('');
        }
    }
}

// 道具更新循环
function updatePowerUps() {
    // 更新冷却时间
    const currentTime = Date.now();
    for (const type in powerUpState) {
        if (powerUpState[type].cooldown > 0) {
            powerUpState[type].cooldown -= 0.016; // 约60fps
            if (powerUpState[type].cooldown < 0) {
                powerUpState[type].cooldown = 0;
            }
        }
    }
    
    // 检查时间减缓效果是否结束
    if (slowTimeActive && currentTime > slowTimeEndTime) {
        slowTimeActive = false;
    }
    
    updatePowerUpButtons();
}

// 获取当前速度乘数（用于时间减缓效果）
function getSpeedMultiplier() {
    return slowTimeActive ? 0.5 : 1.0;
}