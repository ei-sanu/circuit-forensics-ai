/**
 * Universal Cross-Platform ML Engine Runner
 * Works on Windows, macOS, and Linux
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const isWin = process.platform === 'win32';
const mlDir = path.resolve(__dirname, '..', 'services', 'ml-engine');
const mlVenvDir = path.join(mlDir, '.venv');
const serverVenvDir = path.resolve(__dirname, '..', 'server', '.venv');
const port = process.env.PORT || '8001';

function checkAlreadyRunning(port, callback) {
  const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
  });
  req.on('error', () => callback(false));
  req.setTimeout(1000, () => {
    req.destroy();
    callback(false);
  });
}

checkAlreadyRunning(port, (isRunning) => {
  if (isRunning) {
    console.log(`[ML-ENGINE] CIRCUIT ML Engine is already running and healthy on http://127.0.0.1:${port} (Docker / existing instance).`);
    const monitor = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/health`, () => {}).on('error', () => {});
    }, 10000);
    process.on('SIGINT', () => { clearInterval(monitor); process.exit(0); });
    process.on('SIGTERM', () => { clearInterval(monitor); process.exit(0); });
    return;
  }

  // Determine paths for Windows vs Mac/Linux (check ml-engine/.venv, then server/.venv)
  const getExecutable = () => {
    const mlUvicorn = isWin ? path.join(mlVenvDir, 'Scripts', 'uvicorn.exe') : path.join(mlVenvDir, 'bin', 'uvicorn');
    const serverUvicorn = isWin ? path.join(serverVenvDir, 'Scripts', 'uvicorn.exe') : path.join(serverVenvDir, 'bin', 'uvicorn');
    const mlPython = isWin ? path.join(mlVenvDir, 'Scripts', 'python.exe') : path.join(mlVenvDir, 'bin', 'python3');
    const serverPython = isWin ? path.join(serverVenvDir, 'Scripts', 'python.exe') : path.join(serverVenvDir, 'bin', 'python3');

    if (fs.existsSync(mlUvicorn)) return { cmd: mlUvicorn, args: ['app.main:app', '--host', '0.0.0.0', '--port', port, '--reload'] };
    if (fs.existsSync(serverUvicorn)) return { cmd: serverUvicorn, args: ['app.main:app', '--host', '0.0.0.0', '--port', port, '--reload'] };
    if (fs.existsSync(mlPython)) return { cmd: mlPython, args: ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port, '--reload'] };
    if (fs.existsSync(serverPython)) return { cmd: serverPython, args: ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port, '--reload'] };

    return { cmd: isWin ? 'python' : 'python3', args: ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port, '--reload'] };
  };

  const { cmd, args } = getExecutable();
  console.log(`[ML-ENGINE] Starting Python ML Engine on http://127.0.0.1:${port} using ${cmd}`);

  const child = spawn(cmd, args, {
    cwd: mlDir,
    stdio: 'inherit',
    shell: isWin,
    env: {
      ...process.env,
      PORT: port,
    },
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
});
