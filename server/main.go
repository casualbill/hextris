package main

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/oschwald/geoip2-golang"
)

// 区域定义
const (
	RegionAsia       = "亚洲"
	RegionEurope     = "欧洲"
	RegionNorthAmerica = "北美洲"
	RegionSouthAmerica = "南美洲"
	RegionAfrica     = "非洲"
	RegionOceania    = "大洋洲"
)

// 数据库配置
const (
	dbUser     = "root"
	dbPassword = "password"
	dbName     = "hextris"
	dbHost     = "localhost"
	dbPort     = "3306"
)

// 排行榜相关配置
const (
	GlobalRankLimit   = 100
	RegionalRankLimit = 50
	GlobalMinScore    = 1000
	RegionalMinScore  = 500
)

// PlayerScore 玩家分数记录
type PlayerScore struct {
	ID        int       `json:"id"`
	Nickname  string    `json:"nickname"`
	Score     int       `json:"score"`
	Region    string    `json:"region"`
	IPAddress string    `json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`
}

// RankEntry 排行榜条目
type RankEntry struct {
	Rank     int    `json:"rank"`
	Nickname string `json:"nickname"`
	Score    int    `json:"score"`
	Region   string `json:"region,omitempty"`
}

// API响应结构
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

var (
	db *sql.DB
	gi *geoip2.Reader
)

func main() {
	// 初始化数据库连接
	var err error
	db, err = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true", dbUser, dbPassword, dbHost, dbPort, dbName))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// 测试数据库连接
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// 初始化GeoIP数据库
	gi, err = geoip2.Open("GeoLite2-Country.mmdb")
	if err != nil {
		log.Fatalf("Failed to open GeoIP database: %v", err)
	}
	defer gi.Close()

	// 创建表（如果不存在）
	createTable()

	// 初始化Gin框架
	router := gin.Default()

	// 启用 CORS
	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// 允许所有来源
			return true
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
	}))

	// API路由
	api := router.Group("/api")
	{
		api.POST("/submit-score", submitScore)
		api.GET("/global-rankings", getGlobalRankings)
		api.GET("/regional-rankings", getRegionalRankings)
		api.GET("/player-rank", getPlayerRank)
		api.GET("/search-player", searchPlayer)
	}

	// 启动服务器
	log.Println("Server starting on port 8080...")
	log.Fatal(router.Run(":8080"))
}

