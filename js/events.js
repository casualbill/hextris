// Random Events System for Hextris
var EventSystem = {
    enabled: true,
    events: [],
    activeEvents: [],
    nextEventTime: 0,
    lastEventTime: 0,
    minInterval: 30000, // 30 seconds
    maxInterval: 60000, // 60 seconds
    eventIcons: {},
    eventTypes: [
        'speedUp',
        'speedDown',
        'colorswap',
        'autoClear',
        'controlInvert'
    ]
};

// Event classes
function SpeedUpEvent() {
    this.name = '极速模式';
    this.duration = 8000;
    this.startTime = 0;
    this.icon = 'fa-tachometer';
    this.color = '#e74c3c';
    this.active = false;
    
    this.activate = function() {
        this.startTime = Date.now();
        this.active = true;
        window.blockSpeedModifier = 2.0;
        window.eventFlashColor = this.color;
        window.eventFlashActive = true;
        showEventNotification(this.name, '所有下落速度提升100%');
        addEventIcon(this);
    };
    
    this.update = function() {
        if (!this.active) return;
        
        if (Date.now() - this.startTime >= this.duration) {
            this.deactivate();
        }
    };
    
    this.deactivate = function() {
        this.active = false;
        window.blockSpeedModifier = 1.0;
        window.eventFlashActive = false;
        removeEventIcon(this);
    };
}

function SpeedDownEvent() {
    this.name = '慢动作';
    this.duration = 10000;
    this.startTime = 0;
    this.icon = 'fa-hourglass-half';
    this.color = '#3498db';
    this.active = false;
    
    this.activate = function() {
        this.startTime = Date.now();
        this.active = true;
        window.blockSpeedModifier = 0.5;
        window.eventFlashColor = this.color;
        window.eventFlashActive = true;
        showEventNotification(this.name, '所有下落速度降低50%');
        addEventIcon(this);
    };
    
    this.update = function() {
        if (!this.active) return;
        
        if (Date.now() - this.startTime >= this.duration) {
            this.deactivate();
        }
    };
    
    this.deactivate = function() {
        this.active = false;
        window.blockSpeedModifier = 1.0;
        window.eventFlashActive = false;
        removeEventIcon(this);
    };
}

function ColorSwapEvent() {
		this.name = '颜色重组';
    this.duration = 3000;
    this.startTime = 0;
    this.icon = 'fa-random';
    this.color = '#f39c12';
    this.active = false;
    
    this.activate = function() {
        this.startTime = Date.now();
        this.active = true;
        window.colorFlashActive = true;
        this.swapColors();
        showEventNotification(this.name, '所有颜色块随机重新分配');
        addEventIcon(this);
    };
    
    this.swapColors = function() {
        var allColors = [];
        var allBlocks = [];
        
        // Collect all colors and blocks
        for (var lane = 0; lane < MainHex.blocks.length; lane++) {
            for (var i = 0; i < MainHex.blocks[lane].length; i++) {
                var block = MainHex.blocks[lane][i];
                allColors.push(block.color);
                allBlocks.push(block);
            }
        }
        
        // Shuffle colors
        for (var i = allColors.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = allColors[i];
            allColors[i] = allColors[j];
            allColors[j] = temp;
        }
        
        // Assign new colors
        for (var i = 0; i < allBlocks.length; i++) {
            allBlocks[i].color = allColors[i];
        }
    };
    
    this.update = function() {
        if (!this.active) return;
        
        if (Date.now() - this.startTime >= this.duration) {
            this.deactivate();
        }
    };
    
    this.deactivate = function() {
        this.active = false;
        window.colorFlashActive = false;
        removeEventIcon(this);
    };
}

function AutoClearEvent() {
    this.name = '自动清理';
    this.duration = 3000;
    this.startTime = 0;
    this.icon = 'fa-broom';
    this.color = '#2ecc71';
    this.active = false;
    
    this.activate = function() {
        this.startTime = Date.now();
        this.active = true;
        window.clearFlashActive = true;
        this.clearBlocks();
        showEventNotification(this.name, '自动清理中心六边形边缘的最底层颜色块');
        addEventIcon(this);
    };
    
    this.clearBlocks = function() {
        var nonEmptyLanes = [];
        
        // Find all non-empty lanes
        for (var lane = 0; lane < MainHex.blocks.length; lane++) {
            if (MainHex.blocks[lane].length > 0) {
                nonEmptyLanes.push(lane);
            }
        }
        
        if (nonEmptyLanes.length > 0) {
            var randomLane = nonEmptyLanes[Math.floor(Math.random() * nonEmptyLanes.length)];
            var blockToDelete = MainHex.blocks[randomLane][0];
            blockToDelete.deleted = 1;
            blockToDelete.opacity = 1;
            blockToDelete.tint = 1.0;
        }
    };
    
    this.update = function() {
        if (!this.active) return;
        
        if (Date.now() - this.startTime >= this.duration) {
            this.deactivate();
        }
    };
    
    this.deactivate = function() {
        this.active = false;
        window.clearFlashActive = false;
        removeEventIcon(this);
    };
}

