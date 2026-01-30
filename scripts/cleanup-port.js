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
        execSync(`lsof -t -i:${port} | xargs kill -9 2>/dev/null`);
        console.log(`✅ Killed processes on port ${port}`);
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (error) {
    // Port might be free
  }
}

const port = process.argv[2] || 5000;
killPort(port);
