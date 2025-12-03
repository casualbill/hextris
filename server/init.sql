-- 创建数据库
CREATE DATABASE IF NOT EXISTS hextris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE hextris;

-- 创建玩家分数表
CREATE TABLE IF NOT EXISTS player_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
    score INT NOT NULL,
    region VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建索引以提高查询性能
CREATE INDEX idx_region_score ON player_scores (region, score DESC);
CREATE INDEX idx_nickname ON player_scores (nickname);
CREATE INDEX idx_ip_address ON player_scores (ip_address);

-- 插入一些测试数据
INSERT INTO player_scores (nickname, score, region, ip_address) VALUES
('玩家1', 10000, '亚洲', '192.168.1.1'),
('玩家2', 9500, '欧洲', '192.168.1.2'),
('玩家3', 9000, '北美洲', '192.168.1.3'),
('玩家4', 8500, '南美洲', '192.168.1.4'),
('玩家5', 8000, '非洲', '192.168.1.5'),
('玩家6', 7500, '大洋洲', '192.168.1.6'),
('玩家7', 7000, '亚洲', '192.168.1.7'),
('玩家8', 6500, '欧洲', '192.168.1.8'),
('玩家9', 6000, '北美洲', '192.168.1.9'),
('玩家10', 5500, '南美洲', '192.168.1.10');
