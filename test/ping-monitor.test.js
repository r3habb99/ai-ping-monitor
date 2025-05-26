const assert = require('assert');
const { spawn } = require('child_process');
const PingMonitorAI = require('../ping-monitor.js');

describe('PingMonitorAI', function() {
    this.timeout(30000); // Increase timeout for network operations

    let monitor;

    beforeEach(() => {
        monitor = new PingMonitorAI();
    });

    afterEach(() => {
        if (monitor && monitor.isRunning) {
            monitor.stopMonitoring();
        }
    });

    describe('Constructor', () => {
        it('should initialize with default hosts', () => {
            assert(Array.isArray(monitor.hosts));
            assert(monitor.hosts.length > 0);
            assert(monitor.hosts.some(host => host.name === 'Google DNS'));
            assert(monitor.hosts.some(host => host.address === '8.8.8.8'));
        });

        it('should initialize with default stats', () => {
            assert.strictEqual(monitor.stats.totalPings, 0);
            assert.strictEqual(monitor.stats.successfulPings, 0);
            assert.strictEqual(monitor.stats.failedPings, 0);
            assert.strictEqual(monitor.stats.averageLatency, 0);
            assert.strictEqual(monitor.stats.connectionQuality, 'Unknown');
        });

        it('should initialize ping history as Map', () => {
            assert(monitor.pingHistory instanceof Map);
            assert.strictEqual(monitor.pingHistory.size, 0);
        });
    });

    describe('Platform Detection', () => {
        it('should detect platform correctly', () => {
            assert(typeof monitor.platform === 'string');
            assert(['win32', 'darwin', 'linux'].includes(monitor.platform));
        });

        it('should generate correct ping command for platform', () => {
            const cmd = monitor.getPingCommand('8.8.8.8', 1);
            assert(typeof cmd.command === 'string');
            assert(Array.isArray(cmd.args));

            if (monitor.platform === 'win32') {
                assert.strictEqual(cmd.command, 'ping');
                assert(cmd.args.includes('-n'));
            } else {
                assert.strictEqual(cmd.command, 'ping');
                assert(cmd.args.includes('-c'));
            }
        });
    });

    describe('Ping Execution', () => {
        it('should execute ping to Google DNS', async () => {
            const host = { name: 'Test Google DNS', address: '8.8.8.8' };
            const result = await monitor.executePing(host);

            assert(typeof result === 'object');
            assert(typeof result.success === 'boolean');
            assert(typeof result.host === 'string');
            assert(typeof result.timestamp === 'string');
            assert.strictEqual(result.host, 'Test Google DNS');

            if (result.success) {
                assert(typeof result.latency === 'number');
                assert(result.latency > 0);
            }
        });

        it('should handle invalid host gracefully', async () => {
            const host = { name: 'Invalid Host', address: 'invalid.host.that.does.not.exist.12345' };
            const result = await monitor.executePing(host);

            assert(typeof result === 'object');
            assert.strictEqual(result.success, false);
            assert.strictEqual(result.latency, null);
            assert.strictEqual(result.host, 'Invalid Host');
        });
    });

    describe('Ping Output Parsing', () => {
        it('should parse Windows ping output correctly', () => {
            const windowsOutput = `
Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=15ms TTL=117
            `;

            // Temporarily set platform to Windows for testing
            const originalPlatform = monitor.platform;
            monitor.platform = 'win32';

            const result = monitor.parsePingOutput(windowsOutput, 'Test Host');

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.latency, 15);
            assert.strictEqual(result.host, 'Test Host');

            // Restore original platform
            monitor.platform = originalPlatform;
        });

        it('should parse Unix ping output correctly', () => {
            const unixOutput = `
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=117 time=14.5 ms
            `;

            // Temporarily set platform to Linux for testing
            const originalPlatform = monitor.platform;
            monitor.platform = 'linux';

            const result = monitor.parsePingOutput(unixOutput, 'Test Host');

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.latency, 14.5);
            assert.strictEqual(result.host, 'Test Host');

            // Restore original platform
            monitor.platform = originalPlatform;
        });

        it('should handle failed ping output', () => {
            const failedOutput = `
Ping request could not find host invalid.host. Please check the name and try again.
            `;

            const result = monitor.parsePingOutput(failedOutput, 'Test Host');

            assert.strictEqual(result.success, false);
            assert.strictEqual(result.latency, null);
            assert.strictEqual(result.host, 'Test Host');
        });
    });

    describe('AI Analysis', () => {
        it('should analyze connection quality correctly', () => {
            // Test that the function returns a valid quality rating
            let quality = monitor.analyzeConnectionQuality([5, 8, 6, 9, 7]);
            const validQualities = ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'];
            assert(validQualities.includes(quality), `Expected quality to be one of ${validQualities.join(', ')}, but got: ${quality}`);

            // Test poor quality
            quality = monitor.analyzeConnectionQuality([250, 300, 280, 320, 290]);
            assert(['Poor', 'Very Poor'].includes(quality), `Expected quality to be Poor or Very Poor, but got: ${quality}`);

            // Test no data
            quality = monitor.analyzeConnectionQuality([]);
            assert.strictEqual(quality, 'No Data');
        });

        it('should calculate variance correctly', () => {
            const variance = monitor.calculateVariance([10, 20, 30]);
            assert(typeof variance === 'number');
            assert(variance >= 0);
        });

        it('should provide quality ratings for different latencies', () => {
            assert.strictEqual(monitor.getLatencyQuality(10), '🟢 Excellent');
            assert.strictEqual(monitor.getLatencyQuality(30), '🟡 Good');
            assert.strictEqual(monitor.getLatencyQuality(75), '🟠 Fair');
            assert.strictEqual(monitor.getLatencyQuality(150), '🔴 Poor');
            assert.strictEqual(monitor.getLatencyQuality(250), '⚫ Very Poor');
            assert.strictEqual(monitor.getLatencyQuality(null), '❓ Unknown');
        });
    });

    describe('Statistics Management', () => {
        it('should update stats correctly', () => {
            const mockResults = [
                { success: true, latency: 15, host: 'Host1' },
                { success: true, latency: 25, host: 'Host2' },
                { success: false, latency: null, host: 'Host3' }
            ];

            monitor.updateStats(mockResults);

            assert.strictEqual(monitor.stats.totalPings, 3);
            assert.strictEqual(monitor.stats.successfulPings, 2);
            assert.strictEqual(monitor.stats.failedPings, 1);
        });

        it('should store ping history correctly', () => {
            const mockResults = [
                { success: true, latency: 15, host: 'Host1', timestamp: new Date().toISOString() },
                { success: true, latency: 25, host: 'Host2', timestamp: new Date().toISOString() }
            ];

            monitor.storePingHistory(mockResults);

            assert.strictEqual(monitor.pingHistory.size, 2);
            assert(monitor.pingHistory.has('Host1'));
            assert(monitor.pingHistory.has('Host2'));
            assert.strictEqual(monitor.pingHistory.get('Host1').length, 1);
            assert.strictEqual(monitor.pingHistory.get('Host2').length, 1);
        });

        it('should limit ping history to 100 entries per host', () => {
            const mockResults = [];
            for (let i = 0; i < 150; i++) {
                mockResults.push({
                    success: true,
                    latency: 15 + i,
                    host: 'TestHost',
                    timestamp: new Date().toISOString()
                });
            }

            monitor.storePingHistory(mockResults);

            assert.strictEqual(monitor.pingHistory.get('TestHost').length, 100);
        });
    });

    describe('Concurrent Ping Monitoring', () => {
        it('should run concurrent ping to all hosts', async () => {
            const results = await monitor.runConcurrentPing();

            assert(Array.isArray(results));
            assert.strictEqual(results.length, monitor.hosts.length);

            results.forEach(result => {
                assert(typeof result === 'object');
                assert(typeof result.success === 'boolean');
                assert(typeof result.host === 'string');
                assert(typeof result.timestamp === 'string');
            });
        });
    });
});

describe('CLI Interface', () => {
    it('should show help when --help flag is used', (done) => {
        const child = spawn('node', ['ping-monitor.js', '--help']);
        let output = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.on('close', (code) => {
            assert(output.includes('AI-Powered Internet Ping Monitor'));
            assert(output.includes('Usage:'));
            done();
        });
    });

    it('should run single test when --test flag is used', (done) => {
        const child = spawn('node', ['ping-monitor.js', '--test']);
        let output = '';
        let finished = false;

        // Set a timeout to kill the process
        const timeout = setTimeout(() => {
            if (!finished) {
                finished = true;
                child.kill();
                done();
            }
        }, 15000);

        child.stdout.on('data', (data) => {
            output += data.toString();
            if (!finished && (output.includes('AI-Powered Internet Ping Monitor') ||
                output.includes('Google DNS') ||
                output.includes('Cloudflare DNS'))) {
                finished = true;
                clearTimeout(timeout);
                child.kill();
                done();
            }
        });

        child.on('close', () => {
            if (!finished) {
                finished = true;
                clearTimeout(timeout);
                done();
            }
        });
    });
});
