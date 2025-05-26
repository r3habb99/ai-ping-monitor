const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('Electron Main Process', () => {
    let mainModule;

    before(() => {
        // Mock Electron modules for testing
        global.mockElectron = {
            app: {
                whenReady: () => Promise.resolve(),
                on: () => {},
                quit: () => {},
                requestSingleInstanceLock: () => true,
                isQuiting: false
            },
            BrowserWindow: class MockBrowserWindow {
                constructor(options) {
                    this.options = options;
                    this.webContents = {
                        send: () => {},
                        openDevTools: () => {}
                    };
                }
                loadFile() { return Promise.resolve(); }
                on() {}
                show() {}
                hide() {}
                focus() {}
                isVisible() { return true; }
                isDestroyed() { return false; }
                isMinimized() { return false; }
                restore() {}
                static getAllWindows() { return []; }
            },
            Tray: class MockTray {
                constructor() {}
                setToolTip() {}
                setContextMenu() {}
                on() {}
                popUpContextMenu() {}
            },
            Menu: {
                buildFromTemplate: () => ({})
            },
            nativeImage: {
                createFromPath: () => ({})
            },
            ipcMain: {
                handle: () => {},
                on: () => {}
            },
            shell: {},
            dialog: {
                showMessageBoxSync: () => 0
            }
        };

        // Mock electron modules
        require.cache[require.resolve('electron')] = {
            exports: global.mockElectron
        };

        // Mock electron-updater
        require.cache[require.resolve('electron-updater')] = {
            exports: {
                autoUpdater: {
                    checkForUpdatesAndNotify: () => {},
                    on: () => {}
                }
            }
        };

        // Mock electron-store
        require.cache[require.resolve('electron-store')] = {
            exports: class MockStore {
                constructor() {}
                get(key, defaultValue) { return defaultValue; }
                set() {}
            }
        };

        // Mock auto-launch
        require.cache[require.resolve('auto-launch')] = {
            exports: class MockAutoLaunch {
                constructor() {}
                async isEnabled() { return false; }
                async enable() {}
                async disable() {}
            }
        };

        // Mock node-notifier
        require.cache[require.resolve('node-notifier')] = {
            exports: {
                notify: () => {}
            }
        };
    });

    describe('Module Loading', () => {
        it('should load main.js without errors', () => {
            assert.doesNotThrow(() => {
                mainModule = require('../src/main.js');
            });
        });

        it('should have required dependencies available', () => {
            const mainPath = path.join(__dirname, '..', 'src', 'main.js');
            assert(fs.existsSync(mainPath), 'main.js should exist');
            
            const pingMonitorPath = path.join(__dirname, '..', 'ping-monitor.js');
            assert(fs.existsSync(pingMonitorPath), 'ping-monitor.js should exist');
        });
    });

    describe('File Structure', () => {
        it('should have renderer files', () => {
            const rendererPath = path.join(__dirname, '..', 'src', 'renderer');
            assert(fs.existsSync(rendererPath), 'renderer directory should exist');
            
            const htmlPath = path.join(rendererPath, 'index.html');
            assert(fs.existsSync(htmlPath), 'index.html should exist');
            
            const jsPath = path.join(rendererPath, 'renderer.js');
            assert(fs.existsSync(jsPath), 'renderer.js should exist');
            
            const cssPath = path.join(rendererPath, 'styles.css');
            assert(fs.existsSync(cssPath), 'styles.css should exist');
        });

        it('should have asset files', () => {
            const assetsPath = path.join(__dirname, '..', 'assets');
            assert(fs.existsSync(assetsPath), 'assets directory should exist');
            
            const iconPath = path.join(assetsPath, 'icon.png');
            assert(fs.existsSync(iconPath), 'icon.png should exist');
        });
    });

    describe('Package Configuration', () => {
        it('should have valid package.json', () => {
            const packagePath = path.join(__dirname, '..', 'package.json');
            assert(fs.existsSync(packagePath), 'package.json should exist');
            
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            assert(packageJson.name, 'package.json should have name');
            assert(packageJson.version, 'package.json should have version');
            assert(packageJson.main, 'package.json should have main entry point');
            assert(packageJson.build, 'package.json should have build configuration');
            assert(packageJson.dependencies, 'package.json should have dependencies');
        });

        it('should have electron-builder configuration', () => {
            const packagePath = path.join(__dirname, '..', 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            assert(packageJson.build.appId, 'should have appId');
            assert(packageJson.build.productName, 'should have productName');
            assert(packageJson.build.directories, 'should have directories config');
            assert(packageJson.build.files, 'should have files config');
            assert(packageJson.build.win, 'should have Windows config');
            assert(packageJson.build.mac, 'should have macOS config');
            assert(packageJson.build.linux, 'should have Linux config');
        });
    });

    describe('Renderer HTML Structure', () => {
        it('should have valid HTML structure', () => {
            const htmlPath = path.join(__dirname, '..', 'src', 'renderer', 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            assert(htmlContent.includes('<!DOCTYPE html>'), 'should have DOCTYPE');
            assert(htmlContent.includes('<html'), 'should have html tag');
            assert(htmlContent.includes('<head>'), 'should have head section');
            assert(htmlContent.includes('<body>'), 'should have body section');
            assert(htmlContent.includes('AI Ping Monitor'), 'should have app title');
            assert(htmlContent.includes('renderer.js'), 'should include renderer script');
            assert(htmlContent.includes('styles.css'), 'should include styles');
        });

        it('should have required UI elements', () => {
            const htmlPath = path.join(__dirname, '..', 'src', 'renderer', 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for main UI elements
            assert(htmlContent.includes('id="connectionStatus"'), 'should have connection status element');
            assert(htmlContent.includes('id="toggleMonitoring"'), 'should have toggle button');
            assert(htmlContent.includes('id="settingsBtn"'), 'should have settings button');
            assert(htmlContent.includes('id="hostList"'), 'should have host list');
            assert(htmlContent.includes('id="latencyChart"'), 'should have chart element');
        });
    });

    describe('CSS Styles', () => {
        it('should have valid CSS file', () => {
            const cssPath = path.join(__dirname, '..', 'src', 'renderer', 'styles.css');
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            
            assert(cssContent.length > 0, 'CSS file should not be empty');
            assert(cssContent.includes('.app-container'), 'should have app container styles');
            assert(cssContent.includes('.status-card'), 'should have status card styles');
            assert(cssContent.includes('.btn'), 'should have button styles');
        });
    });

    describe('Renderer JavaScript', () => {
        it('should have valid renderer script', () => {
            const jsPath = path.join(__dirname, '..', 'src', 'renderer', 'renderer.js');
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            
            assert(jsContent.length > 0, 'Renderer JS should not be empty');
            assert(jsContent.includes('ipcRenderer'), 'should use ipcRenderer');
            assert(jsContent.includes('PingMonitorUI'), 'should have PingMonitorUI class');
            assert(jsContent.includes('DOMContentLoaded'), 'should wait for DOM ready');
        });
    });

    after(() => {
        // Clean up mocks
        delete global.mockElectron;
        
        // Clear require cache for mocked modules
        delete require.cache[require.resolve('electron')];
        delete require.cache[require.resolve('electron-updater')];
        delete require.cache[require.resolve('electron-store')];
        delete require.cache[require.resolve('auto-launch')];
        delete require.cache[require.resolve('node-notifier')];
    });
});
