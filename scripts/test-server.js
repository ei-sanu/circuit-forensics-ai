const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const venvDir = path.join(serverDir, '.venv');

const pytestBin = isWin
  ? path.join(venvDir, 'Scripts', 'pytest.exe')
  : path.join(venvDir, 'bin', 'pytest');

const cmd = fs.existsSync(pytestBin) ? pytestBin : 'pytest';

console.log(`🧪 Running Core API pytest suite using: ${cmd}`);

const result = spawnSync(cmd, ['tests', ...process.argv.slice(2)], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: isWin,
  env: {
    ...process.env,
    PYTHONPATH: serverDir,
  },
});

process.exit(result.status || 0);
