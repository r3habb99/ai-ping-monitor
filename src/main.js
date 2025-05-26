const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const os = require('os');
const Store = require('electron-store');
const AutoLaunch = require('auto-launch');
const notifier = require('node-notifier');

// Import our ping monitor
const PingMonitorAI = require('../ping-monitor.js');

class DesktopPingMonitor {
    constructor() {
        this.mainWindow = null;
        this.tray = null;
        this.pingMonitor = new PingMonitorAI();
        this.isMonitoring = false;
        this.store = new Store();
        this.autoLauncher = null;
        this.lastConnectionQuality = 'Unknown';

        // Default settings
        this.settings = {
            autoStart: false,
            minimizeToTray: true,
            showNotifications: true,
            pingInterval: 5000,
            startMinimized: false,
            ...this.store.get('settings', {})
        };

        this.setupAutoLauncher();
        this.setupAutoUpdater();
        this.setupEventHandlers();
    }

    setupAutoLauncher() {
        this.autoLauncher = new AutoLaunch({
            name: 'AI Ping Monitor',
            path: process.execPath,
        });
    }

    setupAutoUpdater() {
        // Configure auto-updater
        autoUpdater.checkForUpdatesAndNotify();

        // Auto-updater events
        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');
        });

        autoUpdater.on('update-available', (info) => {
            console.log('Update available:', info.version);
            this.showNotification('Update Available', `Version ${info.version} is available for download`);
        });

        autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available');
        });

        autoUpdater.on('error', (err) => {
            console.error('Auto-updater error:', err);
        });

        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "Download speed: " + progressObj.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            console.log(log_message);
        });

        autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded');
            this.showUpdateReadyDialog(info);
        });

        // Check for updates every 4 hours
        setInterval(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 4 * 60 * 60 * 1000);
    }

    showUpdateReadyDialog(info) {
        const response = dialog.showMessageBoxSync(this.mainWindow, {
            type: 'info',
            buttons: ['Restart Now', 'Later'],
            title: 'Update Ready',
            message: `Version ${info.version} has been downloaded and is ready to install.`,
            detail: 'The application will restart to apply the update.'
        });

        if (response === 0) {
            autoUpdater.quitAndInstall();
        }
    }

    setupEventHandlers() {
        // App event handlers
        app.whenReady().then(() => {
            this.createTray();
            this.createWindow();
            this.startMonitoring();
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.stopMonitoring();
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });

        // IPC handlers
        ipcMain.handle('get-ping-data', () => {
            return {
                stats: this.pingMonitor.stats,
                isMonitoring: this.isMonitoring,
                settings: this.settings
            };
        });

        ipcMain.handle('toggle-monitoring', () => {
            if (this.isMonitoring) {
                this.stopMonitoring();
            } else {
                this.startMonitoring();
            }
            return this.isMonitoring;
        });

        ipcMain.handle('get-settings', () => {
            return this.settings;
        });

        ipcMain.handle('save-settings', (event, newSettings) => {
            this.settings = { ...this.settings, ...newSettings };
            this.store.set('settings', this.settings);
            this.applySettings();
            return this.settings;
        });

        ipcMain.handle('get-ping-history', () => {
            return Object.fromEntries(this.pingMonitor.pingHistory);
        });
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 600,
            minHeight: 400,
            icon: this.getIconPath(),
            show: !this.settings.startMinimized,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
        });

        this.mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

        // Handle window close
        this.mainWindow.on('close', (event) => {
            if (this.settings.minimizeToTray && !app.isQuiting) {
                event.preventDefault();
                this.mainWindow.hide();

                if (this.settings.showNotifications && process.platform === 'win32') {
                    this.showNotification('AI Ping Monitor', 'Application minimized to system tray');
                }
            }
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // Development tools
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools();
        }
    }

    createTray() {
        const iconPath = this.getIconPath();
        this.tray = new Tray(nativeImage.createFromPath(iconPath));

        this.updateTrayTooltip();
        this.updateTrayContextMenu();

        this.tray.on('click', () => {
            if (this.mainWindow) {
                if (this.mainWindow.isVisible()) {
                    this.mainWindow.hide();
                } else {
                    this.mainWindow.show();
                    this.mainWindow.focus();
                }
            } else {
                this.createWindow();
            }
        });

        this.tray.on('right-click', () => {
            this.tray.popUpContextMenu();
        });
    }

    getIconPath() {
        const platform = process.platform;
        let iconName;

        if (platform === 'win32') {
            iconName = 'icon.ico';
        } else if (platform === 'darwin') {
            iconName = 'icon.icns';
        } else {
            iconName = 'icon.png';
        }

        // Try assets folder first, then fallback to built-in icon
        const assetsPath = path.join(__dirname, '..', 'assets', iconName);
        const fallbackPath = path.join(__dirname, 'assets', iconName);

        try {
            require('fs').accessSync(assetsPath);
            return assetsPath;
        } catch {
            return fallbackPath;
        }
    }

    updateTrayTooltip() {
        if (!this.tray) return;

        const quality = this.pingMonitor.stats.connectionQuality || 'Unknown';
        const avgLatency = this.pingMonitor.stats.averageLatency || 0;
        const successRate = this.pingMonitor.stats.totalPings > 0
            ? ((this.pingMonitor.stats.successfulPings / this.pingMonitor.stats.totalPings) * 100).toFixed(1)
            : 0;

        const tooltip = `AI Ping Monitor
Quality: ${quality}
Latency: ${avgLatency.toFixed(1)}ms
Success: ${successRate}%`;

        this.tray.setToolTip(tooltip);
    }

    updateTrayContextMenu() {
        if (!this.tray) return;

        const contextMenu = Menu.buildFromTemplate([
            {
                label: `Status: ${this.pingMonitor.stats.connectionQuality || 'Unknown'}`,
                enabled: false
            },
            {
                label: `Latency: ${(this.pingMonitor.stats.averageLatency || 0).toFixed(1)}ms`,
                enabled: false
            },
            { type: 'separator' },
            {
                label: this.isMonitoring ? 'Stop Monitoring' : 'Start Monitoring',
                click: () => {
                    if (this.isMonitoring) {
                        this.stopMonitoring();
                    } else {
                        this.startMonitoring();
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Show Window',
                click: () => {
                    if (this.mainWindow) {
                        this.mainWindow.show();
                        this.mainWindow.focus();
                    } else {
                        this.createWindow();
                    }
                }
            },
            {
                label: 'Settings',
                click: () => {
                    if (this.mainWindow) {
                        this.mainWindow.show();
                        this.mainWindow.focus();
                        this.mainWindow.webContents.send('show-settings');
                    } else {
                        this.createWindow();
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    app.isQuiting = true;
                    this.stopMonitoring();
                    app.quit();
                }
            }
        ]);

        this.tray.setContextMenu(contextMenu);
    }

    async startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        console.log('Starting ping monitoring...');

        // Start the monitoring loop
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.pingMonitor.runConcurrentPing();
                this.updateTrayTooltip();
                this.updateTrayContextMenu();
                this.checkConnectionQualityChange();

                // Send update to renderer if window is open
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.webContents.send('ping-update', {
                        stats: this.pingMonitor.stats,
                        history: Object.fromEntries(this.pingMonitor.pingHistory)
                    });
                }
            } catch (error) {
                console.error('Ping monitoring error:', error);
            }
        }, this.settings.pingInterval);
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        console.log('Stopping ping monitoring...');

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.updateTrayContextMenu();
    }

    checkConnectionQualityChange() {
        const currentQuality = this.pingMonitor.stats.connectionQuality;

        if (currentQuality !== this.lastConnectionQuality && this.settings.showNotifications) {
            this.showNotification(
                'Connection Quality Changed',
                `Network quality is now: ${currentQuality}`
            );
            this.lastConnectionQuality = currentQuality;
        }
    }

    showNotification(title, message) {
        if (!this.settings.showNotifications) return;

        notifier.notify({
            title: title,
            message: message,
            icon: this.getIconPath(),
            sound: false,
            wait: false
        });
    }

    async applySettings() {
        // Apply auto-start setting
        try {
            const isEnabled = await this.autoLauncher.isEnabled();
            if (this.settings.autoStart && !isEnabled) {
                await this.autoLauncher.enable();
            } else if (!this.settings.autoStart && isEnabled) {
                await this.autoLauncher.disable();
            }
        } catch (error) {
            console.error('Auto-start setting error:', error);
        }

        // Apply monitoring interval
        if (this.isMonitoring) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }
}

// Create and start the application
const desktopApp = new DesktopPingMonitor();

// Handle app events
app.on('before-quit', () => {
    app.isQuiting = true;
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (desktopApp.mainWindow) {
            if (desktopApp.mainWindow.isMinimized()) {
                desktopApp.mainWindow.restore();
            }
            desktopApp.mainWindow.focus();
        }
    });
}
