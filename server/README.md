# Hextris 排行榜服务器

基于 Go 语言的 Hextris 游戏排行榜服务器，使用 MySQL 数据库存储玩家数据。

## 功能特性

- 全球排行榜和分区域排行榜
- IP 地址自动识别区域（亚洲、欧洲、北美洲、南美洲、非洲、大洋洲）
- 分数上传和验证
- 排行榜查询 API
- 玩家搜索功能
- 网络连接状态检查

## 数据库表结构

### players 表
```sql
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
    ip_address VARCHAR(45) NOT NULL,
    region VARCHAR(20) NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_score (score DESC)
);
```

### regions 表（IP 区域映射）
```sql
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(20) NOT NULL,
    ip_range_start VARCHAR(45) NOT NULL,
    ip_range_end VARCHAR(45) NOT NULL,
    UNIQUE KEY idx_ip_range (ip_range_start, ip_range_end)
);
```

## API 接口

### 1. 上传分数
**POST** `/api/score`

请求参数：
```json
{
    "nickname": "玩家昵称",
    "score": 1500,
    "ip_address": "192.168.1.1"
}
```

响应：
```json
{
    "success": true,
    "message": "分数已上传",
    "global_rank": 50,
    "regional_rank": 10
}
```

### 2. 获取全球排行榜
**GET** `/api/rankings/global?limit=100`

响应：
```json
{
    "success": true,
    "last_updated": "2024-01-01 12:00:00",
    "rankings": [
        {
            "rank": 1,
            "nickname": "玩家1",
            "score": 10000,
            "region": "亚洲"
        },
        ...
    ]
}
```

### 3. 获取区域排行榜
**GET** `/api/rankings/region?region=亚洲&limit=50`

响应：
```json
{
    "success": true,
    "last_updated": "2024-01-01 12:00:00",
    "rankings": [
        {
            "rank": 1,
            "nickname": "玩家1",
            "score": 10000
        },
        ...
    ]
}
```

### 4. 搜索玩家
**GET** `/api/search?nickname=玩家昵称`

响应：
```json
{
    "success": true,
    "results": [
        {
            "rank": 50,
            "nickname": "玩家昵称",
            "score": 1500,
            "region": "亚洲"
        }
    ]
}
```

### 5. 检查网络连接
**GET** `/api/ping`

响应：
```json
{
    "success": true,
    "message": "服务器连接正常"
}
```

## 区域划分

1. 亚洲 (Asia)
2. 欧洲 (Europe)
3. 北美洲 (North America)
4. 南美洲 (South America)
5. 非洲 (Africa)
6. 大洋洲 (Oceania)

## 分数要求

- 全球排行榜最低分数：1000 分
- 区域排行榜最低分数：500 分
