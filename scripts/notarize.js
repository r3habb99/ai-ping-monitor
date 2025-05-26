const { notarize } = require('@electron/notarize');
const path = require('path');
const fs = require('fs');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization: Not macOS platform');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  // Check if we have the required environment variables
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD || !process.env.APPLE_TEAM_ID) {
    console.log('Skipping notarization: Missing Apple credentials');
    return;
  }

  // Check if the app exists
  if (!fs.existsSync(appPath)) {
    console.log(`Skipping notarization: App not found at ${appPath}`);
    return;
  }

  console.log(`Notarizing ${appName} at ${appPath}...`);

  try {
    await notarize({
      appBundleId: 'com.rishabhprajapati.ai-ping-monitor',
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log('Notarization completed successfully');
  } catch (error) {
    console.error('Notarization failed:', error);
    // Don't throw error to prevent build failure if notarization fails
    console.log('Continuing build without notarization...');
  }
};
