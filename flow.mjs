/** Percorre o fluxo principal de ponta a ponta e verifica os 20 passos. */
import { chromium } from 'playwright';

const FILE = 'file:///home/user/PROT-TIPO-APP-FITINES-/dist/index.html';
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(FILE);

const frame = page.locator('.stage__frame');
let step = 0;
const check = async (label, fn) => {
  step += 1;
  try {
    await fn();
    console.log(`  ${String(step).padStart(2)}. ok  ${label}`);
  } catch (e) {
    console.log(`  ${String(step).padStart(2)}. FAIL ${label}\n       ${String(e).split('\n')[0]}`);
    process.exitCode = 1;
  }
};
const btn = (t) => frame.locator('button', { hasText: t }).first();
// Quando um sheet está aberto, o clique precisa ser no sheet — a Home fica atrás do overlay.
const sheetBtn = (t) => frame.locator('.sheet button', { hasText: t }).first();
const sheetFoot = (n = 0) => frame.locator('.sheet__footer button').nth(n);
const seeText = async (t) => {
  await frame.getByText(t, { exact: false }).first().waitFor({ timeout: 4000 });
};

console.log('\nFluxo principal (20 passos):');

await check('1 introdução ao Nivor', async () => {
  await seeText('Treino, recuperação e rotina em uma decisão clara');
});

await check('2 onboarding representativo', async () => {
  await btn('Começar').click();
  await seeText('Qual é o seu objetivo principal');
  await btn('Ganhar massa muscular').click();
  await btn('Continuar').click();
  await seeText('experiência e frequência');
  await btn('Intermediário').click();
  await btn('Continuar').click();
  await seeText('Quanto tempo você tem');
  await btn('Continuar').click();
  await seeText('Onde você treina');
  await btn('Academia completa').click();
  await btn('Continuar').click();
});

await check('3 revisar plano semanal inicial', async () => {
  await seeText('Seu plano inicial');
  await seeText('provisória');
  await btn('Confirmar semana e ver Hoje').click();
});

await check('4 abrir a tela Hoje', async () => {
  await seeText('Olá, Rafael');
});

await check('5 check-in em 4 entradas, respondido de verdade', async () => {
  await btn('Fazer check-in').click();
  await seeText('Check-in de hoje');
  // sono 7h00 -> 6h15 (3 toques de 15 min)
  const steppers = frame.locator('.checkin-field .stepper');
  // sono: 7h24 -> 6h24 (4 toques de 15 min)
  for (let i = 0; i < 4; i += 1) await steppers.first().locator('.stepper__btn').first().click();
  // energia 3/5
  await frame.locator('.scale__option').nth(2).click();
  // desconforto moderado nas pernas
  await sheetBtn('Moderado').click();
  await sheetBtn('Pernas').click();
  // tempo disponível: 70 -> 55 (3 toques de 5 min)
  for (let i = 0; i < 3; i += 1) await steppers.last().locator('.stepper__btn').first().click();
  await sheetFoot(0).click();
});

await check('6 receber a decisão adaptativa', async () => {
  await seeText('Hoje, faça Costas + Bíceps em 55 minutos');
  await seeText('55 min');
  await seeText('Confiança moderada');
});

await check('7 abrir a explicação', async () => {
  await btn('Ver explicação completa').click();
  await seeText('Por que esta recomendação');
  await seeText('Dados ausentes');
  await seeText('Alternativas avaliadas e descartadas');
  await seeText('Não é uma probabilidade');
});

await check('8 comparar original e adaptado', async () => {
  await sheetBtn('Ver a comparação antes e depois').click();
  await seeText('Antes e depois');
  await seeText('Plano original');
  await seeText('Plano atualizado');
});

await check('9 aceitar a adaptação', async () => {
  await sheetFoot(0).click();
  await seeText('Adaptação aceita');
});

await check('10 ver a semana atualizada', async () => {
  await frame.locator('.tabbar__item', { hasText: 'Plano' }).click();
  await seeText('Plano Vivo');
  await seeText('2 dias mudaram');
  await seeText('Extensão lombar');
});

await check('11 abrir o treino', async () => {
  await frame.locator('.tabbar__item', { hasText: 'Treino' }).click();
  await seeText('Costas + Bíceps');
  await seeText('Puxada alta');
});

await check('12 iniciar a sessão', async () => {
  await btn('Iniciar treino').click();
  await seeText('0 de 11 séries');
});

await check('13 registrar série, carga, reps e esforço', async () => {
  await frame.locator('.setrow__check').first().click();
  await seeText('1 de 11 séries');
  await frame.locator('.setrow__field').first().click();
  await seeText('Carga · série 1');
  await frame.locator('.sheet .stepper__btn').last().click();
  await sheetFoot(0).click();
  await frame.locator('.setrow__field').nth(2).click();
  await seeText('RIR');
  await sheetFoot(0).click();
});

