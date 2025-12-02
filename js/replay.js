// 回放系统管理类
class ReplaySystem {
    constructor() {
        this.isReplaying = false; // 是否正在回放
        this.currentReplay = null; // 当前回放数据
        this.replayIndex = 0; // 当前回放步骤索引
        this.replaySpeed = 1; // 回放速度
        this.isPaused = false; // 回放是否暂停
        this.playbackStartTime = 0; // 回放开始时间
        this.pauseStartTime = 0; // 暂停开始时间
        
        this.init();
    }
    
    init() {
        // 绑定事件监听器
        this.bindEvents();
        
        // 初始化回放UI
        this.initReplayUI();
    }
    
    // 绑定事件监听器
    bindEvents() {
        // 游戏开始时重置回放记录
        $(document).on('gameStart', () => {
            this.startRecording();
        });
        
        // 游戏结束时保存回放
        $(document).on('gameOver', () => {
            this.saveReplay();
        });
    }
    
    // 开始记录游戏操作
    startRecording() {
        this.recording = {
            startTime: Date.now(),
            endTime: null,
            finalScore: 0,
            duration: 0,
            actions: []
        };
        
        // 记录方块生成事件
        this.originalWaveGenUpdate = window.waveone.update;
        window.waveone.update = () => {
            // 记录方块生成
            if (window.waveone.shouldGenerateBlock()) {
                this.recordAction('generateBlock', {
                    lane: window.spawnLane,
                    color: window.lastGen.color,
                    timestamp: Date.now() - this.recording.startTime
                });
            }
            
            this.originalWaveGenUpdate();
        };
        
        // 记录旋转事件
        this.originalHexRotate = window.MainHex.rotate;
        window.MainHex.rotate = (direction) => {
            this.recordAction('rotate', {
                direction: direction,
                timestamp: Date.now() - this.recording.startTime
            });
            
            this.originalHexRotate(direction);
        };
        
        // 记录消除事件
        this.originalBlockDestroyed = window.blockDestroyed;
        window.blockDestroyed = () => {
            this.recordAction('blockDestroyed', {
                score: window.score,
                timestamp: Date.now() - this.recording.startTime
            });
            
            this.originalBlockDestroyed();
        };
    }
    
    // 记录单个操作
    recordAction(type, data) {
        if (this.recording) {
            this.recording.actions.push({
                type: type,
                data: data
            });
        }
    }
    
    // 保存回放数据
    saveReplay() {
        if (!this.recording) return;
        
        this.recording.endTime = Date.now();
        this.recording.duration = this.recording.endTime - this.recording.startTime;
        this.recording.finalScore = window.score;
        
        // 获取现有回放列表
        let replays = this.getReplays();
        
        // 添加新回放
        replays.push(this.recording);
        
        // 限制最多保存10局回放
        if (replays.length > 10) {
            replays.shift(); // 删除最早的回放
        }
        
        // 保存到本地存储
        localStorage.setItem('hextrisReplays', JSON.stringify(replays));
        
        // 恢复原始函数
        this.restoreOriginalFunctions();
        
        // 触发回放列表更新事件
        $(document).trigger('replayListUpdated');
    }
    
    // 恢复原始函数
    restoreOriginalFunctions() {
        if (this.originalWaveGenUpdate) {
            window.waveone.update = this.originalWaveGenUpdate;
        }
        
        if (this.originalHexRotate) {
            window.MainHex.rotate = this.originalHexRotate;
        }
        
        if (this.originalBlockDestroyed) {
            window.blockDestroyed = this.originalBlockDestroyed;
        }
    }
    
    // 获取所有回放
    getReplays() {
        let replays = localStorage.getItem('hextrisReplays');
        return replays ? JSON.parse(replays) : [];
    }
    
    // 删除指定回放
    deleteReplay(index) {
        let replays = this.getReplays();
        replays.splice(index, 1);
        localStorage.setItem('hextrisReplays', JSON.stringify(replays));
        $(document).trigger('replayListUpdated');
    }
    
    // 开始播放指定回放
    startReplay(replayData) {
        this.isReplaying = true;
        this.currentReplay = replayData;
        this.replayIndex = 0;
        this.isPaused = false;
        this.playbackStartTime = Date.now();
        
        // 重置游戏状态
        window.gameState = 1;
        window.score = 0;
        window.blocks = [];
        
        // 初始化游戏
        window.initialize(1);
        
        // 隐藏主菜单，显示回放控制栏
        this.showReplayControls();
        
        // 开始回放循环
        this.replayLoop();
    }
    
