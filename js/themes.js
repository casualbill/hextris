// Theme management system
window.ThemeManager = {
    themes: {
        classic: {
            name: "经典主题",
            blockColors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#8e44ad", "#d35400"],
            backgroundColor: "rgb(236, 240, 241)",
            centerColor: "rgb(44,62,80)",
            borderColor: "rgba(0,0,0,0.1)"
        },
        dark: {
            name: "深色主题",
            blockColors: ["#e74c3c", "#f39c12", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"],
            backgroundColor: "rgb(26, 35, 46)",
            centerColor: "rgb(149, 165, 166)",
            borderColor: "rgba(255,255,255,0.1)"
        },
        light: {
            name: "明亮主题",
            blockColors: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"],
            backgroundColor: "rgb(255, 255, 255)",
            centerColor: "rgb(52, 73, 94)",
            borderColor: "rgba(0,0,0,0.05)"
        },
        warm: {
            name: "暖色主题",
            blockColors: ["#e74c3c", "#e67e22", "#f39c12", "#f1c40f", "#d35400", "#c0392b"],
            backgroundColor: "rgb(24DF, 245, 238)",
            centerColor: "rgb(126, 65, 11)",
            borderColor: "rgba(126, 65, 11, 0.1)"
        },
        cool: {
            name: "冷色主题",
            blockColors: ["#2980b9", "#3498db", "#1abc9c", "#2ecc71", "#34495e", "#2c3e50"],
            backgroundColor: "rgb(230, 238, 245)",
            centerColor: "rgb(44, 62, 80)",
            borderColor: "rgba(44, 62, 80, 0.1)"
        },
        colorBlind: {
            name: "色盲模式",
            blockColors: ["#8e44ad", "#f1c40f", "#3498db", "#d35400", "#e74c3c", "#2ecc71"],
            backgroundColor: "rgb(236, 240, 241)",
            centerColor: "rgb(44,62,80)",
            borderColor: "rgba(0,0,0,0.1)"
        }
    },

    currentTheme: null,

    init: function() {
        // Load saved theme from localStorage
        var savedTheme = localStorage.getItem("hextris-theme");
        if (savedTheme) {
            try {
                this.currentTheme = JSON.parse(savedTheme);
            } catch (e) {
                this.currentTheme = this.themes.classic;
            }
        } else {
            this.currentTheme = this.themes.classic;
        }
        this.applyTheme();
    },

    applyTheme: function() {
        window.colors = this.currentTheme.blockColors;
        window.hexagonBackgroundColor = this.currentTheme.backgroundColor;
        window.hexagonBackgroundColorClear = this.currentTheme.backgroundColor.replace("rgb", "rgba").replace(")", ", 0.5)");
        window.centerBlue = this.currentTheme.centerColor;
        
        // Update tinted colors
        window.hexColorsToTintedColors = {};
        window.rgbToHex = {};
        window.rgbColorsToTintedColors = {};
        
        this.currentTheme.blockColors.forEach((color, index) => {
            var rgb = this.hexToRgb(color);
            var tintedRgb = this.tintColor(rgb, 0.4);
            var tinted;
            
            // Special tint for color blind mode
            if (this.currentTheme.name === "色盲模式") {
                const colorBlindTints = [
                    "rgb(229,152,102)", // Purple
                    "rgb(246,223,133)", // Yellow
                    "rgb(151,201,235)", // Blue
                    "rgb(210,180,222)", // Orange
                    "rgb(241,163,155)", // Red
                    "rgb(150,227,183)"  // Green
                ];
                tinted = colorBlindTints[index % colorBlindTints.length];
            } else {
                tinted = `rgb(${tintedRgb.r}, ${tintedRgb.g}, ${tintedRgb.b})`;
            }
            
            window.hexColorsToTintedColors[color] = tinted;
            window.rgbToHex[`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`] = color;
            window.rgbColorsToTintedColors[`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`] = tinted;
        });
        
        // Update canvas background
        document.getElementById('canvas').style.backgroundColor = this.currentTheme.backgroundColor;
    },

    setTheme: function(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = this.themes[themeName];
        } else {
            this.currentTheme = themeName;
        }
        this.saveTheme();
        this.applyTheme();
    },

    saveTheme: function() {
        localStorage.setItem("hextris-theme", JSON.stringify(this.currentTheme));
    },

    hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    },

    tintColor: function(rgb, factor) {
        return {
            r: Math.floor(255 - (255 - rgb.r) * (1 - factor)),
            g: Math.floor(255 - (255 - rgb.g) * (1 - factor)),
            b: Math.floor(255 - (255 - rgb.b) * (1 - factor))
        };
    }
};

