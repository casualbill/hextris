// 多人对战核心逻辑
let multiplayerState = {
    isMultiplayer: false,
    currentRoom: null,
    currentPlayer: {
        id: null,
        nickname: `玩家${Math.floor(Math.random() * 1000)}`,
        isHost: false,
        isAlive: true,
        score: 0
    },
    players: [],
    rooms: []
};

// WebSocket连接
let ws;
function connectToServer() {
    // 尝试连接到WebSocket服务器
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Connected to server');
    };
    
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
    };
    
    ws.onclose = () => {
        console.log('Disconnected from server');
        swal("连接断开", "与服务器的连接已断开，请刷新页面重试", "error");
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        swal("连接错误", "无法连接到服务器，请检查服务器是否运行", "error");
    };
}

function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

// 处理服务器消息
function handleServerMessage(message) {
    switch (message.type) {
        case 'clientId':
            multiplayerState.currentPlayer.id = message.id;
            break;
        case 'roomCreated':
            multiplayerState.currentRoom = { id: message.roomId };
            multiplayerState.currentPlayer = message.player;
            multiplayerState.players = message.players;
            showRoomInterface();
            break;
        case 'roomJoined':
            multiplayerState.currentRoom = { id: message.roomId };
            multiplayerState.currentPlayer = message.player;
            multiplayerState.players = message.players;
            showRoomInterface();
            break;
        case 'playerJoined':
            multiplayerState.players = message.players;
            updatePlayerList();
            break;
        case 'playerLeft':
            multiplayerState.players = message.players;
            updatePlayerList();
            break;
        case 'roomDestroyed':
            multiplayerState.currentRoom = null;
            multiplayerState.currentPlayer.isHost = false;
            swal("房间已解散", message.reason, "info");
            showLobbyInterface();
            break;
        case 'gameStarted':
            multiplayerState.isMultiplayer = true;
            multiplayerState.blockSequence = message.blockSequence;
            initMultiplayerGame();
            break;
        case 'gameEnded':
            multiplayerState.isMultiplayer = false;
            showGameResult(message.winner, message.rankings);
            break;
        case 'playerFailed':
            const player = multiplayerState.players.find(p => p.id === message.playerId);
            if (player) {
                player.isAlive = false;
            }
            break;
        case 'scoreUpdated':
            const scorePlayer = multiplayerState.players.find(p => p.id === message.playerId);
            if (scorePlayer) {
                scorePlayer.score = message.score;
            }
            break;
        case 'roomList':
            multiplayerState.rooms = message.rooms;
            updateRoomList();
            break;
        case 'error':
            swal("错误", message.message, "error");
            break;
    }
}

// 创建房间
function createRoom() {
    sendMessage({ type: 'createRoom', nickname: multiplayerState.currentPlayer.nickname });
}

// 加入房间
function joinRoom(roomId) {
    sendMessage({ type: 'joinRoom', roomId, nickname: multiplayerState.currentPlayer.nickname });
}

// 离开房间
function leaveRoom() {
    sendMessage({ type: 'leaveRoom' });
    multiplayerState.currentRoom = null;
    multiplayerState.currentPlayer.isHost = false;
    showLobbyInterface();
}

// 开始游戏
function startGame() {
    sendMessage({ type: 'startGame' });
}

// 玩家失败
function playerFailed(playerId) {
    sendMessage({ type: 'playerFailed' });
}

// 更新分数
function updateScore(score) {
    multiplayerState.currentPlayer.score = score;
    sendMessage({ type: 'updateScore', score });
}

// 结束游戏
function endGame(winner) {
    multiplayerState.isMultiplayer = false;
    showGameResult(winner);
}

// 显示大厅界面
function showLobbyInterface() {
    hideAllInterfaces();
    $('#lobbyInterface').show();
    sendMessage({ type: 'getRoomList' });
}

// 显示房间界面
function showRoomInterface() {
    hideAllInterfaces();
    $('#roomInterface').show();
    updatePlayerList();
}

// 更新房间列表
function updateRoomList() {
    const roomList = $('#roomList');
    roomList.empty();
    
    multiplayerState.rooms.forEach(room => {
        const roomItem = $(`
            <div class='roomItem'>
                <div>房间号: ${room.id}</div>
                <div>人数: ${room.playerCount}/${room.maxPlayers}</div>
                <div>状态: 等待中</div>
                <button onclick="joinRoom('${room.id}')">加入</button>
            </div>
        `);
        roomList.append(roomItem);
    });
}

