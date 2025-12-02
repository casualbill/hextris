// 多人对战功能的核心模块
class Multiplayer {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
        this.currentPlayer = null;
        this.players = [];
        this.isHost = false;
        this.gameState = 'lobby'; // lobby, playing, finished
        
        this.initializeWebSocket();
        this.setupEventListeners();
    }
    
    // 初始化WebSocket连接
    initializeWebSocket() {
        // 注意：这里需要一个实际的WebSocket服务器地址
        // 为了演示，我们使用一个虚拟的地址
        const websocketUrl = 'wss://your-websocket-server.com';
        
        this.socket = new WebSocket(websocketUrl);
        
        this.socket.onopen = () => {
            console.log('WebSocket连接已建立');
        };
        
        this.socket.onmessage = (event) => {
            this.handleServerMessage(JSON.parse(event.data));
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.showError('连接服务器失败，请稍后重试');
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket连接已关闭');
            this.showError('与服务器的连接已断开');
        };
    }
    
    // 处理来自服务器的消息
    handleServerMessage(message) {
        switch (message.type) {
            case 'connect':
                this.currentPlayer = message.playerId;
                break;
            case 'create_room':
                this.handleCreateRoomResponse(message);
                break;
            case 'join_room':
                this.handleJoinRoomResponse(message);
                break;
            case 'room_list_update':
                this.handleRoomListUpdate(message);
                break;
            case 'player_joined':
                this.handlePlayerJoined(message);
                break;
            case 'player_left':
                this.handlePlayerLeft(message);
                break;
            case 'update_host':
                // 服务器通知更新房主
                this.isHost = (this.currentPlayer === message.newHostId);
                // 更新UI以反映新的房主状态
                if (window.updatePlayerList) {
                    window.updatePlayerList(this.players, this.isHost);
                }
                break;
            case 'room_list':
                this.updateRoomList(message.rooms);
                break;
            case 'game_start':
                this.handleGameStart(message);
                break;
            case 'game_state_update':
                this.handleGameStateUpdate(message);
                break;
            case 'player_eliminated':
                this.handlePlayerEliminated(message);
                break;
            case 'game_end':
                this.handleGameEnd(message);
                break;
            case 'start_game_request':
                this.handleGameStart(message);
                break;
            case 'game_update':
                this.handleGameUpdate(message.updateData);
                break;
            case 'player_eliminated':
                this.handlePlayerEliminated(message.playerId);
                break;
            case 'game_end':
                this.handleGameEnd(message.results);
                break;
            case 'error':
                this.showError(message.message);
                break;
        }
    }
    
    // 处理房间列表更新
    handleRoomListUpdate(message) {
        if (message.success) {
            // 更新房间列表
            if (window.updateRoomList) {
                window.updateRoomList(message.rooms);
            }
        } else {
            this.showError(message.message || '获取房间列表失败');
        }
    }
    
    // 创建房间
    createRoom() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // 显示创建房间的提示
            this.showInfo('正在创建房间...');
            
            this.socket.send(JSON.stringify({
                type: 'create_room',
                playerId: this.currentPlayer,
                playerName: this.getPlayerName()
            }));
        } else {
            this.showError('未连接到服务器，请稍后重试');
        }
    }
    
    // 加入房间
    joinRoom(roomId) {
        // 验证房间号格式（6位数字）
        if (!/^\d{6}$/.test(roomId)) {
            this.showError('房间号格式错误，请输入6位数字');
            return;
        }
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // 显示加入房间的提示
            this.showInfo('正在加入房间...');
            
            this.socket.send(JSON.stringify({
                type: 'join_room',
                roomId: roomId,
                playerId: this.currentPlayer,
                playerName: this.getPlayerName()
            }));
        } else {
            this.showError('未连接到服务器，请稍后重试');
        }
    }
    
    // 获取玩家名称（如果未设置，则生成默认名称）
    getPlayerName() {
        var playerName = localStorage.getItem('playerName');
        if (!playerName) {
            // 生成默认名称，如"玩家1"、"玩家2"等
            playerName = '玩家' + Math.floor(Math.random() * 1000);
            localStorage.setItem('playerName', playerName);
        }
        return playerName;
    }
    
    // 显示信息提示
    showInfo(message) {
        // 这里可以使用sweetAlert或其他UI组件显示信息
        console.log('信息:', message);
    }
    
    // 离开房间
    leaveRoom() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'leave_room',
                roomId: this.currentRoom,
                playerId: this.currentPlayer
            }));
        }
        
        this.resetRoomState();
    }
    
    // 开始游戏（房主调用）
    startGameRequest() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.isHost) {
            this.socket.send(JSON.stringify({
                type: 'start_game',
                roomId: this.currentRoom
            }));
        }
    }
    
    // 发送游戏更新
    sendGameUpdate(updateData) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'game_update',
                roomId: this.currentRoom,
                playerId: this.currentPlayer,
                updateData: updateData
            }));
        }
    }
    
    // 处理创建房间响应
    handleCreateRoomResponse(message) {
        if (message.success) {
            this.currentRoom = message.roomId;
            this.isHost = true;
            this.players = [message.player];
            
            // 切换到房间界面
            this.showRoomInterface();
            
            // 显示房间创建成功的提示
            this.showInfo('房间创建成功，房间号: ' + message.roomId);
        } else {
            this.showError(message.message || '创建房间失败');
        }
    }
    
    // 处理加入房间响应
    handleJoinRoomResponse(message) {
        if (message.success) {
            this.currentRoom = message.roomId;
            this.isHost = false;
            this.players = message.players;
            
            // 切换到房间界面
            this.showRoomInterface();
            
            // 显示加入房间成功的提示
            this.showInfo('成功加入房间: ' + message.roomId);
        } else {
            this.showError(message.message || '加入房间失败');
        }
    }
    
    // 更新房间列表
    updateRoomList(rooms) {
        // 清空现有的房间列表
        $('#roomList').html('');
        
        if (rooms.length === 0) {
            $('#roomList').html('<div style="margin: 10px 0; color: #95a5a6;">暂无可用房间</div>');
        } else {
            // 生成房间列表HTML
            var roomListHTML = '';
            rooms.forEach(function(room) {
                // 只显示等待中的房间
                if (room.status === 'waiting') {
                    roomListHTML += '<div style="margin: 10px 0; padding: 10px; border: 1px solid #3498db; border-radius: 5px; cursor: pointer;" onclick="joinRoomFromList(\'' + room.id + '\')">';
                    roomListHTML += '<div style="font-size: 16px; font-weight: bold;">房间号: ' + room.id + '</div>';
                    roomListHTML += '<div style="margin-top: 5px;">人数: ' + room.currentPlayers + '/' + room.maxPlayers + '</div>';
                    roomListHTML += '<div style="margin-top: 5px;">状态: ' + (room.status === 'waiting' ? '等待中' : '游戏中') + '</div>';
                    roomListHTML += '</div>';
                }
            });
            
            $('#roomList').html(roomListHTML);
        }
    }
    
    // 从房间列表加入房间
    joinRoomFromList(roomId) {
        this.joinRoom(roomId);
    }
    
    // 请求房间列表
    requestRoomList() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'request_room_list'
            }));
        }
    }
    
    // 处理玩家加入
    handlePlayerJoined(message) {
        this.addPlayer(message.player);
        
        // 显示玩家加入的提示
        this.showInfo(message.player.name + ' 加入了房间');
    }
    
    // 处理玩家离开
    handlePlayerLeft(message) {
        var playerName = '';
        
        // 找到离开的玩家名称
        this.players.forEach(function(player) {
            if (player.id === message.playerId) {
                playerName = player.name;
            }
        });
        
        this.removePlayer(message.playerId);
        
        // 显示玩家离开的提示
        this.showInfo(playerName + ' 离开了房间');
    }
    
    // 添加玩家
    addPlayer(player) {
        this.players.push(player);
        
        // 更新玩家列表UI
        if (window.updatePlayerList) {
            window.updatePlayerList(this.players, this.isHost);
        }
    }
    
    // 移除玩家
    removePlayer(playerId) {
        this.players = this.players.filter(function(player) {
            return player.id !== playerId;
        });
        
        // 如果房主离开了房间，重新设置房主
        if (this.players.length > 0) {
            // 检查离开的玩家是否是之前的房主
            const wasHostLeaving = this.players.findIndex(p => p.id === playerId) === 0;
            if (wasHostLeaving) {
                // 新的房主是剩余玩家中的第一个
                this.isHost = (this.currentPlayer === this.players[0].id);
                
                // 通知其他玩家新的房主
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({
                        type: 'update_host',
                        roomId: this.currentRoom,
                        newHostId: this.players[0].id
                    }));
                }
            }
        } else {
            // 房间空了，重置状态
            this.resetRoomState();
            this.showLobbyInterface();
        }
        
        // 更新玩家列表UI
        if (window.updatePlayerList) {
            window.updatePlayerList(this.players, this.isHost);
        }
    }
    
    // 发送开始游戏请求
    startGameRequest() {
        if (this.isHost && this.players.length >= 2) {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'start_game_request',
                    roomId: this.currentRoom
                }));
            }
        }
    }
    
    // 处理游戏开始
    handleGameStart(message) {
        if (message.success) {
            // 切换到游戏界面
            this.showGameInterface();
            
            // 显示游戏开始的提示
            this.showInfo('游戏开始！');
            
            // 这里可以添加初始化游戏状态的逻辑
            if (window.initMultiplayerGame) {
                window.initMultiplayerGame(this.players, this.currentPlayer);
            }
        } else {
            this.showError(message.message || '游戏开始失败');
        }
    }
    
    // 处理游戏状态更新
    handleGameStateUpdate(message) {
        if (message.success) {
            // 更新所有玩家的游戏状态
            message.playerStates.forEach(function(playerState) {
                if (window.updatePlayerGameState) {
                    window.updatePlayerGameState(playerState.playerId, playerState.score, playerState.isAlive);
                }
            });
        } else {
            this.showError(message.message || '游戏状态更新失败');
        }
    }
    
    // 处理玩家被淘汰
    handlePlayerEliminated(message) {
        if (message.success) {
            // 更新被淘汰玩家的状态
            if (window.updatePlayerGameState) {
                window.updatePlayerGameState(message.playerId, message.finalScore, false);
            }
            
            // 显示玩家被淘汰的提示
            var playerName = '';
            this.players.forEach(function(player) {
                if (player.id === message.playerId) {
                    playerName = player.name;
                }
            });
            
            this.showInfo(playerName + ' 被淘汰了');
        } else {
            this.showError(message.message || '玩家淘汰通知失败');
        }
    }
    
    // 处理游戏结束
    handleGameEnd(message) {
        if (message.success) {
            // 显示游戏结束排名
            if (window.showGameOverRanking) {
                window.showGameOverRanking(message.rankings);
            }
            
            // 显示游戏结束的提示
            this.showInfo('游戏结束！');
        } else {
            this.showError(message.message || '游戏结束通知失败');
        }
    }
    
    // 更新房间列表
    updateRoomList(rooms) {
        // 这里将更新房间列表UI
        console.log('房间列表已更新:', rooms);
    }
    
    // 开始游戏
    startGame(gameData) {
        this.gameState = 'playing';
        // 这里将初始化多人游戏界面和逻辑
        console.log('游戏开始:', gameData);
    }
    
    // 处理游戏更新
    handleGameUpdate(updateData) {
        // 这里将处理来自其他玩家的游戏更新
        console.log('游戏更新:', updateData);
    }
    
    // 处理玩家被淘汰
    handlePlayerEliminated(playerId) {
        // 这里将更新玩家状态UI
        console.log('玩家已被淘汰:', playerId);
        
        // 如果是当前玩家被淘汰
        if (playerId === this.currentPlayer) {
            this.gameState = 'eliminated';
            // 显示被淘汰的UI
        }
        
        // 检查是否只剩一名玩家
        const remainingPlayers = this.players.filter(player => player.id !== playerId);
        if (remainingPlayers.length === 1) {
            // 游戏结束，remainingPlayers[0] 是胜利者
            this.handleGameEnd({
                winner: remainingPlayers[0],
                players: this.players
            });
        }
    }
    
    // 处理游戏结束
    handleGameEnd(results) {
        this.gameState = 'finished';
        // 这里将显示游戏结束的排名UI
        console.log('游戏结束:', results);
    }
    
    // 显示错误消息
    showError(message) {
        // 这里将显示错误消息给用户
        alert(message);
    }
    
    // 显示房间界面
    showRoomInterface() {
        showMultiplayerRoom(this.currentRoom);
        updatePlayerList(this.players, this.isHost);
    }
    
    // 显示游戏界面
    showGameInterface() {
        document.getElementById('multiplayerLobby').style.display = 'none';
        document.getElementById('multiplayerRoom').style.display = 'none';
        document.getElementById('multiplayerGame').style.display = 'block';
    }
    
    // 切换到大厅界面
    showLobbyInterface() {
        showMultiplayerLobby();
    }
    
    // 更新玩家列表UI
    updatePlayerList() {
        window.updatePlayerList(this.players, this.isHost);
    }
    
    // 重置房间状态
    resetRoomState() {
        this.currentRoom = null;
        this.isHost = false;
        this.players = [];
        this.gameState = 'lobby';
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 初始化UI事件
        initMultiplayerUIEvents();
    }
}

// 初始化多人对战模块
window.multiplayer = new Multiplayer();
