// 主题管理模块
var ThemeManager = {
    // 预设主题定义
    presets: {
        classic: {
            name: '经典主题',
            description: '默认的Hextris配色方案',
            colors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"],
            backgroundColor: 'rgb(236, 240, 241)',
            centerHexColor: 'rgb(44,62,80)',
            outerBorderColor: 'rgb(220, 223, 225)',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNjY2VkZmYiLz48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZTc0YzNjIiB4PSIyIiB5PSIyIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZjFjNDBmIiB4PSIyMSIgeT0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IiMzNDk4ZGIvPjwvZz4='
        },
        dark: {
            name: '深色主题',
            description: '适合夜间游戏的深色背景',
            colors: ["#e74c3c", "#f39c12", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"],
            backgroundColor: 'rgb(30, 35, 40)',
            centerHexColor: 'rgb(52, 59, 70)',
            outerBorderColor: 'rgb(60, 70, 80)',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMxZjJjMzEiLz48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZTc0YzNjIiB4PSIyIiB5PSIyIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZjNjOTcyIiB4PSIyMSIgeT0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IiMzNDk4ZGIvPjwvZz4='
        },
        bright: {
            name: '明亮主题',
            description: '鲜艳明亮的配色方案',
            colors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#e67e22", "#34495e"],
            backgroundColor: 'rgb(255, 255, 255)',
            centerHexColor: 'rgb(52, 73, 94)',
            outerBorderColor: 'rgb(200, 200, 200)',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZTc0YzNjIiB4PSIyIiB5PSIyIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZjFjNDBmIiB4PSIyMSIgeT0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IiMzNDk4ZGIvPjwvZz4='
        },
        warm: {
            name: '暖色主题',
            description: '温暖的红橙色调',
            colors: ["#e74c3c", "#e67e22", "#f39c12", "#f1c40f", "#d35400", "#c0392b"],
            backgroundColor: 'rgb(250, 245, 235)',
            centerHexColor: 'rgb(142, 68, 17)',
            outerBorderColor: 'rgb(230, 200, 170)',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmZmZiYTkiLz48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZTc0YzNjIiB4PSIyIiB5PSIyIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjZTY3ZTIyIiB4PSIyMSIgeT0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IiNmYzliNzEiLz48L3N2Zz4='
        },
        cool: {
            name: '冷色主题',
            description: '清凉的蓝绿色调',
            colors: ["#3498db", "#1abc9c", "#16a085", "#2980b9", "#00cec9", "#0984e3"],
            backgroundColor: 'rgb(225, 235, 245)',
            centerHexColor: 'rgb(26, 188, 156)',
            outerBorderColor: 'rgb(175, 195, 215)',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlNWVmZjUiLz48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjMzQ5OGRiIiB4PSIyIiB5PSIyIi8+PHJlY3Qgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiBmaWxsPSIjMWFiYzljIiB4PSIyMSIgeT0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IiMxNmE4NTUiLz48L3N2Zz4='
        }
    },

    // 当前主题
    currentTheme: null,
    
    // 初始化
    init: function() {
        // 从本地存储加载主题
        this.loadTheme();
        
        // 初始化主题界面
        this.initializeThemeUI();
    },

    // 加载主题
    loadTheme: function() {
        var savedTheme = localStorage.getItem('hextris_theme');
        var savedCustomTheme = localStorage.getItem('hextris_custom_theme');
        
        if (savedTheme === 'custom' && savedCustomTheme) {
            this.currentTheme = JSON.parse(savedCustomTheme);
            this.currentTheme.name = '自定义主题';
        } else if (savedTheme && this.presets[savedTheme]) {
            this.currentTheme = this.presets[savedTheme];
        } else {
            this.currentTheme = this.presets.classic;
        }
        
        this.applyTheme();
    },

    // 保存主题
    saveTheme: function() {
        if (this.currentTheme.name === '自定义主题') {
            localStorage.setItem('hextris_theme', 'custom');
            localStorage.setItem('hextris_custom_theme', JSON.stringify(this.currentTheme));
        } else {
            for (var key in this.presets) {
                if (this.presets[key].name === this.currentTheme.name) {
                    localStorage.setItem('hextris_theme', key);
                    break;
                }
            }
        }
    },

    // 应用主题
    applyTheme: function() {
        // 更新全局颜色变量
        window.colors = this.currentTheme.colors;
        window.hexagonBackgroundColor = this.currentTheme.backgroundColor;
        window.hexagonBackgroundColorClear = this.currentTheme.backgroundColor.replace('rgb', 'rgba').replace(')', ', 0.5)');
        window.centerBlue = this.currentTheme.centerHexColor;
        window.grey = this.currentTheme.outerBorderColor;
        
        // 更新颜色映射
        this.updateColorMaps();
        
        // 更新中心六边形颜色
        if (window.MainHex) {
            var rgb = this.currentTheme.centerHexColor.match(/\d+/g);
            if (rgb) {
                MainHex.fillColor = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
            }
        }
        
        // 更新背景
        $('body').css('background-color', this.currentTheme.backgroundColor);
        
        // 更新画布背景
        var canvas = document.getElementById('canvas');
        if (canvas && canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = this.currentTheme.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // 更新主题按钮背景颜色
        var themeBtn = $('#themeBtn');
        if (themeBtn.length > 0) {
            themeBtn.css('backgroundColor', this.currentTheme.colors[0]);
        }
        
        // 更新主题选择界面状态
        this.updateThemeSelectionUI();
    },

    // 更新颜色映射
    updateColorMaps: function() {
        window.hexColorsToTintedColors = {};
        window.rgbToHex = {};
        window.rgbColorsToTintedColors = {};
        
        for (var i = 0; i < this.currentTheme.colors.length; i++) {
            var hex = this.currentTheme.colors[i];
            var rgb = this.hexToRgb(hex);
            var tinted = this.tintColor(hex, 0.2);
            
            window.hexColorsToTintedColors[hex] = rgb;
            window.rgbToHex[rgb] = hex;
            window.rgbColorsToTintedColors[rgb] = tinted;
        }
    },

    // 十六进制转RGB
    hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 'rgb(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ')' : '';
    },

    // 调整颜色亮度
    tintColor: function(color, percent) {
        var rgb = this.hexToRgb(color).match(/\d+/g);
        if (rgb) {
            var r = Math.min(255, Math.max(0, parseInt(rgb[0]) + (255 * percent)));
            var g = Math.min(255, Math.max(0, parseInt(rgb[1]) + (255 * percent)));
            var b = Math.min(255, Math.max(0, parseInt(rgb[2]) + (255 * percent)));
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }
        return color;
    },

    // 初始化主题UI
    initializeThemeUI: function() {
        // 创建主题按钮
        this.createThemeButton();
        
        // 创建主题选择界面
        this.createThemeSelectionUI();
        
        // 创建自定义主题界面
        this.createCustomThemeUI();
        
        // 更新主题选择界面状态
        this.updateThemeSelectionUI();
    },

    // 创建主题按钮
    createThemeButton: function() {
        var themeBtn = $('<div>')
            .attr('id', 'themeBtn')
            .attr('title', '主题设置')
            .on('click', function() {
                $('#themeSelectionOverlay').fadeIn();
            });
        
        // 添加一个简单的图标
        themeBtn.html('<i class="fa fa-paint-brush"></i>');
        
        // 设置主题按钮样式
        themeBtn.css({
            backgroundImage: 'none',
            backgroundColor: '#3498db',
            textAlign: 'center',
            lineHeight: '40px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '50%'
        });
        
        $('body').append(themeBtn);
    },

    // 创建主题选择界面
    createThemeSelectionUI: function() {
        var overlay = $('<div>')
            .attr('id', 'themeSelectionOverlay')
            .addClass('overlay')
            .css({
                display: 'none',
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: '2000'
            });
        
        var container = $('<div>')
            .css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: '80%',
                maxHeight: '80%',
                overflow: 'auto'
            });
        
        var header = $('<h2>')
            .text('主题选择')
            .css({
                textAlign: 'center',
                marginBottom: '20px',
                color: '#2c3e50'
            });
        
        container.append(header);
        
        // 创建预设主题列表
        var themesContainer = $('<div>')
            .css({
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            });
        
        // 添加预设主题
        for (var key in this.presets) {
            var theme = this.presets[key];
            var themeItem = $('<div>')
                .addClass('theme-item')
                .css({
                    padding: '15px',
                    border: '2px solid transparent',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                })
                .on('click', function() {
                    ThemeManager.currentTheme = theme;
                    ThemeManager.applyTheme();
                    ThemeManager.saveTheme();
                    ThemeManager.updateThemeSelectionUI();
                });
            
            // 缩略图
            var thumbnail = $('<img>')
                .attr('src', theme.thumbnail)
                .attr('alt', theme.name)
                .css({
                    width: '100%',
                    height: '80px',
                    marginBottom: '10px',
                    borderRadius: '5px'
                });
            
            // 主题名称
            var name = $('<div>')
                .text(theme.name)
                .css({
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#34495e',
                    fontWeight: 'bold'
                });
            
            themeItem.append(thumbnail, name);
            themesContainer.append(themeItem);
        }
        
        container.append(themesContainer);
        
        // 自定义主题按钮
        var customThemeBtn = $('<button>')
            .text('自定义主题')
            .css({
                width: '100%',
                padding: '10px',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
            })
            .on('click', function() {
                $('#themeSelectionOverlay').hide();
                $('#customThemeOverlay').fadeIn();
            });
        
        container.append(customThemeBtn);
        
        // 关闭按钮
        var closeBtn = $('<button>')
            .text('关闭')
            .css({
                width: '100%',
                padding: '10px',
                marginTop: '10px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
            })
            .on('click', function() {
                $('#themeSelectionOverlay').fadeOut();
            });
        
        container.append(closeBtn);
        
        overlay.append(container);
        $('body').append(overlay);
    },

    // 更新主题选择UI状态
    updateThemeSelectionUI: function() {
        $('.theme-item').css('border-color', 'transparent');
        
        $('.theme-item').each(function() {
            var themeName = $(this).find('div').text();
            if (themeName === ThemeManager.currentTheme.name) {
                $(this).css('border-color', '#3498db');
            }
        });
    },

    // 创建自定义主题界面
    createCustomThemeUI: function() {
        var overlay = $('<div>')
            .attr('id', 'customThemeOverlay')
            .addClass('overlay')
            .css({
                display: 'none',
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: '2000'
            });
        
        var container = $('<div>')
            .css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: '80%',
                maxHeight: '80%',
                overflow: 'auto'
            });
        
        var header = $('<h2>')
            .text('自定义主题')
            .css({
                textAlign: 'center',
                marginBottom: '20px',
                color: '#2c3e50'
            });
        
        container.append(header);
        
        // 颜色设置表单
        var form = $('<form>');
        
        // 颜色块设置
        var blockColorsContainer = $('<div>')
            .css({
                marginBottom: '20px'
            });
        
        var blockColorsTitle = $('<h3>')
            .text('颜色块颜色')
            .css({
                fontSize: '16px',
                marginBottom: '10px',
                color: '#34495e'
            });
        
        blockColorsContainer.append(blockColorsTitle);
        
        for (var i = 0; i < 6; i++) {
            var colorBlock = $('<div>')
                .css({
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '5px'
                });
            
            var colorLabel = $('<label>')
                .text('颜色 ' + (i + 1) + ':')
                .css({
                    width: '80px',
                    fontSize: '14px'
                });
            
            var colorInput = $('<input>')
                .attr('type', 'color')
                .attr('id', 'customBlockColor' + i)
                .val(this.currentTheme.colors[i])
                .css({
                    width: '50px',
                    height: '30px',
                    marginLeft: '10px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                })
                .on('change', function(index) {
                    return function() {
                        ThemeManager.currentTheme.colors[index] = $(this).val();
                        ThemeManager.applyTheme();
                        ThemeManager.updateCustomPreview();
                    };
                }(i));
            
            var colorPreview = $('<div>')
                .css({
                    width: '30px',
                    height: '30px',
                    marginLeft: '10px',
                    backgroundColor: this.currentTheme.colors[i],
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                });
            
            colorBlock.append(colorLabel, colorInput, colorPreview);
            blockColorsContainer.append(colorBlock);
        }
        
        form.append(blockColorsContainer);
        
        // 背景色设置
        var backgroundColorContainer = this.createColorInput('背景色', 'backgroundColor', this.currentTheme.backgroundColor);
        form.append(backgroundColorContainer);
        
        // 中心六边形颜色设置
        var centerHexColorContainer = this.createColorInput('中心六边形颜色', 'centerHexColor', this.currentTheme.centerHexColor);
        form.append(centerHexColorContainer);
        
        // 外层边界颜色设置
        var outerBorderColorContainer = this.createColorInput('外层边界颜色', 'outerBorderColor', this.currentTheme.outerBorderColor);
        form.append(outerBorderColorContainer);
        
        // 实时预览
        var previewContainer = $('<div>')
            .css({
                marginTop: '20px',
                padding: '15px',
                border: '2px solid #eee',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
            });
        
        var previewTitle = $('<h3>')
            .text('实时预览')
            .css({
                fontSize: '16px',
                marginBottom: '10px',
                color: '#34495e',
                textAlign: 'center'
            });
        
        previewContainer.append(previewTitle);
        
        var previewCanvas = $('<canvas>')
            .attr('id', 'themePreviewCanvas')
            .attr('width', '200')
            .attr('height', '200')
            .css({
                display: 'block',
                margin: '0 auto',
                borderRadius: '5px'
            });
        
        previewContainer.append(previewCanvas);
        form.append(previewContainer);
        
        // 按钮容器
        var buttonsContainer = $('<div>')
            .css({
                display: 'flex',
                gap: '10px',
                marginTop: '20px'
            });
        
        // 保存按钮
        var saveBtn = $('<button>')
            .attr('type', 'button')
            .text('保存')
            .css({
                flex: '1',
                padding: '10px',
                backgroundColor: '#2ecc71',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
            })
            .on('click', function() {
                ThemeManager.currentTheme.name = '自定义主题';
                ThemeManager.saveTheme();
                $('#customThemeOverlay').fadeOut();
                ThemeManager.updateThemeSelectionUI();
                swal({title: '主题已保存', text: '自定义主题已保存并应用', type: 'success', timer: 2000});
            });
        
        // 重置按钮
        var resetBtn = $('<button>')
            .attr('type', 'button')
            .text('重置为默认')
            .css({
                flex: '1',
                padding: '10px',
                backgroundColor: '#f39c12',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
            })
            .on('click', function() {
                ThemeManager.currentTheme = ThemeManager.presets.classic;
                ThemeManager.applyTheme();
                ThemeManager.updateCustomThemeInputs();
                ThemeManager.updateCustomPreview();
            });
        
        // 取消按钮
        var cancelBtn = $('<button>')
            .attr('type', 'button')
            .text('取消')
            .css({
                flex: '1',
                padding: '10px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
            })
            .on('click', function() {
                $('#customThemeOverlay').fadeOut();
            });
        
        buttonsContainer.append(saveBtn, resetBtn, cancelBtn);
        form.append(buttonsContainer);
        
        container.append(form);
        overlay.append(container);
        $('body').append(overlay);
        
        // 初始化预览
        this.updateCustomPreview();
    },

    // 创建颜色输入项
    createColorInput: function(label, property, value) {
        var container = $('<div>')
            .css({
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px'
            });
        
        var colorLabel = $('<label>')
            .text(label + ':')
            .css({
                width: '150px',
                fontSize: '14px'
            });
        
        var colorInput = $('<input>')
            .attr('type', 'color')
            .attr('id', 'custom' + property.charAt(0).toUpperCase() + property.slice(1))
            .val(this.rgbToHex(value))
            .css({
                width: '50px',
                height: '30px',
                marginLeft: '10px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            })
            .on('change', function(propertyName) {
                return function() {
                    var hexColor = $(this).val();
                    var rgbColor = ThemeManager.hexToRgb(hexColor);
                    ThemeManager.currentTheme[propertyName] = rgbColor;
                    ThemeManager.applyTheme();
                    ThemeManager.updateCustomPreview();
                    
                    // 更新预览方块
                    $(this).next().css('background-color', hexColor);
                };
            }(property));
        
        var colorPreview = $('<div>')
            .css({
                width: '30px',
                height: '30px',
                marginLeft: '10px',
                backgroundColor: value,
                borderRadius: '5px',
                border: '1px solid #ccc'
            });
        
        container.append(colorLabel, colorInput, colorPreview);
        
        return container;
    },

    // RGB转十六进制
    rgbToHex: function(rgb) {
        var result = rgb.match(/\d+/g);
        if (result) {
            var r = parseInt(result[0]).toString(16);
            var g = parseInt(result[1]).toString(16);
            var b = parseInt(result[2]).toString(16);
            
            r = r.length == 1 ? '0' + r : r;
            g = g.length == 1 ? '0' + g : g;
            b = b.length == 1 ? '0' + b : b;
            
            return '#' + r + g + b;
        }
        return '#ffffff';
    },

    // 更新自定义主题输入框
    updateCustomThemeInputs: function() {
        // 更新颜色块颜色
        for (var i = 0; i < 6; i++) {
            $('#customBlockColor' + i).val(this.currentTheme.colors[i]);
            $('#customBlockColor' + i).next().css('background-color', this.currentTheme.colors[i]);
        }
        
        // 更新背景色
        $('#customBackgroundColor').val(this.rgbToHex(this.currentTheme.backgroundColor));
        $('#customBackgroundColor').next().css('background-color', this.currentTheme.backgroundColor);
        
        // 更新中心六边形颜色
        $('#customCenterHexColor').val(this.rgbToHex(this.currentTheme.centerHexColor));
        $('#customCenterHexColor').next().css('background-color', this.currentTheme.centerHexColor);
        
        // 更新外层边界颜色
        $('#customOuterBorderColor').val(this.rgbToHex(this.currentTheme.outerBorderColor));
        $('#customOuterBorderColor').next().css('background-color', this.currentTheme.outerBorderColor);
    },

    // 更新自定义主题预览
    updateCustomPreview: function() {
        var canvas = document.getElementById('themePreviewCanvas');
        if (!canvas) return;
        
        var ctx = canvas.getContext('2d');
        var size = 200;
        var centerX = size / 2;
        var centerY = size / 2;
        
        // 清空画布
        ctx.clearRect(0, 0, size, size);
        
        // 设置背景
        ctx.fillStyle = this.currentTheme.backgroundColor;
        ctx.fillRect(0, 0, size, size);
        
        // 绘制外层边界
        ctx.strokeStyle = this.currentTheme.outerBorderColor;
        ctx.lineWidth = 6;
        this.drawHexagon(ctx, centerX, centerY, 70, this.currentTheme.outerBorderColor);
        
        // 绘制中心六边形
        this.drawHexagon(ctx, centerX, centerY, 25, this.currentTheme.centerHexColor);
        
        // 绘制颜色块预览
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 6 + i * Math.PI / 3;
            var x = centerX + Math.cos(angle) * 50;
            var y = centerY + Math.sin(angle) * 50;
            
            ctx.fillStyle = this.currentTheme.colors[i];
            ctx.fillRect(x - 10, y - 10, 20, 20);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 10, y - 10, 20, 20);
        }
    },

    // 绘制六边形
    drawHexagon: function(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        
        for (var i = 0; i < 6; i++) {
            var angle = i * Math.PI / 3 - Math.PI / 6;
            var px = x + Math.cos(angle) * radius;
            var py = y + Math.sin(angle) * radius;
            
            if (i == 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

// 初始化主题管理
$(document).ready(function() {
    ThemeManager.init();
});