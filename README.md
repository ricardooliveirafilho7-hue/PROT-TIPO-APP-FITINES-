# Nivor — protótipo navegável de alta fidelidade

Protótipo de validação do **Nivor Core**, construído a partir da documentação das Fases 1 a 14
no Notion, com a precedência definida pelo pedido: Fases 12, 13 e 14 primeiro, depois a Fase 11
(PRD canônico), depois 8/9/10 (design), depois 3/4 (motor e fluxos), depois 1/2/5/6/7.

Conceito materializado: **decisão adaptativa + Plano Vivo** — uma decisão clara para hoje, com
impacto semanal explícito.

```
Plano semanal → Check-in → Estado do dia → Decisão → Explicação
→ Aceitar / Ajustar / Manter original → Treino ao vivo → Resultado → Replanejamento
```

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/index.html — arquivo único, autocontido
```

O build produz **um único HTML** com CSS e JS embutidos: sem CDN, sem fonte externa, sem rede.
Basta abrir `dist/index.html` no navegador ou no celular.

## Verificação automatizada

```bash
node flow.mjs    # percorre os 20 passos do fluxo principal + 5 caminhos alternativos
node audit.mjs   # contraste WCAG AA, alvos de toque, rolagem horizontal, rótulos acessíveis
node shots.mjs   # captura 24 telas em 360/390/430 px, claro/escuro, 200% de texto
```

Estado atual: 20/20 passos do fluxo, 5/5 caminhos alternativos, 24/24 auditorias, zero botão sem
interação, zero erro de runtime.

## Estrutura

```
src/
├─ styles/tokens.css     Tokens em 3 camadas + eixos de modo
├─ styles/app.css        Componentes (nenhuma cor literal)
├─ engine/               Domínio, cenário do Rafael e motor determinístico
├─ system/               Nivor System: primitivas reutilizáveis
├─ nivor/                DecisionHero, DecisionDiff, AdaptiveWeek, gráficos
├─ state/store.tsx       Estado local, sem backend
├─ screens/              Telas e camadas transitórias
└─ Guide.tsx             Painel do moderador (fora do aparelho)
```

## Telas e estados

Boas-vindas · Onboarding em 5 passos (objetivo, experiência e frequência, disponibilidade e
duração, equipamento e restrições) · Revisão do plano inicial · Hoje normal · Check-in diário ·
Hoje adaptado · Explicação da decisão · Comparação antes e depois · Plano Vivo semanal ·
Detalhes do treino · Pré-treino · Treino ao vivo · Edição de série · Substituição de exercício ·
Pausa e retomada · Pós-treino · Semana atualizada · Progresso · Revisão semanal · Histórico de
decisões · Baixa confiança · Offline com dados · Sincronização pendente · Dados insuficientes ·
Desconforto e sinal de segurança.

Estados de sistema também cobertos: carregando, vazio, dados antigos, erro recuperável,
recomendação rejeitada, plano original mantido, treino restaurado, integração não conectada.

## Cenário fictício (idêntico em todas as telas)

Rafael, 27 anos, hipertrofia, intermediário, 5 treinos por semana, sem smartwatch, 4ª semana de
uso. Treino planejado: Costas + Bíceps, 70 min, 15 séries. Sono 6h18 (padrão 7h24), energia 3/5,
desconforto moderado em pernas, 55 minutos disponíveis. Decisão: manter Costas + Bíceps
condensado para 55 min e 11 séries, remover uma série de remada apoiada e uma de rosca inclinada,
mover a extensão lombar para sexta, evitar falha nos compostos. Confiança moderada, revisão
amanhã às 7h.

Nenhum dado de participante real é usado.

## Decisões de design tomadas neste protótipo

A documentação deixa parte do visual em aberto. As decisões provisórias adotadas foram:

1. **Paleta provisória.** Base grafite azulado (`#05080f`), accent frio "glacial" (`#4ea2ff`),
   positivo jade, atenção âmbar, crítico coral. Tudo em tokens semânticos: trocar a camada de
   primitivos substitui a identidade sem tocar em nenhum componente.
