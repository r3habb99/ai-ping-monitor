const { ipcRenderer } = require('electron');

class PingMonitorUI {
    constructor() {
        this.isMonitoring = false;
        this.settings = {};
        this.chart = null;
        this.chartData = [];
        this.maxDataPoints = 20;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadInitialData();
        this.hideLoadingOverlay();
    }

    initializeElements() {
        // Main elements
        this.connectionIcon = document.getElementById('connectionIcon');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.connectionQuality = document.getElementById('connectionQuality');
        this.toggleBtn = document.getElementById('toggleMonitoring');
        
        // Statistics elements
        this.avgLatency = document.getElementById('avgLatency');
        this.successRate = document.getElementById('successRate');
        this.totalPings = document.getElementById('totalPings');
        this.failedPings = document.getElementById('failedPings');
        
        // Host list
        this.hostList = document.getElementById('hostList');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettings = document.getElementById('closeSettings');
        this.saveSettings = document.getElementById('saveSettings');
        this.cancelSettings = document.getElementById('cancelSettings');
        
        // Settings inputs
        this.autoStartInput = document.getElementById('autoStart');
        this.minimizeToTrayInput = document.getElementById('minimizeToTray');
        this.showNotificationsInput = document.getElementById('showNotifications');
        this.startMinimizedInput = document.getElementById('startMinimized');
        this.pingIntervalInput = document.getElementById('pingInterval');
        
        // Other controls
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    setupEventListeners() {
        // Main controls
        this.toggleBtn.addEventListener('click', () => this.toggleMonitoring());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.minimizeBtn.addEventListener('click', () => this.minimizeToTray());
        
        // Modal controls
        this.closeSettings.addEventListener('click', () => this.hideSettings());
        this.cancelSettings.addEventListener('click', () => this.hideSettings());
        this.saveSettings.addEventListener('click', () => this.saveSettingsData());
        
        // Modal backdrop click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
        
        // IPC listeners
        ipcRenderer.on('ping-update', (event, data) => {
            this.updateUI(data);
        });
        
        ipcRenderer.on('show-settings', () => {
            this.showSettings();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSettings();
            }
            if (e.ctrlKey && e.key === ',') {
                this.showSettings();
            }
        });
    }

