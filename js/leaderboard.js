// 排行榜功能模块
var Leaderboard = {
	// 服务器 API 地址
	apiBaseUrl: 'https://hextris-rankings-api.onrender.com/api',
	
	// 玩家信息
	player: {
		nickname: '',
		region: '',
		bestScore: 0,
		globalRank: -1,
		regionalRank: -1
	},
	
	// 排行榜数据
	globalRankings: [],
	regionalRankings: [],
	
	// 最后更新时间
	lastUpdateTime: null,
	
	// 初始化排行榜功能
	init: function() {
		this.loadPlayerNickname();
		this.bindEvents();
		this.getPlayerInfo();
	},
	
	// 加载玩家昵称
	loadPlayerNickname: function() {
		var nickname = localStorage.getItem('playerNickname');
		if (!nickname) {
			this.promptForNickname();
		} else {
			this.player.nickname = nickname;
		}
	},
	
	// 提示玩家输入昵称
	promptForNickname: function() {
		swal({
			title: '欢迎来到 Hextris!',
			text: '请输入你的昵称:',
			type: 'input',
			showCancelButton: true,
			confirmButtonText: '确定',
			cancelButtonText: '跳过',
			closeOnConfirm: true,
			inputPlaceholder: '你的昵称'
		}, function(inputValue) {
			if (inputValue === false) return;
			
			if (inputValue === '') {
				Leaderboard.player.nickname = '匿名玩家';
			} else {
				Leaderboard.player.nickname = inputValue;
			}
			
			localStorage.setItem('playerNickname', Leaderboard.player.nickname);
		});
	},
	
	// 绑定事件
	bindEvents: function() {
		// 排行榜按钮点击事件
		$('#leaderboardBtn').on('click', function() {
			Leaderboard.showLeaderboard();
		});
		
		// 关闭排行榜按钮点击事件
		$('#closeLeaderboardBtn').on('click', function() {
			Leaderboard.hideLeaderboard();
		});
		
		// 标签切换事件
		$('#globalTab').on('click', function() {
			Leaderboard.switchTab('global');
		});
		
		$('#regionalTab').on('click', function() {
			Leaderboard.switchTab('regional');
		});
		
		// 刷新按钮点击事件
		$('#refreshLeaderboardBtn').on('click', function() {
			Leaderboard.refreshLeaderboard();
		});
		
		// 搜索按钮点击事件
		$('#searchBtn').on('click', function() {
			Leaderboard.searchPlayer();
		});
		
		// 回车键搜索
		$('#searchInput').on('keypress', function(e) {
			if (e.which == 13) {
				Leaderboard.searchPlayer();
			}
		});
	},
	
	// 显示排行榜
	showLeaderboard: function() {
		$('#leaderboardScreen').removeClass('hidden');
		this.loadGlobalRankings();
		this.loadRegionalRankings();
	},
	
	// 隐藏排行榜
	hideLeaderboard: function() {
		$('#leaderboardScreen').addClass('hidden');
	},
	
	// 切换标签
	switchTab: function(tab) {
		// 更新标签样式
		$('#globalTab').removeClass('active');
		$('#regionalTab').removeClass('active');
		$('#' + tab + 'Tab').addClass('active');
		
		// 显示对应的排行榜
		$('#globalLeaderboard').addClass('hidden');
		$('#regionalLeaderboard').addClass('hidden');
		$('#' + tab + 'Leaderboard').removeClass('hidden');
	},
	
	// 获取玩家信息
	getPlayerInfo: function() {
		$.ajax({
			url: this.apiBaseUrl + '/player-rank',
			method: 'GET',
			dataType: 'json',
			success: function(response) {
				if (response.success) {
					Leaderboard.player.region = response.data.region;
					Leaderboard.player.bestScore = response.data.best_score;
					Leaderboard.player.globalRank = response.data.global_rank;
					Leaderboard.player.regionalRank = response.data.regional_rank;
					Leaderboard.updatePlayerInfoDisplay();
				}
			},
			error: function() {
				console.error('Failed to get player info');
			}
		});
	},
	
	// 更新玩家信息显示
	updatePlayerInfoDisplay: function() {
		// 更新全球排名
		if (this.player.globalRank <= 100 && this.player.globalRank > 0) {
			$('#playerGlobalRank').text('#' + this.player.globalRank);
		} else {
			$('#playerGlobalRank').text('未上榜');
		}
		
		// 更新区域排名
		if (this.player.regionalRank <= 50 && this.player.regionalRank > 0) {
			$('#playerRegionalRank').text('#' + this.player.regionalRank);
		} else {
			$('#playerRegionalRank').text('未上榜');
		}
	},
	
	// 加载全球排行榜
	loadGlobalRankings: function() {
		// 显示加载状态
		$('#globalLeaderboard').html('<div id="globalLeaderboardLoading" class="loading">加载中...</div>');
		
		$.ajax({
			url: this.apiBaseUrl + '/global-rankings',
			method: 'GET',
			dataType: 'json',
			success: function(response) {
				if (response.success) {
					Leaderboard.globalRankings = response.data;
					Leaderboard.displayGlobalRankings();
					Leaderboard.updateLastUpdateTime();
				} else {
					$('#globalLeaderboard').html('<div class="loading">加载失败</div>');
				}
			},
			error: function() {
				$('#globalLeaderboard').html('<div class="loading">网络连接失败，无法加载排行榜</div>');
			}
		});
	},
	
	// 显示全球排行榜
	displayGlobalRankings: function() {
		var html = '';
		
		if (this.globalRankings.length === 0) {
			html = '<div class="loading">暂无数据</div>';
		} else {
			for (var i = 0; i < this.globalRankings.length; i++) {
				var entry = this.globalRankings[i];
				var className = 'leaderboardItem';
				
				// 为前三名添加特殊样式
				if (entry.rank === 1) className += ' rank1';
				else if (entry.rank === 2) className += ' rank2';
				else if (entry.rank === 3) className += ' rank3';
				
				// 高亮显示当前玩家
				if (entry.nickname === this.player.nickname && entry.score === this.player.bestScore) {
					className += ' currentPlayer';
				}
				
				html += '<div class="' + className + '">' +
						'<div class="leaderboardRank">#' + entry.rank + '</div>' +
						'<div class="leaderboardNickname">' + entry.nickname + '</div>' +
						'<div class="leaderboardScore">' + entry.score + '</div>' +
						'<div class="leaderboardRegion">' + entry.region + '</div>' +
					'</div>';
			}
		}
		
		$('#globalLeaderboard').html(html);
	},
	
	// 加载区域排行榜
	loadRegionalRankings: function() {
		// 如果玩家区域未知，先获取玩家信息
		if (!this.player.region) {
			this.getPlayerInfo();
			return;
		}
		
		// 显示加载状态
		$('#regionalLeaderboard').html('<div id="regionalLeaderboardLoading" class="loading">加载中...</div>');
		
		$.ajax({
			url: this.apiBaseUrl + '/regional-rankings',
			method: 'GET',
			dataType: 'json',
			data: { region: this.player.region },
			success: function(response) {
				if (response.success) {
					Leaderboard.regionalRankings = response.data;
					Leaderboard.displayRegionalRankings();
					Leaderboard.updateLastUpdateTime();
				} else {
					$('#regionalLeaderboard').html('<div class="loading">加载失败</div>');
				}
			},
			error: function() {
				$('#regionalLeaderboard').html('<div class="loading">网络连接失败，无法加载排行榜</div>');
			}
		});
	},
	
	// 显示区域排行榜
	displayRegionalRankings: function() {
		var html = '';
		
		if (this.regionalRankings.length === 0) {
			html = '<div class="loading">暂无数据</div>';
		} else {
			for (var i = 0; i < this.regionalRankings.length; i++) {
				var entry = this.regionalRankings[i];
				var className = 'leaderboardItem';
				
				// 为前三名添加特殊样式
				if (entry.rank === 1) className += ' rank1';
				else if (entry.rank === 2) className += ' rank2';
				else if (entry.rank === 3) className += ' rank3';
				
				// 高亮显示当前玩家
				if (entry.nickname === this.player.nickname && entry.score === this.player.bestScore) {
					className += ' currentPlayer';
				}
				
				html += '<div class="' + className + '">' +
						'<div class="leaderboardRank">#' + entry.rank + '</div>' +
						'<div class="leaderboardNickname">' + entry.nickname + '</div>' +
						'<div class="leaderboardScore">' + entry.score + '</div>' +
					'</div>';
			}
		}
		
		$('#regionalLeaderboard').html(html);
	},
	
	// 刷新排行榜
	refreshLeaderboard: function() {
		this.loadGlobalRankings();
		this.loadRegionalRankings();
		this.getPlayerInfo();
	},
	
	// 搜索玩家
	searchPlayer: function() {
		var nickname = $('#searchInput').val().trim();
		if (!nickname) {
			swal('提示', '请输入玩家昵称', 'warning');
			return;
		}
		
		$.ajax({
			url: this.apiBaseUrl + '/search-player',
			method: 'GET',
			dataType: 'json',
			data: { nickname: nickname },
			success: function(response) {
				if (response.success) {
					if (response.data) {
						var player = response.data;
						var html = '<div class="searchResult">' +
								'<div>昵称: ' + player.nickname + '</div>' +
								'<div>分数: ' + player.score + '</div>' +
								'<div>区域: ' + player.region + '</div>' +
								'<div>全球排名: #' + player.global_rank + '</div>' +
								'</div>';
								
						// 在当前显示的排行榜顶部显示搜索结果
						var currentTab = $('#globalTab').hasClass('active') ? 'global' : 'regional';
						$('#' + currentTab + 'Leaderboard').prepend(html);
					} else {
						swal('提示', '未找到该玩家', 'info');
					}
				} else {
					swal('提示', '搜索失败', 'error');
				}
			},
			error: function() {
				swal('提示', '网络连接失败，无法搜索玩家', 'error');
			}
		});
	},
	
	// 上传分数
	submitScore: function(score) {
		// 检查分数是否达到最低要求
		if (score < 500) {
			return; // 分数太低，不上传
		}
		
		// 如果玩家没有昵称，提示输入
		if (!this.player.nickname || this.player.nickname === '匿名玩家') {
			this.promptForNicknameBeforeSubmit(score);
			return;
		}
		
		// 上传分数
		this.doSubmitScore(score);
	},
	
	// 提交分数前提示输入昵称
	promptForNicknameBeforeSubmit: function(score) {
		swal({
			title: '上传分数',
			text: '请输入你的昵称以上传分数:',
			type: 'input',
			showCancelButton: true,
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			closeOnConfirm: true,
			inputPlaceholder: '你的昵称'
		}, function(inputValue) {
			if (inputValue === false) return;
			
			if (inputValue === '') {
				Leaderboard.player.nickname = '匿名玩家';
			} else {
				Leaderboard.player.nickname = inputValue;
			}
			
			localStorage.setItem('playerNickname', Leaderboard.player.nickname);
			Leaderboard.doSubmitScore(score);
		});
	},
	
	// 执行分数上传
	doSubmitScore: function(score) {
		$.ajax({
			url: this.apiBaseUrl + '/submit-score',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				nickname: this.player.nickname,
				score: score
			}),
			success: function(response) {
				if (response.success) {
					swal('成功', '分数已上传', 'success');
					// 更新玩家信息和排行榜
					Leaderboard.getPlayerInfo();
				} else {
					swal('提示', response.message, 'warning');
				}
			},
			error: function() {
				swal('提示', '网络连接失败，无法上传分数', 'error');
			}
		});
	},
	
	// 更新最后更新时间
	updateLastUpdateTime: function() {
		this.lastUpdateTime = new Date();
		var timeString = this.formatTime(this.lastUpdateTime);
		$('#lastUpdateTime').text('最后更新: ' + timeString);
	},
	
	// 格式化时间
	formatTime: function(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		
		// 补零
		month = month < 10 ? '0' + month : month;
		day = day < 10 ? '0' + day : day;
		hours = hours < 10 ? '0' + hours : hours;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		seconds = seconds < 10 ? '0' + seconds : seconds;
		
		return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
	}
};

// 游戏结束时上传分数
function onGameOver() {
	// 假设 score 是全局变量，表示当前游戏分数
	Leaderboard.submitScore(score);
}

// 页面加载完成后初始化排行榜功能
$(document).ready(function() {
	Leaderboard.init();
});
