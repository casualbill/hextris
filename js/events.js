// Random Events System for Hextris

// Event types
const EventTypes = {
    SPEED_UP: 'speed_up',
    SPEED_DOWN: 'speed_down',
    COLOR_CHANGE: 'color_change',
    AUTO_CLEAN: 'auto_clean',
    CONTROL_REVERSE: 'control_reverse',
    // Add more event types as needed
};

// Event configuration
const EventConfig = {
    [EventTypes.SPEED_UP]: {
        name: '极速模式',
        description: '所有正在下落的颜色块速度提升100%，持续8秒',
        duration: 8000, // 8 seconds in milliseconds
        borderColor: '#e74c3c', // Red for speed up
        icon: 'f062', // Font Awesome icon for speed
    },
    [EventTypes.SPEED_DOWN]: {
        name: '慢动作',
        description: '所有正在下落的颜色块速度降低50%，持续10秒',
        duration: 10000, // 10 seconds in milliseconds
        borderColor: '#3498db', // Blue for slow motion
        icon: 'f04c', // Font Awesome icon for pause/slow
    },
    [EventTypes.COLOR_CHANGE]: {
        name: '颜色重组',
        description: '将场上所有已堆叠的颜色块颜色随机重新分配',
        duration: 0, // Immediate effect
        borderColor: '', // No border for this event
        icon: 'f074', // Font Awesome icon for shuffle
    },
    [EventTypes.AUTO_CLEAN]: {
        name: '自动清理',
        description: '自动消除中心六边形上任意一条边的最底层颜色块',
        duration: 0, // Immediate effect
        borderColor: '', // No border for this event
        icon: 'f1f8', // Font Awesome icon for trash
    },
    [EventTypes.CONTROL_REVERSE]: {
        name: '控制反转',
        description: '玩家左右方向键（或触摸左右侧）的控制方向互换，持续12秒',
        duration: 12000, // 12 seconds in milliseconds
        borderColor: '', // No border for this event
        icon: 'f0e2', // Font Awesome icon for refresh
    },
};

