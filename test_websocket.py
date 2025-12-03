#!/usr/bin/env python3
import asyncio
import websockets
import json

async def test_websocket():
    try:
        # 测试连接到服务器
        async with websockets.connect('ws://localhost:8766') as websocket:
            print("成功连接到WebSocket服务器")
            
            # 测试获取房间列表
            await websocket.send(json.dumps({'type': 'get_rooms'}))
            response = await websocket.recv()
            data = json.loads(response)
            print("房间列表响应:", data)
            
            print("WebSocket测试成功")
            return True
            
    except Exception as e:
        print("WebSocket测试失败:", e)
        return False

if __name__ == "__main__":
    asyncio.run(test_websocket())
