const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const preferredApiPort = Number(process.env.PORT) || 5000;
const preferredWebPort = Number(process.env.WEB_PORT) || 3847;

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        resolve(false);
      } else {
        reject(error);
      }
    });
    server.once('listening', () => {
      server.close((error) => error ? reject(error) : resolve(true));
    });
    server.listen(port);
  });
}

async function findAvailablePort(preferredPort, reservedPorts) {
  for (let port = preferredPort; port <= preferredPort + 100; port += 1) {
    if (reservedPorts.has(port)) continue;
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found between ${preferredPort} and ${preferredPort + 100}.`);
}

async function main() {
  const apiPort = await findAvailablePort(preferredApiPort, new Set());
  const webPort = await findAvailablePort(preferredWebPort, new Set([apiPort]));
  const backendOrigin = `http://localhost:${apiPort}`;

  if (apiPort !== preferredApiPort || webPort !== preferredWebPort) {
    console.log('A default FACIELIS port is already in use; starting on available ports instead.');
  }
  console.log(`FACIELIS frontend: http://localhost:${webPort}`);
  console.log(`FACIELIS API:      ${backendOrigin}/api`);

  const env = {
    ...process.env,
    PORT: String(apiPort),
    BACKEND_ORIGIN: backendOrigin,
    BACKEND_URL: `${backendOrigin}/api/:path*`,
    NEXT_PUBLIC_SOCKET_URL: backendOrigin,
  };
  const children = [];
  let shuttingDown = false;

  function shutdown(exitCode = 0) {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const child of children) {
      if (child.exitCode === null && !child.killed) child.kill();
    }
    process.exitCode = exitCode;
  }

  const api = spawn(process.execPath, ['--import', 'tsx', 'src/server/index.ts'], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  const web = spawn(
    process.execPath,
    [path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'), 'dev', '--turbo', '-p', String(webPort)],
    { cwd: root, env, stdio: 'inherit' }
  );
  children.push(api, web);

  for (const child of children) {
    child.once('error', (error) => {
      console.error(`Failed to start ${child === api ? 'API' : 'frontend'} process:`, error);
      shutdown(1);
    });
    child.once('exit', (code, signal) => {
      if (!shuttingDown) {
        console.error(`${child === api ? 'API' : 'Frontend'} stopped${signal ? ` (${signal})` : ` with code ${code}`}.`);
        shutdown(code || 1);
      }
    });
  }

  process.once('SIGINT', () => shutdown(0));
  process.once('SIGTERM', () => shutdown(0));
}

main().catch((error) => {
  console.error(`Unable to start FACIELIS: ${error.message}`);
  process.exitCode = 1;
});
