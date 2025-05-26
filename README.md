# 🤖 AI-Powered Internet Ping Monitor

A comprehensive cross-platform solution for monitoring internet connectivity with intelligent analysis and real-time reporting. Available as a **desktop application** and **standalone CLI tool**.

## 📥 Quick Download

### 🌐 Official Download Website
**Visit: [https://r3habb99.github.io/ai-ping-monitor/](https://r3habb99.github.io/ai-ping-monitor/)**

- **Auto-detects your platform** and suggests the best download
- **Direct downloads** for all supported platforms
- **Installation guides** and troubleshooting help

### 📦 Alternative Downloads
- **GitHub Releases**: [https://github.com/r3habb99/ai-ping-monitor/releases](https://github.com/r3habb99/ai-ping-monitor/releases)

## 🌟 Cross-Platform Availability

### 🖥️ Desktop Applications
- **Windows**: NSIS Installer, Portable EXE, MSI Package
- **macOS**: DMG, ZIP, PKG Installer
- **Linux**: AppImage, DEB, RPM, Snap, Flatpak

### ⌨️ Command Line Interface
- **Standalone Node.js tool** with zero external dependencies
- **Cross-platform CLI** for Windows, macOS, and Linux

## ✨ Features

### Desktop Application
- **🎯 System Tray Integration**: Always-on monitoring in your taskbar
- **📊 Real-Time Dashboard**: Beautiful UI with live charts and statistics
- **🔔 Smart Notifications**: Alerts for connection issues and quality changes
- **⚙️ Auto-Start Support**: Launch automatically with your system
- **🌙 Dark/Light Mode**: Adaptive UI themes
- **📈 Historical Data**: Track connection quality over time

### Core Monitoring
- **🤖 AI-Powered Analysis**: Intelligent connection quality assessment
- **⚡ Concurrent Monitoring**: Tests multiple hosts simultaneously
- **🌍 Cross-Platform**: Works on all major operating systems
- **📊 Real-Time Statistics**: Live monitoring with detailed metrics
- **📈 Pattern Recognition**: Analyzes latency patterns and trends
- **💾 Detailed Reporting**: Saves comprehensive JSON reports
- **🎯 Smart Recommendations**: AI-generated network optimization tips

## 🚀 Quick Start

### 🖥️ Desktop Application

#### Download & Install
- **Windows**: Download `.exe` installer or portable version
- **macOS**: Download `.dmg` file and drag to Applications
- **Linux**: Download `.AppImage`, `.deb`, `.rpm`, or install via Snap

#### Build from Source
```bash
# Clone the repository
git clone https://github.com/r3habb99/ai-ping-monitor.git
cd ai-ping-monitor

# Automated cross-platform setup
node scripts/setup-cross-platform.js

# Build for your platform
npm run build

# Build for all platforms
npm run build-all
```

### ⌨️ Command Line Interface

#### Prerequisites
- Node.js 18.0.0 or higher
- No additional dependencies required!

#### Installation & Usage

1. **Clone or Download**
   ```bash
   # Download the files to your local machine
   # No npm install needed - zero dependencies!
   ```

2. **Make it Executable** (Linux/macOS)
   ```bash
   chmod +x ping-monitor.js
   ```

3. **Run the Tool**
   ```bash
   # Interactive menu
   node ping-monitor.js

   # Start real-time monitoring
   node ping-monitor.js --start

   # Single ping test
   node ping-monitor.js --test

   # Show help
   node ping-monitor.js --help
   ```

#### Using npm scripts
```bash
npm run start      # Start monitoring
npm run test       # Single test
npm run monitor    # Interactive menu
npm run help       # Show help

# Desktop builds
npm run build-win      # Windows
npm run build-mac      # macOS
npm run build-linux    # Linux
npm run build-all      # All platforms

# Mobile builds
npm run mobile-android # Android development
npm run mobile-ios     # iOS development
```

## 📋 Usage Examples

### 1. Interactive Mode
```bash
node ping-monitor.js
```
Launches an interactive menu where you can choose different monitoring options.

### 2. Real-Time Monitoring
```bash
node ping-monitor.js --start
```
Starts continuous monitoring with real-time updates every 5 seconds.

### 3. Single Test
```bash
node ping-monitor.js --test
```
Performs a one-time ping test to all configured hosts.

## 🎯 Monitored Hosts

The tool monitors these hosts by default:
- **Google DNS**: 8.8.8.8
- **Cloudflare DNS**: 1.1.1.1
- **OpenDNS**: 208.67.222.222
- **Google**: google.com

## 🤖 AI Features

### Connection Quality Analysis
The AI engine analyzes multiple factors:
- **Average Latency**: Response time patterns
- **Latency Variance**: Connection consistency
- **Packet Loss Rate**: Network reliability
- **Pattern Recognition**: Trend analysis

### Quality Ratings
- 🟢 **Excellent**: < 20ms average latency
- 🟡 **Good**: 20-50ms average latency
- 🟠 **Fair**: 50-100ms average latency
- 🔴 **Poor**: 100-200ms average latency
- ⚫ **Very Poor**: > 200ms average latency

### Smart Recommendations
The AI provides actionable insights:
- Network hardware diagnostics
- DNS optimization suggestions
- ISP performance analysis
- Connection stability tips

## 📊 Sample Output

```
🤖 AI-Powered Internet Ping Monitor
=====================================
📊 Monitoring 4 hosts concurrently
⏰ Last check: 1/15/2025, 10:30:45 AM

✅ Google DNS      | 12.3ms   | 🟢 Excellent
✅ Cloudflare DNS  | 8.7ms    | 🟢 Excellent
✅ OpenDNS         | 15.2ms   | 🟢 Excellent
✅ Google          | 22.1ms   | 🟡 Good

📈 AI Analysis & Statistics:
============================
🎯 Connection Quality: Excellent
📊 Success Rate: 100.0%
⚡ Average Latency: 14.6ms
📦 Total Pings: 16
✅ Successful: 16
❌ Failed: 0

💡 AI Recommendations:
======================
🎉 Your connection is performing excellently!

⌨️  Press Ctrl+C to stop monitoring
```

## 🛠️ Technical Implementation

### Architecture
- **Concurrent Processing**: Uses Promise.all() for simultaneous pings
- **Cross-Platform Compatibility**: Detects OS and uses appropriate ping commands
- **Memory Efficient**: Maintains rolling history (last 100 entries per host)
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals properly

### Core Components
1. **PingExecutor**: Handles platform-specific ping commands
2. **AIAnalyzer**: Processes latency data and generates insights
3. **StatisticsEngine**: Tracks and calculates performance metrics
4. **ReportGenerator**: Creates detailed JSON reports
5. **CLIInterface**: Provides interactive user experience

### AI Algorithm
```javascript
// Simplified AI scoring algorithm
let score = 100;
score -= latencyPenalty(avgLatency);
score -= variancePenalty(latencyVariance);
score -= packetLossPenalty(failureRate);
return qualityRating(score);
```

## 📁 File Structure

```
ai-ping-monitor/
├── ping-monitor.js          # Main application file
├── package.json            # Project configuration
├── README.md              # This documentation
└── ping-report-*.json     # Generated reports (auto-created)
```

## 🔧 Configuration

### Custom Hosts
You can modify the hosts array in the code:
```javascript
this.hosts = [
    { name: 'Custom Server', address: 'your-server.com' },
    { name: 'Local Gateway', address: '192.168.1.1' }
];
```

### Monitoring Interval
Change the default 5-second interval:
```javascript
await this.startMonitoring(3000); // 3 seconds
```

### Quality Thresholds
Adjust AI quality thresholds:
```javascript
this.qualityThresholds = {
    excellent: 15,  // < 15ms
    good: 40,       // 15-40ms
    fair: 80,       // 40-80ms
    poor: 150       // 80-150ms
};
```

## 📄 Report Generation

The tool automatically generates detailed JSON reports containing:
- Complete ping history
- Statistical analysis
- AI quality assessments
- Platform information
- Timestamp data

Example report structure:
```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "stats": {
    "totalPings": 100,
    "successfulPings": 98,
    "failedPings": 2,
    "averageLatency": 14.6,
    "connectionQuality": "Excellent"
  },
  "history": { ... },
  "platform": "linux",
  "hosts": [ ... ]
}
```

## 🚀 Performance

- **Memory Usage**: < 50MB typical
- **CPU Usage**: Minimal (< 1% on modern systems)
- **Network Impact**: Negligible (small ICMP packets)
- **Startup Time**: < 1 second
- **Cross-Platform**: Windows, macOS, Linux

## 🤝 Contributing

This is a standalone project perfect for:
- Learning Node.js built-in modules
- Understanding network programming
- Exploring AI/ML concepts in networking
- Building CLI tools

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🎯 Use Cases

- **Network Troubleshooting**: Diagnose connectivity issues
- **Performance Monitoring**: Track internet quality over time
- **ISP Analysis**: Compare different internet providers
- **Remote Work**: Monitor connection stability for video calls
- **Gaming**: Check latency for online gaming
- **Development**: Test API endpoint connectivity

## 🔮 Future Enhancements

- Web dashboard interface
- Email/SMS alerts for connection issues
- Historical data visualization
- Machine learning for predictive analysis
- Integration with network monitoring tools
- Custom notification thresholds

---

**Built with ❤️ using only Node.js built-in modules**

*Perfect for showcasing Node.js skills without dependency bloat!*