function ControlInvertEvent() {
    this.name = '控制反转';
    this.duration = 12000;
    this.startTime = 0;
    this.icon = 'fa-undo';
    this.color = '#9b59b6';
    this.active = false;
    
    this.activate = function() {
        this.startTime = Date.now();
        this.active = true;
        window.controlInverted = true;
        window.hexRotationActive = true;
        showEventNotification(this.name, '左右控制方向互换');
        addEventIcon(this);
    };
    
    this.update = function() {
        if (!this.active) return;
        
        if (Date.now() - this.startTime >= this.duration) {
            this.deactivate();
        }
    };
    
    this.deactivate = function() {
        this.active = false;
        window.controlInverted = false;
        window.hexRotationActive = false;
        removeEventIcon(this);
    };
}

// Event system functions
EventSystem.init = function() {
    this.enabled = true;
    this.activeEvents = [];
    this.nextEventTime = Date.now() + this.getRandomInterval();
    this.lastEventTime = Date.now();
    
    // Initialize global variables
    window.blockSpeedModifier = 1.0;
    window.controlInverted = false;
    window.eventFlashActive = false;
    window.colorFlashActive = false;
    window.clearFlashActive = false;
    window.hexRotationActive = false;
    window.eventFlashColor = '#ffffff';
    
    // Create UI elements
    this.createUI();
    
    // Set the initial state of the events toggle in the help screen
		$(document).on('click', '#openSideBar', function() {
			setTimeout(function() {
				var checkbox = $('#eventsCheckbox');
				if (checkbox.length > 0) {
					checkbox.prop('checked', EventSystem.enabled);
				}
			}, 100); // Wait for the help screen to be shown
		});
		
		// Add CSS styles for the toggle switch and help screen
		var style = document.createElement('style');
		style.innerHTML = `
		#helpScreen {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.8);
			display: none;
			z-index: 1000;
			overflow-y: auto;
		}
		
		#helpScreen.show {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		
		#inst_main_body {
			background-color: white;
			padding: 20px;
			border-radius: 10px;
			max-width: 600px;
			width: 90%;
		}
		
		#instructions_head {
			font-size: 24px;
			font-weight: bold;
			margin-bottom: 20px;
			color: #333;
		}
		
		#helpScreen p {
			color: #555;
			line-height: 1.5;
			margin-bottom: 15px;
		}
		
		.toggle {
			position: relative;
			display: inline-block;
			width: 60px;
			height: 34px;
		}
		
		.toggle input {
			opacity: 0;
			width: 0;
			height: 0;
		}
		
		.toggle-slider {
			position: absolute;
			cursor: pointer;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #ccc;
			transition: .4s;
			border-radius: 34px;
		}
		
		.toggle-slider:before {
			position: absolute;
			content: '';
			height: 26px;
			width: 26px;
			left: 4px;
			bottom: 4px;
			background-color: white;
			transition: .4s;
			border-radius: 50%;
		}
		
		input:checked + .toggle-slider {
			background-color: #2196F3;
		}
		
		input:focus + .toggle-slider {
			box-shadow: 0 0 1px #2196F3;
		}
		
		input:checked + .toggle-slider:before {
			transform: translateX(26px);
		}
		
		#eventsSettings {
			padding: 20px 0;
			border-top: 1px solid #eee;
		}
		
		#eventsSettings strong {
			margin-right: 10px;
			color: #333;
		}
		`;
		document.head.appendChild(style);
};

EventSystem.getRandomInterval = function() {
    return Math.random() * (this.maxInterval - this.minInterval) + this.minInterval;
};

EventSystem.triggerRandomEvent = function() {
    if (!this.enabled || gameState !== 1) return;
    
    var eventType = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
    var newEvent = this.createEvent(eventType);
    
    if (newEvent) {
        newEvent.activate();
        this.activeEvents.push(newEvent);
        this.lastEventTime = Date.now();
        this.nextEventTime = Date.now() + this.getRandomInterval();
    }
};

