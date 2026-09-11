const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');
const mlDir = path.join(rootDir, 'services', 'ml-engine');
const mlVenvDir = path.join(mlDir, '.venv');
const serverVenvDir = path.join(rootDir, 'server', '.venv');

const getPytestBin = () => {
  const mlPytest = isWin ? path.join(mlVenvDir, 'Scripts', 'pytest.exe') : path.join(mlVenvDir, 'bin', 'pytest');
  const serverPytest = isWin ? path.join(serverVenvDir, 'Scripts', 'pytest.exe') : path.join(serverVenvDir, 'bin', 'pytest');

  if (fs.existsSync(mlPytest)) return mlPytest;
  if (fs.existsSync(serverPytest)) return serverPytest;
  return 'pytest';
};

const cmd = getPytestBin();
console.log(`🧪 Running ML Engine pytest suite using: ${cmd}`);

const result = spawnSync(cmd, ['tests', ...process.argv.slice(2)], {
  cwd: mlDir,
  stdio: 'inherit',
  shell: isWin,
  env: {
    ...process.env,
    PYTHONPATH: mlDir,
  },
});

process.exit(result.status || 0);
