// צילומי מסך של כל דף, במחשב (1280) ובנייד (390): node tests/shot.cjs <outdir>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || 'shots-tmp';
const BASE = 'http://localhost:4198/';
const PAGES = [['home', ''], ['lessons', '#/lessons'], ['lesson1', '#/lesson/1'], ['lesson21', '#/lesson/21'], ['studio', '#/studio'], ['portfolio', '#/portfolio'], ['feature', '#/feature']];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn('npx', ['vite', 'preview', '--port', '4198', '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 2500));
  const b = await chromium.launch();
  try {
    for (const vp of [{ width: 1280, height: 900, n: 'd' }, { width: 390, height: 844, n: 'm' }]) {
      const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      await p.route('**/appofapp-gh.vercel.app/ai-menu.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, '../public/ai-menu.js')) }));
      for (const [name, hash] of PAGES) {
        await p.goto(BASE + hash, { waitUntil: 'networkidle' });
        await p.waitForTimeout(1800);
        await p.screenshot({ path: `${OUT}/${name}-${vp.n}.png`, fullPage: vp.n === 'd' });
      }
      await p.close();
    }
  } finally { await b.close(); srv.kill(); }
})();
