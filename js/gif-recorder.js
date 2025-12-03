// GIF录制器模块
function GIFRecorder() {
	var encoder;
	var canvas;
	var ctx;
	var isRecording = false;
	var frames = [];
	var frameRate = 30;
	var frameDelay = 1000 / frameRate;
	var startTime;
	var endTime;
	
	// 初始化
	function init() {
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
	}
	
	// 开始录制
	function startRecording(duration) {
		if (isRecording) return;
		
		isRecording = true;
		frames = [];
		startTime = Date.now();
		endTime = startTime + duration;
		
		encoder = new GIFEncoder();
		encoder.setSize(canvas.width, canvas.height);
		encoder.setRepeat(0); // 循环播放
		encoder.setDelay(frameDelay);
		encoder.start();
		
		captureFrame();
	}
	
	// 捕获帧
	function captureFrame() {
		if (!isRecording || Date.now() > endTime) {
			stopRecording();
			return;
		}
		
		// 创建当前帧的副本
		var frameCanvas = document.createElement('canvas');
		frameCanvas.width = canvas.width;
		frameCanvas.height = canvas.height;
		var frameCtx = frameCanvas.getContext('2d');
		frameCtx.drawImage(canvas, 0, 0);
		
		// 添加到编码器
		encoder.addFrame(frameCtx);
		
		// 计划下一帧
		setTimeout(captureFrame, frameDelay);
	}
	
	// 停止录制
	function stopRecording() {
		isRecording = false;
		encoder.finish();
		
		// 获取GIF数据
		var gifData = encoder.stream();
		var gifBlob = new Blob([gifData], { type: 'image/gif' });
		var gifUrl = URL.createObjectURL(gifBlob);
		
		// 显示预览
		displayPreview(gifUrl, gifBlob);
	}
	
	// 显示预览界面
	function displayPreview(gifUrl, gifBlob) {
		// 创建预览容器
		var previewContainer = document.createElement('div');
		previewContainer.id = 'gifPreviewContainer';
		previewContainer.className = 'gif-preview-container';
		
		// 创建预览内容
		var previewContent = document.createElement('div');
		previewContent.className = 'gif-preview-content';
		
		// 创建GIF图像
		var gifImg = document.createElement('img');
		gifImg.src = gifUrl;
		gifImg.className = 'gif-preview-image';
		
		// 创建按钮容器
		var buttonContainer = document.createElement('div');
		buttonContainer.className = 'gif-preview-buttons';
		
		// 创建下载按钮
		var downloadBtn = document.createElement('button');
		downloadBtn.className = 'gif-preview-btn';
		downloadBtn.textContent = '下载';
		downloadBtn.onclick = function() {
			downloadGIF(gifBlob);
			closePreview();
		};
		
		// 创建分享到Twitter按钮
		var twitterBtn = document.createElement('button');
		twitterBtn.className = 'gif-preview-btn twitter-btn';
		twitterBtn.textContent = '分享到Twitter';
		twitterBtn.onclick = function() {
			shareToTwitter(gifUrl);
			closePreview();
		};
		
		// 创建分享到Facebook按钮
		var facebookBtn = document.createElement('button');
		facebookBtn.className = 'gif-preview-btn facebook-btn';
		facebookBtn.textContent = '分享到Facebook';
		facebookBtn.onclick = function() {
			shareToFacebook(gifUrl);
			closePreview();
		};
		
		// 创建关闭按钮
		var closeBtn = document.createElement('button');
		closeBtn.className = 'gif-preview-close';
		closeBtn.textContent = '×';
		closeBtn.onclick = closePreview;
		
		// 组装界面
		buttonContainer.appendChild(downloadBtn);
		buttonContainer.appendChild(twitterBtn);
		buttonContainer.appendChild(facebookBtn);
		
		previewContent.appendChild(gifImg);
		previewContent.appendChild(buttonContainer);
		previewContent.appendChild(closeBtn);
		
		previewContainer.appendChild(previewContent);
		document.body.appendChild(previewContainer);
		
		// 显示预览
		setTimeout(function() {
			previewContainer.classList.add('show');
		}, 10);
	}
	
	// 关闭预览
	function closePreview() {
		var container = document.getElementById('gifPreviewContainer');
		if (container) {
			container.classList.remove('show');
			setTimeout(function() {
				document.body.removeChild(container);
			}, 300);
		}
	}
	
	// 下载GIF
	function downloadGIF(gifBlob) {
		var now = new Date();
		var timestamp = now.getFullYear().toString() +
			padZero(now.getMonth() + 1) +
			padZero(now.getDate()) + '_' +
			padZero(now.getHours()) +
			padZero(now.getMinutes()) +
			padZero(now.getSeconds());
		var filename = 'Hextris_Highlight_' + timestamp + '.gif';
		
		var link = document.createElement('a');
		link.href = URL.createObjectURL(gifBlob);
		link.download = filename;
		link.click();
	}
	
	// 分享到Twitter
	function shareToTwitter(gifUrl) {
		var shareText = '我在Hextris中创造了精彩瞬间！分数：' + score;
		var shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(gifUrl);
	window.open(shareUrl, '_blank');
	}
	
	// 分享到Facebook
	function shareToFacebook(gifUrl) {
		var shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(gifUrl);
	window.open(shareUrl, '_blank');
	}
	
	// 辅助函数：补零
	function padZero(num) {
		return num < 10 ? '0' + num : num;
	}
	
	// 公共方法
	return {
		init: init,
		startRecording: startRecording,
		isRecording: function() { return isRecording; }
	};
}

// 导出函数
window.GIFRecorder = GIFRecorder;