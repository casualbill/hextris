// 排行榜功能模块

// 服务器地址
const SERVER_URL = 'http://localhost:8080';

// 排行榜数据
let globalLeaderboardData = [];
let regionLeaderboardData = [];
let searchResultsData = [];

// 玩家信息
let currentPlayer = {
	nickname: '',
	score: 0,
	rank: -1
};

// 区域信息
let currentRegion = {
	name: '',
	code: ''
};

// 初始化排行榜功能
function initLeaderboard() {
	// 绑定事件
	bindLeaderboardEvents();

	// 加载本地存储的玩家昵称
	loadPlayerNickname();

	// 尝试获取玩家区域
	getPlayerRegion();
}

// 绑定排行榜相关事件
function bindLeaderboardEvents() {
	// 排行榜按钮点击事件
	$('#leaderboardBtn').click(function() {
		showLeaderboard();
	});

	// 返回按钮点击事件
	$('#backBtn').click(function() {
		hideLeaderboard();
	});

	// 排行榜标签切换事件
	$('#globalTab').click(function() {
		switchToGlobalLeaderboard();
	});

	$('#regionTab').click(function() {
		switchToRegionLeaderboard();
	});

	// 搜索按钮点击事件
	$('#searchBtn').click(function() {
		searchPlayers();
	});

	// 搜索输入框回车事件
	$('#searchInput').keypress(function(e) {
		if (e.which == 13) {
			searchPlayers();
		}
	});

	// 返回全球排行榜按钮点击事件
	$('#backToGlobalBtn').click(function() {
		showGlobalLeaderboard();
	});

	// 刷新按钮点击事件
	$('#globalRefreshBtn').click(function() {
		loadGlobalLeaderboard();
	});

	$('#regionRefreshBtn').click(function() {
		loadRegionLeaderboard();
	});

	// 重试按钮点击事件
	$('#retryBtn').click(function() {
		loadGlobalLeaderboard();
	});
}

// 显示排行榜
function showLeaderboard() {
	// 显示排行榜界面
	$('#leaderboardScreen').show();

	// 隐藏游戏结束界面
	$('#gameoverscreen').hide();

	// 加载全球排行榜
	loadGlobalLeaderboard();
}

// 隐藏排行榜
function hideLeaderboard() {
	// 隐藏排行榜界面
	$('#leaderboardScreen').hide();

	// 显示游戏结束界面
	$('#gameoverscreen').show();
}

// 切换到全球排行榜
function switchToGlobalLeaderboard() {
	// 更新标签状态
	$('#globalTab').addClass('active');
	$('#regionTab').removeClass('active');

	// 显示全球排行榜
	showGlobalLeaderboard();
}

// 切换到区域排行榜
function switchToRegionLeaderboard() {
	// 更新标签状态
	$('#regionTab').addClass('active');
	$('#globalTab').removeClass('active');

	// 显示区域排行榜
	showRegionLeaderboard();
}

// 显示全球排行榜
function showGlobalLeaderboard() {
	// 隐藏其他内容
	$('#regionLeaderboard').hide();
	$('#searchResults').hide();
	$('#networkError').hide();

	// 显示全球排行榜
	$('#globalLeaderboard').show();

	// 如果没有数据，加载数据
	if (globalLeaderboardData.length === 0) {
		loadGlobalLeaderboard();
	} else {
		// 渲染排行榜
		renderGlobalLeaderboard();
	}
}

// 显示区域排行榜
function showRegionLeaderboard() {
	// 隐藏其他内容
	$('#globalLeaderboard').hide();
	$('#searchResults').hide();
	$('#networkError').hide();

	// 显示区域排行榜
	$('#regionLeaderboard').show();

	// 如果没有数据，加载数据
	if (regionLeaderboardData.length === 0) {
		loadRegionLeaderboard();
	} else {
		// 渲染排行榜
		renderRegionLeaderboard();
	}
}

// 加载全球排行榜
function loadGlobalLeaderboard() {
	// 显示加载状态
	showLoadingState('#globalLeaderboardList');

	// 发送HTTP GET请求获取全球排行榜数据
	$.get(SERVER_URL + '/leaderboard/global', function(data) {
		// 保存排行榜数据
		globalLeaderboardData = data.players;

		// 渲染排行榜
		renderGlobalLeaderboard();

		// 更新最后更新时间
		updateLastUpdate('#globalLastUpdate');

		// 隐藏网络错误提示
		$('#networkError').hide();

	}).fail(function() {
		// 显示网络错误提示
		showNetworkError();

	}).always(function() {
		// 隐藏加载状态
		hideLoadingState('#globalLeaderboardList');
	});
}

