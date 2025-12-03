package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// 数据库配置
const (
	DBHost     = "localhost"
	DBPort     = "3306"
	DBUser     = "root"
	DBPassword = ""
	DBName     = "hextris_rankings"
)

// 全局变量
var db *sql.DB

// Player 结构体表示玩家信息
type Player struct {
	ID       int    `json:"id"`
	Nickname string `json:"nickname"`
	IP       string `json:"ip_address"`
	Region   string `json:"region"`
	Score    int    `json:"score"`
	CreatedAt string `json:"created_at"`
}

// ScoreRequest 结构体表示分数上传请求
type ScoreRequest struct {
	Nickname string `json:"nickname"`
	Score    int    `json:"score"`
	IP       string `json:"ip_address"`
}

// ScoreResponse 结构体表示分数上传响应
type ScoreResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	GlobalRank    int    `json:"global_rank,omitempty"`
	RegionalRank  int    `json:"regional_rank,omitempty"`
}

// RankingEntry 结构体表示排行榜条目
type RankingEntry struct {
	Rank     int    `json:"rank"`
	Nickname string `json:"nickname"`
	Score    int    `json:"score"`
	Region   string `json:"region,omitempty"`
}

// RankingResponse 结构体表示排行榜响应
type RankingResponse struct {
	Success     bool            `json:"success"`
	LastUpdated string           `json:"last_updated"`
	Rankings    []RankingEntry  `json:"rankings"`
}

// SearchResponse 结构体表示搜索响应
type SearchResponse struct {
	Success bool            `json:"success"`
	Results []RankingEntry  `json:"results"`
}

// PingResponse 结构体表示ping响应
type PingResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func main() {
	// 连接数据库
	var err error
	connStr := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True",
		DBUser, DBPassword, DBHost, DBPort, DBName)
	db, err = sql.Open("mysql", connStr)
	if err != nil {
		log.Fatalf("无法连接数据库: %v", err)
	}
	defer db.Close()

	// 测试数据库连接
	err = db.Ping()
	if err != nil {
		log.Fatalf("无法ping数据库: %v", err)
	}
	log.Println("数据库连接成功")

	// 设置路由
	http.HandleFunc("/api/ping", pingHandler)
	http.HandleFunc("/api/score", scoreHandler)
	http.HandleFunc("/api/rankings/global", globalRankingsHandler)
	http.HandleFunc("/api/rankings/region", regionalRankingsHandler)
	http.HandleFunc("/api/search", searchHandler)
	
	// 获取玩家排名
	http.HandleFunc("/api/player/rank", playerRankHandler)

	// 启动服务器
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("服务器启动在端口 %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// pingHandler 处理连接检查请求
func pingHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	response := PingResponse{
		Success: true,
		Message: "服务器连接正常",
	}
	json.NewEncoder(w).Encode(response)
}

