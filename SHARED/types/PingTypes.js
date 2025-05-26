/**
 * Type definitions and interfaces for the AI Ping Monitor
 * These serve as documentation and validation helpers
 */

/**
 * Host configuration object
 * @typedef {Object} Host
 * @property {string} name - Display name for the host
 * @property {string} address - IP address or hostname
 * @property {string} [provider] - Service provider name
 * @property {string} [category] - Category of the host
 * @property {string} [type] - Type: 'ip' or 'hostname'
 */

/**
 * Ping result object
 * @typedef {Object} PingResult
 * @property {boolean} success - Whether the ping was successful
 * @property {number|null} latency - Latency in milliseconds
 * @property {string} host - Host name that was pinged
 * @property {string} timestamp - ISO timestamp of the ping
 * @property {string|null} error - Error message if ping failed
 */

/**
 * Network statistics object
 * @typedef {Object} NetworkStats
 * @property {number} totalPings - Total number of pings sent
 * @property {number} successfulPings - Number of successful pings
 * @property {number} failedPings - Number of failed pings
 * @property {number} successRate - Success rate as percentage
 * @property {number} averageLatency - Average latency in milliseconds
 * @property {number|null} minLatency - Minimum latency recorded
 * @property {number|null} maxLatency - Maximum latency recorded
 * @property {number} packetLoss - Packet loss as percentage
 * @property {string} connectionQuality - Quality rating
 */

/**
 * Monitoring configuration object
 * @typedef {Object} MonitoringConfig
 * @property {Host[]} hosts - Array of hosts to monitor
 * @property {number} interval - Monitoring interval in milliseconds
 * @property {number} timeout - Ping timeout in milliseconds
 * @property {number} maxHistoryEntries - Maximum history entries per host
 * @property {QualityThresholds} qualityThresholds - Latency thresholds for quality ratings
 */

/**
 * Quality thresholds object
 * @typedef {Object} QualityThresholds
 * @property {number} excellent - Threshold for excellent quality (ms)
 * @property {number} good - Threshold for good quality (ms)
 * @property {number} fair - Threshold for fair quality (ms)
 * @property {number} poor - Threshold for poor quality (ms)
 */

/**
 * Recommendation object
 * @typedef {Object} Recommendation
 * @property {string} type - Type: 'success', 'info', 'warning', 'critical'
 * @property {string} message - Recommendation message
 * @property {string} icon - Emoji icon for the recommendation
 */

/**
 * Application settings object
 * @typedef {Object} AppSettings
 * @property {boolean} autoStart - Start with system
 * @property {boolean} minimizeToTray - Minimize to system tray
 * @property {boolean} showNotifications - Show desktop notifications
 * @property {boolean} startMinimized - Start application minimized
 * @property {number} pingInterval - Ping interval in milliseconds
 * @property {string} theme - UI theme ('light', 'dark', 'auto')
 * @property {Host[]} customHosts - User-defined hosts
 */

/**
 * Ping command configuration
 * @typedef {Object} PingCommand
 * @property {string} command - Command to execute
 * @property {string[]} args - Command arguments
 */

/**
 * Quality levels enumeration
 */
const QualityLevels = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
    VERY_POOR: 'Very Poor',
    UNKNOWN: 'Unknown',
    NO_DATA: 'No Data'
};

/**
 * Recommendation types enumeration
 */
const RecommendationTypes = {
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical'
};

/**
 * Host types enumeration
 */
const HostTypes = {
    IP: 'ip',
    HOSTNAME: 'hostname'
};

/**
 * Platform types enumeration
 */
const PlatformTypes = {
    WINDOWS: 'win32',
    MACOS: 'darwin',
    LINUX: 'linux'
};

/**
 * Default configuration values
 */
const DefaultConfig = {
    PING_INTERVAL: 5000,
    PING_TIMEOUT: 10000,
    MAX_HISTORY_ENTRIES: 100,
    QUALITY_THRESHOLDS: {
        excellent: 20,
        good: 50,
        fair: 100,
        poor: 200
    },
    DEFAULT_HOSTS: [
        { name: 'Google DNS', address: '8.8.8.8', provider: 'Google' },
        { name: 'Cloudflare DNS', address: '1.1.1.1', provider: 'Cloudflare' },
        { name: 'OpenDNS', address: '208.67.222.222', provider: 'OpenDNS' },
        { name: 'Google', address: 'google.com', provider: 'Google' }
    ]
};

