#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class PortableBuilder {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.packageJson = require('../package.json');
        this.version = this.packageJson.version;
        this.productName = this.packageJson.build.productName;
        this.distDir = path.join(__dirname, '..', 'dist');
    }

    async build() {
        console.log('🚀 Building portable executables for AI Ping Monitor...');
        console.log(`📋 Platform: ${this.platform} (${this.arch})`);
        console.log(`📦 Version: ${this.version}`);
        
        try {
            // Ensure dist directory exists
            this.ensureDir(this.distDir);
            
            // Build for current platform
            await this.buildCurrentPlatform();
            
            // Create portable packages
            await this.createPortablePackages();
            
            // Generate download information
            await this.generateDownloadInfo();
            
            console.log('\n✅ Portable build completed successfully!');
            console.log(`📁 Output directory: ${this.distDir}`);
            this.listGeneratedFiles();
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async buildCurrentPlatform() {
        console.log('\n🔨 Building for current platform...');
        
        try {
            let buildCommand;
            
            switch (this.platform) {
                case 'win32':
                    buildCommand = 'npm run build-win';
                    break;
                case 'darwin':
                    buildCommand = 'npm run build-mac';
                    break;
                case 'linux':
                    buildCommand = 'npm run build-linux';
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.platform}`);
            }
            
            console.log(`🔄 Running: ${buildCommand}`);
            execSync(buildCommand, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log('✅ Platform build completed');
            
        } catch (error) {
            throw new Error(`Platform build failed: ${error.message}`);
        }
    }

    async createPortablePackages() {
        console.log('\n📦 Creating portable packages...');
        
        switch (this.platform) {
            case 'win32':
                await this.createWindowsPortable();
                break;
            case 'darwin':
                await this.createMacOSPortable();
                break;
            case 'linux':
                await this.createLinuxPortable();
                break;
        }
    }

    async createWindowsPortable() {
        console.log('🪟 Creating Windows portable package...');
        
        // Windows portable executable should already be created by electron-builder
        const portableExe = path.join(this.distDir, `${this.productName}-${this.version}-x64-portable.exe`);
        
        if (fs.existsSync(portableExe)) {
            console.log('✅ Windows portable executable found');
            
            // Create a simple batch file for easy launching
            const batchContent = `@echo off
echo Starting ${this.productName}...
"%~dp0${path.basename(portableExe)}"
pause`;
            
            fs.writeFileSync(
                path.join(this.distDir, `Launch-${this.productName}.bat`),
                batchContent
            );
            
            console.log('✅ Launch batch file created');
        } else {
            console.log('⚠️  Windows portable executable not found');
        }
    }

    async createMacOSPortable() {
        console.log('🍎 Creating macOS portable package...');
        
        // Look for the ZIP file created by electron-builder
        const zipFile = path.join(this.distDir, `${this.productName}-${this.version}-x64.zip`);
        
        if (fs.existsSync(zipFile)) {
            console.log('✅ macOS ZIP package found');
            
            // Create a simple shell script for easy launching
            const shellContent = `#!/bin/bash
echo "Starting ${this.productName}..."
open "${this.productName}.app"`;
            
            const scriptPath = path.join(this.distDir, `Launch-${this.productName}.sh`);
            fs.writeFileSync(scriptPath, shellContent);
            
            // Make script executable
            try {
                execSync(`chmod +x "${scriptPath}"`);
                console.log('✅ Launch script created');
            } catch (error) {
                console.log('⚠️  Could not make script executable');
            }
        } else {
            console.log('⚠️  macOS ZIP package not found');
        }
    }

    async createLinuxPortable() {
        console.log('🐧 Creating Linux portable package...');
        
        // Look for AppImage
        const appImagePattern = new RegExp(`${this.productName}-${this.version}-x64\\.AppImage`);
        const files = fs.readdirSync(this.distDir);
        const appImageFile = files.find(file => appImagePattern.test(file));
        
        if (appImageFile) {
            const appImagePath = path.join(this.distDir, appImageFile);
            console.log('✅ Linux AppImage found');
            
            // Make AppImage executable
            try {
                execSync(`chmod +x "${appImagePath}"`);
                console.log('✅ AppImage made executable');
            } catch (error) {
                console.log('⚠️  Could not make AppImage executable');
            }
            
            // Create a simple shell script for easy launching
            const shellContent = `#!/bin/bash
echo "Starting ${this.productName}..."
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
"\$DIR/${appImageFile}"`;
            
            const scriptPath = path.join(this.distDir, `Launch-${this.productName}.sh`);
            fs.writeFileSync(scriptPath, shellContent);
            
            // Make script executable
            try {
                execSync(`chmod +x "${scriptPath}"`);
                console.log('✅ Launch script created');
            } catch (error) {
                console.log('⚠️  Could not make script executable');
            }
        } else {
            console.log('⚠️  Linux AppImage not found');
        }
    }

    async generateDownloadInfo() {
        console.log('\n📄 Generating download information...');
        
        const files = fs.readdirSync(this.distDir);
        const downloadInfo = {
            version: this.version,
            productName: this.productName,
            buildDate: new Date().toISOString(),
            platform: this.platform,
            architecture: this.arch,
            files: []
        };
        
        files.forEach(file => {
            const filePath = path.join(this.distDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                downloadInfo.files.push({
                    name: file,
                    size: stats.size,
                    sizeFormatted: this.formatFileSize(stats.size),
                    type: this.getFileType(file),
                    description: this.getFileDescription(file)
                });
            }
        });
        
        // Sort files by type and size
        downloadInfo.files.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type.localeCompare(b.type);
            }
            return b.size - a.size;
        });
        
        fs.writeFileSync(
            path.join(this.distDir, 'download-info.json'),
            JSON.stringify(downloadInfo, null, 2)
        );
        
        console.log('✅ Download information saved');
    }

    getFileType(filename) {
        const ext = path.extname(filename).toLowerCase();
        
        if (ext === '.exe') return 'Windows Executable';
        if (ext === '.msi') return 'Windows Installer';
        if (ext === '.dmg') return 'macOS Disk Image';
        if (ext === '.zip') return 'ZIP Archive';
        if (ext === '.pkg') return 'macOS Package';
        if (ext === '.appimage') return 'Linux AppImage';
        if (ext === '.deb') return 'Debian Package';
        if (ext === '.rpm') return 'RPM Package';
        if (ext === '.tar.gz') return 'TAR Archive';
        if (ext === '.sh') return 'Shell Script';
        if (ext === '.bat') return 'Batch File';
        
        return 'Other';
    }

    getFileDescription(filename) {
        if (filename.includes('portable')) return 'Portable executable - no installation required';
        if (filename.includes('AppImage')) return 'Universal Linux package - no installation required';
        if (filename.includes('Launch')) return 'Convenience launcher script';
        if (filename.includes('.dmg')) return 'macOS installer disk image';
        if (filename.includes('.zip')) return 'Compressed archive';
        if (filename.includes('.exe') && !filename.includes('portable')) return 'Windows installer';
        if (filename.includes('.msi')) return 'Windows MSI installer package';
        if (filename.includes('.deb')) return 'Debian/Ubuntu package';
        if (filename.includes('.rpm')) return 'Red Hat/Fedora package';
        
        return 'Application file';
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    listGeneratedFiles() {
        console.log('\n📋 Generated files:');
        
        const files = fs.readdirSync(this.distDir);
        files.forEach(file => {
            const filePath = path.join(this.distDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                const size = this.formatFileSize(stats.size);
                const type = this.getFileType(file);
                console.log(`   📄 ${file} (${size}) - ${type}`);
            }
        });
        
        console.log('\n💡 Usage instructions:');
        console.log('1. Distribute the portable executable files');
        console.log('2. Users can run them directly without installation');
        console.log('3. Include the launch scripts for convenience');
        console.log('4. Share the download-info.json for website integration');
    }

    static printUsage() {
        console.log(`
🚀 AI Ping Monitor Portable Builder

Usage:
  node scripts/build-portable.js

This script will:
  ✅ Build the application for your current platform
  ✅ Create portable executable packages
  ✅ Generate convenience launcher scripts
  ✅ Create download information file

No admin privileges required!

The generated files can be:
  📤 Uploaded to file sharing services
  🌐 Distributed via websites
  📧 Sent directly to users
  💾 Stored on USB drives

All executables are self-contained and require no installation.
        `);
    }
}

// Run builder if called directly
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        PortableBuilder.printUsage();
        process.exit(0);
    }
    
    const builder = new PortableBuilder();
    builder.build().catch(console.error);
}

module.exports = PortableBuilder;
