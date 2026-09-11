/**
 * Universal Cross-Platform Multi-Service Runner
 * Concurrently starts Frontend, Server, and ML Engine in a single terminal
 * Works identically on Windows, macOS, and Linux
 */
const { spawn, execSync } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  frontend: '\x1b[36m', // Cyan
  server: '\x1b[32m',   // Green
  ml: '\x1b[35m',       // Magenta
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

console.log(`\n${colors.bold}🌐 Starting all CIRCUIT services concurrently (OS: ${process.platform})...${colors.reset}\n`);

// Clean stale ports before starting services
try {
  execSync(`node "${path.join(__dirname, 'clean-ports.js')}"`, { stdio: 'inherit' });
} catch {
  // Ignore
}

const services = [
  {
    name: 'FRONTEND ',
    color: colors.frontend,
    cmd: isWin ? 'npx.cmd' : 'npx',
    args: ['next', 'dev', '-p', '8080'],
    cwd: rootDir,
  },
  {
    name: 'SERVER   ',
    color: colors.server,
    cmd: 'node',
    args: [path.join(__dirname, 'run-server.js')],
    cwd: rootDir,
  },
  {
    name: 'ML-ENGINE',
    color: colors.ml,
    cmd: 'node',
    args: [path.join(__dirname, 'run-ml.js')],
    cwd: rootDir,
  },
];

const children = [];

services.forEach((svc) => {
  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWin,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  children.push(child);

  const prefix = `${svc.color}[${svc.name}]${colors.reset} `;

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${prefix}${line}`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`${prefix}${line}`);
      }
    });
  });

  child.on('error', (err) => {
    console.error(`${prefix}❌ Process error: ${err.message}`);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${prefix}Process exited with code ${code}`);
    }
  });
});

function cleanup() {
  console.log(`\n🛑 Shutting down all CIRCUIT services...`);
  children.forEach((child) => {
    try {
      if (isWin) {
        spawn('taskkill', ['/pid', child.pid, '/f', '/t'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // Ignore
    }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
