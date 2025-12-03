// 直播功能模块
var LiveStream = (function() {
    var ws = null;
    var isHost = false;
    var currentRoomId = null;
    var nickname = 'Player' + Math.floor(Math.random() * 1000);
    var danmakuList = [];
    var maxDanmaku = 10;
    var streamInterval = null;
    
    // 初始化WebSocket连接
    function initWebSocket() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            return;
        }
        
        ws = new WebSocket('ws://localhost:8765');
        
        ws.onopen = function() {
            console.log('WebSocket连接已建立');
            
            // 如果是打开直播大厅，自动获取房间列表
            if ($('#liveHall').hasClass('hidden') === false) {
                ws.send(JSON.stringify({
                    action: 'get_rooms'
                }));
            }
        };
        
        ws.onmessage = function(event) {
            var data = JSON.parse(event.data);
            handleMessage(data);
        };
        
        ws.onclose = function() {
            console.log('WebSocket连接已关闭');
            ws = null;
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket错误:', error);
        };
    }
    
    // 处理服务器消息
    function handleMessage(data) {
        switch (data.action) {
            case 'room_created':
                onRoomCreated(data);
                break;
            case 'room_joined':
                onRoomJoined(data);
                break;
            case 'room_list':
                updateRoomList(data.rooms);
                break;
            case 'game_state':
                updateGameState(data);
                break;
            case 'danmaku':
                addDanmaku(data);
                break;
            case 'viewer_joined':
                updateViewerCount(data.viewer_count);
                break;
            case 'viewer_left':
                updateViewerCount(data.viewer_count);
                break;
            case 'room_closed':
                onRoomClosed(data);
                break;
            case 'error':
                alert(data.message);
                break;
        }
    }
    
    // 房间创建成功
    function onRoomCreated(data) {
        currentRoomId = data.room_id;
        isHost = true;
        
        // 更新UI
        $('#liveStreamBtn').text('停止直播').addClass('active');
        $('#roomNumber').text(currentRoomId);
        $('#roomInfo').addClass('show');
        
        // 开始发送游戏状态
        startStreaming();
    }
    
    // 加入房间成功
    function onRoomJoined(data) {
        currentRoomId = data.room_id;
        isHost = false;
        
        // 更新UI
        $('#watchLive').removeClass('hidden');
        $('#hostNickname').text(data.host_nickname);
        $('#currentScore').text(data.current_score + ' 分');
        $('#gameTime').text(formatTime(data.game_time));
        $('#viewerCount').text(data.viewer_count + ' 观众');
    }
    
    // 更新房间列表
    function updateRoomList(rooms) {
        var roomList = $('#roomList');
        roomList.empty();
        
        if (rooms.length === 0) {
            roomList.html('<p style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">暂无直播房间</p>');
            return;
        }
        
        rooms.forEach(function(room) {
            var roomItem = $('<div class="room-item">');
            roomItem.html(`
                <h3>房间号: ${room.room_id}</h3>
                <div class="room-info-row">
                    <span>主播: ${room.nickname}</span>
                    <span>分数: ${room.current_score}</span>
                </div>
                <div class="room-info-row">
                    <span>观众: ${room.viewer_count}</span>
                    <span>正在直播</span>
                </div>
            `);
            
            roomItem.click(function() {
                joinRoom(room.room_id);
            });
            
            roomList.append(roomItem);
        });
    }
    
    // 更新游戏状态（观众端）
    function updateGameState(data) {
        if (!isHost && data.state) {
            // 在观众端更新游戏画面
            renderStreamCanvas(data.state);
            
            // 更新直播信息
            if (data.score !== undefined) {
                $('#currentScore').text(data.score + ' 分');
            }
            if (data.game_time !== undefined) {
                $('#gameTime').text(formatTime(data.game_time));
            }
            if (data.host_nickname !== undefined) {
                $('#hostNickname').text(data.host_nickname);
            }
            if (data.viewer_count !== undefined) {
                $('#viewerCount').text(data.viewer_count + ' 观众');
            }
        }
    }
    
    // 添加弹幕
    function addDanmaku(data) {
        danmakuList.push({
            nickname: data.nickname,
            content: data.content,
            timestamp: data.timestamp
        });
        
        // 限制弹幕数量
        if (danmakuList.length > maxDanmaku) {
            danmakuList.shift();
        }
        
        // 更新弹幕显示
        updateDanmakuDisplay();
    }
    
    // 更新弹幕显示
    function updateDanmakuDisplay() {
        var container = $('#danmakuContainer');
        container.empty();
        
        danmakuList.forEach(function(danmaku) {
            var danmakuItem = $('<div class="danmaku-item">');
            danmakuItem.html(`<span class="nickname">${danmaku.nickname}:</span>${danmaku.content}`);
            container.append(danmakuItem);
        });
        
        // 滚动到底部
        container.scrollTop(container[0].scrollHeight);
    }
    
    // 更新观众数量
    function updateViewerCount(count) {
        if (isHost) {
            // 主播端显示观众数量
            $('#viewerCount').text(count + ' 观众');
        }
    }
    
    // 房间关闭
    function onRoomClosed(data) {
        alert(data.message);
        exitWatchMode();
    }
    
    // 开始直播
    function startLiveStream() {
        initWebSocket();
        
        // 获取昵称
        var inputNickname = prompt('请输入您的昵称:', nickname);
        if (inputNickname) {
            nickname = inputNickname;
        }
        
        // 确保WebSocket连接建立后发送创建房间请求
        function sendCreateRequest() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    action: 'create_room',
                    nickname: nickname
                }));
            } else {
                setTimeout(sendCreateRequest, 100);
            }
        }
        
        sendCreateRequest();
    }
    
    // 停止直播
    function stopLiveStream() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                action: 'leave_room'
            }));
        }
        
        // 停止发送游戏状态
        stopStreaming();
        
        // 重置UI
        $('#liveStreamBtn').text('开始直播').removeClass('active');
        $('#roomInfo').removeClass('show');
        
        isHost = false;
        currentRoomId = null;
    }
    
    // 打开直播大厅
    function openLiveHall() {
        initWebSocket();
        
        // 显示直播大厅
        $('#liveHall').removeClass('hidden');
    }
    
    // 关闭直播大厅
    function closeLiveHall() {
        $('#liveHall').addClass('hidden');
    }
    
    // 加入房间
    function joinRoom(roomId) {
        initWebSocket();
        
        // 获取昵称
        var inputNickname = prompt('请输入您的昵称:', nickname);
        if (inputNickname) {
            nickname = inputNickname;
        }
        
        // 确保WebSocket连接建立后发送加入请求
        function sendJoinRequest() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    action: 'join_room',
                    room_id: roomId,
                    nickname: nickname
                }));
                
                // 关闭直播大厅
                closeLiveHall();
            } else {
                setTimeout(sendJoinRequest, 100);
            }
        }
        
        sendJoinRequest();
    }
    
    // 退出观看模式
    function exitWatchMode() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                action: 'leave_room'
            }));
        }
        
        // 清空弹幕
        danmakuList = [];
        updateDanmakuDisplay();
        
        // 隐藏观看界面
        $('#watchLive').addClass('hidden');
        
        currentRoomId = null;
        isHost = false;
    }
    
    // 发送弹幕
    function sendDanmaku(content) {
        if (!content.trim() || !ws || ws.readyState !== WebSocket.OPEN) {
            return;
        }
        
        ws.send(JSON.stringify({
            action: 'send_danmaku',
            nickname: nickname,
            content: content.trim(),
            timestamp: Date.now()
        }));
    }
    
    // 开始发送游戏状态（主播端）
    function startStreaming() {
        streamInterval = setInterval(function() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                var gameState = getCurrentGameState();
                
                ws.send(JSON.stringify({
                    action: 'update_game_state',
                    state: gameState,
                    score: score,
                    game_time: Date.now() - startTime
                }));
            }
        }, 100); // 每100ms发送一次，确保延迟不超过2秒
    }
    
    // 停止发送游戏状态
    function stopStreaming() {
        if (streamInterval) {
            clearInterval(streamInterval);
            streamInterval = null;
        }
    }
    
    // 获取当前游戏状态
    function getCurrentGameState() {
        // 收集游戏状态信息
        return {
            blocks: blocks.map(function(block) {
                return {
                    lane: block.lane,
                    color: block.color,
                    x: block.x,
                    y: block.y,
                    settled: block.settled
                };
            }),
            hex: {
                rotation: MainHex.rotation,
                blocks: MainHex.blocks.map(function(side) {
                    return side.map(function(block) {
                        return {
                            color: block.color,
                            height: block.height,
                            deleted: block.deleted
                        };
                    });
                })
            },
            score: score,
            comboTime: comboTime,
            gameTime: Date.now() - startTime
        };
    }
    
    // 渲染游戏画面到观众端
    function renderStreamCanvas(state) {
        var container = $('#streamCanvas');
        
        // 这里简化处理，实际应该创建canvas并渲染游戏画面
        // 为了演示，我们显示一些基本信息
        var html = `
            <div style="color: white; text-align: center; font-family: 'Exo', sans-serif;">
                <h3>直播画面</h3>
                <p>分数: ${state.score}</p>
                <p>游戏时间: ${formatTime(state.gameTime)}</p>
                <p>组合时间: ${state.comboTime}</p>
                <p>方块数量: ${state.blocks.length}</p>
            </div>
        `;
        
        container.html(html);
    }
    
    // 格式化时间
    function formatTime(milliseconds) {
        var seconds = Math.floor(milliseconds / 1000);
        var minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    
    // 初始化事件监听
    function initEventListeners() {
        // 开始/停止直播按钮
        $('#liveStreamBtn').click(function() {
            if (!isHost) {
                startLiveStream();
            } else {
                stopLiveStream();
            }
        });
        
        // 观看直播按钮
        $('#watchLiveBtn').click(function() {
            openLiveHall();
        });
        
        // 返回主菜单按钮
        $('#backToMenuBtn').click(function() {
            closeLiveHall();
        });
        
        // 返回大厅按钮
        $('#backToHallBtn').click(function() {
            exitWatchMode();
            openLiveHall();
        });
        
        // 发送弹幕按钮
        $('#sendDanmakuBtn').click(function() {
            var content = $('#danmakuInput').val();
            sendDanmaku(content);
            $('#danmakuInput').val('');
        });
        
        // 回车键发送弹幕
        $('#danmakuInput').keypress(function(e) {
            if (e.which === 13) {
                var content = $(this).val();
                sendDanmaku(content);
                $(this).val('');
            }
        });
    }
    
    // 初始化直播模块
    function init() {
        initEventListeners();
        
        // 页面加载时获取昵称
        var savedNickname = localStorage.getItem('hextris_nickname');
        if (savedNickname) {
            nickname = savedNickname;
        }
    }
    
    // 暴露公共方法
    return {
        init: init,
        startLiveStream: startLiveStream,
        stopLiveStream: stopLiveStream,
        openLiveHall: openLiveHall,
        closeLiveHall: closeLiveHall,
        joinRoom: joinRoom,
        exitWatchMode: exitWatchMode,
        sendDanmaku: sendDanmaku
    };
})();

// 页面加载完成后初始化直播模块
$(document).ready(function() {
    LiveStream.init();
});