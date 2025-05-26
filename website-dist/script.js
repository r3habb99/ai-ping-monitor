// Platform detection and download management
class DownloadManager {
    constructor() {
        this.version = '1.0.0';
        this.baseUrl = 'https://github.com/r3habb99/ai-ping-monitor/releases/download/v' + this.version + '/';
        this.init();
    }

    init() {
        this.detectPlatform();
        this.setupDownloadLinks();
        this.loadReleaseData();
    }

    detectPlatform() {
        const platform = this.getPlatform();
        const arch = this.getArchitecture();

        console.log('Detected platform:', platform, arch);

        // Update recommended download
        this.updateRecommendedDownload(platform, arch);
    }

    getPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';

        return 'unknown';
    }

    getArchitecture() {
        const userAgent = navigator.userAgent.toLowerCase();

        // Check for ARM on macOS
        if (userAgent.includes('mac') && (userAgent.includes('arm') || userAgent.includes('m1') || userAgent.includes('m2'))) {
            return 'arm64';
        }

        // Check for 64-bit
        if (userAgent.includes('x64') || userAgent.includes('x86_64') || userAgent.includes('amd64') || userAgent.includes('wow64')) {
            return 'x64';
        }

        // Default to x64 for modern systems
        return 'x64';
    }

    updateRecommendedDownload(platform, arch) {
        const recommendedEl = document.getElementById('recommended-download');
        if (!recommendedEl) return;

        let downloadInfo = this.getRecommendedDownload(platform, arch);

        if (downloadInfo) {
            recommendedEl.innerHTML = `
                <div class="recommended-item">
                    <div class="platform-info">
                        <span class="platform-icon">${downloadInfo.icon}</span>
                        <div>
                            <h4>${downloadInfo.name}</h4>
                            <p>${downloadInfo.description}</p>
                        </div>
                    </div>
                    <a href="${downloadInfo.url}" class="download-btn primary" onclick="trackDownload('${downloadInfo.filename}')">
                        📥 Download Now
                    </a>
                </div>
            `;
        } else {
            recommendedEl.innerHTML = `
                <p>Unable to detect your platform. Please choose from the options below.</p>
            `;
        }
    }

    getRecommendedDownload(platform, arch) {
        const downloads = {
            windows: {
                x64: {
                    icon: '🪟',
                    name: 'Windows Installer (64-bit)',
                    description: 'Recommended for Windows 10/11',
                    filename: 'AI-Ping-Monitor-${this.version}-x64.exe',
                    url: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.exe'
                },
                ia32: {
                    icon: '🪟',
                    name: 'Windows Installer (32-bit)',
                    description: 'For older Windows systems',
                    filename: 'AI-Ping-Monitor-${this.version}-ia32.exe',
                    url: this.baseUrl + 'AI-Ping-Monitor-${this.version}-ia32.exe'
                }
            },
            macos: {
                x64: {
                    icon: '🍎',
                    name: 'macOS DMG (Intel)',
                    description: 'For Intel-based Macs',
                    filename: 'AI-Ping-Monitor-${this.version}-x64.dmg',
                    url: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.dmg'
                },
                arm64: {
                    icon: '🍎',
                    name: 'macOS DMG (Apple Silicon)',
                    description: 'For M1/M2 Macs',
                    filename: 'AI-Ping-Monitor-${this.version}-arm64.dmg',
                    url: this.baseUrl + 'AI-Ping-Monitor-${this.version}-arm64.dmg'
                }
            },
            linux: {
                x64: {
                    icon: '🐧',
                    name: 'Linux AppImage',
                    description: 'Universal Linux package',
                    filename: 'AI-Ping-Monitor-${this.version}-x64.AppImage',
                    url: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.AppImage'
                }
            }
        };

        return downloads[platform] && downloads[platform][arch] ? downloads[platform][arch] : null;
    }

    setupDownloadLinks() {
        const downloadBtns = document.querySelectorAll('.download-btn[data-platform]');

        downloadBtns.forEach(btn => {
            const platform = btn.dataset.platform;
            const type = btn.dataset.type;

            const url = this.getDownloadUrl(platform, type);
            if (url) {
                btn.href = url;
                btn.onclick = () => this.trackDownload(this.getFilename(platform, type));
            }
        });
    }

    getDownloadUrl(platform, type) {
        const urls = {
            windows: {
                installer: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.exe',
                portable: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64-portable.exe',
                msi: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.msi'
            },
            macos: {
                dmg: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.dmg',
                zip: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.zip'
            },
            linux: {
                appimage: this.baseUrl + 'AI-Ping-Monitor-${this.version}-x64.AppImage',
                deb: this.baseUrl + 'ai-ping-monitor_${this.version}_amd64.deb',
                rpm: this.baseUrl + 'ai-ping-monitor-${this.version}.x86_64.rpm'
            }
        };

        return urls[platform] && urls[platform][type] ? urls[platform][type] : null;
    }

    getFilename(platform, type) {
        const filenames = {
            windows: {
                installer: 'AI-Ping-Monitor-${this.version}-x64.exe',
                portable: 'AI-Ping-Monitor-${this.version}-x64-portable.exe',
                msi: 'AI-Ping-Monitor-${this.version}-x64.msi'
            },
            macos: {
                dmg: 'AI-Ping-Monitor-${this.version}-x64.dmg',
                zip: 'AI-Ping-Monitor-${this.version}-x64.zip'
            },
            linux: {
                appimage: 'AI-Ping-Monitor-${this.version}-x64.AppImage',
                deb: 'ai-ping-monitor_${this.version}_amd64.deb',
                rpm: 'ai-ping-monitor-${this.version}.x86_64.rpm'
            }
        };

        return filenames[platform] && filenames[platform][type] ? filenames[platform][type] : 'unknown';
    }

    async loadReleaseData() {
        try {
            const response = await fetch('https://api.github.com/repos/r3habb99/ai-ping-monitor/releases/latest');
            const release = await response.json();

            this.updateDownloadList(release.assets);
        } catch (error) {
            console.error('Failed to load release data:', error);
        }
    }

    updateDownloadList(assets) {
        const downloadListEl = document.getElementById('download-list');
        if (!downloadListEl) return;

        if (!assets || assets.length === 0) {
            downloadListEl.innerHTML = '<p>No downloads available at the moment.</p>';
            return;
        }

        const downloadItems = assets.map(asset => `
            <div class="download-item">
                <div class="download-info">
                    <h4>${asset.name}</h4>
                    <p>${this.getAssetDescription(asset.name)}</p>
                    <div class="download-size">${this.formatFileSize(asset.size)}</div>
                </div>
                <a href="${asset.browser_download_url}" class="download-btn primary" onclick="trackDownload('${asset.name}')">
                    📥 Download
                </a>
            </div>
        `).join('');

        downloadListEl.innerHTML = downloadItems;
    }

    getAssetDescription(filename) {
        if (filename.includes('.exe') && filename.includes('portable')) return 'Windows Portable Executable';
        if (filename.includes('.exe')) return 'Windows Installer';
        if (filename.includes('.msi')) return 'Windows MSI Package';
        if (filename.includes('.dmg')) return 'macOS Disk Image';
        if (filename.includes('.zip')) return 'macOS ZIP Archive';
        if (filename.includes('.AppImage')) return 'Linux AppImage';
        if (filename.includes('.deb')) return 'Debian/Ubuntu Package';
        if (filename.includes('.rpm')) return 'Red Hat/Fedora Package';
        return 'Application Package';
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    trackDownload(filename) {
        console.log('Download started:', filename);

        // Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'engagement',
                'event_label': filename
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DownloadManager();
});

// Utility functions
function trackDownload(filename) {
    console.log('Download tracked:', filename);
}