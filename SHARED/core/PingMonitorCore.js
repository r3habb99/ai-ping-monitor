/**
 * Shared Core Ping Logic
 * Used by both desktop and mobile applications
 */

const { spawn } = require('child_process');
const os = require('os');

/**
 * Core ping monitoring functionality that can be shared across platforms
 */
class PingMonitorCore {
    constructor(options = {}) {
        this.platform = os.platform();
        this.defaultHosts = [
            { name: 'Google DNS', address: '8.8.8.8' },
            { name: 'Cloudflare DNS', address: '1.1.1.1' },
            { name: 'OpenDNS', address: '208.67.222.222' },
            { name: 'Google', address: 'google.com' }
        ];

        this.hosts = options.hosts || this.defaultHosts;
        this.qualityThresholds = options.qualityThresholds || {
            excellent: 20,
            good: 50,
            fair: 100,
            poor: 200
        };

        this.maxHistoryEntries = options.maxHistoryEntries || 100;
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

        return { success, latency, host };
    }

    /**
     * Execute ping command
     */
    async executePing(host) {
        return new Promise((resolve) => {
            const { command, args } = this.getPingCommand(host.address);
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
     * Calculate variance for latency analysis
     */
    calculateVariance(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    /**
     * AI-based connection quality analysis
     */
    analyzeConnectionQuality(latencies, packetLossRate = 0) {
        if (latencies.length === 0) return 'No Data';

        const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
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
        score -= packetLossRate * 2;

        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        if (score >= 20) return 'Poor';
        return 'Very Poor';
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
     * Run concurrent ping monitoring
     */
    async runConcurrentPing(hosts = null) {
        const hostsToTest = hosts || this.hosts;
        const promises = hostsToTest.map(host => this.executePing(host));
        return await Promise.all(promises);
    }

    /**
     * Generate AI-powered recommendations
     */
    generateRecommendations(stats) {
        const recommendations = [];
        const packetLoss = (stats.failedPings / stats.totalPings) * 100;

        if (packetLoss > 10) {
            recommendations.push('🔧 High packet loss detected - Check network hardware');
        }
        if (stats.averageLatency > this.qualityThresholds.poor) {
            recommendations.push('🐌 High latency detected - Consider switching DNS or ISP');
        }
        if (stats.connectionQuality === 'Excellent') {
            recommendations.push('🎉 Your connection is performing excellently!');
        }
        if (stats.totalPings < 10) {
            recommendations.push('📊 Collecting more data for better AI analysis...');
        }

        return recommendations;
    }
}

module.exports = {
    PingMonitorCore,

    // Utility functions
    utils: {
        formatLatency: (latency) => latency ? `${latency.toFixed(1)}ms` : 'N/A',
        formatSuccessRate: (successful, total) => total > 0 ? `${((successful / total) * 100).toFixed(1)}%` : '0%',
        getQualityColor: (quality) => {
            const colors = {
                'Excellent': '#4caf50',
                'Good': '#2196f3',
                'Fair': '#ff9800',
                'Poor': '#f44336',
                'Very Poor': '#9c27b0'
            };
            return colors[quality] || '#666666';
        }
    }
};