await check('14 substituir um exercício', async () => {
  await frame.locator('.exercise__action', { hasText: 'Substituir' }).nth(1).click();
  await seeText('Substituir exercício');
  await sheetBtn('Usar este exercício').click();
  await seeText('Exercício substituído');
});

await check('15 pausar e retomar', async () => {
  await frame.getByLabel('Pausar treino').click();
  await seeText('Treino pausado');
  await frame.locator('.banner button', { hasText: 'Retomar' }).first().click();
});

await check('16 concluir o treino', async () => {
  await frame.locator('.live__foot button').first().click();
  await seeText('Treino concluído');
});

await check('17 informar percepção pós-treino', async () => {
  await seeText('Como foi o esforço da sessão');
  await sheetBtn('Adequada').click();
  await seeText('O que isso atualiza');
});

await check('18 ver impacto no restante da semana', async () => {
  await sheetFoot(0).click();
  await seeText('Resumo da semana');
});

await check('19 abrir a revisão semanal', async () => {
  await btn('Abrir revisão semanal').click();
  await seeText('Revisão semanal');
  await seeText('O que ainda está incerto');
  await frame.locator('.sheet').getByLabel('Fechar').click();
});

await check('20 consultar decisões anteriores e voltar à Home', async () => {
  await btn('Ver tudo').click();
  await seeText('Histórico de decisões');
  await seeText('Plano original mantido');
  await frame.locator('.sheet').getByLabel('Fechar').click();
  await frame.locator('.tabbar__item', { hasText: 'Hoje' }).click();
  await seeText('Treino de hoje concluído');
});

console.log('\nCaminhos alternativos:');
step = 0;

await check('rejeitar e manter o plano original', async () => {
  await page.locator('.guide__jump-btn', { hasText: 'Hoje — plano adaptado' }).click();
  await btn('Manter plano original').click();
  await seeText('Manter o plano original');
  await sheetBtn('Prefiro seguir meu plano').click();
  await sheetFoot(0).click();
  await seeText('Plano original mantido');
  await seeText('em 70 minutos');
});

await check('ajustar a duração manualmente', async () => {
  await page.locator('.guide__jump-btn', { hasText: 'Hoje — plano adaptado' }).click();
  await btn('Ajustar').click();
  await seeText('Ajustar a sessão de hoje');
  await frame.locator('.sheet .stepper__btn').last().click();
  await sheetFoot(0).click();
  await seeText('em 60 minutos');
});

await check('desconforto forte dispara estado de segurança', async () => {
  await page.locator('.guide__jump-btn', { hasText: 'Segurança' }).click();
  await seeText('não vai recomendar esta sessão');
  await seeText('profissional habilitado');
  const glass = await frame.locator('.hero').first().getAttribute('class');
  if (glass?.includes('glass-action')) throw new Error('estado de segurança usando vidro');
});

await check('offline mantém o treino utilizável', async () => {
  await page.locator('.guide__jump-btn', { hasText: 'Hoje — plano adaptado' }).click();
  await page.locator('.segmented__option', { hasText: 'Offline' }).first().click();
  await seeText('Você está offline');
  await frame.locator('.tabbar__item', { hasText: 'Treino' }).click();
  await btn('Iniciar treino').click();
  await seeText('Registrando neste aparelho');
});

await check('sincronização pendente pode ser resolvida', async () => {
  await page.locator('.guide__jump-btn', { hasText: 'Hoje — plano adaptado' }).click();
  await page.locator('.segmented__option', { hasText: 'Sync pendente' }).first().click();
  await seeText('Sincronização pendente');
  await btn('Sincronizar agora').click();
  await seeText('Tudo sincronizado');
});

/* Nenhum botão sem efeito: todo elemento interativo do aparelho precisa de handler */
console.log('\nBotões sem interação:');
await page.locator('.guide__jump-btn', { hasText: 'Hoje — plano adaptado' }).click();
const dead = await page.evaluate(() => {
  const frameEl = document.querySelector('.stage__frame');
  const out = [];
  frameEl.querySelectorAll('button').forEach((el) => {
    const k = Object.keys(el).find((x) => x.startsWith('__reactProps$'));
    const props = k ? el[k] : null;
    if (!props || (!props.onClick && !props.onChange && el.type !== 'submit')) {
      out.push((el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) || el.className);
    }
  });
  return out;
});
console.log(dead.length ? '  ' + dead.join('\n  ') : '  nenhum');

console.log('\nErros de runtime: ' + (errors.length ? errors.join(' | ') : 'nenhum'));
await b.close();
