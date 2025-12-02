// Hextris 多人对战游戏逻辑
class HextrisGame {
    constructor(canvas, playerId, playerName, isLocal = true) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.playerId = playerId;
        this.playerName = playerName;
        this.isLocal = isLocal;
        
        this.score = 0;
        this.isAlive = true;
        this.gameStarted = false;
        this.failed = false;
        
        this.size = 30;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        
        // 六边形网格
        this.hexGrid = [];
        this.initializeGrid();
        
        // 当前方块
        this.currentBlock = null;
        this.blockQueue = [];
        
        // 游戏状态
        this.gamePaused = false;
        this.gameOver = false;
        
        // 方块颜色
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        
        // 事件回调
        this.onGameOver = null;
        this.onScoreChange = null;
        this.onBlockPlaced = null;
        
        // 生成初始方块队列
        this.generateBlockQueue();
    }
    
    initializeGrid() {
        // 创建六边形网格
        this.hexGrid = [];
        for (let i = 0; i < 6; i++) {
            this.hexGrid[i] = [];
            for (let j = 0; j < 6; j++) {
                this.hexGrid[i][j] = null;
            }
        }
    }
    
    generateBlockQueue() {
        // 生成方块队列
        for (let i = 0; i < 3; i++) {
            this.blockQueue.push(this.generateRandomBlock());
        }
    }
    
    generateRandomBlock() {
        // 生成随机方块
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const type = Math.floor(Math.random() * 3); // 0: 单格, 1: 双格, 2: 三格
        
        return { color, type, rotation: 0 };
    }
    
    startGame() {
        this.gameStarted = true;
        this.currentBlock = this.blockQueue.shift();
        this.blockQueue.push(this.generateRandomBlock());
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameStarted || this.gamePaused || this.gameOver) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 游戏逻辑更新
        if (!this.currentBlock) return;
        
        // 方块自动下落逻辑（简化版）
        // 这里可以添加重力效果
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制六边形网格
        this.renderGrid();
        
        // 绘制已放置的方块
        this.renderPlacedBlocks();
        
        // 绘制当前方块
        if (this.currentBlock && !this.gameOver) {
            this.renderCurrentBlock();
        }
        
        // 绘制分数
        this.renderScore();
    }
    
    renderGrid() {
        // 绘制六边形网格背景
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 简化的六边形网格绘制
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                const x = this.centerX + (j - 2.5) * this.size * 1.5;
                const y = this.centerY + (i - 2.5) * this.size * Math.sqrt(3);
                
                // 调整六边形排列以居中
                const offsetY = i % 2 === 0 ? 0 : this.size * Math.sqrt(3) / 2;
                
                this.drawHexagon(x, y + offsetY, this.size / 2, false);
            }
        }
    }
    
    renderPlacedBlocks() {
        // 绘制已放置的方块
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                const cell = this.hexGrid[i][j];
                if (cell) {
                    const x = this.centerX + (j - 2.5) * this.size * 1.5;
                    const y = this.centerY + (i - 2.5) * this.size * Math.sqrt(3);
                    const offsetY = i % 2 === 0 ? 0 : this.size * Math.sqrt(3) / 2;
                    
                    this.drawHexagon(x, y + offsetY, this.size / 2, true, cell.color);
                }
            }
        }
    }
    
    renderCurrentBlock() {
        // 绘制当前操作的方块（简化版，固定在中心）
        const x = this.centerX;
        const y = this.centerY;
        
        this.drawHexagon(x, y, this.size / 2, true, this.currentBlock.color);
    }
    
    renderScore() {
        // 绘制分数
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 20px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`分数: ${this.score}`, this.canvas.width / 2, 30);
    }
    
    drawHexagon(x, y, size, fill = false, color = '#FFFFFF') {
        // 绘制六边形
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        
        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    // 玩家操作
    rotateBlock() {
        if (!this.currentBlock || this.gameOver || !this.isLocal) return;
        
        this.currentBlock.rotation = (this.currentBlock.rotation + 1) % 6;
    }
    
    moveBlock(direction) {
        if (!this.currentBlock || this.gameOver || !this.isLocal) return;
        
        // 简化的移动逻辑
        this.score += 10;
        if (this.onScoreChange) {
            this.onScoreChange(this.score);
        }
    }
    
    placeBlock() {
        if (!this.currentBlock || this.gameOver || !this.isLocal) return;
        
        // 简化的放置逻辑
        const i = Math.floor(Math.random() * 6);
        const j = Math.floor(Math.random() * 6);
        
        if (!this.hexGrid[i][j]) {
            this.hexGrid[i][j] = { ...this.currentBlock };
            this.score += 100;
            
            if (this.onScoreChange) {
                this.onScoreChange(this.score);
            }
            
            if (this.onBlockPlaced) {
                this.onBlockPlaced(i, j, this.currentBlock.color);
            }
            
            // 检查游戏结束（随机模拟）
            if (Math.random() < 0.01) {
                this.endGame(false);
            }
            
            // 获取下一个方块
            this.currentBlock = this.blockQueue.shift();
            this.blockQueue.push(this.generateRandomBlock());
        }
    }
    
    endGame(isWinner = false) {
        this.gameOver = true;
        this.isAlive = false;
        this.failed = !isWinner;
        
        if (this.onGameOver) {
            this.onGameOver(this.score, isWinner);
        }
    }
    
    fail() {
        this.failed = true;
        this.isAlive = false;
    }
    
    setScore(score) {
        this.score = score;
    }
    
    setGridState(grid) {
        this.hexGrid = JSON.parse(JSON.stringify(grid));
    }
}