// scoreHandler 处理分数上传请求
func scoreHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
		return
	}

	var req ScoreRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "请求格式错误", http.StatusBadRequest)
		return
	}

	// 验证分数
	if req.Score <= 0 {
		http.Error(w, "分数必须大于0", http.StatusBadRequest)
		return
	}

	// 获取区域
	region := getRegionByIP(req.IP)
	if region == "" {
		region = "未知"
	}

	// 验证昵称
	if req.Nickname == "" {
		req.Nickname = "匿名玩家"
	}

	// 插入玩家数据
	result, err := db.Exec("INSERT INTO players (nickname, ip_address, region, score) VALUES (?, ?, ?, ?)",
		req.Nickname, req.IP, region, req.Score)
	if err != nil {
		log.Printf("插入玩家数据失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	// 获取插入的ID
	id, err := result.LastInsertId()
	if err != nil {
		log.Printf("获取插入ID失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	// 计算排名
	globalRank, err := getGlobalRank(req.Score)
	if err != nil {
		log.Printf("计算全球排名失败: %v", err)
		globalRank = -1
	}

	regionalRank, err := getRegionalRank(req.Score, region)
	if err != nil {
		log.Printf("计算区域排名失败: %v", err)
		regionalRank = -1
	}

	// 构造响应
	response := ScoreResponse{
		Success:       true,
		Message:       "分数已上传",
		GlobalRank:    globalRank,
		RegionalRank:  regionalRank,
	}

	log.Printf("玩家 %s (ID: %d) 上传分数 %d，区域: %s，全球排名: %d，区域排名: %d",
		req.Nickname, id, req.Score, region, globalRank, regionalRank)

	json.NewEncoder(w).Encode(response)
}

// globalRankingsHandler 处理全球排行榜请求
func globalRankingsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
		return
	}

	// 获取参数
	limitStr := r.URL.Query().Get("limit")
	limit := 100
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 100
		}
	}

	// 查询全球排行榜
	rows, err := db.Query("SELECT nickname, score, region FROM players WHERE score >= 1000 ORDER BY score DESC LIMIT ?", limit)
	if err != nil {
		log.Printf("查询全球排行榜失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// 处理结果
	var rankings []RankingEntry
	rank := 1
	for rows.Next() {
		var nickname, region string
		var score int
		err := rows.Scan(&nickname, &score, &region)
		if err != nil {
			log.Printf("扫描全球排行榜数据失败: %v", err)
			continue
		}
		rankings = append(rankings, RankingEntry{
			Rank:     rank,
			Nickname: nickname,
			Score:    score,
			Region:   region,
		})
		rank++
	}

	if err = rows.Err(); err != nil {
		log.Printf("遍历全球排行榜数据失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	// 构造响应
	response := RankingResponse{
		Success:     true,
		LastUpdated: time.Now().Format("2006-01-02 15:04:05"),
		Rankings:    rankings,
	}

	json.NewEncoder(w).Encode(response)
}

// regionalRankingsHandler 处理区域排行榜请求
func regionalRankingsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
		return
	}

	// 获取参数
	region := r.URL.Query().Get("region")
	if region == "" {
		http.Error(w, "区域参数不能为空", http.StatusBadRequest)
		return
	}

	limitStr := r.URL.Query().Get("limit")
	limit := 50
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 50
		}
	}

	// 查询区域排行榜
	rows, err := db.Query("SELECT nickname, score FROM players WHERE region = ? AND score >= 500 ORDER BY score DESC LIMIT ?", region, limit)
	if err != nil {
		log.Printf("查询区域排行榜失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// 处理结果
	var rankings []RankingEntry
	rank := 1
	for rows.Next() {
		var nickname string
		var score int
		err := rows.Scan(&nickname, &score)
		if err != nil {
			log.Printf("扫描区域排行榜数据失败: %v", err)
			continue
		}
		rankings = append(rankings, RankingEntry{
			Rank:     rank,
			Nickname: nickname,
			Score:    score,
		})
		rank++
	}

	if err = rows.Err(); err != nil {
		log.Printf("遍历区域排行榜数据失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	// 构造响应
	response := RankingResponse{
		Success:     true,
		LastUpdated: time.Now().Format("2006-01-02 15:04:05"),
		Rankings:    rankings,
	}

	json.NewEncoder(w).Encode(response)
}

// searchHandler 处理玩家搜索请求
func searchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
		return
	}

	// 获取参数
	nickname := r.URL.Query().Get("nickname")
	if nickname == "" {
		http.Error(w, "昵称参数不能为空", http.StatusBadRequest)
		return
	}

	// 查询玩家
	rows, err := db.Query("SELECT nickname, score, region FROM players WHERE nickname LIKE ? ORDER BY score DESC", "%"+nickname+"%")
	if err != nil {
		log.Printf("搜索玩家失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// 处理结果
	var results []RankingEntry
	for rows.Next() {
		var nick, region string
		var score int
		err := rows.Scan(&nick, &score, &region)
		if err != nil {
			log.Printf("扫描搜索结果失败: %v", err)
			continue
		}

		// 计算排名
		rank, err := getGlobalRank(score)
		if err != nil {
			rank = -1
		}

		results = append(results, RankingEntry{
			Rank:     rank,
			Nickname: nick,
			Score:    score,
			Region:   region,
		})
	}

	if err = rows.Err(); err != nil {
		log.Printf("遍历搜索结果失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	// 构造响应
	response := SearchResponse{
		Success: true,
		Results: results,
	}

	json.NewEncoder(w).Encode(response)
}

// getRegionByIP 根据IP地址获取区域
func getRegionByIP(ip string) string {
	// 解析IP地址
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return "未知"
	}

	// 转换为整数
	ipInt := ipToInt(parsedIP)

	// 查询数据库中的IP范围
	rows, err := db.Query("SELECT region_name FROM regions WHERE INET_ATON(ip_range_start) <= ? AND INET_ATON(ip_range_end) >= ?", ipInt, ipInt)
	if err != nil {
		log.Printf("查询IP区域失败: %v", err)
		return "未知"
	}
	defer rows.Close()

	// 获取第一个匹配的区域
	var region string
	if rows.Next() {
		err := rows.Scan(&region)
		if err != nil {
			log.Printf("扫描IP区域失败: %v", err)
			return "未知"
		}
		return region
	}

	// 如果没有匹配，返回默认区域（这里简化处理）
	// 实际应用中应该使用更完整的IP数据库
	return "亚洲"
}

// ipToInt 将IP地址转换为整数
func ipToInt(ip net.IP) uint32 {
	if ip == nil {
		return 0
	}
	ip = ip.To4()
	if ip == nil {
		return 0
	}
	return uint32(ip[0])<<24 | uint32(ip[1])<<16 | uint32(ip[2])<<8 | uint32(ip[3])
}

// getGlobalRank 计算全球排名
func getGlobalRank(score int) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM players WHERE score > ?", score).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count + 1, nil
}

// getRegionalRank 计算区域排名
func getRegionalRank(score int, region string) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM players WHERE region = ? AND score > ?", region, score).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count + 1, nil
}

// playerRankHandler 处理获取玩家排名请求
func playerRankHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
		return
	}

	nickname := r.URL.Query().Get("nickname")
	if nickname == "" {
		http.Error(w, "昵称参数不能为空", http.StatusBadRequest)
		return
	}

	// 获取玩家信息
	var player Player
	err := db.QueryRow("SELECT nickname, score, region FROM players WHERE nickname = ? ORDER BY score DESC LIMIT 1", nickname).Scan(&player.Nickname, &player.Score, &player.Region)
	if err != nil {
		if err == sql.ErrNoRows {
			response := map[string]interface{}{
				"success":       true,
				"global_rank":   0,
				"regional_rank": 0,
			}
			json.NewEncoder(w).Encode(response)
		} else {
			log.Printf("查询玩家信息失败: %v", err)
			http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		}
		return
	}

	// 计算全球排名
	globalRank, err := getGlobalRank(player.Score)
	if err != nil {
		globalRank = 0
	}

	// 计算区域排名
	regionalRank, err := getRegionalRank(player.Score, player.Region)
	if err != nil {
		regionalRank = 0
	}

	response := map[string]interface{}{
		"success":       true,
		"global_rank":   globalRank,
		"regional_rank": regionalRank,
	}
	json.NewEncoder(w).Encode(response)
}