// Initialize theme previews
function initThemePreviews() {
    Object.keys(ThemeManager.themes).forEach(themeKey => {
        const theme = ThemeManager.themes[themeKey];
        const preview = $(`.theme-item[data-theme='${themeKey}'] .theme-preview`);
        
        // Set preview background
        preview.css('background-color', theme.backgroundColor);
        
        // Add color blocks to preview
        for (let i = 0; i < theme.blockColors.length; i++) {
            const colorBlock = $(`<div style="position:absolute;width:30px;height:30px;top:${10 + (i % 2) * 35}px;left:${10 + Math.floor(i / 2) * 35}px;background-color:${theme.blockColors[i]};border-radius:5px;"></div>`);
            preview.append(colorBlock);
        }
        
        // Add center hexagon
        const centerHex = $(`<div style="position:absolute;width:40px;height:40px;top:30px;left:30px;background-color:${theme.centerColor};border-radius:50%;"></div>`);
        preview.append(centerHex);
    });
    
    // Set custom theme preview
    updateCustomThemePreview();
}

// Update custom theme preview
function updateCustomThemePreview() {
    const preview = $('#custom_theme_preview');
    let background = $('#custom_theme_settings input[data-type="background"]').val();
    let center = $('#custom_theme_settings input[data-type="center"]').val();
    let colors = [];
    
    $('#custom_theme_settings input[data-index]').each((index, el) => {
        colors.push($(el).val());
    });
    
    preview.css('background-color', background);
    preview.empty();
    
    // Add color blocks to preview
    for (let i = 0; i < colors.length; i++) {
        const colorBlock = $(`<div style="position:absolute;width:50px;height:50px;top:${25 + (i % 2) * 60}px;left:${25 + Math.floor(i / 2) * 60}px;background-color:${colors[i]};border-radius:5px;"></div>`);
        preview.append(colorBlock);
    }
    
    // Add center hexagon
    const centerHex = $(`<div style="position:absolute;width:80px;height:80px;top:60px;left:60px;background-color:${center};border-radius:50%;"></div>`);
    preview.append(centerHex);
}