    async loadInitialData() {
        try {
            const data = await ipcRenderer.invoke('get-ping-data');
            this.isMonitoring = data.isMonitoring;
            this.settings = data.settings;
            this.updateUI({ stats: data.stats });
            this.updateToggleButton();
            this.loadSettings();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    updateUI(data) {
        if (data.stats) {
            this.updateStatistics(data.stats);
            this.updateConnectionStatus(data.stats);
        }
        
        if (data.history) {
            this.updateHostList(data.history);
            this.updateChart(data.history);
        }
    }

    updateStatistics(stats) {
        this.avgLatency.textContent = `${(stats.averageLatency || 0).toFixed(1)}ms`;
        
        const successRate = stats.totalPings > 0 
            ? ((stats.successfulPings / stats.totalPings) * 100).toFixed(1)
            : 0;
        this.successRate.textContent = `${successRate}%`;
        
        this.totalPings.textContent = stats.totalPings || 0;
        this.failedPings.textContent = stats.failedPings || 0;
    }

    updateConnectionStatus(stats) {
        const quality = stats.connectionQuality || 'Unknown';
        const qualityClass = quality.toLowerCase().replace(' ', '-');
        
        // Update status text
        this.connectionStatus.textContent = this.isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped';
        this.connectionQuality.textContent = `Connection Quality: ${quality}`;
        
        // Update icon and styling
        this.connectionIcon.className = `status-icon ${qualityClass}`;
        if (this.isMonitoring) {
            this.connectionIcon.classList.add('monitoring');
        }
        
        // Update icon based on quality
        const iconElement = this.connectionIcon.querySelector('i');
        if (quality === 'Excellent') {
            iconElement.className = 'fas fa-wifi';
        } else if (quality === 'Good') {
            iconElement.className = 'fas fa-signal';
        } else if (quality === 'Fair') {
            iconElement.className = 'fas fa-exclamation-triangle';
        } else if (quality === 'Poor' || quality === 'Very Poor') {
            iconElement.className = 'fas fa-times-circle';
        } else {
            iconElement.className = 'fas fa-question-circle';
        }
    }

    updateHostList(history) {
        this.hostList.innerHTML = '';
        
        Object.entries(history).forEach(([hostName, hostHistory]) => {
            const latestPing = hostHistory[hostHistory.length - 1];
            if (!latestPing) return;
            
            const hostItem = document.createElement('div');
            hostItem.className = 'host-item';
            
            const statusClass = latestPing.success ? 'online' : 'offline';
            const latency = latestPing.latency ? `${latestPing.latency.toFixed(1)}ms` : 'N/A';
            
            hostItem.innerHTML = `
                <div class="host-info">
                    <div class="host-status-icon ${statusClass}"></div>
                    <span class="host-name">${hostName}</span>
                </div>
                <span class="host-latency">${latency}</span>
            `;
            
            this.hostList.appendChild(hostItem);
        });
    }

    updateChart(history) {
        // Simple chart implementation using canvas
        const canvas = document.getElementById('latencyChart');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Collect latency data
        const allLatencies = [];
        Object.values(history).forEach(hostHistory => {
            hostHistory.forEach(ping => {
                if (ping.latency !== null) {
                    allLatencies.push({
                        timestamp: new Date(ping.timestamp),
                        latency: ping.latency
                    });
                }
            });
        });
        
        if (allLatencies.length === 0) return;
        
        // Sort by timestamp and take last 20 points
        allLatencies.sort((a, b) => a.timestamp - b.timestamp);
        const recentData = allLatencies.slice(-this.maxDataPoints);
        
        // Draw chart
        this.drawChart(ctx, canvas, recentData);
    }

    drawChart(ctx, canvas, data) {
        if (data.length === 0) return;
        
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Find min/max values
        const latencies = data.map(d => d.latency);
        const minLatency = Math.min(...latencies);
        const maxLatency = Math.max(...latencies);
        const range = maxLatency - minLatency || 1;
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight * i) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Draw line
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = padding + (chartWidth * index) / (data.length - 1);
            const y = padding + chartHeight - ((point.latency - minLatency) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#667eea';
        data.forEach((point, index) => {
            const x = padding + (chartWidth * index) / (data.length - 1);
            const y = padding + chartHeight - ((point.latency - minLatency) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = minLatency + (range * (5 - i)) / 5;
            const y = padding + (chartHeight * i) / 5;
            ctx.fillText(`${value.toFixed(0)}ms`, padding - 20, y + 4);
        }
    }

    async toggleMonitoring() {
        try {
            this.isMonitoring = await ipcRenderer.invoke('toggle-monitoring');
            this.updateToggleButton();
        } catch (error) {
            console.error('Failed to toggle monitoring:', error);
        }
    }

    updateToggleButton() {
        const icon = this.toggleBtn.querySelector('i');
        const text = this.toggleBtn.querySelector('span');
        
        if (this.isMonitoring) {
            icon.className = 'fas fa-stop';
            text.textContent = 'Stop';
            this.toggleBtn.className = 'btn btn-secondary';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = 'Start';
            this.toggleBtn.className = 'btn btn-primary';
        }
    }

    showSettings() {
        this.loadSettings();
        this.settingsModal.classList.add('show');
    }

    hideSettings() {
        this.settingsModal.classList.remove('show');
    }

    async loadSettings() {
        try {
            this.settings = await ipcRenderer.invoke('get-settings');
            
            this.autoStartInput.checked = this.settings.autoStart;
            this.minimizeToTrayInput.checked = this.settings.minimizeToTray;
            this.showNotificationsInput.checked = this.settings.showNotifications;
            this.startMinimizedInput.checked = this.settings.startMinimized;
            this.pingIntervalInput.value = this.settings.pingInterval / 1000;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettingsData() {
        try {
            const newSettings = {
                autoStart: this.autoStartInput.checked,
                minimizeToTray: this.minimizeToTrayInput.checked,
                showNotifications: this.showNotificationsInput.checked,
                startMinimized: this.startMinimizedInput.checked,
                pingInterval: parseInt(this.pingIntervalInput.value) * 1000
            };
            
            this.settings = await ipcRenderer.invoke('save-settings', newSettings);
            this.hideSettings();
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    minimizeToTray() {
        if (window.electronAPI) {
            window.electronAPI.minimize();
        } else {
            window.close();
        }
    }

    hideLoadingOverlay() {
        setTimeout(() => {
            this.loadingOverlay.classList.add('hidden');
        }, 1000);
    }
}

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PingMonitorUI();
});