// 创建玩家分数表
func createTable() {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS player_scores (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nickname VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
		score INT NOT NULL,
		region VARCHAR(20) NOT NULL,
		ip_address VARCHAR(45) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`

	_, err := db.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
}

// 根据IP地址获取区域
func getRegionByIP(ip string) string {
	// 本地测试IP
	if ip == "127.0.0.1" || ip == "::1" {
		return RegionAsia
	}

	// 解析IP地址
	ipAddr := net.ParseIP(ip)
	if ipAddr == nil {
		return RegionAsia // 默认返回亚洲
	}

	// 查询GeoIP数据库
	record, err := gi.Country(ipAddr)
	if err != nil {
		log.Printf("Failed to get region for IP %s: %v", ip, err)
		return RegionAsia
	}

	// 根据国家代码映射到区域
	countryCode := record.Country.IsoCode
	return mapCountryToRegion(countryCode)
}

// 将国家代码映射到区域
func mapCountryToRegion(countryCode string) string {
	countryCode = strings.ToUpper(countryCode)

	// 亚洲国家
	asiaCountries := []string{"CN", "JP", "KR", "IN", "RU", "SG", "HK", "TW", "TH", "VN", "MY", "ID", "PH", "BD", "PK", "AF", "IR", "IQ", "SA", "AE", "IL", "TR", "UA"}
	for _, code := range asiaCountries {
		if countryCode == code {
			return RegionAsia
		}
	}

	// 欧洲国家
	europeCountries := []string{"GB", "DE", "FR", "IT", "ES", "PT", "NL", "BE", "LU", "CH", "AT", "SE", "NO", "DK", "FI", "IE", "GR", "RO", "HU", "PL", "CZ", "SK", "SI", "BG", "HR", "RS", "ME", "AL", "MK", "MT", "CY"}
	for _, code := range europeCountries {
		if countryCode == code {
			return RegionEurope
		}
	}

	// 北美洲国家
	northAmericaCountries := []string{"US", "CA", "MX"}
	for _, code := range northAmericaCountries {
		if countryCode == code {
			return RegionNorthAmerica
		}
	}

	// 南美洲国家
	southAmericaCountries := []string{"BR", "AR", "CL", "CO", "PE", "VE", "EC", "BO", "PY", "UY", "GS"}
	for _, code := range southAmericaCountries {
		if countryCode == code {
			return RegionSouthAmerica
		}
	}

	// 非洲国家
	africanCountries := []string{"EG", "ZA", "NG", "KE", "TZ", "GH", "CM", "SN", "MA", "DZ", "TN", "LY", "SD", "SS", "ET", "UG", "RW", "BI", "CD", "CG", "AO", "ZW", "MW", "ZM", "NA", "BW", "LS", "SZ"}
	for _, code := range africanCountries {
		if countryCode == code {
			return RegionAfrica
		}
	}

	// 大洋洲国家
	oceaniaCountries := []string{"AU", "NZ", "PG", "FJ", "SB", "VU", "KI", "TO", "NR", "TV", "PF"}
	for _, code := range oceaniaCountries {
		if countryCode == code {
			return RegionOceania
		}
	}

	// 默认返回亚洲
	return RegionAsia
}

// 提交分数
func submitScore(c *gin.Context) {
	var scoreData struct {
		Nickname string `json:"nickname"`
		Score    int    `json:"score"`
	}

	if err := c.ShouldBindJSON(&scoreData); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{Success: false, Message: "Invalid request data"})
		return
	}

	// 获取玩家IP地址
	ip := c.ClientIP()

	// 获取玩家区域
	region := getRegionByIP(ip)

	// 验证分数是否达到最低要求
	if scoreData.Score < RegionalMinScore {
		c.JSON(http.StatusBadRequest, APIResponse{Success: false, Message: fmt.Sprintf("Score must be at least %d to submit", RegionalMinScore)})
		return
	}

	// 限制昵称长度
	if len(scoreData.Nickname) == 0 {
		scoreData.Nickname = "匿名玩家"
	} else if len(scoreData.Nickname) > 50 {
		scoreData.Nickname = scoreData.Nickname[:50]
	}

	// 插入分数记录
	_, err := db.Exec("INSERT INTO player_scores (nickname, score, region, ip_address) VALUES (?, ?, ?, ?)",
		scoreData.Nickname, scoreData.Score, region, ip)
	if err != nil {
		log.Printf("Failed to insert score: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to submit score"})
		return
	}

	c.JSON(http.StatusOK, APIResponse{Success: true, Message: "Score submitted successfully"})
}

// 获取全球排行榜
func getGlobalRankings(c *gin.Context) {
	rows, err := db.Query(`
	SELECT nickname, score, region 
	FROM player_scores 
	ORDER BY score DESC 
	LIMIT ?
	`, GlobalRankLimit)
	if err != nil {
		log.Printf("Failed to get global rankings: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get rankings"})
		return
	}
	defer rows.Close()

	var rankings []RankEntry
	var rank = 1

	for rows.Next() {
		var entry RankEntry
		if err := rows.Scan(&entry.Nickname, &entry.Score, &entry.Region); err != nil {
			log.Printf("Failed to scan row: %v", err)
			continue
		}
		entry.Rank = rank
		rankings = append(rankings, entry)
		rank++
	}

	if err := rows.Err(); err != nil {
		log.Printf("Rows error: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get rankings"})
		return
	}

	c.JSON(http.StatusOK, APIResponse{Success: true, Data: rankings})
}

// 获取区域排行榜
func getRegionalRankings(c *gin.Context) {
	region := c.Query("region")
	if region == "" {
		c.JSON(http.StatusBadRequest, APIResponse{Success: false, Message: "Region parameter is required"})
		return
	}

	rows, err := db.Query(`
	SELECT nickname, score 
	FROM player_scores 
	WHERE region = ? 
	ORDER BY score DESC 
	LIMIT ?
	`, region, RegionalRankLimit)
	if err != nil {
		log.Printf("Failed to get regional rankings: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get rankings"})
		return
	}
	defer rows.Close()

	var rankings []RankEntry
	var rank = 1

	for rows.Next() {
		var entry RankEntry
		if err := rows.Scan(&entry.Nickname, &entry.Score); err != nil {
			log.Printf("Failed to scan row: %v", err)
			continue
		}
		entry.Rank = rank
		rankings = append(rankings, entry)
		rank++
	}

	if err := rows.Err(); err != nil {
		log.Printf("Rows error: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get rankings"})
		return
	}

	c.JSON(http.StatusOK, APIResponse{Success: true, Data: rankings})
}

// 获取玩家排名
func getPlayerRank(c *gin.Context) {
	ip := c.ClientIP()
	
	// 获取玩家区域
	region := getRegionByIP(ip)
	
	// 获取玩家的最佳分数
	var bestScore int
	row := db.QueryRow("SELECT MAX(score) FROM player_scores WHERE ip_address = ?", ip)
	if err := row.Scan(&bestScore); err != nil && err != sql.ErrNoRows {
		log.Printf("Failed to get player's best score: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get player rank"})
		return
	}

	// 获取全球排名
	var globalRank int
	row = db.QueryRow("SELECT COUNT(*) + 1 FROM player_scores WHERE score > ?", bestScore)
	if err := row.Scan(&globalRank); err != nil {
		log.Printf("Failed to get global rank: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get player rank"})
		return
	}

	// 获取区域排名
	var regionalRank int
	row = db.QueryRow("SELECT COUNT(*) + 1 FROM player_scores WHERE score > ? AND region = ?", bestScore, region)
	if err := row.Scan(&regionalRank); err != nil {
		log.Printf("Failed to get regional rank: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get player rank"})
		return
	}

	// 准备响应数据
	playerRank := struct {
		GlobalRank   int    `json:"global_rank"`
		RegionalRank int    `json:"regional_rank"`
		BestScore    int    `json:"best_score"`
		Region       string `json:"region"`
	}{globalRank, regionalRank, bestScore, region}

	c.JSON(http.StatusOK, APIResponse{Success: true, Data: playerRank})
}

// 搜索玩家
func searchPlayer(c *gin.Context) {
	nickname := c.Query("nickname")
	if nickname == "" {
		c.JSON(http.StatusBadRequest, APIResponse{Success: false, Message: "Nickname parameter is required"})
		return
	}

	// 搜索玩家的最佳分数
	var player struct {
		Nickname string `json:"nickname"`
		Score    int    `json:"score"`
		Region   string `json:"region"`
	}

	row := db.QueryRow(`
	SELECT nickname, MAX(score), region 
	FROM player_scores 
	WHERE nickname LIKE ? 
	GROUP BY nickname, region 
	ORDER BY MAX(score) DESC 
	LIMIT 1
	`, "%"+nickname+"%")

	if err := row.Scan(&player.Nickname, &player.Score, &player.Region); err == sql.ErrNoRows {
		c.JSON(http.StatusOK, APIResponse{Success: true, Message: "Player not found", Data: nil})
		return
	} else if err != nil {
		log.Printf("Failed to search player: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to search player"})
		return
	}

	// 获取全球排名
	var globalRank int
	row = db.QueryRow("SELECT COUNT(*) + 1 FROM player_scores WHERE score > ?", player.Score)
	if err := row.Scan(&globalRank); err != nil {
		log.Printf("Failed to get global rank for player: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get player rank"})
		return
	}

	// 获取区域排名
	var regionalRank int
	row = db.QueryRow("SELECT COUNT(*) + 1 FROM player_scores WHERE score > ? AND region = ?", player.Score, player.Region)
	if err := row.Scan(&regionalRank); err != nil {
		log.Printf("Failed to get regional rank for player: %v", err)
		c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: "Failed to get player rank"})
		return
	}

	// 准备响应数据
	searchResult := struct {
		Rank       int    `json:"rank"`
		Nickname   string `json:"nickname"`
		Score      int    `json:"score"`
		Region     string `json:"region"`
		GlobalRank int    `json:"global_rank"`
	}{globalRank, player.Nickname, player.Score, player.Region, globalRank}

	c.JSON(http.StatusOK, APIResponse{Success: true, Data: searchResult})
}
