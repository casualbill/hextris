// 直播功能相关的JavaScript代码

let socket = null;
let isLive = false;
let currentRoomId = null;
let hostName = 'Player';

// 初始化Socket连接
function initSocket() {
    socket = io('http://localhost:5001');
    
    // 连接成功
    socket.on('connect', function() {
        console.log('Socket connected');
    });
    
    // 连接断开
    socket.on('disconnect', function() {
        console.log('Socket disconnected');
    });
    
    // 房间创建成功
    socket.on('room_created', function(data) {
        currentRoomId = data.room_id;
        isLive = true;
        
        // 更新UI
        $('#liveBtn').text('停止直播');
        $('#liveBtn').addClass('live');
        $('#liveInfo').addClass('show');
        $('#roomId').text('房间号: ' + currentRoomId);
        
        console.log('Room created: ' + currentRoomId);
    });
    
    // 直播停止
    socket.on('broadcast_stopped', function() {
        stopLive();
    });
    
    // 主播断开连接
    socket.on('host_disconnected', function() {
        stopLive();
    });
    
    // 观众数量更新
    socket.on('viewer_count_updated', function(data) {
        $('#viewerCount').text('观众: ' + data.viewer_count);
    });
    
    // 游戏状态更新
    socket.on('game_state_updated', function(data) {
        // 这里处理游戏状态的更新，例如更新分数、游戏画面等
        if (data.game_state) {
            // 观众端更新游戏状态
            if (!isLive) {
                updateGameStateFromHost(data.game_state);
            }
        }
    });
    
    // 弹幕消息接收
    socket.on('message_received', function(data) {
        // 这里处理弹幕消息的显示
        showDanmaku(data.sender_name, data.message);
    });
}

// 开始直播
function startLive() {
    if (!socket) {
        initSocket();
    }
    
    // 获取玩家名称（可以从本地存储或其他地方获取）
    hostName = Cookies.get('playerName') || 'Player';
    
    // 发送创建房间的请求
    socket.emit('create_room', {
        host_name: hostName
    });
}

// 停止直播
function stopLive() {
    if (socket && currentRoomId) {
        socket.emit('stop_broadcast', {
            room_id: currentRoomId
        });
    }
    
    // 重置状态
    isLive = false;
    currentRoomId = null;
    
    // 更新UI
    $('#liveBtn').text('开始直播');
    $('#liveBtn').removeClass('live');
    $('#liveInfo').removeClass('show');
    
    console.log('Live stopped');
}

// 切换直播状态
function toggleLive() {
    if (isLive) {
        stopLive();
    } else {
        startLive();
    }
}

// 发送游戏状态更新
function sendGameStateUpdate(gameState) {
    if (socket && currentRoomId && isLive) {
        socket.emit('update_game_state', {
            room_id: currentRoomId,
            game_state: gameState
        });
    }
}

// 发送弹幕消息
function sendDanmaku(message, senderName) {
    if (socket && currentRoomId) {
        socket.emit('send_message', {
            room_id: currentRoomId,
            message: message,
            sender_name: senderName
        });
    }
}

// 从主播更新游戏状态
function updateGameStateFromHost(gameState) {
    // 这里实现从主播同步游戏状态的逻辑
    // 例如更新分数、游戏板、当前方块等
    console.log('Game state updated from host:', gameState);
    
    // 示例：更新分数
    if (gameState.score !== undefined) {
        score = gameState.score;
    }
    
    // 示例：更新游戏板
    if (gameState.board !== undefined) {
        // 更新游戏板数据
        board = gameState.board;
    }
    
    // 示例：更新当前方块
    if (gameState.currentBlock !== undefined) {
        // 更新当前方块数据
        currentBlock = gameState.currentBlock;
    }
}

// 显示弹幕
function showDanmaku(senderName, message) {
    // 这里实现弹幕的显示逻辑
    // 例如在游戏画面右侧添加滚动的弹幕
    console.log('Danmaku:', senderName, ':', message);
    
    // 示例：创建弹幕元素
    const danmakuElement = $('<div class="danmaku"></div>');
    danmakuElement.text(senderName + ': ' + message);
    
    // 添加到弹幕容器
    $('#danmakuContainer').append(danmakuElement);
    
    // 设置动画（从右向左滚动）
    danmakuElement.animate({
        left: '-100%'
    }, 5000, function() {
        // 动画结束后移除元素
        $(this).remove();
    });
}

// 页面加载完成后初始化
$(document).ready(function() {
    // 绑定直播按钮点击事件
    $('#liveBtn').click(function() {
        toggleLive();
    });
});
