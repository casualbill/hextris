const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// 服务静态文件
app.use(express.static(path.join(__dirname, '.')));

// 存储所有房间
const rooms = new Map();

// 存储所有连接的客户端
const clients = new Map();

class Room {
    constructor(roomId, hostId) {
        this.id = roomId;
        this.hostId = hostId;
        this.players = new Map();
        this.maxPlayers = 4;
        this.status = 'waiting'; // waiting, playing, finished
        this.blockSequence = [];
        this.gameStartTime = null;
    }

    addPlayer(player) {
        if (this.players.size >= this.maxPlayers) return false;
        this.players.set(player.id, player);
        return true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        
        // 如果房主离开，解散房间
        if (playerId === this.hostId) {
            this.broadcast({ type: 'roomDestroyed', reason: 'hostLeft' });
            rooms.delete(this.id);
        }
    }

    broadcast(message, excludeId = null) {
        this.players.forEach((player, id) => {
            if (id !== excludeId && clients.has(id)) {
                const client = clients.get(id);
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            }
        });
    }

    generateBlockSequence() {
        this.blockSequence = [];
        for (let i = 0; i < 1000; i++) {
            this.blockSequence.push({
                lane: Math.floor(Math.random() * 6),
                color: ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71'][Math.floor(Math.random() * 4)]
            });
        }
    }

    startGame() {
        this.status = 'playing';
        this.gameStartTime = Date.now();
        this.generateBlockSequence();
        
        // 初始化所有玩家状态
        this.players.forEach(player => {
            player.isAlive = true;
            player.score = 0;
        });
        
        this.broadcast({
            type: 'gameStarted',
            blockSequence: this.blockSequence,
            startTime: this.gameStartTime
        });
    }

    playerFailed(playerId) {
        const player = this.players.get(playerId);
        if (!player) return;
        
        player.isAlive = false;
        
        // 检查是否只剩一名玩家
        const alivePlayers = Array.from(this.players.values()).filter(p => p.isAlive);
        
        if (alivePlayers.length === 1) {
            this.status = 'finished';
            const winner = alivePlayers[0];
            
            this.broadcast({
                type: 'gameEnded',
                winner: winner,
                rankings: Array.from(this.players.values()).sort((a, b) => {
                    if (a.isAlive) return -1;
                    if (b.isAlive) return 1;
                    return b.score - a.score;
                })
            });
        } else {
            this.broadcast({ type: 'playerFailed', playerId });
        }
    }

    updatePlayerScore(playerId, score) {
        const player = this.players.get(playerId);
        if (player) {
            player.score = score;
            this.broadcast({ type: 'scoreUpdated', playerId, score });
        }
    }
}

wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 10);
    clients.set(clientId, ws);
    
    console.log(`Client connected: ${clientId}`);
    
    // 发送客户端ID
    ws.send(JSON.stringify({ type: 'clientId', id: clientId }));
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'createRoom':
                    handleCreateRoom(clientId, message.nickname);
                    break;
                case 'joinRoom':
                    handleJoinRoom(clientId, message.roomId, message.nickname);
                    break;
                case 'leaveRoom':
                    handleLeaveRoom(clientId);
                    break;
                case 'startGame':
                    handleStartGame(clientId);
                    break;
                case 'playerFailed':
                    handlePlayerFailed(clientId);
                    break;
                case 'updateScore':
                    handleUpdateScore(clientId, message.score);
                    break;
                case 'getRoomList':
                    handleGetRoomList(clientId);
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        handleLeaveRoom(clientId);
        clients.delete(clientId);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function handleCreateRoom(clientId, nickname) {
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    const room = new Room(roomId, clientId);
    
    const player = {
        id: clientId,
        nickname: nickname || `玩家${Math.floor(Math.random() * 1000)}`,
        isHost: true,
        isAlive: true,
        score: 0
    };
    
    room.addPlayer(player);
    rooms.set(roomId, room);
    
    clients.get(clientId).send(JSON.stringify({
        type: 'roomCreated',
        roomId: roomId,
        player: player,
        players: Array.from(room.players.values())
    }));
    
    console.log(`Room created: ${roomId} by ${clientId}`);
}

