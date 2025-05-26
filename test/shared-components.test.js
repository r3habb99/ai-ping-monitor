const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('Shared Components', () => {
    describe('Core Module', () => {
        it('should load PingMonitorCore module', () => {
            const corePath = path.join(__dirname, '..', 'SHARED', 'core', 'PingMonitorCore.js');
            assert(fs.existsSync(corePath), 'PingMonitorCore.js should exist');

            const coreModule = require(corePath);
            assert(typeof coreModule === 'object', 'Core module should export an object');
        });

        it('should have proper directory structure', () => {
            const sharedPath = path.join(__dirname, '..', 'SHARED');
            assert(fs.existsSync(sharedPath), 'SHARED directory should exist');

            const corePath = path.join(sharedPath, 'core');
            assert(fs.existsSync(corePath), 'core directory should exist');

            const typesPath = path.join(sharedPath, 'types');
            assert(fs.existsSync(typesPath), 'types directory should exist');

            const utilsPath = path.join(sharedPath, 'utils');
            assert(fs.existsSync(utilsPath), 'utils directory should exist');
        });
    });

    describe('File Structure Validation', () => {
        it('should have all required project files', () => {
            const requiredFiles = [
                'package.json',
                'README.md',
                'ping-monitor.js',
                'src/main.js',
                'src/renderer/index.html',
                'src/renderer/renderer.js',
                'src/renderer/styles.css'
            ];

            requiredFiles.forEach(file => {
                const filePath = path.join(__dirname, '..', file);
                assert(fs.existsSync(filePath), `${file} should exist`);
            });
        });

        it('should have build configuration files', () => {
            const buildFiles = [
                'scripts/setup-cross-platform.js',
                'scripts/build-website.js',
                'scripts/notarize.js',
                'scripts/release.js'
            ];

            buildFiles.forEach(file => {
                const filePath = path.join(__dirname, '..', file);
                assert(fs.existsSync(filePath), `${file} should exist`);
            });
        });

        it('should have documentation files', () => {
            const docFiles = [
                'README.md'
            ];

            docFiles.forEach(file => {
                const filePath = path.join(__dirname, '..', file);
                assert(fs.existsSync(filePath), `${file} should exist`);
            });
        });
    });

    describe('Asset Files', () => {
        it('should have icon files', () => {
            const assetsPath = path.join(__dirname, '..', 'assets');
            assert(fs.existsSync(assetsPath), 'assets directory should exist');

            const iconFiles = ['icon.png', 'icon.ico', 'icon.icns', 'icon.svg'];
            iconFiles.forEach(iconFile => {
                const iconPath = path.join(assetsPath, iconFile);
                assert(fs.existsSync(iconPath), `${iconFile} should exist`);
            });
        });

        it('should have build assets', () => {
            const buildPath = path.join(__dirname, '..', 'build');
            assert(fs.existsSync(buildPath), 'build directory should exist');

            // Check for some build files (they might not all exist yet)
            const buildFiles = fs.readdirSync(buildPath);
            assert(buildFiles.length > 0, 'build directory should not be empty');
        });
    });

    describe('Scripts Validation', () => {
        it('should have executable scripts', () => {
            const scriptsPath = path.join(__dirname, '..', 'scripts');
            const scripts = fs.readdirSync(scriptsPath);

            assert(scripts.length > 0, 'scripts directory should not be empty');

            scripts.forEach(script => {
                const scriptPath = path.join(scriptsPath, script);
                const content = fs.readFileSync(scriptPath, 'utf8');
                assert(content.length > 0, `${script} should not be empty`);
            });
        });

        it('should have valid Node.js scripts', () => {
            const scriptFiles = [
                'scripts/setup-cross-platform.js',
                'scripts/build-website.js',
                'scripts/release.js'
            ];

            scriptFiles.forEach(scriptFile => {
                const scriptPath = path.join(__dirname, '..', scriptFile);
                const content = fs.readFileSync(scriptPath, 'utf8');

                // Check for Node.js shebang or require statements
                assert(
                    content.includes('#!/usr/bin/env node') ||
                    content.includes('require(') ||
                    content.includes('const ') ||
                    content.includes('module.exports'),
                    `${scriptFile} should be a valid Node.js script`
                );
            });
        });
    });

    describe('Package.json Validation', () => {
        let packageJson;

        before(() => {
            const packagePath = path.join(__dirname, '..', 'package.json');
            packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        });

        it('should have required npm scripts', () => {
            const requiredScripts = [
                'start',
                'test',
                'build',
                'build-win',
                'build-mac',
                'build-linux',
                'build-all'
            ];

            requiredScripts.forEach(script => {
                assert(packageJson.scripts[script], `npm script '${script}' should exist`);
            });
        });

        it('should have required dependencies', () => {
            const requiredDeps = [
                'auto-launch',
                'electron-store',
                'electron-updater',
                'node-notifier'
            ];

            requiredDeps.forEach(dep => {
                assert(packageJson.dependencies[dep], `dependency '${dep}' should exist`);
            });
        });

        it('should have required devDependencies', () => {
            const requiredDevDeps = [
                'electron',
                'electron-builder'
            ];

            requiredDevDeps.forEach(dep => {
                assert(packageJson.devDependencies[dep], `devDependency '${dep}' should exist`);
            });
        });

        it('should have valid build configuration', () => {
            assert(packageJson.build, 'build configuration should exist');
            assert(packageJson.build.appId, 'appId should be defined');
            assert(packageJson.build.productName, 'productName should be defined');
            assert(packageJson.build.directories, 'directories should be defined');
            assert(packageJson.build.files, 'files array should be defined');
        });
    });

    describe('GitHub Workflow', () => {
        it('should have GitHub Actions workflow', () => {
            const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'build-and-release.yml');
            assert(fs.existsSync(workflowPath), 'GitHub Actions workflow should exist');

            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            assert(workflowContent.includes('name:'), 'workflow should have a name');
            assert(workflowContent.includes('on:'), 'workflow should have triggers');
            assert(workflowContent.includes('jobs:'), 'workflow should have jobs');
            assert(workflowContent.includes('test:'), 'workflow should have test job');
            assert(workflowContent.includes('build-desktop:'), 'workflow should have build job');
        });
    });
});