    // 回放循环
    replayLoop() {
        if (!this.isReplaying || this.isPaused) {
            requestAnimationFrame(() => this.replayLoop());
            return;
        }
        
        // 计算已播放时间
        let elapsedTime = (Date.now() - this.playbackStartTime) * this.replaySpeed;
        
        // 执行所有在当前时间点之前的操作
        while (this.replayIndex < this.currentReplay.actions.length) {
            let action = this.currentReplay.actions[this.replayIndex];
            
            if (action.data.timestamp <= elapsedTime) {
                this.executeAction(action);
                this.replayIndex++;
            } else {
                break;
            }
        }
        
        // 更新进度条
        this.updateProgressBar(elapsedTime);
        
        // 检查回放是否结束
        if (this.replayIndex >= this.currentReplay.actions.length && window.gameState !== -1) {
            // 回放结束
            this.endReplay();
        }
        
        requestAnimationFrame(() => this.replayLoop());
    }
    
    // 执行回放操作
    executeAction(action) {
        switch (action.type) {
            case 'rotate':
                window.MainHex.rotate(action.data.direction);
                break;
            case 'generateBlock':
                // 生成方块（需要修改wavegen.js来支持手动生成）
                if (window.waveone.generateBlock) {
                    window.waveone.generateBlock(action.data.lane, action.data.color);
                }
                break;
            case 'blockDestroyed':
                window.score = action.data.score;
                break;
        }
    }
    
    // 暂停/继续回放
    togglePause() {
        if (!this.isReplaying) return;
        
        if (this.isPaused) {
            // 继续回放
            this.isPaused = false;
            this.playbackStartTime += Date.now() - this.pauseStartTime;
        } else {
            // 暂停回放
            this.isPaused = true;
            this.pauseStartTime = Date.now();
        }
    }
    
    // 设置回放速度
    setSpeed(speed) {
        if (!this.isReplaying) return;
        
        // 调整已播放时间以保持进度一致
        let elapsedTime = (Date.now() - this.playbackStartTime) * this.replaySpeed;
        this.replaySpeed = speed;
        this.playbackStartTime = Date.now() - (elapsedTime / this.replaySpeed);
    }
    
    // 结束回放
    endReplay() {
        this.isReplaying = false;
        this.currentReplay = null;
        this.replayIndex = 0;
        this.isPaused = false;
        this.playbackStartTime = 0;
        
        // 显示回放结束提示
        this.showReplayEndScreen();
    }
    
    // 退出回放
    exitReplay() {
        this.isReplaying = false;
        this.currentReplay = null;
        this.replayIndex = 0;
        this.isPaused = false;
        this.playbackStartTime = 0;
        
        // 隐藏回放控制栏
        this.hideReplayControls();
        
        // 重置游戏状态到主菜单
        window.gameState = 0;
        window.setStartScreen();
    }
    
    // 初始化回放UI
    initReplayUI() {
        // 添加回放按钮到主菜单
        this.addReplayButtonToMainMenu();
        
        // 创建回放列表界面
        this.createReplayListUI();
        
        // 创建回放控制栏
        this.createReplayControls();
        
        // 创建回放结束界面
        this.createReplayEndScreen();
    }
    
    // 添加回放按钮到主菜单
    addReplayButtonToMainMenu() {
        // 根据游戏的实际UI结构添加回放按钮
        // 主菜单的开始按钮是#startBtn，我们将在它旁边添加回放按钮
        
        // 首先检查#startBtn是否存在
        if ($('#startBtn').length) {
            // 隐藏默认的开始按钮
            $('#startBtn').hide();
            
            // 创建一个新的按钮容器
            let buttonContainer = $('<div id="buttonCont" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;"></div>');
            
            // 添加开始按钮
            let startButton = $('<div id="startBtnNew" style="cursor:pointer; margin: 10px 0; padding: 15px; background-color: #2ecc71; color: white; text-align: center; border-radius: 5px; font-size: 18px;">开始游戏</div>');
            
            startButton.on('click', () => {
                // 触发游戏开始
                window.gameState = 1;
                window.startGame();
            });
            
            // 添加回放按钮
            let replayButton = $('<div id="replayBtn" style="cursor:pointer; margin: 10px 0; padding: 15px; background-color: #3498db; color: white; text-align: center; border-radius: 5px; font-size: 18px;">回放</div>');
            
            replayButton.on('click', () => {
                this.showReplayList();
            });
            
            // 将按钮添加到容器
            buttonContainer.append(startButton);
            buttonContainer.append(replayButton);
            
            // 将容器添加到body
            $('body').append(buttonContainer);
        }
    }
    
