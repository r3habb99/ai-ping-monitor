#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class CrossPlatformSetup {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.isCI = process.env.CI === 'true';
    }

    async setup() {
        console.log('🚀 Setting up AI Ping Monitor for cross-platform development...');
        console.log(`📋 Platform: ${this.platform} (${this.arch})`);

        try {
            // Install dependencies
            await this.installDependencies();

            // Setup platform-specific requirements
            await this.setupPlatformRequirements();

            // Create necessary directories
            await this.createDirectories();

            // Setup build certificates (if available)
            await this.setupCertificates();

            // Verify setup
            await this.verifySetup();

            console.log('\n✅ Cross-platform setup completed successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. Run "npm run build" to build for current platform');
            console.log('2. Run "npm run build-all" to build for all platforms');
            console.log('3. Run "npm run build-website" to generate download website');
            console.log('4. Run "npm run deploy-website" to deploy to GitHub Pages');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async installDependencies() {
        console.log('\n📦 Installing dependencies...');

        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dependencies installed successfully');
        } catch (error) {
            throw new Error('Failed to install dependencies: ' + error.message);
        }
    }

    async setupPlatformRequirements() {
        console.log('\n🔧 Setting up platform-specific requirements...');

        switch (this.platform) {
            case 'win32':
                await this.setupWindows();
                break;
            case 'darwin':
                await this.setupMacOS();
                break;
            case 'linux':
                await this.setupLinux();
                break;
            default:
                console.log('⚠️  Unknown platform, skipping platform-specific setup');
        }
    }

    async setupWindows() {
        console.log('🪟 Setting up Windows requirements...');

        // Check for Windows SDK
        try {
            execSync('where signtool', { stdio: 'pipe' });
            console.log('✅ Windows SDK found');
        } catch {
            console.log('⚠️  Windows SDK not found - code signing will be disabled');
        }

        // Check for Visual Studio Build Tools
        try {
            execSync('where msbuild', { stdio: 'pipe' });
            console.log('✅ Visual Studio Build Tools found');
        } catch {
            console.log('⚠️  Visual Studio Build Tools not found - some features may not work');
        }
    }

    async setupMacOS() {
        console.log('🍎 Setting up macOS requirements...');

        // Check for Xcode Command Line Tools
        try {
            execSync('xcode-select -p', { stdio: 'pipe' });
            console.log('✅ Xcode Command Line Tools found');
        } catch {
            console.log('⚠️  Xcode Command Line Tools not found');
            console.log('   Run: xcode-select --install');
        }

        // Check for codesign
        try {
            execSync('which codesign', { stdio: 'pipe' });
            console.log('✅ Code signing tools available');
        } catch {
            console.log('⚠️  Code signing tools not found');
        }
    }

    async setupLinux() {
        console.log('🐧 Setting up Linux requirements...');

        // Check for required packages without trying to install
        const requiredPackages = [
            'libnss3-dev',
            'libatk-bridge2.0-dev',
            'libdrm2-dev',
            'libxcomposite-dev',
            'libxdamage-dev',
            'libxrandr-dev',
            'libgbm-dev',
            'libxss-dev',
            'libasound2-dev'
        ];

        console.log('📋 Checking for required system packages...');

        // Check if packages are available (without installing)
        const missingPackages = [];

        for (const pkg of requiredPackages) {
            try {
                // Check if the library files exist
                const libName = pkg.replace('-dev', '').replace('lib', '');
                execSync(`ldconfig -p | grep ${libName}`, { stdio: 'pipe' });
                console.log(`✅ ${pkg} (or equivalent) found`);
            } catch {
                missingPackages.push(pkg);
            }
        }

        if (missingPackages.length > 0) {
            console.log('⚠️  Some system packages may be missing:');
            console.log('   Missing packages:', missingPackages.join(' '));
            console.log('');
            console.log('📋 To install missing packages (requires admin access):');

            if (this.commandExists('apt-get')) {
                console.log(`   sudo apt-get update && sudo apt-get install -y ${missingPackages.join(' ')}`);
            } else if (this.commandExists('yum')) {
                console.log(`   sudo yum install -y ${missingPackages.join(' ')}`);
            } else if (this.commandExists('dnf')) {
                console.log(`   sudo dnf install -y ${missingPackages.join(' ')}`);
            } else {
                console.log('   Please install equivalent packages for your distribution');
            }

            console.log('');
            console.log('💡 Note: The application may still build and run without these packages,');
            console.log('   but some features might not work properly.');
        } else {
            console.log('✅ All required system packages appear to be available');
        }
    }

    commandExists(command) {
        try {
            execSync(`which ${command}`, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }

    async createDirectories() {
        console.log('\n📁 Creating necessary directories...');

        const directories = [
            'dist',
            'build',
            'certs',
            'website-dist'
        ];

        directories.forEach(dir => {
            const dirPath = path.join(process.cwd(), dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`✅ Created directory: ${dir}`);
            } else {
                console.log(`📁 Directory exists: ${dir}`);
            }
        });
    }

    async setupCertificates() {
        console.log('\n🔐 Setting up code signing certificates...');

        const certsDir = path.join(process.cwd(), 'certs');

        // Check for existing certificates
        const windowsCert = path.join(certsDir, 'windows-cert.p12');
        const macOSCert = path.join(certsDir, 'macos-cert.p12');

        if (fs.existsSync(windowsCert)) {
            console.log('✅ Windows certificate found');
        } else {
            console.log('⚠️  Windows certificate not found');
            console.log('   Place your .p12 certificate at: certs/windows-cert.p12');
        }

        if (fs.existsSync(macOSCert)) {
            console.log('✅ macOS certificate found');
        } else {
            console.log('⚠️  macOS certificate not found');
            console.log('   Place your .p12 certificate at: certs/macos-cert.p12');
        }

        // Create certificate info file
        const certInfo = {
            windows: {
                certificateFile: 'certs/windows-cert.p12',
                certificatePassword: process.env.WINDOWS_CERT_PASSWORD || '',
                publisherName: 'Rishabh Prajapati'
            },
            macos: {
                certificateFile: 'certs/macos-cert.p12',
                certificatePassword: process.env.MACOS_CERT_PASSWORD || '',
                appleId: process.env.APPLE_ID || '',
                appleIdPassword: process.env.APPLE_ID_PASSWORD || '',
                teamId: process.env.APPLE_TEAM_ID || ''
            }
        };

        fs.writeFileSync(
            path.join(certsDir, 'certificate-info.json'),
            JSON.stringify(certInfo, null, 2)
        );

        console.log('📄 Certificate configuration saved');
    }

    async verifySetup() {
        console.log('\n🔍 Verifying setup...');

        // Check if electron-builder is available
        try {
            execSync('npx electron-builder --version', { stdio: 'pipe' });
            console.log('✅ Electron Builder available');
        } catch {
            throw new Error('Electron Builder not found');
        }

        // Check if electron is available
        try {
            execSync('npx electron --version', { stdio: 'pipe' });
            console.log('✅ Electron available');
        } catch {
            throw new Error('Electron not found');
        }

        // Verify package.json build configuration
        const packageJson = require('../package.json');
        if (packageJson.build) {
            console.log('✅ Build configuration found');
        } else {
            throw new Error('Build configuration missing in package.json');
        }

        // Check for required assets
        const assetsDir = path.join(process.cwd(), 'assets');
        if (fs.existsSync(assetsDir)) {
            console.log('✅ Assets directory found');
        } else {
            console.log('⚠️  Assets directory not found - some icons may be missing');
        }
    }

    static printUsage() {
        console.log(`
🚀 AI Ping Monitor Cross-Platform Setup

Usage:
  node scripts/setup-cross-platform.js

This script will:
  ✅ Install all required dependencies
  ✅ Setup platform-specific build requirements
  ✅ Create necessary directories
  ✅ Configure code signing certificates
  ✅ Verify the development environment

Environment Variables (optional):
  WINDOWS_CERT_PASSWORD - Password for Windows code signing certificate
  MACOS_CERT_PASSWORD   - Password for macOS code signing certificate
  APPLE_ID              - Apple ID for notarization
  APPLE_ID_PASSWORD     - App-specific password for Apple ID
  APPLE_TEAM_ID         - Apple Developer Team ID

After setup, you can:
  npm run build         - Build for current platform
  npm run build-all     - Build for all platforms
  npm run build-website - Generate download website
  npm run deploy-website - Deploy to GitHub Pages
        `);
    }
}

// Run setup if called directly
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        CrossPlatformSetup.printUsage();
        process.exit(0);
    }

    const setup = new CrossPlatformSetup();
    setup.setup().catch(console.error);
}

module.exports = CrossPlatformSetup;
