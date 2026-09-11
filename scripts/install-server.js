/**
 * Universal Cross-Platform Python Server Installer
 * Works on Windows, macOS, and Linux
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const serverDir = path.resolve(__dirname, '..', 'server');
const venvDir = path.join(serverDir, '.venv');

console.log(`\n📦 [SERVER-INSTALL] Setting up Python virtual environment (OS: ${process.platform})...`);

// 1. Detect available Python command
function getPythonCommand() {
  const candidates = isWin
    ? ['python', 'py -3', 'py', 'python3']
    : ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      const parts = cmd.split(' ');
      const test = spawnSync(parts[0], [...parts.slice(1), '--version'], { encoding: 'utf-8', shell: isWin });
      if (test.status === 0) {
        console.log(`✅ Found Python interpreter: ${cmd} (${test.stdout.trim() || test.stderr.trim()})`);
        return cmd;
      }
    } catch {
      // Continue searching
    }
  }
  return null;
}

const pythonCmd = getPythonCommand();
if (!pythonCmd) {
  console.error('❌ [SERVER-INSTALL] Error: No Python installation found on system path!');
  console.error('👉 Please install Python 3.10+ and ensure it is available in your PATH.');
  process.exit(1);
}

// 2. Create virtual environment if not already present
if (!fs.existsSync(venvDir)) {
  console.log(`🚀 Creating virtual environment at server/.venv...`);
  const parts = pythonCmd.split(' ');
  const venvResult = spawnSync(parts[0], [...parts.slice(1), '-m', 'venv', '.venv'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: isWin,
  });

  if (venvResult.status !== 0) {
    console.error('❌ Failed to create virtual environment.');
    process.exit(1);
  }
  console.log('✅ Virtual environment created at server/.venv');
} else {
  console.log('ℹ️  Virtual environment already exists at server/.venv');
}

// 3. Determine Pip path
const venvPip = isWin
  ? path.join(venvDir, 'Scripts', 'pip.exe')
  : path.join(venvDir, 'bin', 'pip');

const pipCmd = fs.existsSync(venvPip) ? venvPip : `${pythonCmd} -m pip`;

// 4. Install requirements
console.log(`📥 Installing requirements from server/requirements.txt...`);
const pipResult = spawnSync(pipCmd, ['install', '-r', 'requirements.txt'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: isWin,
});

if (pipResult.status !== 0) {
  console.error('❌ Failed to install Python server requirements.');
  process.exit(1);
}

console.log('✨ [SERVER-INSTALL] Python Core API Server dependencies installed successfully!\n');
