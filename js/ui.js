// UI管理器
class UIManager {
    constructor() {
        this.screens = {
            mainMenu: document.getElementById('mainMenu'),
            lobby: document.getElementById('lobbyScreen'),
            room: document.getElementById('roomScreen'),
            game: document.getElementById('gameScreen'),
            gameOver: document.getElementById('gameOverScreen')
        };
        
        this.multiplayerManager = new MultiplayerManager();
        this.currentGames = {};
        
        this.init();
    }
    
    init() {
        // 初始化Socket连接
        this.multiplayerManager.connect();
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 初始化回调
        this.initCallbacks();
    }
    
    bindEventListeners() {
        // 主菜单按钮
        document.getElementById('multiplayerBtn').addEventListener('click', () => {
            this.showScreen('lobby');
            this.loadRoomList();
        });
        
        document.getElementById('singlePlayerBtn').addEventListener('click', () => {
            this.startSinglePlayer();
        });
        
        // 房间大厅按钮
        document.getElementById('createRoomBtn').addEventListener('click', () => {
            this.multiplayerManager.createRoom();
        });
        
        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            const roomId = document.getElementById('joinRoomInput').value;
            this.multiplayerManager.joinRoom(roomId);
        });
        
        document.getElementById('backToMenuFromLobby').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // 房间内按钮
        document.getElementById('leaveRoomBtn').addEventListener('click', () => {
            this.multiplayerManager.leaveRoom();
            this.showScreen('lobby');
            this.loadRoomList();
        });
        
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.multiplayerManager.startGame();
        });
        
        // 游戏界面按钮
        document.getElementById('quitGameBtn').addEventListener('click', () => {
            this.endGame();
            this.showScreen('lobby');
        });
        
        // 游戏结束界面按钮
        document.getElementById('backToMenuFromOver').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
    }
    
    initCallbacks() {
        // 多人对战回调
        this.multiplayerManager.onRoomJoined = (roomId, players, hostId) => {
            this.showScreen('room');
            this.updateRoomUI(roomId, players, hostId);
        };
        
        this.multiplayerManager.onPlayerJoined = (player) => {
            this.updatePlayersList();
        };
        
        this.multiplayerManager.onPlayerLeft = (playerId) => {
            this.updatePlayersList();
        };
        
        this.multiplayerManager.onGameStarted = (players) => {
            this.startMultiplayerGame(players);
        };
        
        this.multiplayerManager.onGameEnded = (results) => {
            this.showGameResults(results);
        };
    }
    
    showScreen(screenName) {
        // 显示指定界面
        Object.keys(this.screens).forEach(key => {
            this.screens[key].classList.remove('active');
        });
        
        this.screens[screenName].classList.add('active');
    }
    
    loadRoomList() {
        // 加载房间列表
        const rooms = this.multiplayerManager.getRoomList();
        const roomListElement = document.getElementById('roomList');
        
        roomListElement.innerHTML = '';
        
        if (rooms.length === 0) {
            roomListElement.innerHTML = '<p style="color: #a0a0b8; text-align: center; grid-column: 1 / -1;">暂无在线房间</p>';
            return;
        }
        
        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.innerHTML = `
                <h4>房间号: ${room.id}</h4>
                <div class="room-info">
                    <span class="room-players">${room.players}/${room.maxPlayers} 人</span>
                    <span class="room-status ${room.status}">${room.status === 'waiting' ? '等待中' : '游戏中'}</span>
                </div>
            `;
            
            if (room.status === 'waiting') {
                roomElement.addEventListener('click', () => {
                    this.multiplayerManager.joinRoom(room.id);
                });
            }
            
            roomListElement.appendChild(roomElement);
        });
    }
    
    updateRoomUI(roomId, players, hostId) {
        // 更新房间UI
        document.getElementById('roomId').textContent = `房间号: ${roomId}`;
        
        const playerListElement = document.getElementById('playerList');
        playerListElement.innerHTML = '';
        
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = `player-item ${player.id === hostId ? 'host' : ''}`;
            playerElement.innerHTML = `
                <span class="player-name">${player.name}</span>
                ${player.id === hostId ? '<span class="host-tag">房主</span>' : ''}
            `;
            playerListElement.appendChild(playerElement);
        });
        
        // 更新开始游戏按钮状态
        const startGameBtn = document.getElementById('startGameBtn');
        const isHost = this.multiplayerManager.currentUser.id === hostId;
        
        startGameBtn.disabled = players.length < 2 || !isHost;
        startGameBtn.style.display = isHost ? 'inline-block' : 'none';
        
        // 更新房间状态
        const statusElement = document.getElementById('roomStatus');
        if (players.length >= 4) {
            statusElement.textContent = '房间已满，准备开始游戏...';
        } else {
            statusElement.textContent = `等待其他玩家... (${players.length}/4)`;
        }
    }
    
    updatePlayersList() {
        // 更新玩家列表
        const players = this.multiplayerManager.players;
        const hostId = players.find(p => p.isHost).id;
        this.updateRoomUI(this.multiplayerManager.currentRoom, players, hostId);
    }
    
    startSinglePlayer() {
        // 开始单人游戏 - 使用原有的游戏实现
        this.showScreen('game');
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = '';
        
        // 创建游戏区域 - 使用原有的canvas和界面结构
        const gameArea = document.createElement('div');
        gameArea.className = 'player-game-area single-player';
        gameArea.innerHTML = `
            <div class="player-header">
                <span class="player-game-name">单人游戏</span>
                <span class="player-score" id="singleScore">分数: 0</span>
            </div>
            <div class="hextris-container" style="position: relative;">
                <canvas id="canvas" class="game-canvas" width="600" height="600"></canvas>
                <div id="container">
                    <div id="helpScreen">
                        <div id="helpInner">
                            <img class="backButton" src="images/btn_back.svg" onclick="closeHelpScreen()">
                            <p class="help">H: Toggle this help screen</p>
                            <p class="help">A,S,D: Rotate hexagon</p>
                            <p class="help">Space: pause/resume game</p>
                            <p class="help">T: Toggle Twitter Console</p>
                            <p class="help">W: Toggle Gameplay Visualizer</p>
                        </div>
                    </div>
                    <div id="openSideBar">
                        <h3>HELP <img src="images/btn_help.svg" style="position: relative; top: 3px;"></h3>
                    </div>
                    <div class="helpMouse">
                        <div class="helpMouseInner"></div>
                        <img src="images/icon_arrows.svg" />
                    </div>
                    <div class="helpMouse helpMouseAlt">
                        <img src="images/icon_arrows.svg" />
                    </div>
                    <div id="pauseScreen">
                        <div id="resumeBtn"><p>resume</p></div>
                        <div id="restartBtn"><p>restart</p></div>
                        <div id="shareBtn"><p>share</p></div>
                    </div>
                    <div id="devtools"></div>
                </div>
                <div id="buttonCont">
                    <div class="buttonRow">
                        <div id="newScore" class="social-box"></div>
                    </div>
                </div>
            </div>
        `;
        gameContainer.appendChild(gameArea);
        
        // 初始化游戏
        setTimeout(() => {
            this.initializeSinglePlayerGame();
        }, 100);
    }
    
    initializeSinglePlayerGame() {
        // 初始化单人游戏 - 重置原有的游戏状态
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // 重置游戏状态变量
        window.gameState = 0;
        window.score = 0;
        window.prevScore = 0;
        window.MainHex = null;
        window.blocks = [];
        window.history = {};
        
        // 调用原有的游戏初始化函数
        if (typeof init === 'function') {
            init(true);
        }
        
        // 启动游戏主循环
        if (typeof animate === 'function') {
            animate();
        }
        
        // 绑定单人游戏的分数更新
        this.setupSinglePlayerScoreUpdate();
    }
    
    setupSinglePlayerScoreUpdate() {
        // 设置单人游戏分数更新
        const scoreElement = document.getElementById('singleScore');
        const updateScoreInterval = setInterval(() => {
            if (typeof score !== 'undefined') {
                scoreElement.textContent = `分数: ${score}`;
            }
            
            // 检查游戏是否结束
            if (typeof gameState !== 'undefined' && gameState === 3) {
                clearInterval(updateScoreInterval);
                // 显示游戏结束界面
                setTimeout(() => {
                    this.showSinglePlayerGameOver(score);
                }, 1000);
            }
        }, 100);
    }
    
    showSinglePlayerGameOver(finalScore) {
         // 显示单人游戏结束界面
         const results = [{
             name: '你',
             score: finalScore,
             isAlive: false
         }];
         
         this.showGameResults(results, true);
     }
    
    startMultiplayerGame(players) {
        // 开始多人游戏
        this.showScreen('game');
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = '';
        
        this.currentGames = {};
        let aliveCount = players.length;
        
        players.forEach((player, index) => {
            // 创建游戏区域
            const gameArea = document.createElement('div');
            gameArea.className = 'player-game-area';
            gameArea.id = `gameArea_${player.id}`;
            gameArea.innerHTML = `
                <div class="player-header">
                    <span class="player-game-name">${player.name}${player.isHost ? ' (房主)' : ''}</span>
                    <span class="player-score" id="score_${player.id}">分数: 0</span>
                </div>
                <canvas class="game-canvas" id="canvas_${player.id}" width="280" height="280"></canvas>
            </div>
            `;
            gameContainer.appendChild(gameArea);
            
            // 初始化游戏
            const canvas = document.getElementById(`canvas_${player.id}`);
            const isLocal = player.id === this.multiplayerManager.currentUser.id;
            const game = new HextrisGame(canvas, player.id, player.name, isLocal);
            
            game.onScoreChange = (score) => {
                document.getElementById(`score_${player.id}`).textContent = `分数: ${score}`;
            };
            
            game.onGameOver = (score, isWinner) => {
                document.getElementById(`gameArea_${player.id}`).classList.add('failed');
                aliveCount--;
                
                // 检查游戏结束
                if (aliveCount <= 1) {
                    setTimeout(() => {
                        this.endMultiplayerGame();
                    }, 1000);
                }
            };
            
            this.currentGames[player.id] = game;
            
            // 只绑定本地玩家的键盘事件
            if (isLocal) {
                this.bindGameKeys(game);
            }
        });
        
        // 同时开始所有游戏
        Object.values(this.currentGames).forEach(game => {
            game.startGame();
        });
    }
    
    bindGameKeys(game) {
        // 绑定游戏控制键
        const handleKeyPress = (e) => {
            if (!game.isAlive || game.gameOver) return;
            
            switch(e.key) {
                case 'a':
                case 'ArrowLeft':
                    game.moveBlock('left');
                    break;
                case 'd':
                case 'ArrowRight':
                    game.moveBlock('right');
                    break;
                case 'r':
                case 'ArrowUp':
                    game.rotateBlock();
                    break;
                case ' ':
                case 'ArrowDown':
                    game.placeBlock();
                    break;
            }
        };
        
        // 移除之前的事件监听器
        document.removeEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', handleKeyPress);
    }
    
    endMultiplayerGame() {
        // 结束多人游戏并显示结果
        const results = [];
        
        Object.values(this.currentGames).forEach(game => {
            results.push({
                playerName: game.playerName,
                score: game.score,
                isWinner: game.isAlive
            });
        });
        
        // 按分数排序
        results.sort((a, b) => b.score - a.score);
        
        this.showGameResults(results);
    }
    
    endGame() {
        // 结束当前游戏
        Object.values(this.currentGames).forEach(game => {
            game.gameOver = true;
        });
    }
    
    showGameResults(results) {
        // 显示游戏结果
        this.showScreen('gameOver');
        
        const rankingList = document.getElementById('rankingList');
        rankingList.innerHTML = '';
        
        results.forEach((result, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = `ranking-item ${result.isWinner ? 'winner' : ''}`;
            rankingItem.innerHTML = `
                <div class="ranking-rank ${index === 0 && result.isWinner ? 'first' : ''}">${index + 1}</div>
                <div class="ranking-player">
                    <div class="ranking-player-name">${result.playerName}</div>
                    <div class="ranking-player-score">最终分数: ${result.score}</div>
                </div>
                <div class="ranking-status ${result.isWinner ? 'winner' : 'loser'}">
                    ${result.isWinner ? '胜利' : '失败'}
                </div>
            `;
            rankingList.appendChild(rankingItem);
        });
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    new UIManager();
});