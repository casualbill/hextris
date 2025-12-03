Hextris
==========

An addictive puzzle game inspired by Tetris.

<img src="images/twitter-opengraph.png" width="100px"><br>

An addictive puzzle game inspired by Tetris. Play it at [www.hextris.io](http://www.hextris.io), or [https://hextris.github.io/hextris](https://hextris.github.io/hextris).

By:
 - Logan Engstrom ([@lengstrom](http://loganengstrom.com/))
 - Garrett Finucane ([@garrettdreyfus](http://github.com/garrettdreyfus))
 - Noah Moroze ([@nmoroze](http://github.com/nmoroze))
 - Michael Yang ([@themichaelyang](http://github.com/themichaelyang))

# Contributing
This project is not very actively maintained, as we are all very busy these days. But feel free to open an issue or PR, and we'll eventually take a look.

# About
Hextris was created by a group of high school friends in 2014.

## Press kit
http://hextris.github.io/presskit/info.html

# About
Hextris was created by a couple high school friends (who are now in college!) who unfortunately don't have as much time to update the game. If you'd like to support the open-source development of Hextris, please consider donating at:

ETH: `0xbf5414129552D37B4Fb12D058Cf1596B960d25b2`

## License
Copyright (C) 2018 Logan Engstrom

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

# 排行榜功能

## 功能特性

- **全球分区域排行榜**：系统根据玩家 IP 地址自动识别所在区域，将全球分为 6 个区域：亚洲、欧洲、北美洲、南美洲、非洲、大洋洲。
- **主菜单排行榜按钮**：点击后进入排行榜界面。
- **两种排行榜视图**：全球排行榜（前 100 名）和区域排行榜（前 50 名），玩家可切换查看。
- **分数上传功能**：玩家游戏结束后，如果分数达到排行榜最低分数要求（全球排行榜最低分数为 1000 分，区域排行榜最低分数为 500 分），系统自动上传分数到服务器。
- **玩家昵称设置**：玩家首次进入游戏时，系统提示输入昵称，输入后保存到本地存储，后续上传分数时使用该昵称，未输入昵称的玩家显示为"匿名玩家"。
- **排行榜刷新功能**：玩家可点击"刷新"按钮手动更新排行榜数据。
- **玩家排名信息显示**：在排行榜界面显示玩家自己的排名信息（全球排名和区域排名）。
- **搜索功能**：玩家可以输入昵称搜索特定玩家在排行榜中的位置。
- **网络状态提示**：网络断开时显示"网络连接失败，无法加载排行榜"提示。

## 安装和运行

### 1. 安装后端依赖

在 `server` 目录下运行以下命令安装 Go 依赖：

```bash
go mod download
```

### 2. 配置数据库

在 `server/main.go` 文件中修改数据库连接配置：

```go
const (
	dbUser     = "root"      // 你的 MySQL 用户名
	dbPassword = "password"  // 你的 MySQL 密码
	dbName     = "hextris"   // 数据库名称
	dbHost     = "localhost" // 数据库主机
	dbPort     = "3306"      // 数据库端口
)
```

### 3. 下载 GeoIP 数据库

服务器需要 GeoIP 数据库来根据 IP 地址识别玩家所在区域。请从 [MaxMind 网站](https://dev.maxmind.com/geoip/geoip2/geolite2/) 下载 `GeoLite2-Country.mmdb` 文件，并将其放在 `server` 目录下。

### 4. 创建数据库

在 MySQL 中创建一个名为 `hextris` 的数据库：

```sql
CREATE DATABASE hextris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 启动后端服务器

在 `server` 目录下运行以下命令启动服务器：

```bash
go run main.go
```

服务器将在 `http://localhost:8080` 上运行。

### 6. 运行前端

将整个项目目录放在 Web 服务器（如 Apache、Nginx 或 IIS）下，然后访问 `index.html` 文件即可。

或者，你可以使用以下命令在本地启动一个简单的 Web 服务器：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Python 2
python -m SimpleHTTPServer 8000

# 使用 Node.js
npx serve .
```

然后在浏览器中访问 `http://localhost:8000`。

## 项目结构

```
hextris-s6-wt18/
├─ images/                # 图片资源
├─ js/                    # JavaScript 文件
│  ├─ leaderboard.js      # 排行榜功能实现
│  ├─ main.js             # 游戏主逻辑
│  ├─ initialization.js   # 游戏初始化
│  └─ ...                 # 其他游戏文件
├─ server/                # 后端代码
│  ├─ main.go             # 服务器主文件
│  ├─ go.mod              # Go 依赖配置
│  └─ README.md           # 服务器说明文档
├─ style/                 # CSS 文件
│  └─ style.css           # 游戏样式
├─ vendor/                # 第三方库
└─ index.html             # 游戏主页面
```

## API 接口

### 1. 提交分数

**接口地址：** `POST /api/submit-score`

**请求参数：**

```json
{
	"nickname": "玩家昵称",
	"score": 1500
}
```

**响应：**

```json
{
	"success": true,
	"message": "Score submitted successfully"
}
```

### 2. 获取全球排行榜

**接口地址：** `GET /api/global-rankings`

**响应：**

```json
{
	"success": true,
	"data": [
		{
			"rank": 1,
			"nickname": "玩家1",
			"score": 10000,
			"region": "亚洲"
		},
		{
			"rank": 2,
			"nickname": "玩家2",
			"score": 9500,
			"region": "欧洲"
		}
	]
}
```

### 3. 获取区域排行榜

**接口地址：** `GET /api/regional-rankings?region=亚洲`

**请求参数：**
- `region`：区域名称（亚洲、欧洲、北美洲、南美洲、非洲、大洋洲）

**响应：**

```json
{
	"success": true,
	"data": [
		{
			"rank": 1,
			"nickname": "玩家1",
			"score": 10000
		},
		{
			"rank": 2,
			"nickname": "玩家2",
			"score": 9500
		}
	]
}
```

### 4. 获取玩家排名

**接口地址：** `GET /api/player-rank`

**响应：**

```json
{
	"success": true,
	"data": {
		"global_rank": 10,
		"regional_rank": 3,
		"best_score": 8500,
		"region": "亚洲"
	}
}
```

### 5. 搜索玩家

**接口地址：** `GET /api/search-player?nickname=玩家`

**请求参数：**
- `nickname`：玩家昵称（支持模糊搜索）

**响应：**

```json
{
	"success": true,
	"data": {
		"rank": 10,
		"nickname": "玩家1",
		"score": 8500,
		"region": "亚洲",
		"global_rank": 10
	}
}
```

## 数据库结构

服务器使用以下数据库表来存储玩家分数：

```sql
CREATE TABLE IF NOT EXISTS player_scores (
	id INT AUTO_INCREMENT PRIMARY KEY,
	nickname VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
	score INT NOT NULL,
	region VARCHAR(20) NOT NULL,
	ip_address VARCHAR(45) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 区域划分

服务器将全球分为以下 6 个区域：

1. **亚洲**：中国、日本、韩国、印度、俄罗斯、新加坡、香港、台湾、泰国、越南、马来西亚、印度尼西亚、菲律宾、孟加拉国、巴基斯坦、阿富汗、伊朗、伊拉克、沙特阿拉伯、阿联酋、以色列、土耳其、乌克兰等

2. **欧洲**：英国、德国、法国、意大利、西班牙、葡萄牙、荷兰、比利时、卢森堡、瑞士、奥地利、瑞典、挪威、丹麦、芬兰、爱尔兰、希腊、罗马尼亚、匈牙利、波兰、捷克、斯洛伐克、斯洛文尼亚、保加利亚、克罗地亚、塞尔维亚、黑山、阿尔巴尼亚、马其顿、马耳他、塞浦路斯等

3. **北美洲**：美国、加拿大、墨西哥

4. **南美洲**：巴西、阿根廷、智利、哥伦比亚、秘鲁、委内瑞拉、厄瓜多尔、玻利维亚、巴拉圭、乌拉圭、南乔治亚和南桑威奇群岛

5. **非洲**：埃及、南非、尼日利亚、肯尼亚、坦桑尼亚、加纳、喀麦隆、塞内加尔、摩洛哥、阿尔及利亚、突尼斯、利比亚、苏丹、南苏丹、埃塞俄比亚、乌干达、卢旺达、布隆迪、刚果民主共和国、刚果共和国、安哥拉、津巴布韦、马拉维、赞比亚、纳米比亚、博茨瓦纳、莱索托、斯威士兰等

6. **大洋洲**：澳大利亚、新西兰、巴布亚新几内亚、斐济、所罗门群岛、瓦努阿图、基里巴斯、汤加、瑙鲁、图瓦卢、法属波利尼西亚等

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- IE 11+

