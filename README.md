# Hextris 多人对战游戏

一个基于HTML5的多人在线对战版Hextris游戏，支持4人同时在线对战。

## 功能特性

- 🎮 **单人游戏模式** - 经典的Hextris单人游戏
- 👥 **多人对战模式** - 最多支持4人同时在线对战
- 🏠 **房间系统** - 创建/加入房间，支持房间列表显示
- 📊 **实时排名** - 游戏过程中实时显示玩家分数和状态
- 🎯 **公平竞技** - 所有玩家使用相同的方块生成序列
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 技术栈

### 前端
- HTML5 Canvas - 游戏渲染
- JavaScript - 游戏逻辑
- Socket.IO - 实时通信
- CSS3 - 样式设计

### 后端
- Node.js
- Express.js
- Socket.IO

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 3. 访问游戏

打开浏览器访问：`http://localhost:3000`

## 游戏规则

### 单人游戏
- 使用鼠标或键盘旋转六边形
- 三个相同颜色的方块连成一线即可消除
- 消除方块获得分数，连续消除有额外奖励
- 方块堆积到顶部边界时游戏结束

### 多人对战
- 房主创建房间，其他玩家加入房间
- 至少2人才能开始游戏，最多支持4人
- 所有玩家同时开始游戏，使用相同的方块序列
- 任一玩家方块超出边界时失败并退出游戏
- 最后剩下的玩家获胜
- 游戏结束后显示最终排名

## 控制方式

- **鼠标左键** - 点击六边形旋转
- **A键** - 旋转左侧六边形
- **S键** - 旋转中间六边形
- **D键** - 旋转右侧六边形
- **空格键** - 暂停/继续游戏

## 项目结构

```
hextris-multiplayer/
├── index.html          # 主HTML文件
├── style/              # 样式文件
│   └── style.css
├── js/                 # JavaScript文件
│   ├── game.js        # 游戏核心逻辑
│   └── ui.js          # 界面管理
├── server.js          # 服务器端代码
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## API 说明

### Socket.IO 事件

#### 客户端事件
- `getRooms` - 获取房间列表
- `createRoom` - 创建房间
- `joinRoom` - 加入房间
- `leaveRoom` - 离开房间
- `startGame` - 开始游戏
- `updatePlayer` - 更新玩家状态
- `getGameState` - 获取游戏状态

#### 服务器事件
- `roomList` - 房间列表数据
- `roomCreated` - 房间创建成功
- `roomJoined` - 房间加入成功
- `playerJoined` - 有玩家加入房间
- `playerLeft` - 有玩家离开房间
- `gameStarted` - 游戏开始
- `gameEnded` - 游戏结束
- `playerUpdated` - 玩家状态更新
- `gameState` - 游戏状态数据
- `error` - 错误信息

## 开发说明

### 添加新功能

1. 修改前端代码：在 `js/game.js` 或 `js/ui.js` 中添加新功能
2. 修改后端代码：在 `server.js` 中添加对应的Socket.IO事件处理
3. 修改样式：在 `style/style.css` 中添加新样式

### 测试

1. 启动服务器：`npm run dev`
2. 打开多个浏览器窗口访问 `http://localhost:3000`
3. 创建房间并在其他窗口加入，测试多人对战功能

## 部署

### 本地部署

```bash
npm start
```

### 云部署

1. 将代码上传到云服务器
2. 安装依赖：`npm install`
3. 使用PM2管理进程：`pm2 start server.js`
4. 配置Nginx反向代理

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进游戏！

## 联系

如有问题或建议，请通过Issue反馈。