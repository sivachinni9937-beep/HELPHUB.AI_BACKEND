/**
 * HelpHub AI — Unified Full-Stack Dev Server Runner
 * Runs both the FastAPI backend and Vite frontend concurrently.
 */

import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const isWin = process.platform === 'win32';

/**
 * Ensures ports 8000 and 5173 are freed before launching to avoid
 * "Port in use" conflicts and automatic jumps to 5174.
 */
function freePort(port) {
  if (isWin) {
    try {
      const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING') && line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== process.pid.toString()) {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            } catch {}
          }
        }
      }
    } catch {}
  }
}

freePort(8000);
freePort(5173);

// 1. Locate Python executable in backend/.venv
let pythonExe = isWin
  ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
  : path.join(backendDir, '.venv', 'bin', 'python');

if (!fs.existsSync(pythonExe)) {
  pythonExe = isWin ? 'python' : 'python3';
}

// 2. Locate Vite binary
const viteJs = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

console.log('\x1b[36m%s\x1b[0m', '==========================================================');
console.log('\x1b[1m\x1b[32m%s\x1b[0m', '  HelpHub AI — Community Problem Solver Dev Environment');
console.log('\x1b[36m%s\x1b[0m', '==========================================================');
console.log('  \x1b[33m• Frontend:\x1b[0m  http://localhost:5173');
console.log('  \x1b[33m• Backend:\x1b[0m   http://127.0.0.1:8000');
console.log('  \x1b[33m• API Docs:\x1b[0m  http://127.0.0.1:8000/docs');
console.log('  \x1b[33m• Login:\x1b[0m     http://localhost:5173/login');
console.log('  \x1b[33m• Press:\x1b[0m     Ctrl+C to stop both servers');
console.log('\x1b[36m%s\x1b[0m\n', '==========================================================');

const processes = [];
let isExiting = false;

function cleanExit(source = '') {
  if (isExiting) return;
  isExiting = true;
  console.log(`\n\x1b[33mStopping HelpHub AI servers (${source})...\x1b[0m`);
  for (const p of processes) {
    if (p && !p.killed) {
      try {
        if (isWin && p.pid) {
          spawn('taskkill', ['/pid', p.pid.toString(), '/T', '/F'], { stdio: 'ignore' });
        } else {
          p.kill('SIGTERM');
        }
      } catch (err) {
        // ignore
      }
    }
  }
  setTimeout(() => process.exit(0), 200);
}

if (process.stdin.isTTY) {
  try {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
      // 0x03 is Ctrl+C
      if (chunk[0] === 3) {
        cleanExit('Ctrl+C');
      }
    });
  } catch {}
} else {
  process.on('SIGINT', () => cleanExit('SIGINT'));
}

process.on('SIGTERM', () => cleanExit('SIGTERM'));

// 3. Spawn FastAPI Backend (isolated process group on Windows to avoid reloader SIGINT propagation)
console.log('\x1b[34m[BACKEND]\x1b[0m Starting FastAPI uvicorn server on port 8000...');
const backendProcess = spawn(
  pythonExe,
  [
    '-m', 'uvicorn', 'app.main:app',
    '--app-dir', 'backend',
    '--reload',
    '--reload-dir', path.join(backendDir, 'app'),
    '--host', '127.0.0.1',
    '--port', '8000'
  ],
  {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    detached: isWin,
    windowsHide: true,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  }
);
processes.push(backendProcess);

backendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.log(`\x1b[34m[BACKEND]\x1b[0m ${line.trim()}`);
    }
  }
});

backendProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.error(`\x1b[31m[BACKEND ERR]\x1b[0m ${line.trim()}`);
    }
  }
});

backendProcess.on('error', (err) => {
  console.error('\x1b[31m[BACKEND FAILED]\x1b[0m Could not start backend:', err.message);
});

// 4. Spawn Frontend with ignored stdin so background execution never triggers EOF exits
console.log('\x1b[32m[FRONTEND]\x1b[0m Starting Vite development server on port 5173...\n');
const frontendProcess = spawn(
  process.execPath,
  [viteJs, '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
  {
    cwd: frontendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false
  }
);
processes.push(frontendProcess);

frontendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.log(`\x1b[32m[FRONTEND]\x1b[0m ${line.trim()}`);
    }
  }
});

frontendProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.error(`\x1b[31m[FRONTEND ERR]\x1b[0m ${line.trim()}`);
    }
  }
});

frontendProcess.on('error', (err) => {
  console.error('\x1b[31m[FRONTEND FAILED]\x1b[0m Could not start frontend:', err.message);
});

frontendProcess.on('exit', (code, signal) => {
  if (!isExiting && code !== 0 && code !== null) {
    console.error(`\x1b[31m[FRONTEND]\x1b[0m Exited with code ${code}`);
  }
});
