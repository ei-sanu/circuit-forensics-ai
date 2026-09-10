/**
 * Universal Cross-Platform FastAPI Core API Server Runner
 * Works on Windows, macOS, and Linux
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const serverDir = path.resolve(__dirname, '..', 'server');
const mlVenvDir = path.resolve(__dirname, '..', 'services', 'ml-engine', '.venv');
const serverVenvDir = path.join(serverDir, '.venv');

// Check for virtual environments
const getPythonPath = () => {
  const serverPy = isWin ? path.join(serverVenvDir, 'Scripts', 'python.exe') : path.join(serverVenvDir, 'bin', 'python3');
  const mlPy = isWin ? path.join(mlVenvDir, 'Scripts', 'python.exe') : path.join(mlVenvDir, 'bin', 'python3');

  if (fs.existsSync(serverPy)) return serverPy;
  if (fs.existsSync(mlPy)) return mlPy;
  return isWin ? 'python' : 'python3';
};

const pythonCmd = getPythonPath();
const port = process.env.PORT || '3000';

console.log(`[SERVER] Starting CIRCUIT Core FastAPI Backend on http://localhost:${port} using ${pythonCmd}`);

const child = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port, '--reload'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: isWin,
  env: {
    ...process.env,
    PYTHONPATH: serverDir,
    PORT: port,
  },
});

child.on('error', (err) => {
  console.error(`\n❌ [SERVER] Failed to start FastAPI server: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[SERVER] Exited with code ${code}`);
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