// 多人对战管理器
class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.currentUser = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: '玩家' + Math.floor(Math.random() * 1000)
        };
        
        this.currentRoom = null;
        this.players = [];
        this.games = {};
        
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onGameStarted = null;
        this.onPlayerUpdate = null;
        this.onGameEnded = null;
    }
    
    connect() {
        // 连接到服务器（使用模拟数据，实际项目中需要真实服务器）
        console.log('连接到多人服务器...');
        
        // 模拟Socket连接
        this.socket = {
            emit: (event, data) => {
                console.log('发送事件:', event, data);
                this.handleServerEvent(event, data);
            },
            on: (event, callback) => {
                console.log('监听事件:', event);
            }
        };
    }
    
    createRoom() {
        // 创建房间
        const roomId = this.generateRoomId();
        this.currentRoom = roomId;
        
        // 模拟服务器响应
        setTimeout(() => {
            this.handleServerEvent('roomCreated', {
                roomId: roomId,
                hostId: this.currentUser.id,
                players: [this.currentUser]
            });
        }, 500);
    }
    
    joinRoom(roomId) {
        // 加入房间
        if (!roomId || roomId.length !== 6) {
            alert('请输入6位房间号');
            return;
        }
        
        this.currentRoom = roomId;
        
        // 模拟服务器响应
        setTimeout(() => {
            this.handleServerEvent('roomJoined', {
                roomId: roomId,
                hostId: 'user_123',
                players: [
                    { id: 'user_123', name: '房主玩家', isHost: true },
                    this.currentUser
                ]
            });
        }, 500);
    }
    
    leaveRoom() {
        // 离开房间
        this.currentRoom = null;
        this.players = [];
        this.games = {};
    }
    
    startGame() {
        // 开始游戏
        if (this.players.length < 2) {
            alert('至少需要2名玩家才能开始游戏');
            return;
        }
        
        // 模拟服务器响应
        setTimeout(() => {
            this.handleServerEvent('gameStarted', {
                players: this.players
            });
        }, 500);
    }
    
    generateRoomId() {
        // 生成6位房间号
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    handleServerEvent(event, data) {
        // 处理服务器事件
        switch (event) {
            case 'roomCreated':
                this.currentRoom = data.roomId;
                this.players = data.players;
                if (this.onRoomJoined) {
                    this.onRoomJoined(data.roomId, data.players, data.hostId);
                }
                break;
                
            case 'roomJoined':
                this.currentRoom = data.roomId;
                this.players = data.players;
                if (this.onRoomJoined) {
                    this.onRoomJoined(data.roomId, data.players, data.hostId);
                }
                break;
                
            case 'playerJoined':
                this.players.push(data.player);
                if (this.onPlayerJoined) {
                    this.onPlayerJoined(data.player);
                }
                break;
                
            case 'playerLeft':
                this.players = this.players.filter(p => p.id !== data.playerId);
                if (this.onPlayerLeft) {
                    this.onPlayerLeft(data.playerId);
                }
                break;
                
            case 'gameStarted':
                if (this.onGameStarted) {
                    this.onGameStarted(data.players);
                }
                break;
                
            case 'playerUpdate':
                if (this.onPlayerUpdate) {
                    this.onPlayerUpdate(data.playerId, data.update);
                }
                break;
                
            case 'gameEnded':
                if (this.onGameEnded) {
                    this.onGameEnded(data.results);
                }
                break;
        }
    }
    
    getRoomList() {
        // 获取房间列表（模拟）
        return [
            {
                id: '123456',
                players: 2,
                maxPlayers: 4,
                status: 'waiting'
            },
            {
                id: '654321',
                players: 1,
                maxPlayers: 4,
                status: 'waiting'
            },
            {
                id: '111111',
                players: 3,
                maxPlayers: 4,
                status: 'playing'
            }
        ];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HextrisGame, MultiplayerManager };
}