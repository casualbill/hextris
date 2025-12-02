// Hextris 多人对战服务器
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.static('.'));

// 房间管理
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.maxPlayersPerRoom = 4;
    }
    
    // 生成6位房间号
    generateRoomId() {
        let roomId;
        do {
            roomId = Math.floor(100000 + Math.random() * 900000).toString();
        } while (this.rooms.has(roomId));
        return roomId;
    }
    
    // 创建房间
    createRoom(hostId, hostName) {
        const roomId = this.generateRoomId();
        
        const room = {
            id: roomId,
            hostId: hostId,
            players: new Map(),
            gameStarted: false,
            gameState: null,
            createdAt: Date.now()
        };
        
        room.players.set(hostId, {
            id: hostId,
            name: hostName,
            isHost: true,
            score: 0,
            isAlive: true,
            gameData: null
        });
        
        this.rooms.set(roomId, room);
        return room;
    }
    
    // 加入房间
    joinRoom(roomId, playerId, playerName) {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        
        if (room.gameStarted) return null;
        
        if (room.players.size >= this.maxPlayersPerRoom) return null;
        
        room.players.set(playerId, {
            id: playerId,
            name: playerName,
            isHost: false,
            score: 0,
            isAlive: true,
            gameData: null
        });
        
        return room;
    }
    
    // 离开房间
    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        const player = room.players.get(playerId);
        if (!player) return;
        
        room.players.delete(playerId);
        
        // 如果房主离开，解散房间
        if (player.isHost || room.players.size === 0) {
            this.rooms.delete(roomId);
        } else if (!room.gameStarted && room.players.size > 0) {
            // 重新选举房主
            const newHost = room.players.values().next().value;
            room.hostId = newHost.id;
            newHost.isHost = true;
        }
    }
    
    // 获取房间
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    
    // 获取所有房间列表
    getRoomList() {
        const rooms = [];
        
        this.rooms.forEach(room => {
            rooms.push({
                id: room.id,
                players: room.players.size,
                maxPlayers: this.maxPlayersPerRoom,
                status: room.gameStarted ? 'playing' : 'waiting',
                createdAt: room.createdAt
            });
        });
        
        return rooms.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    // 开始游戏
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        
        if (room.gameStarted) return false;
        
        if (room.players.size < 2) return false;
        
        room.gameStarted = true;
        room.gameState = {
            startTime: Date.now(),
            blockSequence: this.generateBlockSequence(),
            players: Array.from(room.players.values())
        };
        
        return true;
    }
    
    // 生成方块序列
    generateBlockSequence() {
        const sequence = [];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        
        for (let i = 0; i < 100; i++) {
            sequence.push({
                color: colors[Math.floor(Math.random() * colors.length)],
                type: Math.floor(Math.random() * 3),
                timestamp: i * 1000
            });
        }
        
        return sequence;
    }
    
    // 更新玩家状态
    updatePlayer(roomId, playerId, updateData) {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        
        const player = room.players.get(playerId);
        if (!player) return false;
        
        Object.assign(player, updateData);
        
        return true;
    }
    
    // 检查游戏结束
    checkGameEnd(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.gameStarted) return false;
        
        const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
        
        if (alivePlayers.length <= 1) {
            return true;
        }
        
        return false;
    }
    
    // 获取游戏结果
    getGameResults(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return [];
        
        const results = Array.from(room.players.values()).map(player => ({
            id: player.id,
            name: player.name,
            score: player.score,
            isAlive: player.isAlive
        }));
        
        // 按分数排序，存活玩家优先
        results.sort((a, b) => {
            if (a.isAlive && !b.isAlive) return -1;
            if (!a.isAlive && b.isAlive) return 1;
            return b.score - a.score;
        });
        
        return results;
    }
}

const roomManager = new RoomManager();

