/**
 * Universal Cross-Platform ML Engine Runner
 * Works on Windows, macOS, and Linux
 */
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const mlDir = path.resolve(__dirname, '..', 'services', 'ml-engine');
const venvDir = path.join(mlDir, '.venv');

// Determine paths for Windows vs Mac/Linux
const venvUvicorn = isWin
  ? path.join(venvDir, 'Scripts', 'uvicorn.exe')
  : path.join(venvDir, 'bin', 'uvicorn');

const venvPython = isWin
  ? path.join(venvDir, 'Scripts', 'python.exe')
  : path.join(venvDir, 'bin', 'python3');

let command = '';
let args = [];

if (fs.existsSync(venvUvicorn)) {
  command = venvUvicorn;
  args = ['app.main:app', '--host', '127.0.0.1', '--port', '8001', '--reload'];
} else if (fs.existsSync(venvPython)) {
  command = venvPython;
  args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8001', '--reload'];
} else {
  // Check if system python/uvicorn is available
  console.log('⚡ Virtualenv not found at services/ml-engine/.venv. Attempting system python/uvicorn...');
  const pythonCmd = isWin ? 'python' : 'python3';
  command = pythonCmd;
  args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8001', '--reload'];
}

console.log(`[ML-ENGINE] Starting Python ML Engine on http://127.0.0.1:8001 (OS: ${process.platform})`);

const child = spawn(command, args, {
  cwd: mlDir,
  stdio: 'inherit',
  shell: isWin,
});

child.on('error', (err) => {
  console.error(`\n❌ [ML-ENGINE] Failed to start Python service: ${err.message}`);
  console.error(`👉 Tip: Run "npm run ml:install" to create and install the virtualenv.\n`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[ML-ENGINE] Exited with code ${code}`);
  }
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});
