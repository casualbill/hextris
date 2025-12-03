// 主题管理模块

// 预设主题定义
window.themes = {
    classic: {
        name: '经典主题',
        colors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"],
        backgroundColor: 'rgb(236, 240, 241)',
        centerHexColor: [44, 62, 80], // RGB数组
        borderColor: 'rgb(220, 223, 225)',
        hexColorsToTintedColors: {
            "#e74c3c": "rgb(241,163,155)",
            "#f1c40f": "rgb(246,223,133)",
            "#3498db": "rgb(151,201,235)",
            "#2ecc71": "rgb(150,227,183)"
        }
    },
    dark: {
        name: '深色主题',
        colors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"],
        backgroundColor: 'rgb(30, 30, 30)',
        centerHexColor: [20, 20, 20],
        borderColor: 'rgb(50, 50, 50)',
        hexColorsToTintedColors: {
            "#e74c3c": "rgb(241,163,155)",
            "#f1c40f": "rgb(246,223,133)",
            "#3498db": "rgb(151,201,235)",
            "#2ecc71": "rgb(150,227,183)"
        }
    },
    bright: {
        name: '明亮主题',
        colors: ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1"],
        backgroundColor: 'rgb(255, 255, 255)',
        centerHexColor: [52, 73, 94],
        borderColor: 'rgb(230, 230, 230)',
        hexColorsToTintedColors: {
            "#ff6b6b": "rgb(255, 180, 180)",
            "#feca57": "rgb(254, 225, 150)",
            "#48dbfb": "rgb(150, 220, 255)",
            "#1dd1a1": "rgb(150, 220, 200)"
        }
    },
    warm: {
        name: '暖色主题',
        colors: ["#ff6348", "#ffa502", "#ff6b6b", "#ee5a6f"],
        backgroundColor: 'rgb(250, 240, 230)',
        centerHexColor: [139, 69, 19],
        borderColor: 'rgb(230, 200, 180)',
        hexColorsToTintedColors: {
            "#ff6348": "rgb(255, 180, 160)",
            "#ffa502": "rgb(255, 200, 100)",
            "#ff6b6b": "rgb(255, 180, 180)",
            "#ee5a6f": "rgb(250, 160, 180)"
        }
    },
    cool: {
        name: '冷色主题',
        colors: ["#00d2d3", "#54a0ff", "#0abde3", "#22a6b3"],
        backgroundColor: 'rgb(230, 240, 250)',
        centerHexColor: [25, 25, 112],
        borderColor: 'rgb(200, 220, 240)',
        hexColorsToTintedColors: {
            "#00d2d3": "rgb(150, 220, 220)",
            "#54a0ff": "rgb(180, 200, 255)",
            "#0abde3": "rgb(150, 200, 250)",
            "#22a6b3": "rgb(150, 200, 210)"
        }
    },
    custom: {
        name: '自定义主题',
        colors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"],
        backgroundColor: 'rgb(236, 240, 241)',
        centerHexColor: [44, 62, 80],
        borderColor: 'rgb(220, 223, 225)',
        hexColorsToTintedColors: {
            "#e74c3c": "rgb(241,163,155)",
            "#f1c40f": "rgb(246,223,133)",
            "#3498db": "rgb(151,201,235)",
            "#2ecc71": "rgb(150,227,183)"
        }
    }
};

// 当前使用的主题
window.currentTheme = 'classic';

