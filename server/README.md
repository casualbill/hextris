# Hextris 排行榜服务器

这是 Hextris 游戏的排行榜服务器，使用 Go 语言编写，数据库使用 MySQL。

## 功能特性

- 全球排行榜
- 分区域排行榜（亚洲、欧洲、北美洲、南美洲、非洲、大洋洲）
- 玩家分数上传
- 玩家排名查询
- 玩家搜索功能
- 基于 IP 地址的区域自动识别

## 安装步骤

### 1. 安装 Go 语言

请确保你的系统已经安装了 Go 语言（版本 1.16 或更高）。你可以从 [Go 官方网站](https://golang.org/dl/) 下载并安装。

### 2. 安装 MySQL

请确保你的系统已经安装了 MySQL 数据库。你可以从 [MySQL 官方网站](https://www.mysql.com/downloads/) 下载并安装。

### 3. 创建数据库

你可以使用以下两种方法之一创建数据库：

#### 方法一：使用初始化脚本（推荐）

在 MySQL 中运行 `init.sql` 脚本：

```bash
mysql -u root -p < init.sql
```

这个脚本会自动创建数据库和表，并插入一些测试数据。

#### 方法二：手动创建

在 MySQL 中创建一个名为 `hextris` 的数据库：

```sql
CREATE DATABASE hextris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后创建玩家分数表：

```sql
USE hextris;

CREATE TABLE IF NOT EXISTS player_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
    score INT NOT NULL,
    region VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4. 下载 GeoIP 数据库

服务器需要 GeoIP 数据库来根据 IP 地址识别玩家所在区域。请从 [MaxMind 网站](https://dev.maxmind.com/geoip/geoip2/geolite2/) 下载 `GeoLite2-Country.mmdb` 文件，并将其放在服务器目录下。

### 5. 安装依赖

在服务器目录下运行以下命令安装依赖：

```bash
go mod download
```

## 配置

在 `main.go` 文件中修改数据库连接配置：

```go
const (
	dbUser     = "root"      // 你的 MySQL 用户名
	dbPassword = "password"  // 你的 MySQL 密码
	dbName     = "hextris"   // 数据库名称
	dbHost     = "localhost" // 数据库主机
	dbPort     = "3306"      // 数据库端口
)
```

## 运行服务器

在服务器目录下运行以下命令启动服务器：

```bash
go run main.go
```

服务器将在 `http://localhost:8080` 上运行。

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
