#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WebsiteBuilder {
    constructor() {
        this.websiteDir = path.join(__dirname, '..', 'website-dist');
        this.packageJson = require('../package.json');
        this.version = this.packageJson.version;
        this.productName = this.packageJson.build.productName;
    }

    async build() {
        console.log('🌐 Building download website...');

        // Create website directory
        this.ensureDir(this.websiteDir);

        // Copy assets
        this.copyAssets();

        // Generate HTML files
        this.generateIndexHTML();
        this.generateDownloadHTML();
        this.generateInstallGuideHTML();

        // Generate CSS
        this.generateCSS();

        // Generate JavaScript
        this.generateJS();

        // Generate manifest and other files
        this.generateManifest();
        this.generateRobotsTxt();

        console.log('✅ Website built successfully!');
        console.log(`📁 Output directory: ${this.websiteDir}`);
    }

    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    copyAssets() {
        const assetsDir = path.join(this.websiteDir, 'assets');
        this.ensureDir(assetsDir);

        // Copy icons
        const sourceAssets = path.join(__dirname, '..', 'assets');
        if (fs.existsSync(sourceAssets)) {
            const files = fs.readdirSync(sourceAssets);
            files.forEach(file => {
                const src = path.join(sourceAssets, file);
                const dest = path.join(assetsDir, file);
                fs.copyFileSync(src, dest);
            });
        }
    }

    generateIndexHTML() {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.productName} - Download</title>
    <meta name="description" content="Download ${this.productName} for Windows, macOS, and Linux. Free cross-platform network monitoring tool.">
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="assets/icon.png">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <img src="assets/icon.png" alt="${this.productName}" class="logo">
                <h1>${this.productName}</h1>
                <p class="tagline">AI-Powered Internet Connectivity Monitor</p>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h2>Download for Your Platform</h2>
                <p class="hero-description">
                    Get the latest version (v${this.version}) of ${this.productName} for your operating system.
                    Our smart detection will recommend the best version for your device.
                </p>

                <div class="download-section">
                    <div id="auto-detect" class="auto-detect">
                        <h3>🎯 Recommended for You</h3>
                        <div id="recommended-download" class="recommended-download">
                            <div class="loading">Detecting your platform...</div>
                        </div>
                    </div>

                    <div class="manual-downloads">
                        <h3>📦 All Downloads</h3>
                        <div class="download-grid">
                            <div class="download-card windows">
                                <div class="platform-icon">🪟</div>
                                <h4>Windows</h4>
                                <div class="download-options">
                                    <a href="#" class="download-btn primary" data-platform="windows" data-type="installer">
                                        📥 Installer (.exe)
                                    </a>
                                    <a href="#" class="download-btn secondary" data-platform="windows" data-type="portable">
                                        📦 Portable (.exe)
                                    </a>
                                    <a href="#" class="download-btn secondary" data-platform="windows" data-type="msi">
                                        🔧 MSI Package
                                    </a>
                                </div>
                                <p class="requirements">Windows 10/11 (64-bit)</p>
                            </div>

                            <div class="download-card macos">
                                <div class="platform-icon">🍎</div>
                                <h4>macOS</h4>
                                <div class="download-options">
                                    <a href="#" class="download-btn primary" data-platform="macos" data-type="dmg">
                                        📥 DMG Installer
                                    </a>
                                    <a href="#" class="download-btn secondary" data-platform="macos" data-type="zip">
                                        📦 ZIP Archive
                                    </a>
                                </div>
                                <p class="requirements">macOS 10.15+ (Intel & Apple Silicon)</p>
                            </div>

                            <div class="download-card linux">
                                <div class="platform-icon">🐧</div>
                                <h4>Linux</h4>
                                <div class="download-options">
                                    <a href="#" class="download-btn primary" data-platform="linux" data-type="appimage">
                                        📥 AppImage
                                    </a>
                                    <a href="#" class="download-btn secondary" data-platform="linux" data-type="deb">
                                        📦 DEB Package
                                    </a>
                                    <a href="#" class="download-btn secondary" data-platform="linux" data-type="rpm">
                                        📦 RPM Package
                                    </a>
                                </div>
                                <p class="requirements">Ubuntu 18.04+, Fedora 32+, or equivalent</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="features">
            <div class="container">
                <h2>✨ Key Features</h2>
                <div class="features-grid">
                    <div class="feature">
                        <div class="feature-icon">🤖</div>
                        <h3>AI-Powered Analysis</h3>
                        <p>Intelligent network quality assessment and predictive insights</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🌍</div>
                        <h3>Cross-Platform</h3>
                        <p>Works seamlessly on Windows, macOS, and Linux</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📊</div>
                        <h3>Real-Time Monitoring</h3>
                        <p>Live network performance tracking with detailed statistics</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🔔</div>
                        <h3>Smart Notifications</h3>
                        <p>Get alerted about connection issues and quality changes</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="installation">
            <div class="container">
                <h2>🚀 Quick Installation</h2>
                <div class="install-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <h3>Download</h3>
                        <p>Choose your platform above and download the installer</p>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <h3>Install</h3>
                        <p>Run the installer and follow the setup wizard</p>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <h3>Launch</h3>
                        <p>Start monitoring your network connectivity</p>
                    </div>
                </div>
                <a href="install-guide.html" class="install-guide-link">📖 Detailed Installation Guide</a>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 ${this.productName}. Open source software under MIT License.</p>
            <div class="footer-links">
                <a href="https://github.com/r3habb99/ai-ping-monitor">GitHub</a>
                <a href="https://github.com/r3habb99/ai-ping-monitor/issues">Support</a>
                <a href="https://github.com/r3habb99/ai-ping-monitor/releases">Releases</a>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;

        fs.writeFileSync(path.join(this.websiteDir, 'index.html'), html);
    }

    generateDownloadHTML() {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download ${this.productName}</title>
    <meta name="description" content="Download ${this.productName} v${this.version} for all platforms">
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="assets/icon.png">
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <img src="assets/icon.png" alt="${this.productName}" class="logo">
                <h1>${this.productName}</h1>
                <p class="tagline">Version ${this.version} Downloads</p>
            </div>
        </div>
    </header>

    <main>
        <section class="download-page">
            <div class="container">
                <h2>All Available Downloads</h2>
                <div id="download-list" class="download-list">
                    <div class="loading">Loading download links...</div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 ${this.productName}. Open source software under MIT License.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;

        fs.writeFileSync(path.join(this.websiteDir, 'download.html'), html);
    }

    generateInstallGuideHTML() {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation Guide - ${this.productName}</title>
    <meta name="description" content="Step-by-step installation guide for ${this.productName}">
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="assets/icon.png">
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <img src="assets/icon.png" alt="${this.productName}" class="logo">
                <h1>${this.productName}</h1>
                <p class="tagline">Installation Guide</p>
            </div>
        </div>
    </header>

    <main>
        <section class="install-guide">
            <div class="container">
                <h2>📖 Installation Guide</h2>

                <div class="guide-section">
                    <h3>🪟 Windows Installation</h3>
                    <ol>
                        <li>Download the Windows installer (.exe file)</li>
                        <li>Right-click the downloaded file and select "Run as administrator"</li>
                        <li>Follow the installation wizard</li>
                        <li>Choose installation directory (default recommended)</li>
                        <li>Select additional options (desktop shortcut, start menu entry)</li>
                        <li>Click "Install" and wait for completion</li>
                        <li>Launch from Start Menu or desktop shortcut</li>
                    </ol>

                    <div class="note">
                        <strong>Note:</strong> Windows may show a security warning. Click "More info" and then "Run anyway" to proceed.
                    </div>
                </div>

                <div class="guide-section">
                    <h3>🍎 macOS Installation</h3>
                    <ol>
                        <li>Download the macOS DMG file</li>
                        <li>Double-click the DMG file to mount it</li>
                        <li>Drag the application to the Applications folder</li>
                        <li>Eject the DMG file</li>
                        <li>Launch from Applications folder or Launchpad</li>
                        <li>If prompted, allow the app in System Preferences > Security & Privacy</li>
                    </ol>

                    <div class="note">
                        <strong>Note:</strong> macOS may require you to allow the app in Security & Privacy settings for first-time launch.
                    </div>
                </div>

                <div class="guide-section">
                    <h3>🐧 Linux Installation</h3>

                    <h4>AppImage (Universal)</h4>
                    <ol>
                        <li>Download the AppImage file</li>
                        <li>Make it executable: <code>chmod +x AI-Ping-Monitor-*.AppImage</code></li>
                        <li>Run directly: <code>./AI-Ping-Monitor-*.AppImage</code></li>
                    </ol>

                    <h4>DEB Package (Ubuntu/Debian)</h4>
                    <ol>
                        <li>Download the .deb file</li>
                        <li>Install: <code>sudo dpkg -i ai-ping-monitor_*.deb</code></li>
                        <li>Fix dependencies if needed: <code>sudo apt-get install -f</code></li>
                        <li>Launch from applications menu or run <code>ai-ping-monitor</code></li>
                    </ol>

                    <h4>RPM Package (Fedora/RHEL)</h4>
                    <ol>
                        <li>Download the .rpm file</li>
                        <li>Install: <code>sudo rpm -i ai-ping-monitor-*.rpm</code></li>
                        <li>Or use dnf: <code>sudo dnf install ai-ping-monitor-*.rpm</code></li>
                        <li>Launch from applications menu or run <code>ai-ping-monitor</code></li>
                    </ol>
                </div>

                <div class="guide-section">
                    <h3>🔧 Troubleshooting</h3>

                    <h4>Common Issues</h4>
                    <ul>
                        <li><strong>App won't start:</strong> Check system requirements and ensure you have the latest version</li>
                        <li><strong>Permission denied:</strong> Make sure the file is executable (Linux/macOS)</li>
                        <li><strong>Security warnings:</strong> Allow the app in your system's security settings</li>
                        <li><strong>Network issues:</strong> Ensure the app has network access permissions</li>
                    </ul>

                    <h4>System Requirements</h4>
                    <ul>
                        <li><strong>Windows:</strong> Windows 10 or later (64-bit)</li>
                        <li><strong>macOS:</strong> macOS 10.15 (Catalina) or later</li>
                        <li><strong>Linux:</strong> Ubuntu 18.04+, Fedora 32+, or equivalent</li>
                        <li><strong>RAM:</strong> 512 MB minimum, 1 GB recommended</li>
                        <li><strong>Storage:</strong> 200 MB free space</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h3>🆘 Need Help?</h3>
                    <p>If you encounter any issues during installation:</p>
                    <ul>
                        <li><a href="https://github.com/r3habb99/ai-ping-monitor/issues">Report an issue on GitHub</a></li>
                        <li><a href="https://github.com/r3habb99/ai-ping-monitor/discussions">Join the community discussions</a></li>
                        <li><a href="https://github.com/r3habb99/ai-ping-monitor/wiki">Check the documentation wiki</a></li>
                    </ul>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 ${this.productName}. Open source software under MIT License.</p>
            <div class="footer-links">
                <a href="index.html">Home</a>
                <a href="https://github.com/r3habb99/ai-ping-monitor">GitHub</a>
                <a href="https://github.com/r3habb99/ai-ping-monitor/issues">Support</a>
            </div>
        </div>
    </footer>
</body>
</html>`;

        fs.writeFileSync(path.join(this.websiteDir, 'install-guide.html'), html);
    }

    generateCSS() {
        const css = `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem 0;
    text-align: center;
    color: white;
}