// Initialize theme manager when document is ready
$(document).ready(function() {
    ThemeManager.init();
    initThemePreviews();
    
    // Set active theme
    const activeTheme = ThemeManager.currentTheme;
    let activeThemeKey = 'classic';
    
    if (activeTheme.name) {
        activeThemeKey = Object.keys(ThemeManager.themes).find(key => ThemeManager.themes[key].name === activeTheme.name) || 'classic';
    }
    
    $('.theme-item').removeClass('active');
    $(`.theme-item[data-theme='${activeThemeKey}']`).addClass('active');
    
    // Theme button click handler
    $('#themeBtn').click(function(e) {
        e.stopPropagation();
        if ($('#themeScreen').is(':visible')) {
            $('#themeScreen').fadeOut(150);
            if (gameState === 1) {
                $('#fork-ribbon').fadeOut(150, 'linear');
            }
        } else {
            $('#themeScreen').fadeIn(150);
            $('#helpScreen').fadeOut(150);
            if (gameState === 1) {
                $('#fork-ribbon').fadeIn(150, 'linear');
            }
            
            // Update active theme
            $('.theme-item').removeClass('active');
            const current = ThemeManager.currentTheme;
            let key = 'classic';
            
            if (current.name) {
                key = Object.keys(ThemeManager.themes).find(k => ThemeManager.themes[k].name === current.name) || 'classic';
            }
            
            $(`.theme-item[data-theme='${key}']`).addClass('active');
        }
    });
    
    // Theme screen click close (blank area)
    $('#themeScreen').click(function(e) {
        if (e.target === this) {
            e.stopPropagation();
            $(this).fadeOut(150);
        }
    });

    // Theme item click handler
    $('.theme-item[data-theme]').click(function(e) {
        e.stopPropagation();
        const themeKey = $(this).data('theme');
        ThemeManager.setTheme(themeKey);
        
        $('.theme-item').removeClass('active');
        $(this).addClass('active');
        
        // Close theme screen after selection
        setTimeout(() => {
            $('#themeScreen').fadeOut(150);
        }, 500);
    });
    
    // Custom theme click handler
    $('.custom-theme').click(function(e) {
        e.stopPropagation();
        $('#themeScreen').fadeOut(150);
        
        // Load current theme into custom settings
        const theme = ThemeManager.currentTheme;
        
        if (theme.blockColors) {
            theme.blockColors.forEach((color, index) => {
                $(`#custom_theme_settings input[data-index='${index}']`).val(color);
            });
        }
        
        $('#custom_theme_settings input[data-type="background"]').val(theme.backgroundColor.replace('rgb(', '#').replace(')', '').replace(/, /g, ''));
        $('#custom_theme_settings input[data-type="center"]').val(theme.centerColor.replace('rgb(', '#').replace(')', '').replace(/, /g, ''));
        $('#custom_theme_settings input[data-type="border"]').val(theme.borderColor.replace('rgba(', '#').replace(')', '').replace(/, /g, ''));
        
        updateCustomThemePreview();
        $('#customThemeScreen').fadeIn(150);
    });
    
    // Custom theme screen click close (blank area)
    $('#customThemeScreen').click(function(e) {
        if (e.target === this) {
            e.stopPropagation();
            $(this).fadeOut(150);
        }
    });

    // Color picker change handler
    $('.color-picker').change(function(e) {
        e.stopPropagation();
        updateCustomThemePreview();
    });
    
    // Reset theme button handler
    $('#resetThemeBtn').click(function(e) {
        e.stopPropagation();
        const classic = ThemeManager.themes.classic;
        
        classic.blockColors.forEach((color, index) => {
            $(`#custom_theme_settings input[data-index='${index}']`).val(color);
        });
        
        $('#custom_theme_settings input[data-type="background"]').val(classic.backgroundColor.replace('rgb(', '#').replace(')', '').replace(/, /g, ''));
        $('#custom_theme_settings input[data-type="center"]').val(classic.centerColor.replace('rgb(', '#').replace(')', '').replace(/, /g, ''));
        $('#custom_theme_settings input[data-type="border"]').val(classic.borderColor.replace('rgba(', '#').replace(')', '').replace(/, /g, ''));
        
        updateCustomThemePreview();
    });
    
    // Save theme button handler
    $('#saveThemeBtn').click(function(e) {
        e.stopPropagation();
        const customTheme = {
            name: "自定义主题",
            blockColors: [],
            backgroundColor: '',
            centerColor: '',
            borderColor: ''
        };
        
        $('#custom_theme_settings input[data-index]').each((index, el) => {
            customTheme.blockColors.push($(el).val());
        });
        
        customTheme.backgroundColor = `rgb(${hexToRgb($('#custom_theme_settings input[data-type="background"]').val()).join(', ')})`;
        customTheme.centerColor = `rgb(${hexToRgb($('#custom_theme_settings input[data-type="center"]').val()).join(', ')})`;
        customTheme.borderColor = `rgba(${hexToRgb($('#custom_theme_settings input[data-type="border"]').val()).join(', ')}, 0.1)`;
        
        ThemeManager.setTheme(customTheme);
        $('#customThemeScreen').fadeOut(150);
        
        // Update custom theme preview
        const preview = $('.custom-theme .theme-preview');
        preview.css('background-color', customTheme.backgroundColor);
        preview.empty();
        
        for (let i = 0; i < customTheme.blockColors.length; i++) {
            const colorBlock = $(`<div style="position:absolute;width:30px;height:30px;top:${10 + (i % 2) * 35}px;left:${10 + Math.floor(i / 2) * 35}px;background-color:${customTheme.blockColors[i]};border-radius:5px;"></div>`);
            preview.append(colorBlock);
        }
        
        const centerHex = $(`<div style="position:absolute;width:40px;height:40px;top:30px;left:30px;background-color:${customTheme.centerColor};border-radius:50%;"></div>`);
        preview.append(centerHex);
    });
    
    // Helper function to convert hex to rgb
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [255, 255, 255];
    }
});