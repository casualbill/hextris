package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// 区域定义
const (
	RegionAsia       = "Asia"
	RegionEurope     = "Europe"
	RegionNorthAmerica = "North America"
	RegionSouthAmerica = "South America"
	RegionAfrica     = "Africa"
	RegionOceania    = "Oceania"
)

// 玩家分数数据结构
type PlayerScore struct {
	ID       int    `json:"id"`
	Nickname string `json:"nickname"`
	Score    int    `json:"score"`
	Region   string `json:"region"`
	IP       string `json:"ip"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// 排行榜响应数据结构
type LeaderboardResponse struct {
	Players []PlayerScore `json:"players"`
	LastUpdate time.Time `json:"last_update"`
}

var db *sql.DB

func main() {
	// 暂时注释数据库连接，待MySQL服务器启动后再恢复
	// 初始化数据库连接
	//initDB()
	//defer db.Close()

	// 暂时注释IP2Location数据库初始化，待找到正确的函数名后再恢复
	//ip2location.Init("IP2LOCATION-LITE-DB1.BIN")
	//defer ip2location.Cleanup()

	// 设置路由
	mux := http.NewServeMux()
	mux.HandleFunc("/api/leaderboard/global", getGlobalLeaderboard)
	mux.HandleFunc("/api/leaderboard/region", getRegionLeaderboard)
	mux.HandleFunc("/api/score", submitScore)
	mux.HandleFunc("/api/search", getSearchPlayer)

	// 启动服务器
	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func initDB() {
	// 数据库连接字符串
	connStr := "root:password@tcp(127.0.0.1:3306)/hextris"
	var err error
	
	// 连接到MySQL数据库
	db, err = sql.Open("mysql", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// 测试数据库连接
	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Database connection successful")

	// 创建玩家分数表
	createTableSQL := `CREATE TABLE IF NOT EXISTS player_scores (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nickname VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
		score INT NOT NULL,
		region VARCHAR(50) NOT NULL,
		ip VARCHAR(45) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Player scores table created successfully")
}

// 根据IP地址获取玩家所在区域
func getRegionByIP(ip string) string {
	// 如果IP是本地地址，默认返回亚洲
	if ip == "127.0.0.1" || ip == "::1" {
		return RegionAsia
	}

	// 暂时注释IP2Location数据库查询，待找到正确的函数名后再恢复
	// 查询IP2Location数据库
	//result := ip2location.Get_all(ip)
	//if result.Country_short == "" {
		// 如果查询失败，默认返回亚洲
	//	return RegionAsia
	//}

	// 根据国家代码映射到区域
	//return mapCountryToRegion(result.Country_short)

	// 暂时默认返回亚洲区域
	return RegionAsia
}

// 将国家代码映射到区域
func mapCountryToRegion(countryCode string) string {
	// 亚洲国家代码
	asiaCountries := []string{"AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "HK", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MO", "MY", "MV", "MN", "MM", "NP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "TW", "TJ", "TH", "TL", "TM", "TR", "AE", "UZ", "VN", "YE"}

	// 欧洲国家代码
	europeCountries := []string{"AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL", "HU", "IS", "IE", "IT", "KZ", "XK", "LV", "LI", "LT", "LU", "MK", "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA", "GB", "VA"}

	// 北美洲国家代码
	northAmericaCountries := []string{"AI", "AG", "AW", "BS", "BB", "BZ", "BM", "CA", "KY", "CR", "CU", "CW", "DM", "DO", "SV", "GL", "GD", "GP", "GT", "HT", "HN", "JM", "MQ", "MX", "MS", "NI", "PA", "PR", "BL", "KN", "LC", "MF", "PM", "VC", "SX", "TC", "TT", "US", "VG", "VI"}

	// 南美洲国家代码
	southAmericaCountries := []string{"AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE"}

	// 非洲国家代码
	africaCountries := []string{"DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "YT", "MA", "MZ", "NA", "NE", "NG", "RE", "RW", "SH", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "SZ", "TZ", "TG", "TN", "TR", "UG", "EH", "ZM", "ZW"}

	// 大洋洲国家代码
	oceaniaCountries := []string{"AS", "AU", "CK", "FJ", "PF", "GU", "KI", "MH", "FM", "NR", "NC", "NZ", "NU", "NF", "MP", "PW", "PG", "PR", "WS", "SB", "AS", "TO", "TV", "UM", "VU", "VI"}

	// 检查国家代码属于哪个区域
	for _, code := range asiaCountries {
		if code == countryCode {
			return RegionAsia
		}
	}

	for _, code := range europeCountries {
		if code == countryCode {
			return RegionEurope
		}
	}

	for _, code := range northAmericaCountries {
		if code == countryCode {
			return RegionNorthAmerica
		}
	}

	for _, code := range southAmericaCountries {
		if code == countryCode {
			return RegionSouthAmerica
		}
	}

	for _, code := range africaCountries {
		if code == countryCode {
			return RegionAfrica
		}
	}

	for _, code := range oceaniaCountries {
		if code == countryCode {
			return RegionOceania
		}
	}

	// 如果没有找到匹配的区域，默认返回亚洲
	return RegionAsia
}

// 获取全球排行榜
func getGlobalLeaderboard(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 暂时注释数据库查询，返回模拟数据
	// 查询全球前100名玩家
	//rows, err := db.Query("SELECT id, nickname, score, region, created_at, updated_at FROM player_scores ORDER BY score DESC LIMIT 100")
	//if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}
	//defer rows.Close()

	// 解析查询结果
	var players []PlayerScore
	//for rows.Next() {
		//var p PlayerScore
		//if err := rows.Scan(&p.ID, &p.Nickname, &p.Score, &p.Region, &p.CreatedAt, &p.UpdatedAt); err != nil {
			//http.Error(w, err.Error(), http.StatusInternalServerError)
			//return
		//}
		//players = append(players, p)
	//}

	// 检查是否有扫描错误
	//if err := rows.Err(); err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}

	// 添加模拟数据
	players = append(players, PlayerScore{ID: 1, Nickname: "玩家1", Score: 10000, Region: RegionAsia, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	players = append(players, PlayerScore{ID: 2, Nickname: "玩家2", Score: 9000, Region: RegionEurope, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	players = append(players, PlayerScore{ID: 3, Nickname: "玩家3", Score: 8000, Region: RegionNorthAmerica, CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// 构建响应
	response := LeaderboardResponse{
		Players: players,
		LastUpdate: time.Now(),
	}

	// 设置响应头
	w.Header().Set("Content-Type", "application/json")

	// 编码并发送响应
	json.NewEncoder(w).Encode(response)
}

// 获取区域排行榜
func getRegionLeaderboard(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 获取区域参数
	region := r.URL.Query().Get("region")
	if region == "" {
		http.Error(w, "Region parameter is required", http.StatusBadRequest)
		return
	}

	// 暂时注释数据库查询，返回模拟数据
	// 查询指定区域前50名玩家
	//rows, err := db.Query("SELECT id, nickname, score, region, created_at, updated_at FROM player_scores WHERE region = ? ORDER BY score DESC LIMIT 50", region)
	//if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}
	//defer rows.Close()

	// 解析查询结果
	var players []PlayerScore
	//for rows.Next() {
		//var p PlayerScore
		//if err := rows.Scan(&p.ID, &p.Nickname, &p.Score, &p.Region, &p.CreatedAt, &p.UpdatedAt); err != nil {
			//http.Error(w, err.Error(), http.StatusInternalServerError)
			//return
		//}
		//players = append(players, p)
	//}

	// 检查是否有扫描错误
	//if err := rows.Err(); err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}

	// 添加模拟数据
	players = append(players, PlayerScore{ID: 1, Nickname: "区域玩家1", Score: 7000, Region: region, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	players = append(players, PlayerScore{ID: 2, Nickname: "区域玩家2", Score: 6000, Region: region, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	players = append(players, PlayerScore{ID: 3, Nickname: "区域玩家3", Score: 5000, Region: region, CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// 构建响应
	response := LeaderboardResponse{
		Players: players,
		LastUpdate: time.Now(),
	}

	// 设置响应头
	w.Header().Set("Content-Type", "application/json")

	// 编码并发送响应
	json.NewEncoder(w).Encode(response)
}

// 提交玩家分数
func submitScore(w http.ResponseWriter, r *http.Request) {
	// 只允许POST请求
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 解析请求体
	var p PlayerScore
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 获取玩家IP地址
	ip := getClientIP(r)

	// 根据IP地址获取玩家所在区域
	region := getRegionByIP(ip)

	// 检查分数是否达到最低要求
	// 全球排行榜最低分数为1000分，区域排行榜最低分数为500分
	// 只要达到区域排行榜最低分数就可以上传
	if p.Score < 500 {
		http.Error(w, "Score is too low", http.StatusBadRequest)
		return
	}

	// 暂时注释数据库操作，待MySQL服务器启动后再恢复
	// 插入玩家分数到数据库
	//result, err := db.Exec("INSERT INTO player_scores (nickname, score, region, ip) VALUES (?, ?, ?, ?)", p.Nickname, p.Score, region, ip)
	//if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}

	// 获取插入的ID
	//id, err := result.LastInsertId()
	//if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}

	// 构建响应
	p.ID = 1
	p.Region = region
	p.IP = ip
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	// 设置响应头
	w.Header().Set("Content-Type", "application/json")

	// 编码并发送响应
	json.NewEncoder(w).Encode(p)
}

// 搜索玩家
func getSearchPlayer(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 获取昵称参数
	nickname := r.URL.Query().Get("nickname")
	if nickname == "" {
		http.Error(w, "Nickname parameter is required", http.StatusBadRequest)
		return
	}

	// 暂时注释数据库查询，返回模拟数据
	// 搜索玩家
	//rows, err := db.Query("SELECT id, nickname, score, region, created_at, updated_at FROM player_scores WHERE nickname LIKE ? ORDER BY score DESC", "%"+nickname+"%")
	//if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}
	//defer rows.Close()

	// 解析查询结果
	var players []PlayerScore
	//for rows.Next() {
		//var p PlayerScore
		//if err := rows.Scan(&p.ID, &p.Nickname, &p.Score, &p.Region, &p.CreatedAt, &p.UpdatedAt); err != nil {
			//http.Error(w, err.Error(), http.StatusInternalServerError)
			//return
		//}
		//players = append(players, p)
	//}

	// 检查是否有扫描错误
	//if err := rows.Err(); err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		//return
	//}

	// 添加模拟数据
	players = append(players, PlayerScore{ID: 1, Nickname: nickname + "1", Score: 4000, Region: RegionAsia, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	players = append(players, PlayerScore{ID: 2, Nickname: nickname + "2", Score: 3000, Region: RegionEurope, CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// 设置响应头
	w.Header().Set("Content-Type", "application/json")

	// 编码并发送响应
	json.NewEncoder(w).Encode(players)
}

// 获取客户端IP地址
func getClientIP(r *http.Request) string {
	// 检查是否有X-Forwarded-For头
	ip := r.Header.Get("X-Forwarded-For")
	if ip != "" {
		// X-Forwarded-For头可能包含多个IP地址，用逗号分隔
		// 取第一个IP地址
		for i, b := range ip {
			if b == ',' {
				return ip[:i]
			}
		}
		return ip
	}

	// 检查是否有X-Real-IP头
	ip = r.Header.Get("X-Real-IP")
	if ip != "" {
		return ip
	}

	// 从请求的RemoteAddr字段获取IP地址
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		// 如果无法解析RemoteAddr，返回默认的本地IP地址
		return "127.0.0.1"
	}

	return ip
}
