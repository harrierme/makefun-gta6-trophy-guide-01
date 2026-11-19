// A tiny static server for app/ (Node 22, standard library only), so the guide
// can be tried locally without a build step: `node serve.ts` serves app/ on
// http://localhost:8080 (`--port <n>` for another port). It sends the MIME types
// a browser needs, refuses any path outside app/, and otherwise does nothing
// clever: a development convenience, not a web server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const filePath = resolve(join(root, normalize(rawPath).replace(/^(\.\.[/\\])+/, '')));
  if (!filePath.startsWith(root + sep) && filePath !== root) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const target = filePath === root ? join(root, 'index.html') : filePath;
  let stat;
  try {
    stat = statSync(target);
  } catch {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  if (!stat.isFile()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(target)] ?? 'application/octet-stream' });
  createReadStream(target).pipe(res);
});

server.listen(port, () => {
  console.log(`Leonida Legend guide at http://localhost:${port}`);
});