.header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.logo {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
}

.tagline {
    font-size: 1.2rem;
    opacity: 0.9;
    margin: 0;
}

/* Main content */
main {
    background: white;
    margin: 2rem 0;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

section {
    padding: 3rem 0;
}

section:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
}

/* Hero section */
.hero {
    text-align: center;
}

.hero h2 {
    font-size: 2.2rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.hero-description {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* Download section */
.download-section {
    max-width: 1000px;
    margin: 0 auto;
}

.auto-detect {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 2rem;
    border-radius: 16px;
    margin-bottom: 3rem;
    text-align: center;
}

.auto-detect h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.recommended-download {
    margin-top: 1rem;
}

.loading {
    padding: 1rem;
    font-style: italic;
    opacity: 0.8;
}

/* Download grid */
.download-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.download-card {
    background: #f8f9fa;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.download-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.platform-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.download-card h4 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.download-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.download-btn {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
}

.download-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.download-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.download-btn.secondary {
    background: #e9ecef;
    color: #495057;
}

.download-btn.secondary:hover {
    background: #dee2e6;
}

.requirements {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
}

/* Features section */
.features {
    background: #f8f9fa;
}

.features h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 3rem;
    color: #2c3e50;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature {
    text-align: center;
    padding: 1.5rem;
}

.feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.feature h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.feature p {
    color: #666;
}

/* Installation steps */
.installation h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 3rem;
    color: #2c3e50;
}

