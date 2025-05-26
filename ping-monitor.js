#!/usr/bin/env node

/**
 * AI-Powered Internet Ping Monitor
 * A standalone Node.js tool for monitoring internet connectivity
 * No external dependencies required - uses only Node.js built-in modules
 *
 * Features:
 * - Real-time ping monitoring
 * - AI-based pattern analysis
 * - Connection quality assessment
 * - Concurrent monitoring of multiple hosts
 * - Detailed statistics and reporting
 * - Cross-platform compatibility
 */

const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class PingMonitorAI {
    constructor() {
        this.platform = os.platform();
        this.hosts = [
            { name: 'Google DNS', address: '8.8.8.8' },
            { name: 'Cloudflare DNS', address: '1.1.1.1' },
            { name: 'OpenDNS', address: '208.67.222.222' },
            { name: 'Google', address: 'google.com' }
        ];
        this.pingHistory = new Map();
        this.isRunning = false;
        this.intervals = [];
        this.stats = {
            totalPings: 0,
            successfulPings: 0,
            failedPings: 0,
            averageLatency: 0,
            connectionQuality: 'Unknown'
        };

        // AI-based thresholds for connection quality
        this.qualityThresholds = {
            excellent: 20,
            good: 50,
            fair: 100,
            poor: 200
        };

        this.setupSignalHandlers();
    }

    /**
     * Get platform-specific ping command
     */
    getPingCommand(host, count = 1) {
        const isWindows = this.platform === 'win32';

        if (isWindows) {
            return {
                command: 'ping',
                args: ['-n', count.toString(), host]
            };
        } else {
            // For Unix-like systems, add timeout and interval options
            return {
                command: 'ping',
                args: ['-c', count.toString(), '-W', '3', host]
            };
        }
    }

    /**
     * Parse ping output to extract latency
     */
    parsePingOutput(output, host) {
        const lines = output.split('\n');
        let latency = null;
        let success = false;

        if (process.env.DEBUG) {
            console.log(`Parsing output for ${host}:`);
            console.log(output);
        }

        for (const line of lines) {
            // Windows pattern: time=15ms or time<1ms
            if (this.platform === 'win32' && (line.includes('time=') || line.includes('time<'))) {
                const match = line.match(/time[<=](\d+(?:\.\d+)?)ms/);
                if (match) {
                    latency = parseFloat(match[1]);
                    success = true;
                    break;
                }
            }
            // Unix/Linux/macOS pattern: time=14.0 ms
            else if (line.includes('time=')) {
                const match = line.match(/time=(\d+(?:\.\d+)?)\s*ms/);
                if (match) {
                    latency = parseFloat(match[1]);
                    success = true;
                    break;
                }
            }
            // Alternative Unix pattern: check for "bytes from" line
            else if (line.includes('bytes from') && line.includes('time=')) {
                const match = line.match(/time=(\d+(?:\.\d+)?)\s*ms/);
                if (match) {
                    latency = parseFloat(match[1]);
                    success = true;
                    break;
                }
            }
        }

        if (process.env.DEBUG) {
            console.log(`Parsed result: success=${success}, latency=${latency}`);
        }

        return { success, latency, host };
    }

    /**
     * Execute ping command
     */
    async executePing(host) {
        return new Promise((resolve) => {
            const { command, args } = this.getPingCommand(host.address);

            // Debug information
            if (process.env.DEBUG) {
                console.log(`Executing: ${command} ${args.join(' ')}`);
            }

            const pingProcess = spawn(command, args);

            let output = '';
            let errorOutput = '';

            pingProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pingProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pingProcess.on('error', (error) => {
                resolve({
                    success: false,
                    latency: null,
                    host: host.name,
                    timestamp: new Date().toISOString(),
                    error: `Command error: ${error.message}`
                });
            });

            pingProcess.on('close', (code) => {
                const timestamp = new Date().toISOString();

                if (process.env.DEBUG) {
                    console.log(`Ping to ${host.name} completed with code ${code}`);
                    console.log(`Output: ${output}`);
                    if (errorOutput) console.log(`Error: ${errorOutput}`);
                }

                if (code === 0 && output) {
                    const result = this.parsePingOutput(output, host.name);
                    resolve({
                        ...result,
                        timestamp,
                        error: null
                    });
                } else {
                    resolve({
                        success: false,
                        latency: null,
                        host: host.name,
                        timestamp,
                        error: errorOutput || `Ping failed with code ${code}`
                    });
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                pingProcess.kill();
                resolve({
                    success: false,
                    latency: null,
                    host: host.name,
                    timestamp: new Date().toISOString(),
                    error: 'Timeout (10s)'
                });
            }, 10000);
        });
    }

    /**
     * AI-based connection quality analysis
     */
    analyzeConnectionQuality(latencies) {
        if (latencies.length === 0) return 'No Data';

        const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
        const maxLatency = Math.max(...latencies);
        const minLatency = Math.min(...latencies);
        const variance = this.calculateVariance(latencies);

        // AI scoring algorithm
        let score = 100;

        // Penalize high average latency
        if (avgLatency > this.qualityThresholds.excellent) score -= 20;
        if (avgLatency > this.qualityThresholds.good) score -= 30;
        if (avgLatency > this.qualityThresholds.fair) score -= 30;
        if (avgLatency > this.qualityThresholds.poor) score -= 20;

        // Penalize high variance (inconsistent connection)
        if (variance > 100) score -= 15;
        if (variance > 500) score -= 15;

        // Penalize packet loss
        const packetLoss = (this.stats.failedPings / this.stats.totalPings) * 100;
        score -= packetLoss * 2;

        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        if (score >= 20) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Calculate variance for latency analysis
     */
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    /**
     * Update statistics
     */
    updateStats(results) {
        const successfulResults = results.filter(r => r.success && r.latency !== null);
        const latencies = successfulResults.map(r => r.latency);

        this.stats.totalPings += results.length;
        this.stats.successfulPings += successfulResults.length;
        this.stats.failedPings += results.length - successfulResults.length;

        if (latencies.length > 0) {
            const allLatencies = [];
            this.pingHistory.forEach(hostHistory => {
                allLatencies.push(...hostHistory.map(entry => entry.latency).filter(lat => lat !== null));
            });

            if (allLatencies.length > 0) {
                this.stats.averageLatency = allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length;
                this.stats.connectionQuality = this.analyzeConnectionQuality(allLatencies);
            }
        }
    }

    /**
     * Store ping history for AI analysis
     */
    storePingHistory(results) {
        results.forEach(result => {
            if (!this.pingHistory.has(result.host)) {
                this.pingHistory.set(result.host, []);
            }

            const hostHistory = this.pingHistory.get(result.host);
            hostHistory.push(result);

            // Keep only last 100 entries per host
            if (hostHistory.length > 100) {
                hostHistory.shift();
            }
        });
    }

    /**
     * Display real-time results
     */
    displayResults(results) {
        console.clear();
        console.log('🤖 AI-Powered Internet Ping Monitor');
        console.log('=====================================');
        console.log(`📊 Monitoring ${this.hosts.length} hosts concurrently`);
        console.log(`⏰ Last check: ${new Date().toLocaleString()}\n`);

        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const latency = result.latency ? `${result.latency.toFixed(1)}ms` : 'N/A';
            const quality = this.getLatencyQuality(result.latency);

            console.log(`${status} ${result.host.padEnd(15)} | ${latency.padEnd(8)} | ${quality}`);
        });

        console.log('\n📈 AI Analysis & Statistics:');
        console.log('============================');
        console.log(`🎯 Connection Quality: ${this.stats.connectionQuality}`);
        console.log(`📊 Success Rate: ${((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1)}%`);
        console.log(`⚡ Average Latency: ${this.stats.averageLatency.toFixed(1)}ms`);
        console.log(`📦 Total Pings: ${this.stats.totalPings}`);
        console.log(`✅ Successful: ${this.stats.successfulPings}`);
        console.log(`❌ Failed: ${this.stats.failedPings}`);

        console.log('\n💡 AI Recommendations:');
        console.log('======================');
        this.displayRecommendations();

        console.log('\n⌨️  Press Ctrl+C to stop monitoring');
    }

    /**
     * Get latency quality indicator
     */
    getLatencyQuality(latency) {
        if (!latency) return '❓ Unknown';
        if (latency <= this.qualityThresholds.excellent) return '🟢 Excellent';
        if (latency <= this.qualityThresholds.good) return '🟡 Good';
        if (latency <= this.qualityThresholds.fair) return '🟠 Fair';
        if (latency <= this.qualityThresholds.poor) return '🔴 Poor';
        return '⚫ Very Poor';
    }

    /**
     * AI-powered recommendations
     */
    displayRecommendations() {
        const packetLoss = (this.stats.failedPings / this.stats.totalPings) * 100;

        if (packetLoss > 10) {
            console.log('🔧 High packet loss detected - Check network hardware');
        }
        if (this.stats.averageLatency > this.qualityThresholds.poor) {
            console.log('🐌 High latency detected - Consider switching DNS or ISP');
        }
        if (this.stats.connectionQuality === 'Excellent') {
            console.log('🎉 Your connection is performing excellently!');
        }
        if (this.stats.totalPings < 10) {
            console.log('📊 Collecting more data for better AI analysis...');
        }
    }

    /**
     * Run concurrent ping monitoring
     */
    async runConcurrentPing() {
        const promises = this.hosts.map(host => this.executePing(host));
        const results = await Promise.all(promises);

        this.storePingHistory(results);
        this.updateStats(results);
        this.displayResults(results);

        return results;
    }

    /**
     * Start monitoring
     */
    async startMonitoring(interval = 5000) {
        console.log('🚀 Starting AI-Powered Ping Monitor...\n');
        this.isRunning = true;

        // Initial ping
        await this.runConcurrentPing();

        // Set up interval for continuous monitoring
        const monitorInterval = setInterval(async () => {
            if (this.isRunning) {
                await this.runConcurrentPing();
            }
        }, interval);

        this.intervals.push(monitorInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.isRunning = false;
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        console.log('\n🛑 Monitoring stopped. Final statistics saved.');
        this.saveReport();
    }

    /**
     * Save detailed report
     */
    saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            history: Object.fromEntries(this.pingHistory),
            platform: this.platform,
            hosts: this.hosts
        };

        const filename = `ping-report-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`📄 Detailed report saved to: ${filename}`);
    }

    /**
     * Setup signal handlers for graceful shutdown
     */
    setupSignalHandlers() {
        process.on('SIGINT', () => {
            console.log('\n🔄 Gracefully shutting down...');
            this.stopMonitoring();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            this.stopMonitoring();
            process.exit(0);
        });
    }

    /**
     * Interactive menu
     */
    async showMenu() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('🤖 AI-Powered Internet Ping Monitor');
        console.log('===================================');
        console.log('1. Start Real-time Monitoring');
        console.log('2. Single Ping Test');
        console.log('3. Custom Host Ping');
        console.log('4. Exit');
        console.log('');

        rl.question('Select an option (1-4): ', async (answer) => {
            switch (answer) {
                case '1':
                    rl.close();
                    await this.startMonitoring();
                    break;
                case '2':
                    rl.close();
                    await this.runConcurrentPing();
                    break;
                case '3':
                    rl.question('Enter host/IP to ping: ', async (host) => {
                        rl.close();
                        const customHost = { name: 'Custom', address: host };
                        const result = await this.executePing(customHost);
                        console.log('\nResult:', result);
                    });
                    break;
                case '4':
                    rl.close();
                    console.log('👋 Goodbye!');
                    process.exit(0);
                    break;
                default:
                    rl.close();
                    console.log('❌ Invalid option. Please try again.');
                    await this.showMenu();
            }
        });
    }
}

// Main execution
if (require.main === module) {
    const monitor = new PingMonitorAI();

    // Check if command line arguments are provided
    const args = process.argv.slice(2);

    if (args.includes('--start') || args.includes('-s')) {
        monitor.startMonitoring();
    } else if (args.includes('--test') || args.includes('-t')) {
        monitor.runConcurrentPing();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log('🤖 AI-Powered Internet Ping Monitor');
        console.log('Usage:');
        console.log('  node ping-monitor.js           # Interactive menu');
        console.log('  node ping-monitor.js --start   # Start monitoring');
        console.log('  node ping-monitor.js --test    # Single test');
        console.log('  node ping-monitor.js --help    # Show this help');
    } else {
        monitor.showMenu();
    }
}

module.exports = PingMonitorAI;
