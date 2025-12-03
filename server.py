#!/usr/bin/env python3
import asyncio
import websockets
import json
import random
import string

# 存储所有直播房间
rooms = {}

# 生成6位随机房间号
def generate_room_id():
    return random.choices(string.digits, k=6)

# 广播消息给房间内所有观众
async def broadcast_to_viewers(room_id, data):
    if room_id not in rooms:
        return
    
    message = json.dumps(data)
    viewers_to_remove = set()
    
    for viewer in rooms[room_id]['viewers']:
        try:
            await viewer.send(message)
        except websockets.exceptions.ConnectionClosed:
            viewers_to_remove.add(viewer)
    
    # 清理断开连接的观众
    for viewer in viewers_to_remove:
        rooms[room_id]['viewers'].remove(viewer)
        rooms[room_id]['viewers_count'] -= 1

# 处理WebSocket连接
async def handle_connection(websocket):
    print(f"新连接: {websocket.remote_address}")
    
    try:
        # 接收客户端的初始消息
        initial_message = await websocket.recv()
        data = json.loads(initial_message)
        print(f"收到初始消息: {data}")
        
        if data['type'] == 'create_room':
            # 创建新的直播房间
            room_id = ''.join(generate_room_id())
            while room_id in rooms:
                room_id = ''.join(generate_room_id())
            
            rooms[room_id] = {
                'host': websocket,
                'viewers': set(),
                'host_nickname': data['nickname'],
                'score': 0,
                'game_time': 0,
                'viewers_count': 0,
                'status': 'live'
            }
            
            print(f"创建房间: {room_id}")
            
            # 向主播发送房间信息
            await websocket.send(json.dumps({
                'type': 'room_created',
                'room_id': room_id,
                'success': True
            }))
            
            # 处理主播的游戏数据
            async for message in websocket:
                try:
                    msg_data = json.loads(message)
                    print(f"主播消息: {msg_data}")
                    
                    if msg_data['type'] == 'game_update':
                        # 更新游戏状态并广播给所有观众
                        rooms[room_id]['score'] = msg_data['score']
                        rooms[room_id]['game_time'] = msg_data['game_time']
                        
                        # 广播游戏更新
                        broadcast_data = {
                            'type': 'game_update',
                            'score': msg_data['score'],
                            'game_time': msg_data['game_time'],
                            'game_state': msg_data['game_state']
                        }
                        await broadcast_to_viewers(room_id, broadcast_data)
                        
                    elif msg_data['type'] == 'block_update':
                        # 广播方块更新
                        await broadcast_to_viewers(room_id, {
                            'type': 'block_update',
                            'blocks': msg_data['blocks'],
                            'main_hex': msg_data['main_hex']
                        })
                        
                    elif msg_data['type'] == 'chat_message':
                        # 广播聊天消息给所有观众
                        await broadcast_to_viewers(room_id, {
                            'type': 'chat_message',
                            'sender': rooms[room_id]['host_nickname'],
                            'content': msg_data['content']
                        })
                        
                    elif msg_data['type'] == 'stop_broadcast':
                        # 停止直播
                        print(f"停止直播: {room_id}")
                        rooms[room_id]['status'] = 'closed'
                        
                        # 通知所有观众直播结束
                        await broadcast_to_viewers(room_id, {
                            'type': 'broadcast_stopped',
                            'message': '主播已结束直播'
                        })
                        
                        # 清理房间
                        del rooms[room_id]
                        break
                        
                except Exception as e:
                    print(f"处理主播消息时出错: {e}")
                    continue
            
        elif data['type'] == 'join_room':
            # 观众加入直播房间
            room_id = data['room_id']
            print(f"观众尝试加入房间: {room_id}")
            
            if room_id not in rooms or rooms[room_id]['status'] != 'live':
                await websocket.send(json.dumps({
                    'type': 'join_failed',
                    'message': '房间不存在或已关闭'
                }))
                return
            
            # 添加观众到房间
            rooms[room_id]['viewers'].add(websocket)
            rooms[room_id]['viewers_count'] += 1
            
            print(f"观众加入房间: {room_id}, 当前观众数: {rooms[room_id]['viewers_count']}")
            
            # 向观众发送初始房间信息
            await websocket.send(json.dumps({
                'type': 'joined_room',
                'room_id': room_id,
                'host_nickname': rooms[room_id]['host_nickname'],
                'score': rooms[room_id]['score'],
                'game_time': rooms[room_id]['game_time'],
                'viewers_count': rooms[room_id]['viewers_count']
            }))
            
            # 通知主播有新观众加入
            try:
                await rooms[room_id]['host'].send(json.dumps({
                    'type': 'viewer_joined',
                    'viewers_count': rooms[room_id]['viewers_count']
                }))
            except Exception as e:
                print(f"通知主播新观众加入时出错: {e}")
            
            # 处理观众的消息
            async for message in websocket:
                try:
                    msg_data = json.loads(message)
                    print(f"观众消息: {msg_data}")
                    
                    if msg_data['type'] == 'chat_message':
                        # 将观众消息发送给主播
                        if room_id in rooms and rooms[room_id]['host']:
                            await rooms[room_id]['host'].send(json.dumps({
                                'type': 'viewer_message',
                                'sender': msg_data['nickname'],
                                'content': msg_data['content']
                            }))
                            
                            # 广播给所有观众
                            await broadcast_to_viewers(room_id, {
                                'type': 'chat_message',
                                'sender': msg_data['nickname'],
                                'content': msg_data['content']
                            })
                            
                except Exception as e:
                    print(f"处理观众消息时出错: {e}")
                    continue
            
        elif data['type'] == 'get_rooms':
            # 获取所有直播房间列表
            live_rooms = []
            for room_id, room in rooms.items():
                if room['status'] == 'live':
                    live_rooms.append({
                        'room_id': room_id,
                        'host_nickname': room['host_nickname'],
                        'score': room['score'],
                        'viewers_count': room['viewers_count']
                    })
            
            response = {
                'type': 'rooms_list',
                'rooms': live_rooms
            }
            
            print(f"发送房间列表: {response}")
            await websocket.send(json.dumps(response))
            
        else:
            # 未知消息类型
            await websocket.send(json.dumps({
                'type': 'error',
                'message': '未知的消息类型'
            }))
            
    except websockets.exceptions.ConnectionClosedOK:
        print(f"连接正常关闭: {websocket.remote_address}")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"连接错误关闭: {websocket.remote_address}, {e}")
    except Exception as e:
        print(f"处理连接时发生错误: {websocket.remote_address}, {e}")
        try:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': '服务器内部错误'
            }))
        except:
            pass
    finally:
        # 清理连接
        print(f"清理连接: {websocket.remote_address}")
        # 查找并清理主播连接
        for room_id, room in list(rooms.items()):
            if room['host'] == websocket:
                print(f"主播断开连接，关闭房间: {room_id}")
                room['status'] = 'closed'
                await broadcast_to_viewers(room_id, {
                    'type': 'broadcast_stopped',
                    'message': '主播已断开连接'
                })
                del rooms[room_id]
                return
            
            # 查找并清理观众连接
            if websocket in room['viewers']:
                print(f"观众离开房间: {room_id}")
                room['viewers'].remove(websocket)
                room['viewers_count'] -= 1
                
                # 通知主播观众离开
                try:
                    await room['host'].send(json.dumps({
                        'type': 'viewer_left',
                        'viewers_count': room['viewers_count']
                    }))
                except:
                    pass
                return

# 启动服务器
async def main():
    server = await websockets.serve(handle_connection, "localhost", 8766)
    print("Hextris直播服务器已启动，端口8766")
    await server.wait_closed()  # 保持服务器运行

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("服务器已停止")
