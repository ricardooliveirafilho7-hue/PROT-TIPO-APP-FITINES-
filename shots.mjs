import { chromium } from 'playwright';

const FILE = 'file:///home/user/PROT-TIPO-APP-FITINES-/dist/index.html';
const OUT = '/tmp/claude-0/-home-user-PROT-TIPO-APP-FITINES-/e776c35c-b108-54b6-acfe-8f99f4ff0daf/scratchpad/shots';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function shot(name, width, height, steps, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: width < 500,
    hasTouch: width < 500,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(FILE);
  await page.waitForTimeout(400);
  if (steps) await steps(page);
  await page.waitForTimeout(350);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.fullPage ?? false });
  if (errs.length) console.log(`!! ${name}:`, errs.slice(0, 3).join(' | '));
  else console.log(`ok ${name}`);
  await ctx.close();
}

const click = (page, text) => page.locator('button', { hasText: text }).first().click();
const clickGuide = async (page, text) => {
  await page.locator('.guide__jump-btn', { hasText: text }).first().click();
  await page.waitForTimeout(250);
};

// Boas-vindas
await shot('01-welcome', 390, 844);

// Onboarding
await shot('02-onboarding-goal', 390, 844, async (p) => { await click(p, 'Começar'); });
await shot('03-onboarding-plan', 390, 844, async (p) => {
  await click(p, 'Começar');
  await click(p, 'Ganhar massa muscular');
  await click(p, 'Continuar');
  await click(p, 'Intermediário');
  await click(p, 'Continuar');
  await click(p, 'Continuar');
  await click(p, 'Academia completa');
  await click(p, 'Continuar');
});

// Hoje sem check-in
await shot('04-today-nocheckin', 390, 844, async (p) => { await clickGuide(p, 'Hoje — sem check-in'); });

// Check-in
await shot('05-checkin', 390, 844, async (p) => { await clickGuide(p, 'Check-in diário'); });

// Hoje adaptado
await shot('06-today-adapted', 390, 844, async (p) => { await clickGuide(p, 'Hoje — plano adaptado'); });

// Explicação
await shot('07-explanation', 390, 844, async (p) => { await clickGuide(p, 'Explicação'); });

// Antes e depois
await shot('08-diff', 390, 844, async (p) => { await clickGuide(p, 'Antes e depois'); });

// Semana atualizada
await shot('09-week', 390, 844, async (p) => { await clickGuide(p, 'Semana atualizada'); });

// Pré-treino
await shot('10-pretreino', 390, 844, async (p) => { await clickGuide(p, 'Pré-treino'); });

// Treino ao vivo
await shot('11-live', 390, 844, async (p) => { await clickGuide(p, 'Treino ao vivo'); });

// Substituir
await shot('12-substitute', 390, 844, async (p) => { await clickGuide(p, 'Substituir exercício'); });

// Pós-treino
await shot('13-post', 390, 844, async (p) => { await clickGuide(p, 'Pós-treino'); });

// Progresso
await shot('14-progress', 390, 844, async (p) => { await clickGuide(p, 'Progresso'); });

// Revisão semanal
await shot('15-weekreview', 390, 844, async (p) => { await clickGuide(p, 'Revisão semanal'); });

// Segurança
await shot('16-safety', 390, 844, async (p) => { await clickGuide(p, 'Segurança'); });

// Baixa confiança
await shot('17-lowconf', 390, 844, async (p) => { await clickGuide(p, 'Confiança baixa'); });

// Dados insuficientes
await shot('18-nodata', 390, 844, async (p) => { await clickGuide(p, 'Dados insuficientes'); });

// 360px
await shot('19-360', 360, 800, async (p) => { await clickGuide(p, 'Hoje — plano adaptado'); });

// 430px
await shot('20-430', 430, 932, async (p) => { await clickGuide(p, 'Hoje — plano adaptado'); });

// Texto 200%
await shot('21-text200', 390, 844, async (p) => {
  await clickGuide(p, 'Hoje — plano adaptado');
  await p.locator('.segmented__option', { hasText: '200%' }).click();
  await p.waitForTimeout(300);
});

// Claro + transparência reduzida
await shot('22-light-reduced', 390, 844, async (p) => {
  await clickGuide(p, 'Hoje — plano adaptado');
  await p.locator('.segmented__option', { hasText: 'Claro' }).click();
  await p.getByRole('switch', { name: 'Transparência reduzida' }).click();
  await p.waitForTimeout(300);
});

// Offline
await shot('23-offline', 390, 844, async (p) => {
  await clickGuide(p, 'Hoje — plano adaptado');
  await p.locator('.segmented__option').filter({ hasText: /^Offline$/ }).first().click();
  await p.waitForTimeout(300);
});

// Desktop com painel
await shot('24-desktop', 1280, 900);

await browser.close();