    // 创建回放列表界面
    createReplayListUI() {
        let replayListHTML = `
            <div id="replayListScreen" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(236, 240, 241, 0.95); z-index: 100; display: none;">
                <div style="text-align: center; margin-top: 50px; font-size: 30px; color: #2c3e50;">回放列表</div>
                <div id="replayList" style="margin: 20px auto; width: 80%; max-width: 600px; height: 400px; overflow-y: auto;"></div>
                <div style="text-align: center; margin-top: 20px;">
                    <button id="backToMainBtn" style="padding: 10px 20px; background-color: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">返回主菜单</button>
                </div>
            </div>
        `;
        
        $('body').append(replayListHTML);
        
        // 绑定返回主菜单按钮事件
        $('#backToMainBtn').on('click', () => {
            this.hideReplayList();
        });
        
        // 监听回放列表更新事件
        $(document).on('replayListUpdated', () => {
            this.updateReplayList();
        });
    }
    
    // 更新回放列表
    updateReplayList() {
        let replays = this.getReplays();
        let replayListHTML = '';
        
        if (replays.length === 0) {
            replayListHTML = '<div style="text-align: center; margin-top: 50px; color: #95a5a6;">暂无回放记录</div>';
        } else {
            // 按时间倒序显示（最新的在前）
            replays.reverse().forEach((replay, index) => {
                let date = new Date(replay.startTime);
                let dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                let durationString = this.formatDuration(replay.duration);
                
                replayListHTML += `
                    <div style="background-color: white; padding: 15px; margin-bottom: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: #2c3e50;">${dateString}</div>
                            <div style="color: #3498db;">分数: ${replay.finalScore}</div>
                            <div style="color: #95a5a6;">时长: ${durationString}</div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="playReplayBtn" data-index="${replays.length - 1 - index}" style="padding: 8px 12px; background-color: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">播放</button>
                            <button class="deleteReplayBtn" data-index="${replays.length - 1 - index}" style="padding: 8px 12px; background-color: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">删除</button>
                        </div>
                    </div>
                `;
            });
        }
        
        $('#replayList').html(replayListHTML);
        
        // 绑定播放按钮事件
        $('.playReplayBtn').on('click', (e) => {
            let index = $(e.target).data('index');
            let replays = this.getReplays();
            this.startReplay(replays[index]);
            this.hideReplayList();
        });
        
        // 绑定删除按钮事件
        $('.deleteReplayBtn').on('click', (e) => {
            let index = $(e.target).data('index');
            
            // 显示确认对话框
            swal({
                title: "确定删除？",
                text: "此操作不可恢复！",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#e74c3c",
                confirmButtonText: "删除",
                cancelButtonText: "取消"
            }, () => {
                this.deleteReplay(index);
            });
        });
    }
    