.install-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.step {
    text-align: center;
    padding: 1.5rem;
}

.step-number {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 auto 1rem;
}

.step h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.step p {
    color: #666;
}

.install-guide-link {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin: 2rem auto 0;
    display: block;
    text-align: center;
    max-width: 300px;
    transition: transform 0.3s ease;
}

.install-guide-link:hover {
    transform: translateY(-2px);
}

/* Footer */
footer {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: white;
    text-align: center;
    padding: 2rem 0;
}

.footer-links {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 2rem;
}

.footer-links a {
    color: white;
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.footer-links a:hover {
    opacity: 1;
}

/* Install guide specific styles */
.install-guide {
    padding: 2rem 0;
}

.guide-section {
    margin-bottom: 3rem;
}

.guide-section h3 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 1rem;
    border-bottom: 2px solid #667eea;
    padding-bottom: 0.5rem;
}

.guide-section h4 {
    font-size: 1.3rem;
    color: #495057;
    margin: 1.5rem 0 1rem;
}

.guide-section ol, .guide-section ul {
    margin-left: 2rem;
    margin-bottom: 1rem;
}

.guide-section li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.note {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
}

code {
    background: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }

    header h1 {
        font-size: 2rem;
    }

    .hero h2 {
        font-size: 1.8rem;
    }

    .download-grid {
        grid-template-columns: 1fr;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }

    .install-steps {
        grid-template-columns: 1fr;
    }

    .footer-links {
        flex-direction: column;
        gap: 1rem;
    }
}

