// 排行榜功能测试脚本
// 这个脚本用于测试排行榜功能的端到端流程

console.log('=== 排行榜功能测试 ===');

// 测试步骤：
// 1. 测试服务器连接
// 2. 测试分数上传
// 3. 测试全球排行榜获取
// 4. 测试区域排行榜获取
// 5. 测试玩家搜索
// 6. 测试玩家排名获取

var API_BASE_URL = 'http://localhost:8080/api';

// 1. 测试服务器连接
console.log('\n1. 测试服务器连接...');
$.ajax({
    url: API_BASE_URL + '/ping',
    type: 'GET',
    dataType: 'json',
    timeout: 5000,
    success: function(response) {
        console.log('✓ 服务器连接成功:', response);
        // 2. 测试分数上传
        testScoreUpload();
    },
    error: function(xhr, status, error) {
        console.log('✗ 服务器连接失败:', error);
        console.log('请确保服务器已启动并运行在 http://localhost:8080');
    }
});

// 2. 测试分数上传
function testScoreUpload() {
    console.log('\n2. 测试分数上传...');
    
    var testData = {
        nickname: '测试玩家' + Math.floor(Math.random() * 1000),
        score: 2500,
        ip_address: '192.168.1.1'
    };
    
    $.ajax({
        url: API_BASE_URL + '/score',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        timeout: 10000,
        data: JSON.stringify(testData),
        success: function(response) {
            console.log('✓ 分数上传成功:', response);
            // 3. 测试全球排行榜获取
            testGlobalRankings();
        },
        error: function(xhr, status, error) {
            console.log('✗ 分数上传失败:', error);
        }
    });
}

// 3. 测试全球排行榜获取
function testGlobalRankings() {
    console.log('\n3. 测试全球排行榜获取...');
    
    $.ajax({
        url: API_BASE_URL + '/rankings/global?limit=10',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            console.log('✓ 全球排行榜获取成功:');
            console.log('   最后更新时间:', response.last_updated);
            console.log('   排行榜数据:', response.rankings);
            // 4. 测试区域排行榜获取
            testRegionalRankings();
        },
        error: function(xhr, status, error) {
            console.log('✗ 全球排行榜获取失败:', error);
        }
    });
}

// 4. 测试区域排行榜获取
function testRegionalRankings() {
    console.log('\n4. 测试区域排行榜获取...');
    
    $.ajax({
        url: API_BASE_URL + '/rankings/region?region=亚洲&limit=10',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            console.log('✓ 区域排行榜获取成功:');
            console.log('   最后更新时间:', response.last_updated);
            console.log('   排行榜数据:', response.rankings);
            // 5. 测试玩家搜索
            testPlayerSearch();
        },
        error: function(xhr, status, error) {
            console.log('✗ 区域排行榜获取失败:', error);
        }
    });
}

// 5. 测试玩家搜索
function testPlayerSearch() {
    console.log('\n5. 测试玩家搜索...');
    
    $.ajax({
        url: API_BASE_URL + '/search?nickname=测试',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            console.log('✓ 玩家搜索成功:');
            console.log('   搜索结果:', response.results);
            // 6. 测试玩家排名获取
            if (response.results.length > 0) {
                testPlayerRank(response.results[0].nickname);
            } else {
                console.log('   没有找到测试玩家，跳过玩家排名测试');
                console.log('\n=== 测试完成 ===');
            }
        },
        error: function(xhr, status, error) {
            console.log('✗ 玩家搜索失败:', error);
        }
    });
}

// 6. 测试玩家排名获取
function testPlayerRank(nickname) {
    console.log('\n6. 测试玩家排名获取...');
    
    $.ajax({
        url: API_BASE_URL + '/player/rank?nickname=' + encodeURIComponent(nickname),
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            console.log('✓ 玩家排名获取成功:');
            console.log('   全球排名:', response.global_rank);
            console.log('   区域排名:', response.regional_rank);
            console.log('\n=== 测试完成 ===');
        },
        error: function(xhr, status, error) {
            console.log('✗ 玩家排名获取失败:', error);
        }
    });
}