// 加载区域排行榜
function loadRegionLeaderboard() {
	// 显示加载状态
	showLoadingState('#regionLeaderboardList');

	// 发送HTTP GET请求获取区域排行榜数据
	$.get(SERVER_URL + '/leaderboard/region', function(data) {
		// 保存排行榜数据
		regionLeaderboardData = data.players;

		// 更新区域信息
		currentRegion.name = data.region.name;
		currentRegion.code = data.region.code;

		// 渲染排行榜
		renderRegionLeaderboard();

		// 更新最后更新时间
		updateLastUpdate('#regionLastUpdate');

		// 隐藏网络错误提示
		$('#networkError').hide();

	}).fail(function() {
		// 显示网络错误提示
		showNetworkError();

	}).always(function() {
		// 隐藏加载状态
		hideLoadingState('#regionLeaderboardList');
	});
}

// 渲染全球排行榜
function renderGlobalLeaderboard() {
	const leaderboardList = $('#globalLeaderboardList');
	leaderboardList.empty();

	// 遍历排行榜数据
	globalLeaderboardData.forEach(function(player, index) {
		const rank = index + 1;
		const isTop3 = rank <= 3;

		// 创建排行榜项
		const item = $('<div class="leaderboardItem"></div>');
		item.append('<div class="rank ' + (isTop3 ? 'top3' : '') + '">' + rank + '</div>');
		item.append('<div class="nickname">' + player.nickname + '</div>');
		item.append('<div class="score">' + player.score + '</div>');

		// 添加到排行榜列表
		leaderboardList.append(item);

		// 检查是否是当前玩家
		if (player.nickname === currentPlayer.nickname) {
			currentPlayer.rank = rank;
			currentPlayer.score = player.score;
		}
	});

	// 显示当前玩家排名
	renderPlayerRank('#playerGlobalRank', '全球', currentPlayer.rank);
}

// 渲染区域排行榜
function renderRegionLeaderboard() {
	const leaderboardList = $('#regionLeaderboardList');
	leaderboardList.empty();

	// 更新区域名称
	$('#regionName').text(currentRegion.name + ' 排行榜');

	// 遍历排行榜数据
	regionLeaderboardData.forEach(function(player, index) {
		const rank = index + 1;
		const isTop3 = rank <= 3;

		// 创建排行榜项
		const item = $('<div class="leaderboardItem"></div>');
		item.append('<div class="rank ' + (isTop3 ? 'top3' : '') + '">' + rank + '</div>');
		item.append('<div class="nickname">' + player.nickname + '</div>');
		item.append('<div class="score">' + player.score + '</div>');

		// 添加到排行榜列表
		leaderboardList.append(item);

		// 检查是否是当前玩家
		if (player.nickname === currentPlayer.nickname) {
			currentPlayer.rank = rank;
			currentPlayer.score = player.score;
		}
	});

	// 显示当前玩家排名
	renderPlayerRank('#playerRegionRank', currentRegion.name, currentPlayer.rank);
}

// 渲染玩家排名
function renderPlayerRank(elementId, leaderboardType, rank) {
	const playerRankElement = $(elementId);

	if (rank > 0) {
		// 显示玩家排名
		playerRankElement.text('你在' + leaderboardType + '排行榜中排名第 ' + rank + ' 名');
		playerRankElement.show();
	} else {
		// 隐藏玩家排名
		playerRankElement.hide();
	}
}

// 搜索玩家
function searchPlayers() {
	const searchInput = $('#searchInput');
	const nickname = searchInput.val().trim();

	// 检查输入是否为空
	if (nickname === '') {
		alert('请输入要搜索的玩家昵称');
		return;
	}

	// 显示加载状态
	showLoadingState('#globalLeaderboardList');

	// 发送HTTP GET请求搜索玩家
	$.get(SERVER_URL + '/leaderboard/search', { nickname: nickname }, function(data) {
		// 保存搜索结果
		searchResultsData = data.players;

		// 渲染搜索结果
		renderSearchResults();

		// 隐藏网络错误提示
		$('#networkError').hide();

	}).fail(function() {
		// 显示网络错误提示
		showNetworkError();

	}).always(function() {
		// 隐藏加载状态
		hideLoadingState('#globalLeaderboardList');
	});
}