EventSystem.createEvent = function(type) {
    switch(type) {
        case 'speedUp':
            return new SpeedUpEvent();
        case 'speedDown':
            return new SpeedDownEvent();
        case 'colorswap':
            return new ColorSwapEvent();
        case 'autoClear':
            return new AutoClearEvent();
        case 'controlInvert':
            return new ControlInvertEvent();
        default:
            return null;
    }
};

EventSystem.update = function() {
    if (!this.enabled || gameState !== 1) return;
    
    // Check if it's time for a new event
    if (Date.now() >= this.nextEventTime) {
        this.triggerRandomEvent();
    }
    
    // Update all active events
    for (var i = this.activeEvents.length - 1; i >= 0; i--) {
        var event = this.activeEvents[i];
        event.update();
        
        if (!event.active) {
            this.activeEvents.splice(i, 1);
        }
    }
};

EventSystem.createUI = function() {
		// Create event notification container
		if (!document.getElementById('eventNotification')) {
			var notification = document.createElement('div');
			notification.id = 'eventNotification';
			notification.innerHTML = '<div id="eventName"></div><div id="eventDescription"></div>';
			document.body.appendChild(notification);
		}
		
		// Create event icons container
		if (!document.getElementById('eventIcons')) {
			var iconsContainer = document.createElement('div');
			iconsContainer.id = 'eventIcons';
			document.body.appendChild(iconsContainer);
		}
		
		// Add event listener for the events toggle in the help screen
		// We'll add this listener when the help screen is shown
		// This ensures the toggle is present in the DOM before we add the listener
		$(document).on('click', '#eventsCheckbox', function(e) {
			EventSystem.enabled = e.target.checked;
			if (!EventSystem.enabled) {
				// Clear all active events
				for (var i = EventSystem.activeEvents.length - 1; i >= 0; i--) {
					EventSystem.activeEvents[i].deactivate();
				}
				EventSystem.activeEvents = [];
				clearEventIcons();
			}
		});
	};

EventSystem.renderEffects = function() {
    // Render event flash border
    if (window.eventFlashActive) {
        ctx.save();
        ctx.strokeStyle = window.eventFlashColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.8;
        ctx.strokeRect(0, 0, trueCanvas.width, trueCanvas.height);
        ctx.restore();
    }
    
    // Render color flash effect
    if (window.colorFlashActive) {
        ctx.save();
        var colors = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'];
        var currentColor = colors[Math.floor(Date.now() / 100) % colors.length];
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = currentColor;
        ctx.fillRect(0, 0, trueCanvas.width, trueCanvas.height);
        ctx.restore();
    }
    
    // Render hex rotation animation
    if (window.hexRotationActive) {
        ctx.save();
        var rotationAngle = (Date.now() / 50) % 360;
        var centerX = trueCanvas.width / 2;
        var centerY = trueCanvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationAngle * Math.PI / 180);
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(-100, -100, 200, 200);
        ctx.restore();
    }
};

// UI helper functions
function showEventNotification(name, description) {
    var notification = document.getElementById('eventNotification');
    var eventName = document.getElementById('eventName');
    var eventDesc = document.getElementById('eventDescription');
    
    eventName.textContent = name;
    eventDesc.textContent = description;
    
    notification.style.display = 'block';
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(-50%) scale(1)';
    
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-50%) scale(0.8)';
        setTimeout(function() {
            notification.style.display = 'none';
        }, 500);
    }, 3000);
}

function addEventIcon(event) {
    var iconsContainer = document.getElementById('eventIcons');
    var icon = document.createElement('div');
    icon.className = 'eventIcon';
    icon.style.backgroundColor = event.color;
    icon.innerHTML = '<i class="fa ' + event.icon + '"></i>';
    icon.title = event.name;
    
    iconsContainer.appendChild(icon);
    
    setTimeout(function() {
        icon.style.opacity = '0';
        setTimeout(function() {
            if (icon.parentNode) {
                icon.parentNode.removeChild(icon);
            }
        }, 500);
    }, event.duration);
}

function removeEventIcon(event) {
    // This is handled by the timeout in addEventIcon
}

function clearEventIcons() {
    var iconsContainer = document.getElementById('eventIcons');
    while (iconsContainer.firstChild) {
        iconsContainer.removeChild(iconsContainer.firstChild);
    }
}

// Export EventSystem
window.EventSystem = EventSystem;