/* Download page specific */
.download-page {
    padding: 2rem 0;
}

.download-list {
    display: grid;
    gap: 1rem;
    margin-top: 2rem;
}

.download-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.3s ease;
}

.download-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.download-info h4 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.download-info p {
    color: #666;
    font-size: 0.9rem;
}

.download-size {
    font-size: 0.8rem;
    color: #999;
    margin-top: 0.25rem;
}`;

        fs.writeFileSync(path.join(this.websiteDir, 'styles.css'), css);
    }

    generateJS() {
        const js = `// Platform detection and download management
class DownloadManager {
    constructor() {
        this.version = '${this.version}';
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
            recommendedEl.innerHTML = \`
                <div class="recommended-item">
                    <div class="platform-info">
                        <span class="platform-icon">\${downloadInfo.icon}</span>
                        <div>
                            <h4>\${downloadInfo.name}</h4>
                            <p>\${downloadInfo.description}</p>
                        </div>
                    </div>
                    <a href="\${downloadInfo.url}" class="download-btn primary" onclick="trackDownload('\${downloadInfo.filename}')">
                        📥 Download Now
                    </a>
                </div>
            \`;
        } else {
            recommendedEl.innerHTML = \`
                <p>Unable to detect your platform. Please choose from the options below.</p>
            \`;
        }
    }

    getRecommendedDownload(platform, arch) {
        const downloads = {
            windows: {
                x64: {
                    icon: '🪟',
                    name: 'Windows Installer (64-bit)',
                    description: 'Recommended for Windows 10/11',
                    filename: 'AI-Ping-Monitor-\${this.version}-x64.exe',
                    url: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.exe'
                },
                ia32: {
                    icon: '🪟',
                    name: 'Windows Installer (32-bit)',
                    description: 'For older Windows systems',
                    filename: 'AI-Ping-Monitor-\${this.version}-ia32.exe',
                    url: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-ia32.exe'
                }
            },
            macos: {
                x64: {
                    icon: '🍎',
                    name: 'macOS DMG (Intel)',
                    description: 'For Intel-based Macs',
                    filename: 'AI-Ping-Monitor-\${this.version}-x64.dmg',
                    url: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.dmg'
                },
                arm64: {
                    icon: '🍎',
                    name: 'macOS DMG (Apple Silicon)',
                    description: 'For M1/M2 Macs',
                    filename: 'AI-Ping-Monitor-\${this.version}-arm64.dmg',
                    url: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-arm64.dmg'
                }
            },
            linux: {
                x64: {
                    icon: '🐧',
                    name: 'Linux AppImage',
                    description: 'Universal Linux package',
                    filename: 'AI-Ping-Monitor-\${this.version}-x64.AppImage',
                    url: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.AppImage'
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
                installer: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.exe',
                portable: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64-portable.exe',
                msi: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.msi'
            },
            macos: {
                dmg: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.dmg',
                zip: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.zip'
            },
            linux: {
                appimage: this.baseUrl + 'AI-Ping-Monitor-\${this.version}-x64.AppImage',
                deb: this.baseUrl + 'ai-ping-monitor_\${this.version}_amd64.deb',
                rpm: this.baseUrl + 'ai-ping-monitor-\${this.version}.x86_64.rpm'
            }
        };

        return urls[platform] && urls[platform][type] ? urls[platform][type] : null;
    }

    getFilename(platform, type) {
        const filenames = {
            windows: {
                installer: 'AI-Ping-Monitor-\${this.version}-x64.exe',
                portable: 'AI-Ping-Monitor-\${this.version}-x64-portable.exe',
                msi: 'AI-Ping-Monitor-\${this.version}-x64.msi'
            },
            macos: {
                dmg: 'AI-Ping-Monitor-\${this.version}-x64.dmg',
                zip: 'AI-Ping-Monitor-\${this.version}-x64.zip'
            },
            linux: {
                appimage: 'AI-Ping-Monitor-\${this.version}-x64.AppImage',
                deb: 'ai-ping-monitor_\${this.version}_amd64.deb',
                rpm: 'ai-ping-monitor-\${this.version}.x86_64.rpm'
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

        const downloadItems = assets.map(asset => \`
            <div class="download-item">
                <div class="download-info">
                    <h4>\${asset.name}</h4>
                    <p>\${this.getAssetDescription(asset.name)}</p>
                    <div class="download-size">\${this.formatFileSize(asset.size)}</div>
                </div>
                <a href="\${asset.browser_download_url}" class="download-btn primary" onclick="trackDownload('\${asset.name}')">
                    📥 Download
                </a>
            </div>
        \`).join('');

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
}`;

        fs.writeFileSync(path.join(this.websiteDir, 'script.js'), js);
    }

    generateManifest() {
        const manifest = {
            name: this.productName,
            short_name: "AI Ping Monitor",
            description: "AI-Powered Internet Connectivity Monitor",
            start_url: "/",
            display: "standalone",
            background_color: "#667eea",
            theme_color: "#667eea",
            icons: [
                {
                    src: "assets/icon.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ]
        };

        fs.writeFileSync(
            path.join(this.websiteDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
    }

    generateRobotsTxt() {
        const robots = `User-agent: *
Allow: /

Sitemap: https://r3habb99.github.io/ai-ping-monitor/sitemap.xml`;

        fs.writeFileSync(path.join(this.websiteDir, 'robots.txt'), robots);
    }
}

// Run the builder
if (require.main === module) {
    const builder = new WebsiteBuilder();
    builder.build().catch(console.error);
}

module.exports = WebsiteBuilder;
