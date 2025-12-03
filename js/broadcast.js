// 直播功能模块
var broadcastModule = {
    socket: null,
    isBroadcasting: false,
    isWatching: false,
    currentRoomId: null,
    hostNickname: 'Player',
    viewerNickname: 'Viewer' + Math.floor(Math.random() * 1000),
    broadcastCanvas: null,
    broadcastCtx: null,
    chatMessages: [],
    maxChatMessages: 10,
    gameUpdateInterval: null,
    
    // 初始化直播功能
    init: function() {
        this.setupUI();
        this.setupCanvas();
        this.setupEventListeners();
    },
    
    // 设置UI元素
    setupUI: function() {
        // 在主菜单显示观看直播按钮
        if (typeof gameState !== 'undefined' && gameState === 0) {
            $('#watchBroadcastBtn').show();
        }
    },
    
    // 设置直播画布
    setupCanvas: function() {
        this.broadcastCanvas = document.getElementById('broadcastCanvas');
        if (this.broadcastCanvas) {
            this.broadcastCtx = this.broadcastCanvas.getContext('2d');
            this.scaleBroadcastCanvas();
            
            $(window).resize(() => {
                this.scaleBroadcastCanvas();
            });
        }
    },
    
    // 缩放直播画布
    scaleBroadcastCanvas: function() {
        this.broadcastCanvas.width = $(window).width();
        this.broadcastCanvas.height = $(window).height();
        
        if (window.devicePixelRatio) {
            var cw = $(this.broadcastCanvas).attr('width');
            var ch = $(this.broadcastCanvas).attr('height');
            
            $(this.broadcastCanvas).attr('width', cw * window.devicePixelRatio);
            $(this.broadcastCanvas).attr('height', ch * window.devicePixelRatio);
            $(this.broadcastCanvas).css('width', cw);
            $(this.broadcastCanvas).css('height', ch);
            
            this.broadcastCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        // 开始直播按钮
        $('#startBroadcastBtn').click(() => {
            this.startBroadcast();
        });
        
        // 停止直播按钮
        $('#stopBroadcastBtn').click(() => {
            this.stopBroadcast();
        });
        
        // 观看直播按钮
        $('#watchBroadcastBtn').click(() => {
            this.showBroadcastLobby();
        });
        
        // 返回菜单按钮
        $('#backToMenuBtn').click(() => {
            this.hideBroadcastLobby();
        });
        
        // 离开直播按钮
        $('#leaveBroadcastBtn').click(() => {
            this.leaveBroadcast();
        });
        
        // 发送聊天消息按钮
        $('#sendChatBtn').click(() => {
            this.sendChatMessage();
        });
        
        // 聊天输入框回车发送
        $('#chatInput').keypress((e) => {
            if (e.which === 13) {
                this.sendChatMessage();
            }
        });
    },
    
    // 连接到WebSocket服务器
    connect: function() {
        try {
            this.socket = new WebSocket('ws://localhost:8766');
            
            this.socket.onopen = () => {
                console.log('WebSocket连接已建立');
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket连接已关闭');
                this.handleDisconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket错误:', error);
            };
        } catch (error) {
            console.error('连接WebSocket服务器失败:', error);
            swal('错误', '无法连接到直播服务器，请确保服务器已启动', 'error');
        }
    },
    
    // 处理WebSocket消息
    handleMessage: function(data) {
        var message = JSON.parse(data);
        
        switch (message.type) {
            case 'room_created':
                this.handleRoomCreated(message);
                break;
            case 'rooms_list':
                this.handleRoomsList(message);
                break;
            case 'joined_room':
                this.handleJoinedRoom(message);
                break;
            case 'join_failed':
                this.handleJoinFailed(message);
                break;
            case 'game_update':
                this.handleGameUpdate(message);
                break;
            case 'block_update':
                this.handleBlockUpdate(message);
                break;
            case 'chat_message':
                this.handleChatMessage(message);
                break;
            case 'viewer_joined':
                this.handleViewerJoined(message);
                break;
            case 'viewer_left':
                this.handleViewerLeft(message);
                break;
            case 'broadcast_stopped':
                this.handleBroadcastStopped(message);
                break;
            case 'viewer_message':
                this.handleViewerMessage(message);
                break;
        }
    },
    
    // 开始直播
    startBroadcast: function() {
        // 获取主播昵称
        this.hostNickname = prompt('请输入您的昵称:', this.hostNickname);
        if (!this.hostNickname) return;
        
        // 连接服务器
        this.connect();
        
        // 等待连接建立后发送创建房间请求
        setTimeout(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    'type': 'create_room',
                    'nickname': this.hostNickname
                }));
            } else {
                swal('错误', '连接服务器失败，请重试', 'error');
            }
        }, 500);
    },
    
    // 处理房间创建成功
    handleRoomCreated: function(message) {
        if (message.success) {
            this.isBroadcasting = true;
            this.currentRoomId = message.room_id;
            
            // 更新UI
            $('#startBroadcastBtn').hide();
            $('#stopBroadcastBtn').show();
            $('#watchBroadcastBtn').hide();
            $('#broadcastRoomInfo').show();
            $('#currentRoomId').text(this.currentRoomId);
            $('#currentViewersCount').text('0');
            
            // 开始定期发送游戏状态
            this.startGameUpdates();
            
            swal('成功', '直播已开始！房间号: ' + this.currentRoomId, 'success');
        } else {
            swal('错误', '创建房间失败', 'error');
        }
    },
    
    // 停止直播
    stopBroadcast: function() {
        if (this.isBroadcasting && this.socket) {
            this.socket.send(JSON.stringify({
                'type': 'stop_broadcast'
            }));
            
            this.cleanupBroadcast();
            swal('提示', '直播已结束', 'info');
        }
    },
    
    // 清理直播资源
    cleanupBroadcast: function() {
        this.isBroadcasting = false;
        this.currentRoomId = null;
        
        // 停止游戏更新
        if (this.gameUpdateInterval) {
            clearInterval(this.gameUpdateInterval);
            this.gameUpdateInterval = null;
        }
        
        // 关闭WebSocket连接
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        // 更新UI
        $('#startBroadcastBtn').show();
        $('#stopBroadcastBtn').hide();
        if (gameState === 0) {
            $('#watchBroadcastBtn').show();
        }
        $('#broadcastRoomInfo').hide();
    },
    
    // 显示直播大厅
    showBroadcastLobby: function() {
        this.connect();
        
        // 等待连接建立后获取房间列表
        setTimeout(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    'type': 'get_rooms'
                }));
                
                $('#overlay').hide();
                $('#broadcastLobby').show();
                $('#watchBroadcastBtn').hide();
            } else {
                swal('错误', '连接服务器失败，请重试', 'error');
            }
        }, 500);
    },
    
    // 隐藏直播大厅
    hideBroadcastLobby: function() {
        $('#broadcastLobby').hide();
        $('#roomsList').html('');
        
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        if (gameState === 0) {
            $('#watchBroadcastBtn').show();
        }
    },
    
    // 处理房间列表
    handleRoomsList: function(message) {
        var roomsList = $('#roomsList');
        roomsList.html('');
        
        if (message.rooms.length === 0) {
            roomsList.html('<p style="text-align:center; color:#666;">当前没有直播</p>');
            return;
        }
        
        message.rooms.forEach(room => {
            var roomItem = $('<div class="room-item"></div>');
            roomItem.html(
                '<h3>房间 ' + room.room_id + '</h3>' +
                '<p>主播: ' + room.host_nickname + '</p>' +
                '<p>分数: ' + room.score + '</p>' +
                '<p>观众: ' + room.viewers_count + '</p>'
            );
            
            roomItem.click(() => {
                this.joinBroadcast(room.room_id);
            });
            
            roomsList.append(roomItem);
        });
    },
    
    // 加入直播
    joinBroadcast: function(roomId) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                'type': 'join_room',
                'room_id': roomId
            }));
        }
    },
    
    // 处理加入房间成功
    handleJoinedRoom: function(message) {
        this.isWatching = true;
        this.currentRoomId = message.room_id;
        this.hostNickname = message.host_nickname;
        
        // 更新UI
        $('#broadcastLobby').hide();
        $('#watchBroadcast').show();
        $('#hostNickname').text('主播: ' + this.hostNickname);
        $('#broadcastScore').text('分数: ' + message.score);
        $('#broadcastTime').text('时间: ' + this.formatTime(message.game_time));
        $('#viewersCount').text('观众: ' + message.viewers_count);
        
        // 隐藏游戏UI
        $('#pauseBtn').hide();
        $('#restartBtn').hide();
        $('#startBroadcastBtn').hide();
        $('#highScoreInGameText').hide();
    },
    
    // 处理加入房间失败
    handleJoinFailed: function(message) {
        swal('错误', message.message, 'error');
        this.hideBroadcastLobby();
    },
    
    // 离开直播
    leaveBroadcast: function() {
        this.isWatching = false;
        this.currentRoomId = null;
        this.chatMessages = [];
        
        // 关闭WebSocket连接
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        // 更新UI
        $('#watchBroadcast').hide();
        $('#chatMessages').html('');
        $('#chatInput').val('');
        
        // 显示游戏UI
        if (gameState === 0) {
            $('#watchBroadcastBtn').show();
            $('#startBroadcastBtn').show();
        }
        
        // 恢复游戏状态
        if (gameState === 1) {
            $('#pauseBtn').show();
            $('#highScoreInGameText').show();
        }
    },
    
    // 开始发送游戏更新
    startGameUpdates: function() {
        // 每100ms发送一次游戏状态更新
        this.gameUpdateInterval = setInterval(() => {
            if (this.isBroadcasting && this.socket && this.socket.readyState === WebSocket.OPEN) {
                var gameTime = Math.floor((Date.now() - startTime) / 1000);
                
                // 发送游戏状态更新
                this.socket.send(JSON.stringify({
                    'type': 'game_update',
                    'score': score,
                    'game_time': gameTime,
                    'game_state': gameState
                }));
                
                // 发送方块状态更新
                this.socket.send(JSON.stringify({
                    'type': 'block_update',
                    'blocks': this.serializeBlocks(blocks),
                    'main_hex': this.serializeMainHex(MainHex)
                }));
            }
        }, 100);
    },
    
    // 序列化方块数据
    serializeBlocks: function(blocks) {
        return blocks.map(block => ({
            lane: block.lane,
            color: block.color,
            x: block.x,
            y: block.y,
            height: block.height,
            settled: block.settled
        }));
    },
    
    // 序列化主六边形数据
    serializeMainHex: function(hex) {
        return {
            blocks: hex.blocks.map(side => 
                side.map(block => ({
                    color: block.color,
                    height: block.height,
                    deleted: block.deleted
                }))
            ),
            rotation: hex.rotation,
            y: hex.y
        };
    },
    
    // 处理游戏更新
    handleGameUpdate: function(message) {
        if (this.isWatching) {
            $('#broadcastScore').text('分数: ' + message.score);
            $('#broadcastTime').text('时间: ' + this.formatTime(message.game_time));
        }
    },
    
    // 处理方块更新
    handleBlockUpdate: function(message) {
        if (this.isWatching) {
            // 渲染直播画面
            this.renderBroadcast(message.blocks, message.main_hex);
        }
    },
    
    // 渲染直播画面
    renderBroadcast: function(blocksData, mainHexData) {
        if (!this.broadcastCtx) return;
        
        // 清空画布
        this.broadcastCtx.clearRect(0, 0, this.broadcastCanvas.width, this.broadcastCanvas.height);
        
        // 设置缩放
        var scale = settings.scale;
        this.broadcastCtx.save();
        this.broadcastCtx.scale(scale, scale);
        
        // 绘制背景
        clearGameBoard.call({ ctx: this.broadcastCtx });
        
        // 绘制主六边形
        if (mainHexData) {
            this.renderMainHex(mainHexData);
        }
        
        // 绘制方块
        if (blocksData) {
            blocksData.forEach(blockData => {
                this.renderBlock(blockData);
            });
        }
        
        // 绘制分数
        var scoreSize = 50;
        var scoreString = $('#broadcastScore').text().split(': ')[1];
        if (scoreString.length == 6) scoreSize = 43;
        else if (scoreString.length == 7) scoreSize = 35;
        else if (scoreString.length == 8) scoreSize = 31;
        else if (scoreString.length == 9) scoreSize = 27;
        
        renderText.call({ ctx: this.broadcastCtx }, 
            trueCanvas.width / 2 / scale, 
            trueCanvas.height / 2 / scale, 
            scoreSize, 
            "rgb(236, 240, 241)", 
            scoreString
        );
        
        this.broadcastCtx.restore();
    },
    
    // 渲染主六边形
    renderMainHex: function(mainHexData) {
        // 这里简化处理，实际需要根据主六边形数据进行渲染
        // 可以复用游戏中的render函数逻辑
    },
    
    // 渲染方块
    renderBlock: function(blockData) {
        // 这里简化处理，实际需要根据方块数据进行渲染
        // 可以复用游戏中的render函数逻辑
    },
    
    // 发送聊天消息
    sendChatMessage: function() {
        var input = $('#chatInput');
        var content = input.val().trim();
        
        if (content && this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                'type': 'chat_message',
                'nickname': this.isBroadcasting ? this.hostNickname : this.viewerNickname,
                'content': content
            }));
            
            input.val('');
        }
    },
    
    // 处理聊天消息
    handleChatMessage: function(message) {
        this.chatMessages.push(message);
        
        // 限制最大显示消息数量
        if (this.chatMessages.length > this.maxChatMessages) {
            this.chatMessages.shift();
        }
        
        // 更新聊天界面
        this.updateChatDisplay();
    },
    
    // 处理观众消息（主播端）
    handleViewerMessage: function(message) {
        this.handleChatMessage(message);
    },
    
    // 更新聊天显示
    updateChatDisplay: function() {
        var chatMessagesDiv = $('#chatMessages');
        chatMessagesDiv.html('');
        
        this.chatMessages.forEach(message => {
            var messageDiv = $('<div class="chat-message"></div>');
            messageDiv.html('<span class="sender">' + message.sender + ': </span>' + message.content);
            chatMessagesDiv.append(messageDiv);
        });
        
        // 滚动到底部
        chatMessagesDiv.scrollTop(chatMessagesDiv[0].scrollHeight);
    },
    
    // 处理观众加入
    handleViewerJoined: function(message) {
        if (this.isBroadcasting) {
            $('#currentViewersCount').text(message.viewers_count);
            
            // 添加系统消息
            this.chatMessages.push({
                sender: '系统',
                content: '有新观众加入直播'
            });
            this.updateChatDisplay();
        }
    },
    
    // 处理观众离开
    handleViewerLeft: function(message) {
        if (this.isBroadcasting) {
            $('#currentViewersCount').text(message.viewers_count);
        }
    },
    
    // 处理直播停止
    handleBroadcastStopped: function(message) {
        if (this.isWatching) {
            swal('提示', message.message, 'info');
            this.leaveBroadcast();
        }
    },
    
    // 处理断开连接
    handleDisconnect: function() {
        if (this.isBroadcasting) {
            this.cleanupBroadcast();
            swal('提示', '与服务器断开连接，直播已停止', 'info');
        } else if (this.isWatching) {
            this.leaveBroadcast();
            swal('提示', '与服务器断开连接', 'info');
        }
    },
    
    // 格式化时间（秒转分:秒）
    formatTime: function(seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    },
    
    // 游戏状态改变时更新UI
    onGameStateChange: function(newState) {
        if (newState === 0) {
            // 主菜单
            $('#watchBroadcastBtn').show();
            $('#startBroadcastBtn').show();
            $('#stopBroadcastBtn').hide();
            $('#broadcastRoomInfo').hide();
        } else if (newState === 1) {
            // 游戏中
            if (!this.isBroadcasting && !this.isWatching) {
                $('#startBroadcastBtn').show();
                $('#watchBroadcastBtn').hide();
            }
        }
    }
};

// 在页面加载完成后初始化直播模块
$(document).ready(() => {
    broadcastModule.init();
});

// 监听游戏状态变化
setInterval(() => {
    if (typeof gameState !== 'undefined') {
        if (typeof originalGameState === 'undefined') {
            originalGameState = gameState;
        }
        if (gameState !== originalGameState) {
            broadcastModule.onGameStateChange(gameState);
            originalGameState = gameState;
        }
    }
}, 100);
