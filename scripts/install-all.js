/**
 * Universal Cross-Platform 1-Click Installer
 * Installs root dependencies, server dependencies, and Python ML venv
 * Works identically on Windows, macOS, and Linux
 */
const { spawnSync } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log(`\n======================================================`);
console.log(`🚀 CIRCUIT Full Stack Installer (OS: ${process.platform})`);
console.log(`======================================================\n`);

// 1. Install Root (Next.js Frontend) dependencies
console.log(`📦 [1/3] Installing root Next.js dependencies...`);
const rootResult = spawnSync(npmCmd, ['install'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});
if (rootResult.status !== 0) {
  console.error('❌ Failed to install root dependencies.');
  process.exit(1);
}

// 2. Install Server (FastAPI API) dependencies
console.log(`\n📦 [2/3] Setting up FastAPI Core Backend dependencies...`);
const serverReqPath = path.join(serverDir, 'requirements.txt');
const pipCmd = isWin ? 'pip' : 'pip3';
const serverResult = spawnSync('node', [path.join(__dirname, 'install-ml.js')], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});
if (serverResult.status !== 0) {
  console.warn('⚠️  Server setup encountered an issue. You can retry with: npm run server:install');
}

// 3. Install Python ML dependencies via install-ml.js
console.log(`\n📦 [3/3] Setting up Python ML Engine environment...`);
const mlResult = spawnSync('node', [path.join(__dirname, 'install-ml.js')], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});
if (mlResult.status !== 0) {
  console.warn('⚠️  Python ML setup encountered an issue. You can retry with: npm run ml:install');
}

console.log(`\n======================================================`);
console.log(`🎉 Full Stack Installation Complete!`);
console.log(`======================================================`);
console.log(`\nTo run all services simultaneously:`);
console.log(`  npm run dev:all`);
console.log(`\nOr run individually:`);
console.log(`  npm run dev      # Frontend (http://localhost:8080)`);
console.log(`  npm run server   # FastAPI Core API (http://localhost:3000)`);
console.log(`  npm run ml       # Python ML Engine (http://localhost:8001)\n`);
