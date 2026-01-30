const { execSync } = require('child_process');

function killPort(port) {
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = output.split('\n');
      const pids = new Set();
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          if (pid !== '0' && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      });
      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`✅ Killed process ${pid} on port ${port}`);
        } catch (e) {
          // Ignore errors
        }
      });
    } else {
      // Linux/Mac
      try {
        // Check if lsof exists
        execSync('command -v lsof >/dev/null 2>&1');
        execSync(`lsof -t -i:${port} | xargs kill -9 2>/dev/null`);
        console.log(`✅ Killed processes on port ${port} using lsof`);
      } catch (e) {
        try {
          // Fallback to fuser if lsof is not available
          execSync('command -v fuser >/dev/null 2>&1');
          execSync(`fuser -k ${port}/tcp 2>/dev/null`);
          console.log(`✅ Killed processes on port ${port} using fuser`);
        } catch (f) {
          // No port cleanup tool found, ignore
        }
      }
    }
  } catch (error) {
    // Port might be free
  }
}

const port = process.argv[2] || 5000;
killPort(port);
