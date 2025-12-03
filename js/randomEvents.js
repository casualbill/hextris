// 随机事件系统
window.randomEvents = {
    // 事件类型
    eventTypes: [
        {
            id: 'speedup',
            name: '极速模式',
            description: '所有正在下落的颜色块速度提升100%',
            duration: 8000, // 8秒
            color: '#e74c3c',
            effect: function() {
                // 保存原始速度
                settings.originalSpeedModifier = settings.speedModifier;
                settings.speedModifier *= 2;
                // 显示红色闪烁边框
                randomEvents.showBorderEffect('#e74c3c');
            },
            endEffect: function() {
                // 恢复原始速度
                settings.speedModifier = settings.originalSpeedModifier;
                randomEvents.hideBorderEffect();
            }
        },
        {
            id: 'slowdown',
            name: '慢动作',
            description: '所有正在下落的颜色块速度降低50%',
            duration: 10000, // 10秒
            color: '#3498db',
            effect: function() {
                // 保存原始速度
                settings.originalSpeedModifier = settings.speedModifier;
                settings.speedModifier *= 0.5;
                // 显示蓝色闪烁边框
                randomEvents.showBorderEffect('#3498db');
            },
            endEffect: function() {
                // 恢复原始速度
                settings.speedModifier = settings.originalSpeedModifier;
                randomEvents.hideBorderEffect();
            }
        },
        {
            id: 'colorchange',
            name: '颜色重组',
            description: '场上所有已堆叠的颜色块颜色随机重新分配',
            duration: 0, // 即时生效，无持续时间
            color: '#f1c40f',
            effect: function() {
                // 收集所有已堆叠的块的颜色
                var colors = [];
                for (var i = 0; i < MainHex.blocks.length; i++) {
                    for (var j = 0; j < MainHex.blocks[i].length; j++) {
                        colors.push(MainHex.blocks[i][j].color);
                    }
                }
                
                // 随机打乱颜色
                for (var i = colors.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    [colors[i], colors[j]] = [colors[j], colors[i]];
                }
                
                // 重新分配颜色
                var colorIndex = 0;
                for (var i = 0; i < MainHex.blocks.length; i++) {
                    for (var j = 0; j < MainHex.blocks[i].length; j++) {
                        MainHex.blocks[i][j].color = colors[colorIndex];
                        colorIndex++;
                    }
                }
                
                // 显示彩色闪光效果
                randomEvents.showFlashEffect('#f1c40f');
            },
            endEffect: function() {
                // 无持续效果，不需要结束处理
            }
        },
        {
            id: 'autoclear',
            name: '自动清理',
            description: '自动消除中心六边形上任意一条边的最底层颜色块',
            duration: 0, // 即时生效，无持续时间
            color: '#2ecc71',
            effect: function() {
                // 选择一条有块的边
                var validLanes = [];
                for (var i = 0; i < MainHex.blocks.length; i++) {
                    if (MainHex.blocks[i].length > 0) {
                        validLanes.push(i);
                    }
                }
                
                if (validLanes.length > 0) {
                    // 随机选择一条边
                    var laneIndex = validLanes[Math.floor(Math.random() * validLanes.length)];
                    // 选择最底层的块（索引0）
                    var block = MainHex.blocks[laneIndex][0];
                    
                    // 标记块为删除
                    block.deleted = 2;
                    // 显示白色闪光效果
                    randomEvents.showFlashEffect('#ffffff', block);
                }
            },
            endEffect: function() {
                // 无持续效果，不需要结束处理
            }
        },
        {
            id: 'controlreverse',
            name: '控制反转',
            description: '玩家左右方向键的控制方向互换',
            duration: 12000, // 12秒
            color: '#9b59b6',
            effect: function() {
                // 保存原始控制方向
                settings.originalControlDirection = settings.controlDirection || 1;
                settings.controlDirection = -1;
                // 显示旋转动画提示
                randomEvents.showRotationEffect();
            },
            endEffect: function() {
                // 恢复原始控制方向
                settings.controlDirection = settings.originalControlDirection;
                randomEvents.hideRotationEffect();
            }
        }
    ],
    
    // 上次事件触发时间
    lastEventTime: 0,
    // 下次事件触发时间
    nextEventTime: 0,
    // 当前活动事件
    currentEvent: null,
    // 事件定时器
    eventTimer: null,
    
    // 初始化
    init: function() {
        this.reset();
    },
    
    // 重置
    reset: function() {
        // 清除定时器
        if (this.eventTimer) {
            clearTimeout(this.eventTimer);
            this.eventTimer = null;
        }
        
        // 结束当前事件
        if (this.currentEvent) {
            this.currentEvent.endEffect();
            this.currentEvent = null;
        }
        
        // 重置时间
        this.lastEventTime = Date.now();
        this.nextEventTime = this.lastEventTime + this.getRandomInterval();
    },
    
    // 获取随机事件间隔（5-10秒）
    getRandomInterval: function() {
        return Math.random() * 5000 + 5000; // 5000ms - 10000ms
    },
    
    // 更新
    update: function() {
        // 如果随机事件系统未开启，则不处理
        if (!settings.randomEventsEnabled) {
            return;
        }
        
        var currentTime = Date.now();
        
        // 检查是否需要触发新事件
        if (currentTime >= this.nextEventTime && !this.currentEvent) {
            this.triggerRandomEvent();
        }
    },
    
    // 触发随机事件
    triggerRandomEvent: function() {
        // 随机选择一个事件类型
        var eventType = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
        
        // 触发事件
        this.currentEvent = Object.assign({}, eventType);
        this.currentEvent.effect();
        
        // 显示事件提示
        this.showEventNotification(this.currentEvent.name, this.currentEvent.description);
        
        // 如果事件有持续时间，则设置定时器在事件结束时调用endEffect
        if (this.currentEvent.duration > 0) {
            var self = this;
            this.eventTimer = setTimeout(function() {
                self.endCurrentEvent();
            }, this.currentEvent.duration);
        } else {
            // 即时事件，触发后立即结束
            this.endCurrentEvent();
        }
        
        // 更新上次事件触发时间和下次事件触发时间
        this.lastEventTime = Date.now();
        this.nextEventTime = this.lastEventTime + this.getRandomInterval();
    },
    
    // 结束当前事件
    endCurrentEvent: function() {
        if (this.currentEvent) {
            this.currentEvent.endEffect();
            this.currentEvent = null;
        }
        
        // 清除定时器
        if (this.eventTimer) {
            clearTimeout(this.eventTimer);
            this.eventTimer = null;
        }
    },
    
    // 显示事件通知
    showEventNotification: function(name, description) {
        // 创建事件通知元素
        var notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = '<div class="event-name">' + name + '</div><div class="event-description">' + description + '</div>';
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(function() {
            notification.classList.add('show');
        }, 100);
        
        // 3秒后隐藏并移除
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    },
    
    // 显示边框效果
    showBorderEffect: function(color) {
        // 为游戏画布添加边框
        var canvas = document.getElementById('canvas');
        canvas.style.border = '5px solid ' + color;
        canvas.style.boxShadow = '0 0 20px ' + color;
    },
    
    // 隐藏边框效果
    hideBorderEffect: function() {
        // 移除游戏画布的边框
        var canvas = document.getElementById('canvas');
        canvas.style.border = 'none';
        canvas.style.boxShadow = 'none';
    },
    
    // 显示闪光效果
    showFlashEffect: function(color, block) {
        // 创建闪光效果元素
        var flash = document.createElement('div');
        flash.className = 'event-flash';
        flash.style.backgroundColor = color;
        document.body.appendChild(flash);
        
        // 显示动画
        setTimeout(function() {
            flash.classList.add('show');
        }, 10);
        
        // 1秒后隐藏并移除
        setTimeout(function() {
            flash.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(flash);
            }, 500);
        }, 1000);
    },
    
    // 显示旋转效果
    showRotationEffect: function() {
        // 为游戏画布添加旋转动画
        var canvas = document.getElementById('canvas');
        canvas.classList.add('rotate-animation');
    },
    
    // 隐藏旋转效果
    hideRotationEffect: function() {
        // 移除游戏画布的旋转动画
        var canvas = document.getElementById('canvas');
        canvas.classList.remove('rotate-animation');
    }
};

// 控制反转处理
// 需要修改input.js中的旋转逻辑，根据settings.controlDirection调整旋转方向