// 渲染搜索结果
function renderSearchResults() {
	const searchResultsList = $('#searchResultsList');
	searchResultsList.empty();

	// 隐藏其他内容
	$('#globalLeaderboard').hide();
	$('#regionLeaderboard').hide();
	$('#networkError').hide();

	// 显示搜索结果
	$('#searchResults').show();

	// 检查是否有搜索结果
	if (searchResultsData.length === 0) {
		// 显示没有找到玩家的提示
		searchResultsList.append('<div class="noResults">没有找到该玩家</div>');
	} else {
		// 遍历搜索结果
		searchResultsData.forEach(function(player, index) {
			const rank = index + 1;
			const isTop3 = rank <= 3;

			// 创建搜索结果项
			const item = $('<div class="leaderboardItem"></div>');
			item.append('<div class="rank ' + (isTop3 ? 'top3' : '') + '">' + rank + '</div>');
			item.append('<div class="nickname">' + player.nickname + '</div>');
			item.append('<div class="score">' + player.score + '</div>');

			// 添加到搜索结果列表
			searchResultsList.append(item);
		});
	}
}

// 提交分数
function submitScore(score) {
	// 检查是否已经设置了玩家昵称
	if (currentPlayer.nickname === '') {
		// 提示用户输入昵称
		setPlayerNickname();
	}

	// 发送HTTP POST请求提交分数
	$.post(SERVER_URL + '/leaderboard/submit', {
		nickname: currentPlayer.nickname,
		score: score
	}, function(data) {
		// 保存玩家的新排名
		currentPlayer.rank = data.rank;
		currentPlayer.score = data.score;

		// 显示提交成功的提示
		alert('分数已提交！你在全球排行榜中排名第 ' + currentPlayer.rank + ' 名');

	}).fail(function() {
		// 显示提交失败的提示
		alert('分数提交失败，请检查网络连接后重试');
	});
}

// 设置玩家昵称
function setPlayerNickname() {
	let nickname = prompt('请输入你的昵称（1-20个字符）：');

	// 检查昵称是否符合要求
	while (nickname === null || nickname.trim() === '' || nickname.length > 20) {
		if (nickname === null) {
			// 用户取消了输入
			nickname = '匿名玩家';
			break;
		} else if (nickname.trim() === '') {
			alert('昵称不能为空');
		} else if (nickname.length > 20) {
			alert('昵称长度不能超过20个字符');
		}

		nickname = prompt('请输入你的昵称（1-20个字符）：');
	}

	// 保存玩家昵称
	currentPlayer.nickname = nickname.trim();

	// 保存到本地存储
	localStorage.setItem('hextris_nickname', currentPlayer.nickname);
}

// 加载玩家昵称
function loadPlayerNickname() {
	const nickname = localStorage.getItem('hextris_nickname');

	if (nickname !== null) {
		currentPlayer.nickname = nickname;
	} else {
		// 没有保存的昵称，提示用户输入
		setPlayerNickname();
	}
}

// 获取玩家区域
function getPlayerRegion() {
	// 这里可以使用IP geolocation API来获取玩家的区域
	// 为了演示，我们使用默认的区域
	currentRegion.name = '中国';
	currentRegion.code = 'CN';
}

// 显示加载状态
function showLoadingState(elementId) {
	const element = $(elementId);
	element.html('<div class="loading">加载中...</div>');
}

// 隐藏加载状态
function hideLoadingState(elementId) {
	const element = $(elementId);
	// 不需要做任何事情，因为会在渲染排行榜时替换内容
}

// 显示网络错误提示
function showNetworkError() {
	// 隐藏其他内容
	$('#globalLeaderboard').hide();
	$('#regionLeaderboard').hide();
	$('#searchResults').hide();

	// 显示网络错误提示
	$('#networkError').show();
}

// 更新最后更新时间
function updateLastUpdate(elementId) {
	const element = $(elementId);
	const now = new Date();
	const timeString = now.getFullYear() + '-' + 
							(now.getMonth() + 1) + '-' + 
							now.getDate() + ' ' + 
							now.getHours() + ':' + 
							now.getMinutes() + ':' + 
							now.getSeconds();
	element.text('最后更新：' + timeString);
}

// 当DOM加载完成时初始化排行榜功能
$(document).ready(function() {
	initLeaderboard();
});