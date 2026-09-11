const { execSync } = require('child_process');

const ports = [8080, 3000, 8001];
const isWin = process.platform === 'win32';

ports.forEach((port) => {
  try {
    if (isWin) {
      const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const lines = output.trim().split('\n');
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && pid !== '0') {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`[CLEAN-PORTS] Freed port ${port} (Killed PID ${pid})`);
          } catch {}
        }
      });
    } else {
      const pids = execSync(`lsof -ti :${port}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n');
      pids.forEach((pid) => {
        if (pid && !isNaN(pid)) {
          try {
            // Only kill if not PID of current process
            if (parseInt(pid, 10) !== process.pid) {
              process.kill(parseInt(pid, 10), 'SIGKILL');
              console.log(`[CLEAN-PORTS] Freed port ${port} (Killed PID ${pid})`);
            }
          } catch (e) {
            // Docker or protected system process, safe to ignore
          }
        }
      });
    }
  } catch {
    // Port was already free
  }
});
console.log('[CLEAN-PORTS] Ports checked and clean.');