    // 创建回放控制栏
    createReplayControls() {
        let replayControlsHTML = `
            <div id="replayControls" style="position: absolute; bottom: 0; left: 0; width: 100%; background-color: rgba(44, 62, 80, 0.9); color: white; padding: 10px 0; display: none; z-index: 100;">
                <div style="display: flex; justify-content: center; align-items: center; gap: 20px;">
                    <button id="replayPauseBtn" style="padding: 8px 12px; background-color: #f1c40f; color: white; border: none; border-radius: 5px; cursor: pointer;">暂停</button>
                    <button id="replaySpeed05Btn" style="padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">0.5倍速</button>
                    <button id="replaySpeed1Btn" style="padding: 8px 12px; background-color: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">1倍速</button>
                    <button id="replaySpeed2Btn" style="padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">2倍速</button>
                    <button id="replayExitBtn" style="padding: 8px 12px; background-color: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">退出回放</button>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <div id="replayProgressText" style="font-size: 14px;">0:00 / 0:00</div>
                    <div id="replayProgressBar" style="width: 80%; height: 5px; background-color: #95a5a6; margin: 10px auto; border-radius: 5px; overflow: hidden;">
                        <div id="replayProgressFill" style="width: 0%; height: 100%; background-color: #2ecc71;"></div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(replayControlsHTML);
        
        // 绑定控制按钮事件
        $('#replayPauseBtn').on('click', () => {
            this.togglePause();
            $('#replayPauseBtn').text(this.isPaused ? '继续' : '暂停');
        });
        
        $('#replaySpeed05Btn').on('click', () => {
            this.setSpeed(0.5);
            this.updateSpeedButtonStyles(0.5);
        });
        
        $('#replaySpeed1Btn').on('click', () => {
            this.setSpeed(1);
            this.updateSpeedButtonStyles(1);
        });
        
        $('#replaySpeed2Btn').on('click', () => {
            this.setSpeed(2);
            this.updateSpeedButtonStyles(2);
        });
        
        $('#replayExitBtn').on('click', () => {
            this.exitReplay();
        });
    }
    
    // 创建回放结束界面
    createReplayEndScreen() {
        let replayEndScreenHTML = `
            <div id="replayEndScreen" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 200; display: none;">
                <div style="text-align: center; margin-bottom: 20px; font-size: 24px; color: #2c3e50;">回放结束</div>
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="replayRestartBtn" style="padding: 10px 20px; background-color: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">重新播放</button>
                    <button id="replayBackToListBtn" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">返回列表</button>
                </div>
            </div>
        `;
        
        $('body').append(replayEndScreenHTML);
        
        // 绑定按钮事件
        $('#replayRestartBtn').on('click', () => {
            this.hideReplayEndScreen();
            if (this.currentReplay) {
                this.startReplay(this.currentReplay);
            }
        });
        
        $('#replayBackToListBtn').on('click', () => {
            this.hideReplayEndScreen();
            this.exitReplay();
            this.showReplayList();
        });
    }
    
    // 显示回放列表
    showReplayList() {
        this.updateReplayList();
        $('#replayListScreen').show();
    }
    
    // 隐藏回放列表
    hideReplayList() {
        $('#replayListScreen').hide();
    }
    
    // 显示回放控制栏
    showReplayControls() {
        $('#replayControls').show();
    }
    
    // 隐藏回放控制栏
    hideReplayControls() {
        $('#replayControls').hide();
    }
    
    // 显示回放结束界面
    showReplayEndScreen() {
        $('#replayEndScreen').show();
    }
    
    // 隐藏回放结束界面
    hideReplayEndScreen() {
        $('#replayEndScreen').hide();
    }
    
    // 更新进度条
    updateProgressBar(elapsedTime) {
        let totalDuration = this.currentReplay.duration;
        let progress = Math.min(elapsedTime / totalDuration, 1);
        
        // 更新进度条
        $('#replayProgressFill').css('width', (progress * 100) + '%');
        
        // 更新进度文本
        let elapsedString = this.formatDuration(elapsedTime);
        let totalString = this.formatDuration(totalDuration);
        $('#replayProgressText').text(`${elapsedString} / ${totalString}`);
    }
    
    // 更新速度按钮样式
    updateSpeedButtonStyles(currentSpeed) {
        // 重置所有速度按钮样式
        $('#replaySpeed05Btn, #replaySpeed1Btn, #replaySpeed2Btn').css('background-color', '#3498db');
        
        // 高亮当前速度按钮
        switch (currentSpeed) {
            case 0.5:
                $('#replaySpeed05Btn').css('background-color', '#2ecc71');
                break;
            case 1:
                $('#replaySpeed1Btn').css('background-color', '#2ecc71');
                break;
            case 2:
                $('#replaySpeed2Btn').css('background-color', '#2ecc71');
                break;
        }
    }
    
    // 格式化时长（毫秒）为MM:SS或HH:MM:SS
    formatDuration(milliseconds) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        
        seconds = seconds % 60;
        minutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

// 初始化回放系统
window.ReplaySystem = new ReplaySystem();

// 触发游戏开始事件的函数（需要在游戏开始时调用）
function triggerGameStart() {
    $(document).trigger('gameStart');
}

// 触发游戏结束事件的函数（需要在游戏结束时调用）
function triggerGameOver() {
    $(document).trigger('gameOver');
}