// 加载保存的主题设置
function loadThemeSettings() {
    var savedTheme = localStorage.getItem('hextris_theme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    
    // 加载自定义主题
    var customTheme = localStorage.getItem('hextris_custom_theme');
    if (customTheme) {
        themes.custom = JSON.parse(customTheme);
    }
}

// 保存主题设置
function saveThemeSettings() {
    localStorage.setItem('hextris_theme', currentTheme);
}

// 保存自定义主题
function saveCustomTheme() {
	// 从颜色选择器获取当前值并更新自定义主题
	var customColors = [];
	for (var i = 0; i < 6; i++) {
		var inputId = '#customColor' + (i + 1);
		var colorValue = $(inputId).val();
		customColors.push(colorValue);
		// 更新颜色块颜色
		updateCustomThemeColor('block', colorValue, i);
	}
	
	// 更新背景色
	var bgColor = $('#customBgColor').val();
	updateCustomThemeColor('background', bgColor, 0);
	
	// 更新中心六边形颜色
	var centerColor = $('#customCenterColor').val();
	updateCustomThemeColor('center', centerColor, 0);
	
	// 更新外层边界颜色
	var borderColor = $('#customBorderColor').val();
	updateCustomThemeColor('border', borderColor, 0);
	
	// 保存到本地存储
    localStorage.setItem('hextris_custom_theme', JSON.stringify(themes.custom));
}

// 应用主题
function applyTheme(themeName) {
    if (!themes[themeName]) {
        themeName = 'classic';
    }
    
    currentTheme = themeName;
    var theme = themes[themeName];
    
    // 更新颜色设置
    window.colors = theme.colors;
    window.hexagonBackgroundColor = theme.backgroundColor;
    window.hexagonBackgroundColorClear = theme.backgroundColor.replace('rgb', 'rgba').replace(')', ', 0.5)');
    window.centerBlue = 'rgb(' + theme.centerHexColor.join(',') + ')';
    window.hexColorsToTintedColors = theme.hexColorsToTintedColors;
    
    // 更新中心六边形颜色
    if (window.MainHex) {
        MainHex.fillColor = theme.centerHexColor;
        MainHex.tempColor = theme.centerHexColor;
    }
    
    // 保存主题设置
    saveThemeSettings();
}

// 重置自定义主题为经典主题
function resetCustomTheme() {
    var classic = themes.classic;
    themes.custom = {
        name: '自定义主题',
        colors: classic.colors.slice(),
        backgroundColor: classic.backgroundColor,
        centerHexColor: classic.centerHexColor.slice(),
        borderColor: classic.borderColor,
        hexColorsToTintedColors: JSON.parse(JSON.stringify(classic.hexColorsToTintedColors))
    };
}

// 更新自定义主题颜色
function updateCustomThemeColor(type, value, index) {
    if (!themes.custom) {
        resetCustomTheme();
    }
    
    switch(type) {
        case 'block':
            if (index >= 0 && index < themes.custom.colors.length) {
                themes.custom.colors[index] = value;
                
                // 更新对应的着色颜色
                var rgbValue = hexToRgb(value);
                if (rgbValue) {
                    var tintedRgb = 'rgb(' + 
                        Math.min(255, rgbValue.r + 50) + ',' + 
                        Math.min(255, rgbValue.g + 50) + ',' + 
                        Math.min(255, rgbValue.b + 50) + ')';
                    themes.custom.hexColorsToTintedColors[value] = tintedRgb;
                }
            }
            break;
        case 'background':
            themes.custom.backgroundColor = value;
            break;
        case 'center':
            var rgbValue = hexToRgb(value);
            if (rgbValue) {
                themes.custom.centerHexColor = [rgbValue.r, rgbValue.g, rgbValue.b];
            }
            break;
        case 'border':
            themes.custom.borderColor = value;
            break;
    }
}

// 辅助函数：十六进制颜色转RGB对象
function hexToRgb(hex) {
    // 移除#号
    hex = hex.replace(/^#/, '');
    
    // 如果是3位颜色，扩展为6位
    if (hex.length === 3) {
        hex = hex.split('').map(function(char) {
            return char + char;
        }).join('');
    }
    
    // 解析RGB值
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return null;
    }
    
    return {r: r, g: g, b: b};
}

// 更新主题选择界面中的当前主题标识
function updateCurrentThemeMarker() {
	// 隐藏所有主题的标识
	$('.currentThemeMarker').hide();
	
	// 显示当前主题的标识
	if (currentTheme === 'custom') {
		$('#customThemeBtn .currentThemeMarker').show();
	} else {
		$('.themeItem[data-theme="' + currentTheme + '"] .currentThemeMarker').show();
	}
}

// 更新主题预览
function updateThemePreviews() {
	// 更新预设主题的预览
	$('.themeItem[data-theme]').each(function() {
		var themeName = $(this).data('theme');
		var theme = themes[themeName];
		var preview = $(this).find('.themePreview');
		
		if (theme && preview) {
			// 设置预览背景色
			preview.css('background-color', theme.backgroundColor);
			
			// 清除之前的预览内容
			preview.empty();
			
			// 添加颜色块预览
			for (var i = 0; i < theme.colors.length; i++) {
				var colorBlock = $('<div>').css({
					'position': 'absolute',
					'width': '20px',
					'height': '20px',
					'background-color': theme.colors[i],
					'border': '1px solid rgba(0, 0, 0, 0.2)',
					'border-radius': '50%',
					'left': (10 + i * 30) + 'px',
					'top': '50%',
					'transform': 'translateY(-50%)'
				});
				preview.append(colorBlock);
			}
		}
	});
	
	// 更新自定义主题的预览
	var customPreview = $('#customThemeBtn .themePreview');
	if (customPreview) {
		var customTheme = themes.custom;
		// 设置预览背景色
		customPreview.css('background-color', customTheme.backgroundColor);
		
		// 清除之前的预览内容
		customPreview.empty();
		
		// 添加颜色块预览
		for (var i = 0; i < customTheme.colors.length; i++) {
			var colorBlock = $('<div>').css({
				'position': 'absolute',
				'width': '20px',
				'height': '20px',
				'background-color': customTheme.colors[i],
				'border': '1px solid rgba(0, 0, 0, 0.2)',
				'border-radius': '50%',
				'left': (10 + i * 30) + 'px',
				'top': '50%',
				'transform': 'translateY(-50%)'
			});
			customPreview.append(colorBlock);
		}
	}
}

// 初始化自定义主题界面中的颜色选择器
function initCustomColorPickers() {
	var customTheme = themes.custom;
	
	// 设置颜色块颜色选择器
	for (var i = 0; i < customTheme.colors.length; i++) {
		var inputId = '#customColor' + (i + 1);
		$(inputId).val(customTheme.colors[i]);
	}
	
	// 设置背景色选择器
	$('#customBgColor').val(rgbToHex(customTheme.backgroundColor));
	
	// 设置中心六边形颜色选择器
	var centerHexColor = 'rgb(' + customTheme.centerHexColor.join(',') + ')';
	$('#customCenterColor').val(rgbToHex(centerHexColor));
	
	// 设置外层边界颜色选择器
	$('#customBorderColor').val(rgbToHex(customTheme.borderColor));
}

// 更新自定义主题预览
function updateCustomThemePreview() {
	var preview = $('#customThemePreview');
	if (!preview) return;
	
	// 获取当前颜色选择器的值
	var customColors = [];
	for (var i = 0; i < 6; i++) {
		var inputId = '#customColor' + (i + 1);
		customColors.push($(inputId).val());
	}
	var bgColor = $('#customBgColor').val();
	var centerColor = $('#customCenterColor').val();
	var borderColor = $('#customBorderColor').val();
	
	// 设置预览背景色
	preview.css('background-color', bgColor);
	
	// 清除之前的预览内容
	preview.empty();
	
	// 添加颜色块预览
	for (var i = 0; i < customColors.length; i++) {
		var colorBlock = $('<div>').css({
			'position': 'absolute',
			'width': '30px',
			'height': '30px',
			'background-color': customColors[i],
			'border': '2px solid rgba(0, 0, 0, 0.3)',
			'border-radius': '50%',
			'left': (50 + i * 40) + 'px',
			'top': '30%',
			'transform': 'translateY(-50%)'
		});
		preview.append(colorBlock);
	}
	
	// 添加中心六边形预览
	var hexagon = $('<div>').css({
		'position': 'absolute',
		'width': '80px',
		'height': '80px',
		'background-color': centerColor,
		'border': '3px solid ' + borderColor,
		'border-radius': '50%',
		'left': '50%',
		'top': '70%',
		'transform': 'translate(-50%, -50%)'
	});
	preview.append(hexagon);
}

// 辅助函数：RGB颜色转十六进制
function rgbToHex(rgb) {
	if (!rgb || !rgb.match(/^rgb\(/)) {
		return '#ffffff';
	}
	
	// 解析RGB值
	var rgbValues = rgb.match(/\d+/g);
	if (rgbValues.length !== 3) {
		return '#ffffff';
	}
	
	var r = parseInt(rgbValues[0]);
	var g = parseInt(rgbValues[1]);
	var b = parseInt(rgbValues[2]);
	
	// 转换为十六进制
	var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	
	return hex;
}

// 初始化主题设置
loadThemeSettings();
// 应用当前主题
applyTheme(currentTheme);