from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hextris-live-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# 存储所有直播房间信息
rooms = {}

class Room:
    def __init__(self, room_id, host_name):
        self.room_id = room_id
        self.host_name = host_name
        self.host_id = None
        self.game_state = None
        self.viewers = []
        self.messages = []

@app.route('/')
def index():
    return jsonify({'message': 'Hextris Live Server'})

@app.route('/rooms')
def get_rooms():
    """获取所有直播房间列表"""
    room_list = []
    for room_id, room in rooms.items():
        if room.host_id:
            room_info = {
                'room_id': room_id,
                'host_name': room.host_name,
                'viewer_count': len(room.viewers),
                'score': room.game_state.get('score', 0) if room.game_state else 0
            }
            room_list.append(room_info)
    return jsonify({'rooms': room_list})

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)
    # 检查是否是主播断开连接
    for room_id, room in rooms.items():
        if room.host_id == request.sid:
            # 主播断开，关闭房间
            emit('host_disconnected', room=room_id)
            del rooms[room_id]
            print(f'Room {room_id} closed because host disconnected')
            break
        # 检查是否是观众断开连接
        if request.sid in room.viewers:
            room.viewers.remove(request.sid)
            # 通知房间内的人观众数量变化
            emit('viewer_count_updated', {
                'viewer_count': len(room.viewers)
            }, room=room_id)
            print(f'Viewer {request.sid} left room {room_id}')
            break

@socketio.on('create_room')
def handle_create_room(data):
    """创建直播房间"""
    host_name = data.get('host_name', 'Anonymous')
    # 生成6位数字房间号
    room_id = ''.join(random.choices(string.digits, k=6))
    # 确保房间号唯一
    while room_id in rooms:
        room_id = ''.join(random.choices(string.digits, k=6))
    
    # 创建房间
    room = Room(room_id, host_name)
    room.host_id = request.sid
    rooms[room_id] = room
    
    # 加入房间
    join_room(room_id)
    
    print(f'Room {room_id} created by host {host_name} ({request.sid})')
    
    emit('room_created', {
        'room_id': room_id,
        'host_name': host_name
    })

@socketio.on('join_room')
def handle_join_room(data):
    """加入直播房间"""
    room_id = data.get('room_id')
    viewer_name = data.get('viewer_name', 'Anonymous')
    
    if room_id not in rooms:
        emit('room_not_found', {'error': 'Room does not exist'})
        return
    
    room = rooms[room_id]
    
    # 检查房间是否有主播
    if not room.host_id:
        emit('room_closed', {'error': 'Room is closed'})
        return
    
    # 加入房间
    join_room(room_id)
    room.viewers.append(request.sid)
    
    print(f'Viewer {viewer_name} ({request.sid}) joined room {room_id}')
    
    # 通知房间内的人观众数量变化
    emit('viewer_count_updated', {
        'viewer_count': len(room.viewers)
    }, room=room_id)
    
    # 发送房间信息给新加入的观众
    emit('room_joined', {
        'room_id': room_id,
        'host_name': room.host_name,
        'viewer_count': len(room.viewers),
        'current_game_state': room.game_state
    })

@socketio.on('leave_room')
def handle_leave_room(data):
    """离开直播房间"""
    room_id = data.get('room_id')
    
    if room_id not in rooms:
        return
    
    room = rooms[room_id]
    
    if request.sid in room.viewers:
        room.viewers.remove(request.sid)
        leave_room(room_id)
        
        # 通知房间内的人观众数量变化
        emit('viewer_count_updated', {
            'viewer_count': len(room.viewers)
        }, room=room_id)
        
        print(f'Viewer {request.sid} left room {room_id}')

@socketio.on('update_game_state')
def handle_update_game_state(data):
    """主播更新游戏状态"""
    room_id = data.get('room_id')
    game_state = data.get('game_state')
    
    if room_id not in rooms:
        return
    
    room = rooms[room_id]
    
    # 检查是否是主播发送的消息
    if room.host_id != request.sid:
        return
    
    # 更新游戏状态
    room.game_state = game_state
    
    # 广播游戏状态给所有观众
    emit('game_state_updated', {
        'game_state': game_state
    }, room=room_id)

@socketio.on('send_message')
def handle_send_message(data):
    """发送弹幕消息"""
    room_id = data.get('room_id')
    message = data.get('message')
    sender_name = data.get('sender_name', 'Anonymous')
    
    if room_id not in rooms:
        return
    
    room = rooms[room_id]
    
    # 存储消息（最多保存100条）
    room.messages.append({'sender_name': sender_name, 'message': message})
    if len(room.messages) > 100:
        room.messages.pop(0)
    
    # 广播消息给房间内的所有人
    emit('message_received', {
        'sender_name': sender_name,
        'message': message
    }, room=room_id)

@socketio.on('stop_broadcast')
def handle_stop_broadcast(data):
    """停止直播"""
    room_id = data.get('room_id')
    
    if room_id not in rooms:
        return
    
    room = rooms[room_id]
    
    # 检查是否是主播发送的消息
    if room.host_id != request.sid:
        return
    
    # 通知所有观众直播结束
    emit('broadcast_stopped', room=room_id)
    
    # 移除房间
    del rooms[room_id]
    
    print(f'Room {room_id} stopped broadcasting')

if __name__ == '__main__':
    print('Starting Hextris Live Server...')
    socketio.run(app, host='0.0.0.0', port=5001)
