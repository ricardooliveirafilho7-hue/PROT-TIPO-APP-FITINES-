/**
 * Auditoria automatizada do protótipo:
 *  - rolagem horizontal
 *  - alvos de toque abaixo de 44x44
 *  - contraste de texto (WCAG AA)
 *  - elementos interativos sem rótulo acessível
 */
import { chromium } from 'playwright';

const FILE = 'file:///home/user/PROT-TIPO-APP-FITINES-/dist/index.html';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const AUDIT = `(() => {
  const frame = document.querySelector('.stage__frame');
  const out = { overflow: [], targets: [], contrast: [], labels: [] };

  // 1. rolagem horizontal dentro do aparelho
  document.querySelectorAll('.app__scroll, .sheet__body, .live__scroll, .onboarding__body, .welcome').forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 1) out.overflow.push(el.className + ' ' + el.scrollWidth + '>' + el.clientWidth);
  });
  if (document.documentElement.scrollWidth > window.innerWidth + 1) out.overflow.push('document');

  const inFrame = (el) => frame && frame.contains(el);

  // 2. alvos de toque
  document.querySelectorAll('button, a, [role=radio], [role=switch], summary').forEach((el) => {
    if (!inFrame(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.height < 40 || r.width < 24) {
      out.targets.push((el.className || el.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' :: ' + (el.textContent || '').trim().slice(0, 28));
    }
  });

  // 3. contraste
  const lum = (c) => {
    const [r, g, b] = c;
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (s) => { const m = s.match(/[\\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
  const mix = (fg, bg, a) => fg.map((v, i) => v * a + bg[i] * (1 - a));
  const bgOf = (el) => {
    let n = el;
    let acc = null;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      const a = Number((cs.backgroundColor.match(/[\\d.]+\\)$/) || ['1)'])[0].slice(0, -1));
      if (c && a > 0.02) { acc = acc ? mix(acc, c, 1) : c; if (a > 0.92) return c; }
      n = n.parentElement;
    }
    return acc || [5, 8, 15];
  };

  document.querySelectorAll('p, span, h1, h2, button, li, summary').forEach((el) => {
    if (!inFrame(el)) return;
    const txt = (el.childNodes && [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('')) || '';
    if (txt.length < 2) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) return;
    const bg = bgOf(el);
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) out.contrast.push(txt.slice(0, 34) + ' :: ' + ratio.toFixed(2) + ' (min ' + need + ') ' + cs.color + ' on rgb(' + bg.map(Math.round).join(',') + ')');
  });

  // 4. rótulo acessível
  document.querySelectorAll('button, [role=radio], [role=switch]').forEach((el) => {
    if (!inFrame(el)) return;
    const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (!name) out.labels.push(el.className || el.tagName);
  });

  return out;
})()`;

async function run(name, steps, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.w ?? 390, height: opts.h ?? 844 } });
  const page = await ctx.newPage();
  await page.goto(FILE);
  await page.waitForTimeout(300);
  if (steps) await steps(page);
  await page.waitForTimeout(300);
  const r = await page.evaluate(AUDIT);
  const issues = [];
  if (r.overflow.length) issues.push('OVERFLOW: ' + r.overflow.join(' | '));
  if (r.targets.length) issues.push('TARGETS(' + r.targets.length + '): ' + [...new Set(r.targets)].slice(0, 6).join(' | '));
  if (r.contrast.length) issues.push('CONTRAST(' + r.contrast.length + '): ' + [...new Set(r.contrast)].slice(0, 6).join(' | '));
  if (r.labels.length) issues.push('LABELS: ' + r.labels.join(' | '));
  console.log(issues.length ? `\n### ${name}\n  ` + issues.join('\n  ') : `ok ${name}`);
  await ctx.close();
}

const g = async (p, t) => { await p.locator('.guide__jump-btn', { hasText: t }).first().click(); await p.waitForTimeout(250); };

await run('welcome');
await run('onboarding', async (p) => { await p.locator('button', { hasText: 'Começar' }).first().click(); });
await run('today-adapted', async (p) => g(p, 'Hoje — plano adaptado'));
await run('today-nocheckin', async (p) => g(p, 'Hoje — sem check-in'));
await run('checkin', async (p) => g(p, 'Check-in diário'));
await run('explanation', async (p) => g(p, 'Explicação'));
await run('diff', async (p) => g(p, 'Antes e depois'));
await run('week', async (p) => g(p, 'Semana atualizada'));
await run('pretreino', async (p) => g(p, 'Pré-treino'));
await run('live', async (p) => g(p, 'Treino ao vivo'));
await run('substitute', async (p) => g(p, 'Substituir exercício'));
await run('post', async (p) => g(p, 'Pós-treino'));
await run('progress', async (p) => g(p, 'Progresso'));
await run('weekreview', async (p) => g(p, 'Revisão semanal'));
await run('safety', async (p) => g(p, 'Segurança'));
await run('lowconf', async (p) => g(p, 'Confiança baixa'));
await run('nodata', async (p) => g(p, 'Dados insuficientes'));
await run('360-today', async (p) => g(p, 'Hoje — plano adaptado'), { w: 360, h: 800 });
await run('430-live', async (p) => g(p, 'Treino ao vivo'), { w: 430, h: 932 });
await run('light', async (p) => {
  await g(p, 'Hoje — plano adaptado');
  await p.locator('.segmented__option', { hasText: 'Claro' }).click();
});
await run('light-live', async (p) => {
  await g(p, 'Treino ao vivo');
  await p.locator('.segmented__option', { hasText: 'Claro' }).click();
});
await run('highcontrast', async (p) => {
  await g(p, 'Hoje — plano adaptado');
  await p.getByRole('switch', { name: 'Alto contraste' }).click();
});
await run('text200', async (p) => {
  await g(p, 'Hoje — plano adaptado');
  await p.locator('.segmented__option', { hasText: '200%' }).click();
});
await run('text200-live', async (p) => {
  await g(p, 'Treino ao vivo');
  await p.locator('.segmented__option', { hasText: '200%' }).click();
});

await browser.close();