/**
 * Validation functions
 */
const Validators = {
    /**
     * Validate host object
     * @param {any} host - Host object to validate
     * @returns {boolean} - Whether the host is valid
     */
    isValidHost(host) {
        return (
            typeof host === 'object' &&
            host !== null &&
            typeof host.name === 'string' &&
            typeof host.address === 'string' &&
            host.name.trim().length > 0 &&
            host.address.trim().length > 0
        );
    },

    /**
     * Validate ping result object
     * @param {any} result - Ping result to validate
     * @returns {boolean} - Whether the result is valid
     */
    isValidPingResult(result) {
        return (
            typeof result === 'object' &&
            result !== null &&
            typeof result.success === 'boolean' &&
            typeof result.host === 'string' &&
            typeof result.timestamp === 'string' &&
            (result.latency === null || typeof result.latency === 'number') &&
            (result.error === null || typeof result.error === 'string')
        );
    },

    /**
     * Validate network stats object
     * @param {any} stats - Network stats to validate
     * @returns {boolean} - Whether the stats are valid
     */
    isValidNetworkStats(stats) {
        return (
            typeof stats === 'object' &&
            stats !== null &&
            typeof stats.totalPings === 'number' &&
            typeof stats.successfulPings === 'number' &&
            typeof stats.failedPings === 'number' &&
            typeof stats.successRate === 'number' &&
            typeof stats.averageLatency === 'number' &&
            typeof stats.packetLoss === 'number' &&
            stats.totalPings >= 0 &&
            stats.successfulPings >= 0 &&
            stats.failedPings >= 0 &&
            stats.successRate >= 0 && stats.successRate <= 100 &&
            stats.averageLatency >= 0 &&
            stats.packetLoss >= 0 && stats.packetLoss <= 100
        );
    },

    /**
     * Validate quality threshold object
     * @param {any} thresholds - Quality thresholds to validate
     * @returns {boolean} - Whether the thresholds are valid
     */
    isValidQualityThresholds(thresholds) {
        return (
            typeof thresholds === 'object' &&
            thresholds !== null &&
            typeof thresholds.excellent === 'number' &&
            typeof thresholds.good === 'number' &&
            typeof thresholds.fair === 'number' &&
            typeof thresholds.poor === 'number' &&
            thresholds.excellent > 0 &&
            thresholds.good > thresholds.excellent &&
            thresholds.fair > thresholds.good &&
            thresholds.poor > thresholds.fair
        );
    }
};

/**
 * Factory functions for creating objects
 */
const Factories = {
    /**
     * Create a host object
     * @param {string} name - Host name
     * @param {string} address - Host address
     * @param {string} [provider] - Provider name
     * @param {string} [category] - Host category
     * @returns {Host} - Host object
     */
    createHost(name, address, provider = null, category = null) {
        return {
            name: name.trim(),
            address: address.trim(),
            ...(provider && { provider }),
            ...(category && { category })
        };
    },

    /**
     * Create a ping result object
     * @param {boolean} success - Whether ping was successful
     * @param {string} host - Host name
     * @param {number|null} latency - Latency in ms
     * @param {string|null} error - Error message
     * @returns {PingResult} - Ping result object
     */
    createPingResult(success, host, latency = null, error = null) {
        return {
            success,
            host,
            latency,
            timestamp: new Date().toISOString(),
            error
        };
    },

    /**
     * Create a recommendation object
     * @param {string} type - Recommendation type
     * @param {string} message - Recommendation message
     * @param {string} icon - Emoji icon
     * @returns {Recommendation} - Recommendation object
     */
    createRecommendation(type, message, icon) {
        return {
            type,
            message,
            icon
        };
    }
};

module.exports = {
    QualityLevels,
    RecommendationTypes,
    HostTypes,
    PlatformTypes,
    DefaultConfig,
    Validators,
    Factories
};