// Events manager object
const EventsManager = {
    eventsEnabled: true, // Default to enabled
    currentEvents: [], // Array to track active events
    lastEventTime: 0, // Last time an event was triggered
    minEventInterval: 30000, // Minimum 30 seconds between events
    maxEventInterval: 60000, // Maximum 60 seconds between events
    nextEventTime: 0, // Time for next event

    // Initialize the events system
    init: function() {
        // Load setting from localStorage if available
        const savedSetting = localStorage.getItem('eventsEnabled');
        if (savedSetting !== null) {
            this.eventsEnabled = savedSetting === 'true';
        }

        // Schedule first event
        if (this.eventsEnabled) {
            this.scheduleNextEvent();
        }

        // Create event display elements
        this.createEventElements();
    },

    // Toggle events on/off
    toggleEvents: function(enabled) {
        this.eventsEnabled = enabled;
        localStorage.setItem('eventsEnabled', enabled ? 'true' : 'false');
        
        if (enabled) {
            this.scheduleNextEvent();
        } else {
            // Cancel all active events
            this.cancelAllEvents();
            this.nextEventTime = 0;
        }
    },

    // Schedule next random event
    scheduleNextEvent: function() {
        if (!this.eventsEnabled) return;
        
        const interval = Math.random() * (this.maxEventInterval - this.minEventInterval) + this.minEventInterval;
        this.nextEventTime = Date.now() + interval;
    },

    // Check if it's time to trigger an event
    checkEvents: function() {
        if (!this.eventsEnabled || gameState !== 1) return;
        
        if (Date.now() >= this.nextEventTime) {
            this.triggerRandomEvent();
            this.scheduleNextEvent();
        }
    },

    // Trigger a random event
    triggerRandomEvent: function() {
        const eventTypes = Object.values(EventTypes);
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        this.triggerEvent(randomEventType);
    },

    // Trigger a specific event
    triggerEvent: function(eventType) {
        const eventConfig = EventConfig[eventType];
        if (!eventConfig) return;

        // Show event notification
        this.showEventNotification(eventConfig.name, eventConfig.description);

        // Store event with expiration time
        const event = {
            type: eventType,
            startTime: Date.now(),
            duration: eventConfig.duration,
            config: eventConfig
        };

        // Add to current events
        this.currentEvents.push(event);

        // Show event icon
        this.showEventIcon(eventType, eventConfig.icon);

        // Trigger event-specific logic
        this.executeEvent(eventType);

        // Schedule cleanup for temporary events
        if (eventConfig.duration > 0) {
            setTimeout(() => {
                this.cleanupEvent(eventType);
            }, eventConfig.duration);
        }

        console.log(`Event triggered: ${eventConfig.name}`);
    },

    // Execute event-specific logic
    executeEvent: function(eventType) {
        switch (eventType) {
            case EventTypes.SPEED_UP:
                this.speedUpBlocks();
                break;
            case EventTypes.SPEED_DOWN:
                this.speedDownBlocks();
                break;
            case EventTypes.COLOR_CHANGE:
                this.changeColors();
                break;
            case EventTypes.AUTO_CLEAN:
                this.autoClean();
                break;
            case EventTypes.CONTROL_REVERSE:
                this.reverseControls();
                break;
            default:
                break;
        }
    },

    // Clean up after event expires
    cleanupEvent: function(eventType) {
        // Remove event from current events
        this.currentEvents = this.currentEvents.filter(event => event.type !== eventType);

        // Remove event icon
        this.hideEventIcon(eventType);

        // Revert game state
        switch (eventType) {
            case EventTypes.SPEED_UP:
                this.resetBlockSpeed();
                this.hideBorderEffect();
                break;
            case EventTypes.SPEED_DOWN:
                this.resetBlockSpeed();
                this.hideBorderEffect();
                break;
            case EventTypes.CONTROL_REVERSE:
                this.resetControls();
                this.hideRotationEffect();
                break;
            default:
                break;
        }
    },

    // Cancel all active events
    cancelAllEvents: function() {
        // Clean up each active event
        const eventTypes = this.currentEvents.map(event => event.type);
        eventTypes.forEach(eventType => this.cleanupEvent(eventType));
        
        this.currentEvents = [];
    },

    // Show settings panel
    showSettingsPanel: function() {
        const settingsPanel = document.getElementById('settingsContainer');
        if (settingsPanel) {
            settingsPanel.style.display = 'block';
        }
    },

    // Hide settings panel
    hideSettingsPanel: function() {
        const settingsPanel = document.getElementById('settingsContainer');
        if (settingsPanel) {
            settingsPanel.style.display = 'none';
        }
    },

    // Speed up blocks by 100%
    speedUpBlocks: function() {
        settings.speedModifier *= 2;
        settings.creationSpeedModifier *= 2;
        this.showBorderEffect(EventConfig[EventTypes.SPEED_UP].borderColor);
    },

    // Slow down blocks by 50%
    speedDownBlocks: function() {
        settings.speedModifier *= 0.5;
        settings.creationSpeedModifier *= 0.5;
        this.showBorderEffect(EventConfig[EventTypes.SPEED_DOWN].borderColor);
    },

    // Reset block speed to normal
    resetBlockSpeed: function() {
        // Check which speed events are active and reset accordingly
        const speedUpActive = this.currentEvents.some(event => event.type === EventTypes.SPEED_UP);
        const speedDownActive = this.currentEvents.some(event => event.type === EventTypes.SPEED_DOWN);
        
        if (!speedUpActive && !speedDownActive) {
            // No active speed events, reset to default
            const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            settings.speedModifier = isMobile ? 0.73 : 0.65;
            settings.creationSpeedModifier = settings.speedModifier;
        }
    },

    // Change colors of all settled blocks
    changeColors: function() {
        // Collect all colors from settled blocks
        const allColors = [];
        const allBlocks = [];

        // Get all settled blocks
        for (let i = 0; i < MainHex.blocks.length; i++) {
            for (let j = 0; j < MainHex.blocks[i].length; j++) {
                const block = MainHex.blocks[i][j];
                if (block.settled) {
                    allColors.push(block.color);
                    allBlocks.push(block);
                }
            }
        }

        // Shuffle colors
        for (let i = allColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
        }

        // Assign new colors
        for (let i = 0; i < allBlocks.length; i++) {
            allBlocks[i].color = allColors[i];
        }

        // Trigger check for matches
        for (let i = 0; i < MainHex.blocks.length; i++) {
            for (let j = 0; j < MainHex.blocks[i].length; j++) {
                MainHex.blocks[i][j].checked = 1;
            }
        }

        // Show flash effect
        this.showFlashEffect('rainbow');
    },

    // Auto clean a random side
    autoClean: function() {
        // Find all sides that have blocks
        const availableSides = [];
        for (let i = 0; i < MainHex.blocks.length; i++) {
            if (MainHex.blocks[i].length > 0) {
                availableSides.push(i);
            }
        }

        if (availableSides.length > 0) {
            // Randomly select a side
            const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
            
            // Remove the bottom block (first in array)
            if (MainHex.blocks[randomSide].length > 0) {
                const blockToRemove = MainHex.blocks[randomSide][0];
                blockToRemove.deleted = 1;
                
                // Show flash effect on this block
                this.showBlockFlash(blockToRemove);
            }
        }
    },

    // Reverse controls
    reverseControls: function() {
        settings.controlReversed = true;
        this.showRotationEffect();
    },

    // Reset controls to normal
    resetControls: function() {
        settings.controlReversed = false;
    },

    // Show event notification
    showEventNotification: function(name, description) {
        const notification = document.getElementById('eventNotification');
        notification.textContent = `${name}: ${description}`;
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(-50%) scale(1)';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-50%) scale(0)';
        }, 3000);
    },

    // Show border effect
    showBorderEffect: function(color) {
        const canvas = document.getElementById('canvas');
        canvas.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color} inset`;
        canvas.style.animation = 'borderFlash 1s infinite alternate';
    },

    // Hide border effect
    hideBorderEffect: function() {
        const canvas = document.getElementById('canvas');
        canvas.style.boxShadow = 'none';
        canvas.style.animation = 'none';
    },

    // Show flash effect
    showFlashEffect: function(type) {
        const flash = document.getElementById('flashEffect');
        flash.style.backgroundColor = type === 'rainbow' ? 'white' : 'white';
        flash.style.opacity = '1';
        
        if (type === 'rainbow') {
            flash.style.animation = 'rainbowFlash 0.5s';
        } else {
            flash.style.animation = 'whiteFlash 0.5s';
        }

        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.animation = 'none';
        }, 500);
    },

    // Show flash effect on a specific block
    showBlockFlash: function(block) {
        // Store original color and set to white for flash
        block.originalColor = block.color;
        block.color = '#FFFFFF';
        
        setTimeout(() => {
            block.color = block.originalColor;
            delete block.originalColor;
        }, 300);
    },

    // Show rotation effect for control reverse
    showRotationEffect: function() {
        const canvas = document.getElementById('canvas');
        canvas.style.animation = 'spin 2s linear infinite';
    },

    // Hide rotation effect
    hideRotationEffect: function() {
        const canvas = document.getElementById('canvas');
        canvas.style.animation = 'none';
    },

    // Show event icon
    showEventIcon: function(eventType, iconCode) {
        const iconContainer = document.getElementById('eventIcons');
        const icon = document.createElement('div');
        icon.className = 'event-icon';
        icon.innerHTML = `<i class="fa ${iconCode}"></i>`;
        icon.dataset.eventType = eventType;
        icon.style.position = 'fixed';
        icon.style.right = '-60px';
        
        // Calculate position based on existing icons
        const existingIcons = iconContainer.querySelectorAll('.event-icon');
        icon.style.top = `${10 + (existingIcons.length * 50)}px`;
        
        iconContainer.appendChild(icon);
        
        // Animate in after a short delay to ensure position is calculated
        setTimeout(() => {
            icon.style.right = '10px';
        }, 10);
    },

    // Hide event icon
    hideEventIcon: function(eventType) {
        const iconContainer = document.getElementById('eventIcons');
        const icon = iconContainer.querySelector(`[data-event-type="${eventType}"]`);
        
        if (icon) {
            icon.style.right = '-60px';
            setTimeout(() => {
                iconContainer.removeChild(icon);
                // Update positions of remaining icons
                this.updateIconPositions();
            }, 300);
        }
    },

    // Create necessary DOM elements
    createEventElements: function() {
        // Event notification
        if (!document.getElementById('eventNotification')) {
            const notification = document.createElement('h1');
            notification.id = 'eventNotification';
            notification.className = 'event-notification';
            document.body.appendChild(notification);
        }

        // Effect description
        if (!document.getElementById('eventEffect')) {
            const effect = document.createElement('h3');
            effect.id = 'eventEffect';
            effect.className = 'event-effect';
            document.body.appendChild(effect);
        }

        // Flash effect
        if (!document.getElementById('flashEffect')) {
            const flash = document.createElement('div');
            flash.id = 'flashEffect';
            document.body.appendChild(flash);
        }

        // Event icons container
        if (!document.getElementById('eventIcons')) {
            const iconsContainer = document.createElement('div');
            iconsContainer.id = 'eventIcons';
            document.body.appendChild(iconsContainer);
        }
    },

    // Update events manager (called in game loop)
    update: function() {
        this.checkEvents();

        // Update active events (if needed for visual effects)
        this.currentEvents.forEach(event => {
            const timeElapsed = Date.now() - event.startTime;
            if (timeElapsed >= event.duration) {
                this.cleanupEvent(event.type);
            }
        });
    },

    // Update positions of event icons when one is removed
    updateIconPositions: function() {
        const iconContainer = document.getElementById('eventIcons');
        const icons = iconContainer.querySelectorAll('.event-icon');
        icons.forEach((icon, index) => {
            icon.style.top = `${10 + (index * 50)}px`;
        });
    }
};

// Add CSS for events
const eventsCSS = `
.event-notification {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    transform-origin: center;
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 20px 30px;
    border-radius: 10px;
    font-size: 18px;
    font-weight: bold;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    text-align: center;
    max-width: 80%;
}

#flashEffect {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
}

.event-icon {
    position: fixed;
    right: -60px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #2c3e50;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 9998;
    transition: right 0.3s ease;
}

@keyframes borderFlash {
    from { box-shadow: 0 0 20px var(--border-color), 0 0 40px var(--border-color) inset; }
    to { box-shadow: 0 0 40px var(--border-color), 0 0 80px var(--border-color) inset; }
}

@keyframes whiteFlash {
    0% { opacity: 0; }
    50% { opacity: 0.7; }
    100% { opacity: 0; }
}

@keyframes rainbowFlash {
    0% { background-color: red; opacity: 0.7; }
    25% { background-color: yellow; opacity: 0.7; }
    50% { background-color: blue; opacity: 0.7; }
    75% { background-color: green; opacity: 0.7; }
    100% { opacity: 0; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

// Add CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = eventsCSS;
document.head.appendChild(styleSheet);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventsManager, EventTypes, EventConfig };
}