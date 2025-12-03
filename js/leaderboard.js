// 排行榜功能模块
var Leaderboard = (function() {
	// 服务器API地址
	var API_BASE_URL = 'http://localhost:8080/api';
	
	// 玩家信息
	var playerInfo = {
		nickname: '',
		ipAddress: '',
		region: '',
		globalRank: '未上榜',
		regionalRank: '未上榜'
	};

	// 初始化
	function init() {
		// 检查本地存储中的昵称
		checkNickname();
		
		// 获取用户IP地址
		getUserIP();
		
		// 绑定事件
		bindEvents();
	}

	// 检查昵称
	function checkNickname() {
		var nickname = localStorage.getItem('hextris_nickname');
		if (nickname) {
			playerInfo.nickname = nickname;
		} else {
			// 首次进入，显示昵称输入弹窗
			setTimeout(function() {
				showNicknameModal();
			}, 1000);
		}
	}

	// 显示昵称输入弹窗
	function showNicknameModal() {
		$('#nicknameModal').show();
	}

	// 隐藏昵称输入弹窗
	function hideNicknameModal() {
		$('#nicknameModal').hide();
	}

	// 保存昵称
	function saveNickname(nickname) {
		if (nickname.trim() === '') {
			nickname = '匿名玩家';
		}
		playerInfo.nickname = nickname;
		localStorage.setItem('hextris_nickname', nickname);
		hideNicknameModal();
	}

	// 获取用户IP地址
	function getUserIP() {
		$.getJSON('https://api.ipify.org?format=json', function(data) {
			playerInfo.ipAddress = data.ip;
			// 这里可以调用IP地理位置API获取区域
			// 暂时默认设置为亚洲
			playerInfo.region = '亚洲';
		}).fail(function() {
			playerInfo.ipAddress = '127.0.0.1';
			playerInfo.region = '亚洲';
		});
	}

	// 绑定事件
	function bindEvents() {
		// 昵称确认按钮
		$('#confirmNicknameBtn').click(function() {
			var nickname = $('#nicknameInput').val();
			saveNickname(nickname);
		});

		// 排行榜按钮
		$('#leaderboardBtn, #leaderboardBtnBottom').click(function() {
			showLeaderboard();
		});

		// 关闭排行榜
		$('#closeLeaderboardBtn').click(function() {
			hideLeaderboard();
		});

		// 排行榜标签切换
		$('.leaderboardTab').click(function() {
			$('.leaderboardTab').removeClass('active').css('background', '#555');
			$(this).addClass('active').css('background', '#3498DB');
			
			var tabId = $(this).attr('id');
			if (tabId === 'globalTabBtn') {
				showGlobalLeaderboard();
			} else if (tabId === 'regionalTabBtn') {
				showRegionalLeaderboard();
			}
		});

		// 搜索按钮
		$('#searchBtn').click(function() {
			searchPlayers();
		});

		// 回车键搜索
		$('#searchInput').keypress(function(e) {
			if (e.which === 13) {
				searchPlayers();
			}
		});

		// 刷新按钮
		$('#refreshBtn').click(function() {
			refreshLeaderboard();
		});

		// 重试按钮
		$('#retryBtn').click(function() {
			hideNetworkError();
			refreshLeaderboard();
		});
	}

	// 显示排行榜
	function showLeaderboard() {
		$('#leaderboardScreen').show();
		showGlobalLeaderboard();
	}

	// 隐藏排行榜
	function hideLeaderboard() {
		$('#leaderboardScreen').hide();
	}

	// 显示全球排行榜
	function showGlobalLeaderboard() {
		$('.leaderboardTabContent').hide();
		$('#globalLeaderboard').show();
		loadGlobalLeaderboard();
	}

	// 显示区域排行榜
	function showRegionalLeaderboard() {
		$('.leaderboardTabContent').hide();
		$('#regionalLeaderboard').show();
		loadRegionalLeaderboard();
	}

	// 加载全球排行榜
	function loadGlobalLeaderboard() {
		showLoading('#globalLeaderboard');
		
		$.ajax({
			url: API_BASE_URL + '/rankings/global?limit=100',
			type: 'GET',
			dataType: 'json',
			timeout: 10000,
			success: function(response) {
				if (response.success) {
					renderGlobalLeaderboard(response.rankings);
					updateLastUpdated(response.last_updated);
					updatePlayerRankInfo();
				} else {
					displayError('#globalLeaderboard', '加载失败');
				}
			},
			error: function() {
				showNetworkError();
			}
		});
	}

	// 加载区域排行榜
	function loadRegionalLeaderboard() {
		showLoading('#regionalLeaderboard');
		
		$.ajax({
			url: API_BASE_URL + '/rankings/region?region=' + encodeURIComponent(playerInfo.region) + '&limit=50',
			type: 'GET',
			dataType: 'json',
			timeout: 10000,
			success: function(response) {
				if (response.success) {
					renderRegionalLeaderboard(response.rankings);
					updateLastUpdated(response.last_updated);
					updatePlayerRankInfo();
				} else {
					displayError('#regionalLeaderboard', '加载失败');
				}
			},
			error: function() {
				showNetworkError();
			}
		});
	}

	// 渲染全球排行榜
	function renderGlobalLeaderboard(rankings) {
		var container = $('#globalLeaderboard');
		container.empty();
		
		if (rankings.length === 0) {
			container.html('<p style="color: #fff; text-align: center; padding: 20px;">暂无数据</p>');
			return;
		}
		
		var table = $('<table style="width: 100%; color: #fff; border-collapse: collapse;">');
		table.append('<thead><tr style="border-bottom: 1px solid #555;"><th style="padding: 10px; text-align: left; width: 60px;">排名</th><th style="padding: 10px; text-align: left;">玩家昵称</th><th style="padding: 10px; text-align: right; width: 100px;">分数</th><th style="padding: 10px; text-align: right; width: 100px;">区域</th></tr></thead>');
		
		var tbody = $('<tbody>');
		$.each(rankings, function(index, entry) {
			var row = $('<tr style="border-bottom: 1px solid #444;">');
			row.append('<td style="padding: 10px;">' + entry.rank + '</td>');
			row.append('<td style="padding: 10px;">' + entry.nickname + '</td>');
			row.append('<td style="padding: 10px; text-align: right;">' + entry.score + '</td>');
			row.append('<td style="padding: 10px; text-align: right;">' + entry.region + '</td>');
			tbody.append(row);
		});
		
		table.append(tbody);
		container.append(table);
	}

	// 渲染区域排行榜
	function renderRegionalLeaderboard(rankings) {
		var container = $('#regionalLeaderboard');
		container.empty();
		
		if (rankings.length === 0) {
			container.html('<p style="color: #fff; text-align: center; padding: 20px;">暂无数据</p>');
			return;
		}
		
		var table = $('<table style="width: 100%; color: #fff; border-collapse: collapse;">');
		table.append('<thead><tr style="border-bottom: 1px solid #555;"><th style="padding: 10px; text-align: left; width: 60px;">排名</th><th style="padding: 10px; text-align: left;">玩家昵称</th><th style="padding: 10px; text-align: right; width: 100px;">分数</th></tr></thead>');
		
		var tbody = $('<tbody>');
		$.each(rankings, function(index, entry) {
			var row = $('<tr style="border-bottom: 1px solid #444;">');
			// 如果是当前玩家，高亮显示
			if (entry.nickname === playerInfo.nickname) {
				row.css('background', '#3498DB');
			}
			row.append('<td style="padding: 10px;">' + entry.rank + '</td>');
			row.append('<td style="padding: 10px;">' + entry.nickname + '</td>');
			row.append('<td style="padding: 10px; text-align: right;">' + entry.score + '</td>');
			body.append(row);
		});
		
		table.append(tbody);
		container.append(table);
	}

	// 搜索玩家
	function searchPlayers() {
		var nickname = $('#searchInput').val().trim();
		if (nickname === '') {
			// 如果搜索框为空，重新加载当前排行榜
			if ($('#globalTabBtn').hasClass('active')) {
				showGlobalLeaderboard();
			} else {
				showRegionalLeaderboard();
			}
			return;
		}
		
		var container = $('.leaderboardTabContent:visible');
		showLoading(container);
		
		$.ajax({
			url: API_BASE_URL + '/search?nickname=' + encodeURIComponent(nickname),
			type: 'GET',
			dataType: 'json',
			timeout: 10000,
			success: function(response) {
				if (response.success && response.results.length > 0) {
					renderSearchResults(response.results, container);
				} else {
					container.html('<p style="color: #fff; text-align: center; padding: 20px;">未找到相关玩家</p>');
				}
			},
			error: function() {
				showNetworkError();
			}
		});
	}

	// 渲染搜索结果
	function renderSearchResults(results, container) {
		container.empty();
		
		var table = $('<table style="width: 100%; color: #fff; border-collapse: collapse;">');
		table.append('<thead><tr style="border-bottom: 1px solid #555;"><th style="padding: 10px; text-align: left; width: 60px;">排名</th><th style="padding: 10px; text-align: left;">玩家昵称</th><th style="padding: 10px; text-align: right; width: 100px;">分数</th><th style="padding: 10px; text-align: right; width: 100px;">区域</th></tr></thead>');
		
		var tbody = $('<tbody>');
		$.each(results, function(index, entry) {
			var row = $('<tr style="border-bottom: 1px solid #444;">');
			row.append('<td style="padding: 10px;">' + (entry.rank > 0 ? entry.rank : '未上榜') + '</td>');
			row.append('<td style="padding: 10px;">' + entry.nickname + '</td>');
			row.append('<td style="padding: 10px; text-align: right;">' + entry.score + '</td>');
			row.append('<td style="padding: 10px; text-align: right;">' + entry.region + '</td>');
			body.append(row);
		});
		
		table.append(tbody);
		container.append(table);
	}

	// 刷新排行榜
	function refreshLeaderboard() {
		if ($('#globalTabBtn').hasClass('active')) {
			showGlobalLeaderboard();
		} else {
			showRegionalLeaderboard();
		}
	}

	// 更新最后更新时间
	function updateLastUpdated(timestamp) {
		if (timestamp) {
			var date = new Date(timestamp);
			var formattedDate = date.toLocaleString();
			$('#lastUpdated').text('最后更新: ' + formattedDate);
		}
	}

	// 更新玩家排名信息
	function updatePlayerRankInfo() {
		// 获取玩家的排名信息
		$.ajax({
			url: API_BASE_URL + '/player/rank?nickname=' + encodeURIComponent(playerInfo.nickname),
			type: 'GET',
			dataType: 'json',
			timeout: 10000,
			success: function(response) {
				if (response.success) {
					playerInfo.globalRank = response.global_rank > 0 ? response.global_rank : '未上榜';
					playerInfo.regionalRank = response.regional_rank > 0 ? response.regional_rank : '未上榜';
				} else {
					playerInfo.globalRank = '未上榜';
					playerInfo.regionalRank = '未上榜';
				}
				
				$('#globalRank').text(playerInfo.globalRank);
				$('#regionalRank').text(playerInfo.regionalRank);
				$('#playerRankInfo').show();
			},
			error: function() {
				// 网络错误，使用默认值
				$('#globalRank').text(playerInfo.globalRank);
				$('#regionalRank').text(playerInfo.regionalRank);
				$('#playerRankInfo').show();
			}
		});
	}

	// 显示加载状态
	function showLoading(container) {
		container.html('<p style="color: #fff; text-align: center; padding: 20px;">加载中...</p>');
	}

	// 显示错误信息
	function displayError(container, message) {
		container.html('<p style="color: #e74c3c; text-align: center; padding: 20px;">' + message + '</p>');
	}

	// 显示网络错误
	function showNetworkError() {
		$('#networkError').show();
		$('.leaderboardTabContent').hide();
	}

	// 隐藏网络错误
	function hideNetworkError() {
		$('#networkError').hide();
		$('.leaderboardTabContent').show();
	}

	// 上传分数
	function uploadScore(score) {
		// 检查分数是否符合要求
		if (score < 500) {
			return; // 分数太低，不上传
		}
		
		// 如果没有昵称，使用默认值
		var nickname = playerInfo.nickname || '匿名玩家';
		
		$.ajax({
			url: API_BASE_URL + '/score',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			timeout: 10000,
			data: JSON.stringify({
				nickname: nickname,
				score: score,
				ip_address: playerInfo.ipAddress
			}),
			success: function(response) {
				if (response.success) {
					// 更新玩家排名信息
					if (response.global_rank > 0) {
						playerInfo.globalRank = response.global_rank;
					}
					if (response.regional_rank > 0) {
						playerInfo.regionalRank = response.regional_rank;
					}
					// 显示上传成功提示
					showScoreUploadSuccess();
				}
			},
			error: function() {
				// 网络错误，不提示
			}
		});
	}

	// 显示分数上传成功提示
	function showScoreUploadSuccess() {
		// 使用sweet-alert显示提示
		if (typeof swal !== 'undefined') {
			swal({
				title: '分数已上传!',
				text: '您的分数已成功上传到排行榜',
				type: 'success',
				timer: 2000,
				showConfirmButton: false
			});
		}
	}

	// 公共方法
	return {
		init: init,
		uploadScore: uploadScore,
		showLeaderboard: showLeaderboard
	};
})();

// 页面加载完成后初始化
$(document).ready(function() {
	Leaderboard.init();
});
