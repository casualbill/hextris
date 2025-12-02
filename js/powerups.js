// 道具系统管理
window.powerups = {
    // 道具类型定义
    types: {
        colorClear: { name: 'colorClear', color: '#FFD700', glowColor: '#FFA500', cooldown: 30, icon: 'C' },
        slowTime: { name: 'slowTime', color: '#3498db', glowColor: '#5dade2', cooldown: 20, icon: 'S' },
        areaClear: { name: 'areaClear', color: '#e74c3c', glowColor: '#ec7063', cooldown: 40, icon: 'A' }
    },
    
    // 玩家持有的道具
    inventory: {
        colorClear: 0,
        slowTime: 0,
        areaClear: 0
    },
    
    // 冷却时间
    cooldowns: {
        colorClear: 0,
        slowTime: 0,
        areaClear: 0
    },
    
    // 道具掉落概率 (10%)
    dropChance: 0.1,
    
    // 道具按钮元素
    buttons: {},
    
    // 初始化道具系统
    init: function() {
        this.createButtons();
        this.updateButtons();
    },
    
    // 创建道具按钮
    createButtons: function() {
        // 创建道具按钮容器
        var container = document.createElement('div');
        container.id = 'powerupButtons';
        container.style.position = 'fixed';
        container.style.bottom = '80px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.gap = '15px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        
        // 创建每个道具按钮
        for (var type in this.types) {
            var button = document.createElement('div');
            button.id = 'powerup-' + type;
            button.className = 'powerup-button';
            button.style.width = '70px';
            button.style.height = '70px';
            button.style.borderRadius = '50%';
            button.style.backgroundColor = '#95a5a6'; // 未获得时为灰色
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.fontSize = '28px';
            button.style.fontWeight = 'bold';
            button.style.color = '#fff';
            button.style.cursor = 'not-allowed';
            button.style.pointerEvents = 'none';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            button.style.transition = 'all 0.3s ease';
            button.innerHTML = this.types[type].icon;
            
            // 添加点击事件
            button.onclick = (function(t) {
                return function() {
                    powerups.use(t);
                };
            })(type);
            
            container.appendChild(button);
            this.buttons[type] = button;
        }
    },
    
    // 更新按钮状态
    updateButtons: function() {
        for (var type in this.types) {
            var button = this.buttons[type];
            var hasPowerup = this.inventory[type] > 0;
            var isCooldown = this.cooldowns[type] > 0;
            
            if (hasPowerup && !isCooldown) {
                // 可使用状态
                button.style.backgroundColor = this.types[type].color;
                button.style.cursor = 'pointer';
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
                button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), 0 0 20px ' + this.types[type].glowColor;
                button.innerHTML = this.types[type].icon;
            } else {
                // 不可使用状态
                button.style.backgroundColor = '#95a5a6';
                button.style.cursor = 'not-allowed';
                button.style.pointerEvents = 'none';
                button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                
                if (isCooldown) {
                    // 显示冷却时间
                    button.style.opacity = '0.7';
                    button.innerHTML = Math.ceil(this.cooldowns[type]);
                } else {
                    button.style.opacity = '0.5';
                    button.innerHTML = this.types[type].icon;
                }
            }
        }
    },
    
    // 获得道具
    gain: function(type) {
        if (this.inventory[type] < 1) {
            this.inventory[type] = 1;
            this.updateButtons();
            
            // 添加获得道具的视觉效果
            var button = this.buttons[type];
            button.style.transform = 'scale(1.2)';
            setTimeout(function() {
                button.style.transform = 'scale(1)';
            }, 300);
        }
    },
    
    // 使用道具
    use: function(type) {
        if (gameState !== 1) return; // 游戏暂停或结束时不可使用
        if (this.inventory[type] <= 0 || this.cooldowns[type] > 0) return;
        
        // 消耗道具
        this.inventory[type]--;
        
        // 启动冷却时间
        this.cooldowns[type] = this.types[type].cooldown;
        
        // 执行道具效果
        this.activate(type);
        
        // 更新按钮状态
        this.updateButtons();
    },
    
    // 激活道具效果
    activate: function(type) {
        switch (type) {
            case 'colorClear':
                this.activateColorClear();
                break;
            case 'slowTime':
                this.activateSlowTime();
                break;
            case 'areaClear':
                this.activateAreaClear();
                break;
        }
    },
    
    // 颜色消除道具效果
    activateColorClear: function() {
        // 找到中心六边形最外层方块的颜色
        var targetColor = null;
        for (var lane = 0; lane < MainHex.sides; lane++) {
            var blocks = MainHex.blocks[lane];
            if (blocks.length > 0) {
                targetColor = blocks[blocks.length - 1].color;
                break;
            }
        }
        
        if (!targetColor) return;
        
        // 消除所有相同颜色的方块
        var clearedBlocks = 0;
        for (var lane = 0; lane < MainHex.sides; lane++) {
            var blocks = MainHex.blocks[lane];
            for (var i = blocks.length - 1; i >= 0; i--) {
                var block = blocks[i];
                if (block.color === targetColor && !block.deleted) {
                    block.deleted = 1;
                    clearedBlocks++;
                }
            }
        }
        
        // 添加分数
        if (clearedBlocks > 0) {
            score += clearedBlocks * 10;
            prevScore = score;
            
            // 添加分数文本效果
            MainHex.texts.push(new Text(trueCanvas.width / 2, trueCanvas.height / 2, 
                '+' + (clearedBlocks * 10), '30px Exo', '#fff', fadeUpAndOut));
        }
    },
    
    // 时间减缓道具效果
    activateSlowTime: function() {
        // 减缓所有下落方块的速度
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (!block.settled) {
                block.iter *= 0.5;
            }
        }
        
        // 5秒后恢复正常速度
        setTimeout(function() {
            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                if (!block.settled) {
                    block.iter *= 2;
                }
            }
        }, 5000);
    },
    
    // 区域清除道具效果
    activateAreaClear: function() {
        // 清除中心六边形上所有已堆叠的方块
        var clearedBlocks = 0;
        for (var lane = 0; lane < MainHex.sides; lane++) {
            var blocks = MainHex.blocks[lane];
            for (var i = blocks.length - 1; i >= 0; i--) {
                var block = blocks[i];
                if (!block.deleted) {
                    block.deleted = 1;
                    clearedBlocks++;
                }
            }
        }
        
        // 添加分数（每个方块10分）
        if (clearedBlocks > 0) {
            score += clearedBlocks * 10;
            prevScore = score;
            
            // 添加分数文本效果
            MainHex.texts.push(new Text(trueCanvas.width / 2, trueCanvas.height / 2, 
                '+' + (clearedBlocks * 10), '30px Exo', '#fff', fadeUpAndOut));
        }
    },
    
    // 更新冷却时间
    updateCooldowns: function(dt) {
        for (var type in this.cooldowns) {
            if (this.cooldowns[type] > 0) {
                this.cooldowns[type] -= dt;
                if (this.cooldowns[type] < 0) {
                    this.cooldowns[type] = 0;
                }
            }
        }
        this.updateButtons();
    },
    
    // 重置道具系统（游戏结束时）
    reset: function() {
        this.inventory = {
            colorClear: 0,
            slowTime: 0,
            areaClear: 0
        };
        
        this.cooldowns = {
            colorClear: 0,
            slowTime: 0,
            areaClear: 0
        };
        
        this.updateButtons();
    }
};