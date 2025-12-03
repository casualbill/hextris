#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import threading

PORT = 8000

# 启动HTTP服务器
class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_http_server():
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"HTTP服务器已启动，端口 {PORT}")
        print(f"游戏页面: http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # 启动HTTP服务器线程
    server_thread = threading.Thread(target=start_http_server)
    server_thread.daemon = True
    server_thread.start()
    
    # 打开浏览器
    webbrowser.open(f'http://localhost:{PORT}')
    
    # 保持主进程运行
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("服务器已停止")