function handleJoinRoom(clientId, roomId, nickname) {
    const room = rooms.get(roomId);
    
    if (!room) {
        clients.get(clientId).send(JSON.stringify({
            type: 'error',
            message: '房间不存在'
        }));
        return;
    }
    
    if (room.status !== 'waiting') {
        clients.get(clientId).send(JSON.stringify({
            type: 'error',
            message: '游戏已开始'
        }));
        return;
    }
    
    if (room.players.size >= room.maxPlayers) {
        clients.get(clientId).send(JSON.stringify({
            type: 'error',
            message: '房间已满'
        }));
        return;
    }
    
    const player = {
        id: clientId,
        nickname: nickname || `玩家${Math.floor(Math.random() * 1000)}`,
        isHost: false,
        isAlive: true,
        score: 0
    };
    
    room.addPlayer(player);
    
    // 通知房间内所有玩家
    room.broadcast({
        type: 'playerJoined',
        player: player,
        players: Array.from(room.players.values())
    });
    
    // 通知新玩家
    clients.get(clientId).send(JSON.stringify({
        type: 'roomJoined',
        roomId: roomId,
        player: player,
        players: Array.from(room.players.values())
    }));
    
    console.log(`Player ${clientId} joined room ${roomId}`);
}

function handleLeaveRoom(clientId) {
    // 找到玩家所在的房间
    let foundRoom = null;
    
    rooms.forEach((room) => {
        if (room.players.has(clientId)) {
            foundRoom = room;
        }
    });
    
    if (!foundRoom) return;
    
    foundRoom.removePlayer(clientId);
    
    // 如果房间还有玩家，通知他们
    if (foundRoom.players.size > 0) {
        foundRoom.broadcast({
            type: 'playerLeft',
            playerId: clientId,
            players: Array.from(foundRoom.players.values())
        });
    } else {
        rooms.delete(foundRoom.id);
    }
    
    console.log(`Player ${clientId} left room ${foundRoom.id}`);
}

function handleStartGame(clientId) {
    // 找到玩家所在的房间
    let foundRoom = null;
    
    rooms.forEach((room) => {
        if (room.hostId === clientId) {
            foundRoom = room;
        }
    });
    
    if (!foundRoom) {
        clients.get(clientId).send(JSON.stringify({
            type: 'error',
            message: '你不是房主'
        }));
        return;
    }
    
    if (foundRoom.players.length < 2) {
        clients.get(clientId).send(JSON.stringify({
            type: 'error',
            message: '至少需要2名玩家'
        }));
        return;
    }
    
    foundRoom.startGame();
    console.log(`Game started in room ${foundRoom.id}`);
}

function handlePlayerFailed(clientId) {
    // 找到玩家所在的房间
    let foundRoom = null;
    
    rooms.forEach((room) => {
        if (room.players.has(clientId)) {
            foundRoom = room;
        }
    });
    
    if (foundRoom) {
        foundRoom.playerFailed(clientId);
    }
}

function handleUpdateScore(clientId, score) {
    // 找到玩家所在的房间
    let foundRoom = null;
    
    rooms.forEach((room) => {
        if (room.players.has(clientId)) {
            foundRoom = room;
        }
    });
    
    if (foundRoom) {
        foundRoom.updatePlayerScore(clientId, score);
    }
}

function handleGetRoomList(clientId) {
    const roomList = Array.from(rooms.values()).filter(room => room.status === 'waiting').map(room => ({
        id: room.id,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers
    }));
    
    clients.get(clientId).send(JSON.stringify({
        type: 'roomList',
        rooms: roomList
    }));
}

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});