// @ts-check
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} PackageJson
 * @property {string} version
 */

/**
 * @type {readline.Interface}
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompts the user with a question and returns the answer.
 * @param {string} query - The question to ask the user.
 * @returns {Promise<string>} The user's answer.
 */
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Publishes the package to npm.
 * @returns {Promise<void>}
 */
async function publishPackage() {
  try {
    // Check if user is logged in to npm
    try {
      execSync('npm whoami', { stdio: 'ignore' });
    } catch (error) {
      console.log('You are not logged in to npm. Please log in:');
      execSync('npm login', { stdio: 'inherit' });
    }

    // Prompt for version bump
    /** @type {PackageJson} */
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    const currentVersion = packageJson.version;
    console.log(`Current version: ${currentVersion}`);
    const bumpType = await question('Enter version bump type (patch/minor/major): ');

    // Update package.json version
    execSync(`npm version ${bumpType} --no-git-tag-version`, { stdio: 'inherit' });

    // Publish to npm
    console.log('Publishing to npm...');
    execSync('npm publish', { stdio: 'inherit' });

    console.log('Package published successfully!');
  } catch (error) {
    console.error('Error publishing package:', error instanceof Error ? error.message : String(error));
  } finally {
    rl.close();
  }
}

publishPackage();
