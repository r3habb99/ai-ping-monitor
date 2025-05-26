/**
 * Network Utility Functions
 * Shared utilities for network operations and analysis
 */

/**
 * Validate if a string is a valid IP address
 */
function isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate if a string is a valid hostname
 */
function isValidHostname(hostname) {
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return hostnameRegex.test(hostname) && hostname.length <= 253;
}

/**
 * Validate if a string is a valid host (IP or hostname)
 */
function isValidHost(host) {
    return isValidIP(host) || isValidHostname(host);
}

/**
 * Parse host string and return normalized host object
 */
function parseHost(hostString) {
    if (typeof hostString !== 'string') {
        throw new Error('Host must be a string');
    }

    const trimmed = hostString.trim();
    if (!trimmed) {
        throw new Error('Host cannot be empty');
    }

    if (!isValidHost(trimmed)) {
        throw new Error(`Invalid host: ${trimmed}`);
    }

    return {
        address: trimmed,
        name: isValidIP(trimmed) ? `IP ${trimmed}` : trimmed,
        type: isValidIP(trimmed) ? 'ip' : 'hostname'
    };
}

/**
 * Get default DNS servers for testing
 */
function getDefaultDNSServers() {
    return [
        { name: 'Google DNS Primary', address: '8.8.8.8', provider: 'Google' },
        { name: 'Google DNS Secondary', address: '8.8.4.4', provider: 'Google' },
        { name: 'Cloudflare DNS Primary', address: '1.1.1.1', provider: 'Cloudflare' },
        { name: 'Cloudflare DNS Secondary', address: '1.0.0.1', provider: 'Cloudflare' },
        { name: 'OpenDNS Primary', address: '208.67.222.222', provider: 'OpenDNS' },
        { name: 'OpenDNS Secondary', address: '208.67.220.220', provider: 'OpenDNS' },
        { name: 'Quad9 DNS', address: '9.9.9.9', provider: 'Quad9' }
    ];
}

/**
 * Get popular websites for connectivity testing
 */
function getPopularWebsites() {
    return [
        { name: 'Google', address: 'google.com', category: 'Search' },
        { name: 'Facebook', address: 'facebook.com', category: 'Social' },
        { name: 'YouTube', address: 'youtube.com', category: 'Video' },
        { name: 'Amazon', address: 'amazon.com', category: 'E-commerce' },
        { name: 'Microsoft', address: 'microsoft.com', category: 'Technology' },
        { name: 'Apple', address: 'apple.com', category: 'Technology' },
        { name: 'Netflix', address: 'netflix.com', category: 'Streaming' },
        { name: 'GitHub', address: 'github.com', category: 'Development' }
    ];
}

/**
 * Calculate network statistics from ping results
 */
function calculateNetworkStats(results) {
    if (!Array.isArray(results) || results.length === 0) {
        return {
            totalPings: 0,
            successfulPings: 0,
            failedPings: 0,
            successRate: 0,
            averageLatency: 0,
            minLatency: null,
            maxLatency: null,
            packetLoss: 0
        };
    }

    const successful = results.filter(r => r.success && r.latency !== null);
    const latencies = successful.map(r => r.latency);

    return {
        totalPings: results.length,
        successfulPings: successful.length,
        failedPings: results.length - successful.length,
        successRate: (successful.length / results.length) * 100,
        averageLatency: latencies.length > 0 ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0,
        minLatency: latencies.length > 0 ? Math.min(...latencies) : null,
        maxLatency: latencies.length > 0 ? Math.max(...latencies) : null,
        packetLoss: ((results.length - successful.length) / results.length) * 100
    };
}

/**
 * Determine network quality based on latency and packet loss
 */
function determineNetworkQuality(averageLatency, packetLoss) {
    // If packet loss is too high, quality is poor regardless of latency
    if (packetLoss > 5) return 'Poor';
    if (packetLoss > 2) return 'Fair';

    // Determine quality based on latency
    if (averageLatency <= 20) return 'Excellent';
    if (averageLatency <= 50) return 'Good';
    if (averageLatency <= 100) return 'Fair';
    if (averageLatency <= 200) return 'Poor';
    return 'Very Poor';
}

/**
 * Format latency value for display
 */
function formatLatency(latency, precision = 1) {
    if (latency === null || latency === undefined) return 'N/A';
    if (typeof latency !== 'number') return 'Invalid';
    return `${latency.toFixed(precision)}ms`;
}

/**
 * Format success rate for display
 */
function formatSuccessRate(successRate, precision = 1) {
    if (successRate === null || successRate === undefined) return 'N/A';
    if (typeof successRate !== 'number') return 'Invalid';
    return `${successRate.toFixed(precision)}%`;
}

/**
 * Get quality color for UI display
 */
function getQualityColor(quality) {
    const colors = {
        'Excellent': '#4caf50',
        'Good': '#2196f3',
        'Fair': '#ff9800',
        'Poor': '#f44336',
        'Very Poor': '#9c27b0',
        'Unknown': '#666666'
    };
    return colors[quality] || colors['Unknown'];
}

/**
 * Get quality emoji for display
 */
function getQualityEmoji(quality) {
    const emojis = {
        'Excellent': '🟢',
        'Good': '🟡',
        'Fair': '🟠',
        'Poor': '🔴',
        'Very Poor': '⚫',
        'Unknown': '❓'
    };
    return emojis[quality] || emojis['Unknown'];
}

/**
 * Generate network recommendations based on stats
 */
function generateNetworkRecommendations(stats) {
    const recommendations = [];

    if (stats.packetLoss > 10) {
        recommendations.push({
            type: 'critical',
            message: 'High packet loss detected - Check network hardware and connections',
            icon: '🔧'
        });
    }

    if (stats.averageLatency > 200) {
        recommendations.push({
            type: 'warning',
            message: 'High latency detected - Consider switching DNS servers or ISP',
            icon: '🐌'
        });
    }

    if (stats.packetLoss > 5 && stats.packetLoss <= 10) {
        recommendations.push({
            type: 'warning',
            message: 'Moderate packet loss - Check WiFi signal strength or cable connections',
            icon: '📶'
        });
    }

    if (stats.averageLatency > 100 && stats.averageLatency <= 200) {
        recommendations.push({
            type: 'info',
            message: 'Moderate latency - Consider using faster DNS servers',
            icon: '⚡'
        });
    }

    if (stats.successRate === 100 && stats.averageLatency < 50) {
        recommendations.push({
            type: 'success',
            message: 'Excellent network performance!',
            icon: '🎉'
        });
    }

    if (stats.totalPings < 10) {
        recommendations.push({
            type: 'info',
            message: 'Collecting more data for better analysis...',
            icon: '📊'
        });
    }

    return recommendations;
}

module.exports = {
    isValidIP,
    isValidHostname,
    isValidHost,
    parseHost,
    getDefaultDNSServers,
    getPopularWebsites,
    calculateNetworkStats,
    determineNetworkQuality,
    formatLatency,
    formatSuccessRate,
    getQualityColor,
    getQualityEmoji,
    generateNetworkRecommendations
};
