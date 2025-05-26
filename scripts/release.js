#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReleaseManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
  }

  async run() {
    console.log('🚀 AI Ping Monitor Release Manager');
    console.log('==================================\n');

    try {
      // Parse command line arguments
      const args = process.argv.slice(2);
      const releaseType = args[0] || 'patch'; // patch, minor, major, prerelease

      if (!['patch', 'minor', 'major', 'prerelease'].includes(releaseType)) {
        throw new Error('Invalid release type. Use: patch, minor, major, or prerelease');
      }

      console.log(`📦 Preparing ${releaseType} release...`);

      // Pre-release checks
      await this.preReleaseChecks();

      // Update version
      const newVersion = await this.updateVersion(releaseType);

      // Build all platforms
      await this.buildAllPlatforms();

      // Create git tag and push
      await this.createGitTag(newVersion);

      // Generate release notes
      await this.generateReleaseNotes(newVersion);

      console.log('\n✅ Release preparation completed!');
      console.log(`🎉 Version ${newVersion} is ready for distribution`);
      console.log('\nNext steps:');
      console.log('1. Push the tag to trigger GitHub Actions: git push origin v' + newVersion);
      console.log('2. Monitor the build process in GitHub Actions');
      console.log('3. Update app store listings if needed');

    } catch (error) {
      console.error('\n❌ Release failed:', error.message);
      process.exit(1);
    }
  }

  async preReleaseChecks() {
    console.log('🔍 Running pre-release checks...');

    // Check if git is clean
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Git working directory is not clean. Please commit or stash changes.');
      }
    } catch (error) {
      throw new Error('Git status check failed: ' + error.message);
    }

    // Check if on main branch
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      if (branch !== 'main' && branch !== 'master') {
        console.warn(`⚠️  Warning: You're on branch '${branch}', not main/master`);
      }
    } catch (error) {
      console.warn('⚠️  Could not determine current branch');
    }

    // Check if dependencies are installed
    if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { cwd: this.projectRoot, stdio: 'inherit' });
    }

    console.log('✓ Pre-release checks passed\n');
  }

  async updateVersion(releaseType) {
    console.log(`📝 Updating version (${releaseType})...`);

    // Use npm version to update version
    const output = execSync(`npm version ${releaseType} --no-git-tag-version`, {
      cwd: this.projectRoot,
      encoding: 'utf8'
    });

    const newVersion = output.trim().replace('v', '');

    // Version is already updated in the main package.json

    console.log(`✓ Version updated to ${newVersion}\n`);
    return newVersion;
  }

  async buildAllPlatforms() {
    console.log('🔨 Building all platforms...');

    try {
      // Build desktop applications
      console.log('Building desktop applications...');
      execSync('npm run build-all', { cwd: this.projectRoot, stdio: 'inherit' });
      console.log('✓ Desktop builds completed');

    } catch (error) {
      throw new Error('Build failed: ' + error.message);
    }

    console.log('✓ Desktop build completed\n');
  }

  async createGitTag(version) {
    console.log('🏷️  Creating git tag...');

    try {
      // Commit version changes
      execSync('git add .', { cwd: this.projectRoot });
      execSync(`git commit -m "chore: bump version to ${version}"`, { cwd: this.projectRoot });

      // Create tag
      execSync(`git tag -a v${version} -m "Release v${version}"`, { cwd: this.projectRoot });

      console.log(`✓ Created tag v${version}\n`);
    } catch (error) {
      throw new Error('Git tag creation failed: ' + error.message);
    }
  }

  async generateReleaseNotes(version) {
    console.log('📝 Generating release notes...');

    const releaseNotes = `# AI Ping Monitor v${version}

## 🚀 What's New

### Desktop Application
- Cross-platform builds for Windows, macOS, and Linux
- System tray integration with real-time monitoring
- Auto-start capabilities
- Smart notifications for connection issues



### Core Features
- AI-powered connection quality analysis
- Concurrent ping testing to multiple hosts
- Real-time statistics and reporting
- Historical data tracking
- Smart recommendations

## 📦 Downloads

### Desktop Applications
- **Windows**: \`AI-Ping-Monitor-${version}-x64.exe\` (Installer), \`AI-Ping-Monitor-${version}-x64-portable.exe\` (Portable)
- **macOS**: \`AI-Ping-Monitor-${version}-x64.dmg\` (Intel), \`AI-Ping-Monitor-${version}-arm64.dmg\` (Apple Silicon)
- **Linux**: \`AI-Ping-Monitor-${version}-x64.AppImage\`, \`ai-ping-monitor_${version}_amd64.deb\`, \`ai-ping-monitor-${version}.x86_64.rpm\`



## 🔧 Installation

### Desktop
1. Download the appropriate installer for your platform
2. Run the installer and follow the setup wizard
3. Launch AI Ping Monitor from your applications menu



## 📊 System Requirements

### Desktop
- **Windows**: Windows 10 or later (x64, x86)
- **macOS**: macOS 10.15 or later (Intel/Apple Silicon)
- **Linux**: Ubuntu 18.04+, Fedora 30+, or equivalent



## 🐛 Bug Fixes
- Improved connection stability monitoring
- Enhanced error handling and recovery
- Better resource management
- Fixed notification timing issues

## 🔒 Security
- Code signing for all desktop applications
- Secure update mechanism
- Privacy-focused data handling (local storage only)

---

**Full Changelog**: https://github.com/r3habb99/ai-ping-monitor/compare/v${this.getPreviousVersion()}...v${version}
`;

    const releaseNotesPath = path.join(this.projectRoot, `RELEASE_NOTES_v${version}.md`);
    fs.writeFileSync(releaseNotesPath, releaseNotes);

    console.log(`✓ Release notes generated: ${releaseNotesPath}\n`);
  }

  getPreviousVersion() {
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' });
      const tagList = tags.trim().split('\n').filter(tag => tag.startsWith('v'));
      return tagList[0] || 'v0.0.0';
    } catch (error) {
      return 'v0.0.0';
    }
  }
}

// Run the release manager
if (require.main === module) {
  const releaseManager = new ReleaseManager();
  releaseManager.run().catch(console.error);
}

module.exports = ReleaseManager;
