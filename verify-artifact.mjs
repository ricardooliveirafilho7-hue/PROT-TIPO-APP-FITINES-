// Verifica o arquivo publicável no mesmo envelope do Artifact (doctype+head+body)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const inner = readFileSync('/tmp/claude-0/-home-user-PROT-TIPO-APP-FITINES-/e776c35c-b108-54b6-acfe-8f99f4ff0daf/scratchpad/nivor-prototipo.html', 'utf8');
writeFileSync('/tmp/wrapped.html', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${inner.match(/<title>[\s\S]*?<\/title>/)[0]}</head><body>${inner.replace(/<title>[\s\S]*?<\/title>/, '')}</body></html>`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [w, h, label] of [[390, 844, 'mobile'], [1280, 900, 'desktop']]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('requestfailed', (r) => errs.push('req ' + r.url().slice(0, 60)));
  await page.goto('file:///tmp/wrapped.html');
  await page.waitForTimeout(700);
  const frame = page.locator('.stage__frame');
  console.log(label, 'frame:', await frame.count(), '| erros:', errs.length ? errs.join('|') : 'nenhum');
  // tema imposto pelo ambiente
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(400);
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.stage__frame')).backgroundColor);
  console.log(label, 'após data-theme=light ->', bg);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(400);
  console.log(label, 'após data-theme=dark ->', await page.evaluate(() => getComputedStyle(document.querySelector('.stage__frame')).backgroundColor));
  await page.screenshot({ path: `/tmp/claude-0/-home-user-PROT-TIPO-APP-FITINES-/e776c35c-b108-54b6-acfe-8f99f4ff0daf/scratchpad/shots/artifact-${label}.png` });
}
await b.close();