// 更新玩家列表
function updatePlayerList() {
    const playerList = $('#playerList');
    playerList.empty();
    
    multiplayerState.currentRoom.players.forEach(player => {
        const playerItem = $(`
            <div class='playerItem'>
                <span>${player.nickname}${player.isHost ? ' (房主)' : ''}</span>
            </div>
        `);
        playerList.append(playerItem);
    });
    
    // 房主显示开始游戏按钮
    if (multiplayerState.currentPlayer.isHost) {
        $('#startGameBtn').show();
        $('#startGameBtn').prop('disabled', multiplayerState.currentRoom.players.length < 2);
    } else {
        $('#startGameBtn').hide();
    }
}

// 隐藏所有界面
function hideAllInterfaces() {
    $('#startScreen').hide();
    $('#lobbyInterface').hide();
    $('#roomInterface').hide();
    $('#gameResultInterface').hide();
}

// 初始化多人游戏
function initMultiplayerGame() {
    hideAllInterfaces();
    gameState = 1;
    // 这里需要修改游戏渲染逻辑来支持多玩家分屏显示
}

// 显示游戏结果
function showGameResult(winner, rankings = null) {
    hideAllInterfaces();
    const resultContainer = $('#gameResultContainer');
    resultContainer.empty();
    
    const rankedPlayers = rankings || [...multiplayerState.players].sort((a, b) => {
        if (a.isAlive) return -1;
        if (b.isAlive) return 1;
        return b.score - a.score;
    });
    
    rankedPlayers.forEach((player, index) => {
        const resultItem = $(`
            <div class='resultItem'>
                <span>${index + 1}. ${player.nickname}</span>
                <span>分数: ${player.score}</span>
                <span>${player.id === winner?.id ? '胜利' : '失败'}</span>
            </div>
        `);
        resultContainer.append(resultItem);
    });
    
    $('#gameResultInterface').show();
}

// 初始化多人对战UI
function initMultiplayerUI() {
    // 添加大厅界面
    const lobbyHTML = `
        <div id='lobbyInterface' class='overlay' style='display:none;'>
            <div class='lobbyContainer'>
                <h1>房间大厅</h1>
                <div class='lobbyButtons'>
                    <button onclick='createRoom()'>创建房间</button>
                    <div class='joinRoom'>
                        <input type='text' id='joinRoomId' placeholder='输入6位房间号' maxlength='6'>
                        <button onclick='joinRoom($("#joinRoomId").val())'>加入房间</button>
                    </div>
                </div>
                <div id='roomList' class='roomList'></div>
                <button onclick='showStartScreen()'>返回主菜单</button>
            </div>
        </div>
    `;
    
    // 添加房间界面
    const roomHTML = `
        <div id='roomInterface' class='overlay' style='display:none;'>
            <div class='roomContainer'>
                <h1>房间 ${multiplayerState.currentRoom?.id || ''}</h1>
                <div id='playerList' class='playerList'></div>
                <button id='startGameBtn' onclick='startGame()' disabled>开始游戏</button>
                <button onclick='leaveRoom()'>离开房间</button>
            </div>
        </div>
    `;
    
    // 添加游戏结果界面
    const resultHTML = `
        <div id='gameResultInterface' class='overlay' style='display:none;'>
            <div class='resultContainer'>
                <h1>游戏结束</h1>
                <div id='gameResultContainer' class='gameResultContainer'></div>
                <button onclick='showLobbyInterface()'>返回大厅</button>
                <button onclick='showStartScreen()'>返回主菜单</button>
            </div>
        </div>
    `;
    
    $('body').append(lobbyHTML);
    $('body').append(roomHTML);
    $('body').append(resultHTML);
}

// 显示开始界面
function showStartScreen() {
    hideAllInterfaces();
    $('#startBtn').show();
    gameState = 0;
}

// 页面加载完成后初始化
$(document).ready(function() {
    initMultiplayerUI();
    connectToServer();
    
    // 在主菜单添加多人对战按钮
    const multiplayerBtn = $(
        '<div id="multiplayerBtn" style="position:absolute;left:50%;top:70%;transform:translate(-50%, 0);cursor:pointer;padding:10px 20px;background:rgba(255,255,255,0.8);border-radius:5px;font-family:Exo;font-size:20px;z-index:100000000;">多人对战</div>'
    );
    multiplayerBtn.click(showLobbyInterface);
    $('body').append(multiplayerBtn);
});