// Socket.IO连接处理
io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);
    
    // 获取房间列表
    socket.on('getRooms', () => {
        const rooms = roomManager.getRoomList();
        socket.emit('roomList', rooms);
    });
    
    // 创建房间
    socket.on('createRoom', (playerName) => {
        const room = roomManager.createRoom(socket.id, playerName || '玩家' + Math.floor(Math.random() * 1000));
        
        socket.join(room.id);
        socket.currentRoom = room.id;
        
        socket.emit('roomCreated', {
            roomId: room.id,
            hostId: room.hostId,
            players: Array.from(room.players.values())
        });
        
        // 广播房间列表更新
        io.emit('roomListUpdated', roomManager.getRoomList());
        
        console.log('房间创建:', room.id, '由玩家:', socket.id);
    });
    
    // 加入房间
    socket.on('joinRoom', ({ roomId, playerName }) => {
        const room = roomManager.joinRoom(roomId, socket.id, playerName || '玩家' + Math.floor(Math.random() * 1000));
        
        if (!room) {
            socket.emit('error', '无法加入房间：房间不存在、已满或游戏已开始');
            return;
        }
        
        socket.join(roomId);
        socket.currentRoom = roomId;
        
        // 通知房间内其他玩家
        socket.to(roomId).emit('playerJoined', {
            player: room.players.get(socket.id)
        });
        
        socket.emit('roomJoined', {
            roomId: room.id,
            hostId: room.hostId,
            players: Array.from(room.players.values())
        });
        
        // 广播房间列表更新
        io.emit('roomListUpdated', roomManager.getRoomList());
        
        console.log('玩家加入房间:', socket.id, '房间:', roomId);
    });
    
    // 离开房间
    socket.on('leaveRoom', () => {
        if (!socket.currentRoom) return;
        
        const room = roomManager.getRoom(socket.currentRoom);
        const wasHost = room && room.hostId === socket.id;
        
        roomManager.leaveRoom(socket.currentRoom, socket.id);
        socket.leave(socket.currentRoom);
        
        // 通知房间内其他玩家
        socket.to(socket.currentRoom).emit('playerLeft', {
            playerId: socket.id,
            wasHost: wasHost
        });
        
        // 广播房间列表更新
        io.emit('roomListUpdated', roomManager.getRoomList());
        
        console.log('玩家离开房间:', socket.id, '房间:', socket.currentRoom);
        
        socket.currentRoom = null;
    });
    
    // 开始游戏
    socket.on('startGame', () => {
        if (!socket.currentRoom) return;
        
        const room = roomManager.getRoom(socket.currentRoom);
        if (!room || room.hostId !== socket.id) {
            socket.emit('error', '只有房主可以开始游戏');
            return;
        }
        
        const success = roomManager.startGame(socket.currentRoom);
        
        if (!success) {
            socket.emit('error', '无法开始游戏：玩家不足或游戏已开始');
            return;
        }
        
        // 通知房间内所有玩家开始游戏
        io.to(socket.currentRoom).emit('gameStarted', {
            players: Array.from(room.players.values()),
            blockSequence: room.gameState.blockSequence,
            startTime: room.gameState.startTime
        });
        
        // 广播房间列表更新
        io.emit('roomListUpdated', roomManager.getRoomList());
        
        console.log('游戏开始:', socket.currentRoom);
    });
    
    // 更新玩家状态
    socket.on('updatePlayer', (updateData) => {
        if (!socket.currentRoom) return;
        
        roomManager.updatePlayer(socket.currentRoom, socket.id, updateData);
        
        // 广播给房间内其他玩家
        socket.to(socket.currentRoom).emit('playerUpdated', {
            playerId: socket.id,
            update: updateData
        });
        
        // 检查游戏是否结束
        if (roomManager.checkGameEnd(socket.currentRoom)) {
            const results = roomManager.getGameResults(socket.currentRoom);
            
            io.to(socket.currentRoom).emit('gameEnded', {
                results: results
            });
            
            console.log('游戏结束:', socket.currentRoom, '结果:', results);
        }
    });
    
    // 获取游戏状态
    socket.on('getGameState', () => {
        if (!socket.currentRoom) return;
        
        const room = roomManager.getRoom(socket.currentRoom);
        if (!room || !room.gameStarted) return;
        
        socket.emit('gameState', {
            players: Array.from(room.players.values()),
            gameState: room.gameState
        });
    });
    
    // 用户断开连接
    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id);
        
        if (socket.currentRoom) {
            const room = roomManager.getRoom(socket.currentRoom);
            const wasHost = room && room.hostId === socket.id;
            
            roomManager.leaveRoom(socket.currentRoom, socket.id);
            
            // 通知房间内其他玩家
            socket.to(socket.currentRoom).emit('playerLeft', {
                playerId: socket.id,
                wasHost: wasHost
            });
            
            // 广播房间列表更新
            io.emit('roomListUpdated', roomManager.getRoomList());
        }
    });
});

// 定时清理空房间
setInterval(() => {
    const now = Date.now();
    roomManager.rooms.forEach((room, roomId) => {
        // 清理创建超过1小时且无玩家的房间
        if (room.players.size === 0 && (now - room.createdAt) > 3600000) {
            roomManager.rooms.delete(roomId);
            console.log('清理空房间:', roomId);
        }
    });
}, 60000); // 每分钟清理一次

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Hextris多人服务器运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT} 开始游戏`);
});