2. **Tipografia.** Pilha de sistema com numerais tabulares nos dados. Evita fonte externa, que a
   distribuição em arquivo único não suportaria. A escala tipográfica é semântica, então a troca
   por uma família definitiva é um ajuste de uma linha.
3. **Quatro abas** (Hoje, Plano, Treino, Progresso), seguindo a correção C08 da Fase 12. O Coach
   existe como camada contextual dentro da decisão, do histórico e da revisão — não como aba.
4. **Vidro restrito** a navegação, DecisionHero, sheets e overlays. Treino ao vivo, listas,
   formulários densos e estados de segurança usam superfície sólida, com fallback opaco completo
   no modo de transparência reduzida.
5. **Mascote como presença abstrata e substituível** (`MascotPresence`). Turi, Flux e Niv seguem
   em avaliação, então o protótipo usa uma forma neutra, aparece uma única vez por tela, nunca
   acima da decisão, nunca em estado de segurança, e pode ser desligado no painel do moderador
   para comparação com e sem personagem.
6. **Confiança categórica**, nunca percentual, com barras + texto + explicação e um aviso
   explícito de que não é probabilidade de acerto (correção C05 da Fase 12).
7. **Título da decisão com teto de 48px** nas escalas de texto maiores: o corpo do texto escala
   integralmente, mas a manchete para de crescer para que duração, motivo e ação continuem na
   primeira dobra.
8. **Painel do moderador fora do aparelho**, fixo em 100% de escala de texto, porque é a
   ferramenta que controla a escala do produto.

## Lógica simulada

`src/engine/decision.ts` implementa a hierarquia da Fase 3 §19: segurança → dados suficientes →
viabilidade de tempo → recuperação → manter. As saídas são `bloqueio_seguranca`, `pedir_dados`,
`condensar`, `reduzir` e `manter`. A confiança vem de cobertura das quatro entradas + maturidade
do histórico.

**A lógica é uma simulação de produto.** Não é validação fisiológica, não é diagnóstico e não
substitui avaliação profissional.

## Limitações — o que falta para virar aplicativo de produção

**Produto e pesquisa**
- Regras de treino precisam de revisão por profissional de Educação Física antes de qualquer uso
  com pessoas (Fase 13 §14 / Fase 14 §4.2).
- O corte de escopo da Fase 13 mantém o produto em NO-GO para desenvolvimento completo até os
  Gates P, S, B e M passarem.

**Técnico**
- Sem backend, conta, autenticação ou sincronização. O estado é local e o `localStorage` guarda
  apenas preferências de exibição.
- Sem persistência real de treino: falta banco local (SQLite/Drift), fila de operações,
  idempotência, resolução de conflito e tombstones — todo o modelo local-first da Fase 5 §6–7.
- O motor é determinístico mas não versionado em produção: falta registro imutável de decisão,
  `supersedes_decision_id`, feature flags por regra e testes de casos dourados.
- Um único cenário fictício. Não há baseline individual, estatística robusta (mediana móvel, MAD)
  nem histerese real entre dias.

**Plataforma**
- É uma implementação web para validação. O alvo definido na Fase 5 é Flutter com Drift, bridges
  nativas e temas em `ThemeExtension`. Os tokens já estão no formato que permite gerar o
  equivalente Dart.
- Sem HealthKit, Health Connect ou calendário externo — corretamente fora do primeiro alpha pela
  correção C02.
- Sem notificações, deep links e restauração de sessão após encerramento do sistema.

**Conformidade**
- Sem política de privacidade, termos, base legal LGPD, registro de operações, canal do titular
  ou exclusão e exportação reais.
- Publicação exige estrutura adulta ou entidade responsável, D-U-N-S e declaração de app de saúde
  no Play Console (Fase 13 §26).

**Design system**
- Falta exportação canônica DTCG, geração automática para código, golden tests por modo, catálogo
  de componentes e RTL verdadeiro (o protótipo usa propriedades lógicas, mas não foi testado em
  árabe ou hebraico).
- Idiomas: só pt-BR foi produzido, conforme a correção C10.

---

Protótipo de pesquisa com dados fictícios. Não oferece diagnóstico, tratamento nem prescrição, e
não substitui profissional habilitado.
