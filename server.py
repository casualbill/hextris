import asyncio
import websockets
import json
import random
import string

# 存储所有连接的客户端
connections = {}

# 存储所有房间信息
rooms = {}

# 生成6位数字房间号
def generate_room_id():
    while True:
        room_id = ''.join(random.choices(string.digits, k=6))
        if room_id not in rooms:
            return room_id

# 处理WebSocket连接
async def handle_connection(websocket):
    print(f"新连接: {websocket.remote_address}")
    
    # 将新连接添加到连接列表
    connections[websocket] = {
        'type': None,  # 'host' 或 'viewer'
        'room_id': None,
        'nickname': '观众' + str(random.randint(1000, 9999))
    }
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get('action')
                
                if action == 'create_room':
                    # 创建房间
                    room_id = generate_room_id()
                    nickname = data.get('nickname', '主播')
                    
                    rooms[room_id] = {
                        'host': websocket,
                        'viewers': [],
                        'nickname': nickname,
                        'score': 0,
                        'game_time': 0,
                        'combo_time': 0,
                        'danmaku': []
                    }
                    
                    connections[websocket]['type'] = 'host'
                    connections[websocket]['room_id'] = room_id
                    connections[websocket]['nickname'] = nickname
                    
                    # 通知主播房间创建成功
                    await websocket.send(json.dumps({
                        'action': 'room_created',
                        'room_id': room_id,
                        'nickname': nickname
                    }))
                    
                    print(f"房间创建: {room_id} by {nickname}")
                    
                elif action == 'join_room':
                    # 加入房间
                    room_id = data.get('room_id')
                    nickname = data.get('nickname', '观众' + str(random.randint(1000, 9999)))
                    
                    if room_id in rooms:
                        room = rooms[room_id]
                        
                        # 检查房间是否已满（限制100个观众）
                        if len(room['viewers']) >= 100:
                            await websocket.send(json.dumps({
                                'action': 'join_failed',
                                'message': '房间已满'
                            }))
                            return
                        
                        # 添加观众到房间
                        room['viewers'].append(websocket)
                        connections[websocket]['type'] = 'viewer'
                        connections[websocket]['room_id'] = room_id
                        connections[websocket]['nickname'] = nickname
                        
                        # 通知观众加入成功
                        await websocket.send(json.dumps({
                            'action': 'joined_room',
                            'room_id': room_id,
                            'host_nickname': room['nickname'],
                            'score': room['score'],
                            'game_time': room['game_time'],
                            'combo_time': room['combo_time'],
                            'viewer_count': len(room['viewers'])
                        }))
                        
                        # 通知主播有新观众加入
                        try:
                            await room['host'].send(json.dumps({
                                'action': 'viewer_joined',
                                'viewer_count': len(room['viewers'])
                            }))
                        except websockets.exceptions.ConnectionClosed:
                            pass
                        
                        print(f"观众加入房间: {room_id} - {nickname}")
                        
                    else:
                        await websocket.send(json.dumps({
                            'action': 'join_failed',
                            'message': '房间不存在'
                        }))
                        
                elif action == 'get_rooms':
                    # 获取所有房间列表
                    room_list = []
                    for room_id, room in rooms.items():
                        try:
                            # 检查主播是否仍然连接
                            await asyncio.wait_for(room['host'].ping(), timeout=0.1)
                            room_list.append({
                                'room_id': room_id,
                                'host_nickname': room['nickname'],
                                'score': room['score'],
                                'viewer_count': len(room['viewers'])
                            })
                        except (websockets.exceptions.ConnectionClosed, asyncio.TimeoutError):
                            # 主播已断开连接，清理房间
                            del rooms[room_id]
                    
                    await websocket.send(json.dumps({
                        'action': 'room_list',
                        'rooms': room_list
                    }))
                    
                elif action == 'update_game_state':
                    # 更新游戏状态（主播发送）
                    room_id = connections[websocket]['room_id']
                    if room_id and room_id in rooms:
                        room = rooms[room_id]
                        
                        # 更新房间状态
                        room['score'] = data.get('score', 0)
                        room['game_time'] = data.get('game_time', 0)
                        room['combo_time'] = data.get('combo_time', 0)
                        
                        # 广播游戏状态给所有观众
                        game_state = {
                            'action': 'game_state',
                            'score': room['score'],
                            'game_time': room['game_time'],
                            'combo_time': room['combo_time'],
                            'blocks': data.get('blocks', []),
                            'next_block': data.get('next_block', None),
                            'game_over': data.get('game_over', False),
                            'host_nickname': room['nickname'],
                            'viewer_count': len(room['viewers'])
                        }
                        
                        # 发送给所有观众
                        for viewer in room['viewers']:
                            try:
                                await viewer.send(json.dumps(game_state))
                            except websockets.exceptions.ConnectionClosed:
                                # 移除断开连接的观众
                                room['viewers'].remove(viewer)
                                del connections[viewer]
                        
                elif action == 'send_danmaku':
                    # 发送弹幕
                    room_id = connections[websocket]['room_id']
                    if room_id and room_id in rooms:
                        room = rooms[room_id]
                        nickname = connections[websocket]['nickname']
                        content = data.get('content', '')
                        
                        if content:
                            danmaku_data = {
                                'action': 'danmaku',
                                'nickname': nickname,
                                'content': content
                            }
                            
                            # 存储弹幕（最多保留100条）
                            room['danmaku'].append(danmaku_data)
                            if len(room['danmaku']) > 100:
                                room['danmaku'].pop(0)
                            
                            # 广播弹幕给所有观众和主播
                            try:
                                await room['host'].send(json.dumps(danmaku_data))
                            except websockets.exceptions.ConnectionClosed:
                                pass
                            
                            for viewer in room['viewers']:
                                try:
                                    await viewer.send(json.dumps(danmaku_data))
                                except websockets.exceptions.ConnectionClosed:
                                    # 移除断开连接的观众
                                    room['viewers'].remove(viewer)
                                    del connections[viewer]
                            
                            print(f"弹幕: {room_id} - {nickname}: {content}")
                        
                elif action == 'leave_room':
                    # 离开房间
                    room_id = connections[websocket]['room_id']
                    if room_id and room_id in rooms:
                        room = rooms[room_id]
                        
                        if connections[websocket]['type'] == 'host':
                            # 主播离开，关闭房间
                            print(f"主播离开，房间关闭: {room_id}")
                            
                            # 通知所有观众房间关闭
                            for viewer in room['viewers']:
                                try:
                                    await viewer.send(json.dumps({
                                        'action': 'room_closed',
                                        'message': '主播已结束直播'
                                    }))
                                except websockets.exceptions.ConnectionClosed:
                                    pass
                            
                            # 清理房间
                            del rooms[room_id]
                        else:
                            # 观众离开
                            if websocket in room['viewers']:
                                room['viewers'].remove(websocket)
                                print(f"观众离开房间: {room_id} - {connections[websocket]['nickname']}")
                                
                                # 通知主播观众数量变化
                                try:
                                    await room['host'].send(json.dumps({
                                        'action': 'viewer_left',
                                        'viewer_count': len(room['viewers'])
                                    }))
                                except websockets.exceptions.ConnectionClosed:
                                    pass
                        
                        # 重置连接信息
                        connections[websocket]['type'] = None
                        connections[websocket]['room_id'] = None
                        
            except json.JSONDecodeError:
                print(f"无效的JSON消息: {message}")
                await websocket.send(json.dumps({
                    'action': 'error',
                    'message': '无效的消息格式'
                }))
    
    except websockets.exceptions.ConnectionClosed:
        print(f"连接断开: {websocket.remote_address}")
    
    finally:
        # 清理断开的连接
        if websocket in connections:
            room_id = connections[websocket]['room_id']
            
            # 如果是主播断开连接，关闭房间
            if room_id and room_id in rooms:
                room = rooms[room_id]
                if connections[websocket]['type'] == 'host':
                    print(f"主播断开连接，房间关闭: {room_id}")
                    
                    # 通知所有观众房间关闭
                    for viewer in room['viewers']:
                        try:
                            await viewer.send(json.dumps({
                                'action': 'room_closed',
                                'message': '主播已断开连接'
                            }))
                        except websockets.exceptions.ConnectionClosed:
                            pass
                    
                    del rooms[room_id]
                else:
                    # 观众断开连接
                    if websocket in room['viewers']:
                        room['viewers'].remove(websocket)
                        
                        # 通知主播观众离开
                        try:
                            await room['host'].send(json.dumps({
                                'action': 'viewer_left',
                                'viewer_count': len(room['viewers'])
                            }))
                        except websockets.exceptions.ConnectionClosed:
                            pass
            
            del connections[websocket]

# 启动服务器
async def main():
    async with websockets.serve(handle_connection, "localhost", 8765):
        print("WebSocket服务器已启动，等待连接...")
        print("服务器地址: ws://localhost:8765")
        await asyncio.Future()  # 无限运行

if __name__ == "__main__":
    asyncio.run(main())