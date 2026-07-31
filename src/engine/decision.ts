/**
 * Motor determinístico de demonstração.
 *
 * IMPORTANTE — limite explícito:
 * Esta lógica existe apenas para tornar o protótipo coerente e testável.
 * Não é validação fisiológica, não é diagnóstico e não substitui avaliação
 * profissional. A hierarquia segue a Fase 3 §19: segurança > viabilidade >
 * recuperação > continuidade do plano > progressão > otimização.
 */

import { OFFICIAL_CHECKIN, PLANNED_DURATION, PLANNED_SESSION, USER } from './data';
import type { CheckIn, Confidence, Decision, DecisionChange } from './types';

export const RULE_VERSION = 'regras v0.4 (protótipo)';

/* ------------------------------------------------------------------ */
/* Confiança — categórica, nunca percentual de acerto                  */
/* ------------------------------------------------------------------ */

interface ConfidenceResult {
  level: Confidence;
  reason: string;
  missing: string[];
}

export function computeConfidence(checkIn: CheckIn): ConfidenceResult {
  const missing: string[] = [];
  if (checkIn.sleepHours === null) missing.push('Duração do sono de hoje');
  if (checkIn.energy === null) missing.push('Energia percebida');
  if (checkIn.discomfortLevel === null) missing.push('Desconforto atual');
  if (checkIn.availableMinutes === null) missing.push('Tempo disponível hoje');

  // Cobertura: quantas das 4 entradas existem.
  const coverage = 4 - missing.length;

  // Maturidade: 4 semanas de uso = histórico curto, mas existente.
  const shortHistory = USER.weekOfUse < 8;

  // Itens que o protótipo assume ausentes no cenário oficial.
  const structuralMissing = ['Variabilidade da frequência cardíaca (sem dispositivo conectado)'];

  if (coverage <= 1) {
    return {
      level: 'insuficiente',
      reason:
        'Não há entradas suficientes para avaliar o dia. O plano original foi mantido sem alteração automática.',
      missing: [...missing, ...structuralMissing],
    };
  }
  if (coverage === 2) {
    return {
      level: 'baixa',
      reason:
        'A confiança está baixa porque faltam entradas do check-in de hoje. Com poucos dados, o Nivor evita mudanças grandes.',
      missing: [...missing, ...structuralMissing],
    };
  }
  if (coverage === 3 || shortHistory) {
    return {
      level: 'moderada',
      reason:
        coverage === 3
          ? 'A confiança está moderada porque uma informação do check-in está ausente e seu histórico ainda é curto.'
          : 'A confiança está moderada porque seu histórico no Nivor ainda é curto e não há dado de um dispositivo conectado.',
      missing: [...missing, ...structuralMissing],
    };
  }
  return {
    level: 'alta',
    reason:
      'A confiança está alta: as quatro entradas de hoje estão presentes, atuais e coerentes com o seu padrão recente.',
    missing: structuralMissing,
  };
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  insuficiente: 'Dados insuficientes',
  baixa: 'Confiança baixa',
  moderada: 'Confiança moderada',
  alta: 'Confiança alta',
};

export const CONFIDENCE_BARS: Record<Confidence, number> = {
  insuficiente: 0,
  baixa: 1,
  moderada: 2,
  alta: 3,
};

/** Texto que impede a leitura de "probabilidade de acerto". */
export const CONFIDENCE_DISCLAIMER =
  'Confiança descreve a qualidade, a atualidade e a completude dos dados usados. Não é uma probabilidade de a recomendação estar certa.';

/* ------------------------------------------------------------------ */
/* Decisão                                                             */
/* ------------------------------------------------------------------ */

const BASE_SIGNALS = (checkIn: CheckIn) => {
  const signals: Decision['supportingSignals'] = [];
  if (checkIn.sleepHours !== null) {
    const deficit = USER.sleepBaseline - checkIn.sleepHours;
    signals.push({
      label: 'Sono',
      value:
        deficit > 0.5
          ? `6h18 — cerca de 1h abaixo do seu padrão (${USER.sleepBaselineLabel})`
          : `Dentro do seu padrão (${USER.sleepBaselineLabel})`,
      direction: deficit > 0.5 ? 'limitante' : 'favoravel',
    });
  }
  if (checkIn.energy !== null) {
    signals.push({
      label: 'Energia',
      value: `${checkIn.energy} de 5 — dia comum para você`,
      direction: checkIn.energy >= 4 ? 'favoravel' : 'contextual',
    });
  }
  signals.push({
    label: 'Costas e bíceps',
    value: 'Adequados — última exposição há 7 dias',
    direction: 'favoravel',
  });
  if (checkIn.discomfortLevel && checkIn.discomfortLevel !== 'nenhum') {
    signals.push({
      label: 'Desconforto',
      value: `${checkIn.discomfortRegion ?? 'Região informada'} — ${checkIn.discomfortLevel}. Não é exigido na sessão de hoje.`,
      direction: 'contextual',
    });
  }
  if (checkIn.availableMinutes !== null) {
    signals.push({
      label: 'Tempo disponível',
      value: `${checkIn.availableMinutes} minutos — ${PLANNED_DURATION - checkIn.availableMinutes} a menos que o planejado`,
      direction: checkIn.availableMinutes < PLANNED_DURATION ? 'limitante' : 'favoravel',
    });
  }
  return signals;
};

const OFFICIAL_CHANGES: DecisionChange[] = [
  {
    id: 'c1',
    kind: 'duracao',
    label: 'Duração da sessão',
    before: '70 min',
    after: '55 min',
  },
  {
    id: 'c2',
    kind: 'series',
    label: 'Remada apoiada',
    before: '3 séries',
    after: '2 séries',
  },
  {
    id: 'c3',
    kind: 'series',
    label: 'Rosca inclinada',
    before: '3 séries',
    after: '2 séries',
  },
  {
    id: 'c4',
    kind: 'movido',
    label: 'Extensão lombar',
    before: 'Hoje · 2 séries',
    after: 'Sexta-feira',
  },
  {
    id: 'c5',
    kind: 'intensidade',
    label: 'Exercícios compostos',
    before: 'Até a falha permitida',
    after: 'Evitar falha · manter 2 repetições em reserva',
  },
  {
    id: 'c6',
    kind: 'mantido',
    label: 'Grupo muscular',
    before: 'Costas + Bíceps',
    after: 'Costas + Bíceps (sem troca)',
  },
];

const OFFICIAL_WEEK_IMPACT: Decision['weekImpact'] = [
  { day: 'Hoje, terça', text: 'Costas + Bíceps em 55 min · 11 séries em vez de 15', changed: true },
  { day: 'Quarta', text: 'Pernas permanece como estava · 75 min', changed: false },
  { day: 'Quinta', text: 'Descanso ou cardio leve · sem mudança', changed: false },
  { day: 'Sexta', text: 'Ombros + posterior recebe a extensão lombar · 60 → 66 min', changed: true },
  { day: 'Sábado e domingo', text: 'Sessão flexível e revisão semanal · sem mudança', changed: false },
];

const OFFICIAL_REJECTED = [
  {
    label: 'Trocar para uma sessão de pernas',
    reason: 'Você relatou desconforto moderado em quadríceps. Trocar aumentaria a exigência do grupo já sensível.',
  },
  {
    label: 'Mover Costas + Bíceps para amanhã',
    reason: 'Quarta já tem Pernas planejado. Mover criaria dois dias seguidos de sessão longa e um dia sem treino.',
  },
  {
    label: 'Manter as 15 séries em 55 minutos',
    reason: 'Exigiria cortar o descanso entre séries pela metade, o que reduz a qualidade das séries principais.',
  },
  {
    label: 'Recomendar descanso',
    reason: 'Apenas um sinal está abaixo do padrão e o grupo planejado está adequado. Descanso seria uma mudança maior que a necessária.',
  },
];

/**
 * Seleciona a decisão a partir do check-in.
 * Ordem: segurança → dados → viabilidade de tempo → recuperação → manter.
 */
export function buildDecision(checkIn: CheckIn): Decision {
  const confidence = computeConfidence(checkIn);
  const signals = BASE_SIGNALS(checkIn);

  const base = {
    id: 'NVR-D-0416',
    ruleVersion: RULE_VERSION,
    createdAt: '06:52',
    plannedSession: PLANNED_SESSION,
    suggestedTime: '17h30',
    durationBefore: PLANNED_DURATION,
    setsBefore: 15,
    supportingSignals: signals,
    confidence: confidence.level,
    confidenceReason: confidence.reason,
    missingData: confidence.missing,
    validUntil: 'hoje às 19h30',
    nextReview: 'amanhã, 7h, depois do próximo check-in',
    usedData: [
      'Sessão planejada para hoje e prioridades da semana',
      'Check-in de hoje às 06h52',
      'Padrão de sono das últimas 2 semanas',
      'Sessões de costas e bíceps das últimas 3 semanas',
      'Sessão de ontem (Peito + Tríceps) e esforço relatado',
    ],
    ignoredFactors: [
      'Peso corporal do dia — variação diária não altera a sessão',
      'Passos de ontem — sem relação suficiente com esta decisão',
    ],
  };

  /* Nível 0 — Segurança */
  if (checkIn.discomfortLevel === 'forte') {
    return {
      ...base,
      actionType: 'bloqueio_seguranca',
      safetyState: 'bloqueio',
      headline: 'Hoje o Nivor não vai recomendar esta sessão.',
      shortReason:
        'Você informou desconforto forte. Desconforto incomum merece atenção. Considere interromper e buscar orientação de um profissional habilitado.',
      recommendedSession: 'Sem sessão recomendada',
      durationAfter: 0,
      setsAfter: 0,
      changes: [
        {
          id: 'sc1',
          kind: 'mantido',
          label: 'Sessão de hoje',
          before: 'Costas + Bíceps · 70 min',
          after: 'Suspensa até você revisar o desconforto',
        },
      ],
      rejectedAlternatives: [
        {
          label: 'Adaptar a sessão reduzindo carga',
          reason: 'Com desconforto forte relatado, o Nivor não adapta a sessão. O sistema não avalia a causa.',
        },
      ],
      confidence: confidence.level,
      confidenceReason:
        'A confiança dos dados não muda esta decisão. Um sinal de segurança interrompe a adaptação automática independentemente da qualidade dos dados.',
      weekImpact: [
        { day: 'Hoje, terça', text: 'Sessão suspensa · nenhum treino é sugerido', changed: true },
        { day: 'Restante da semana', text: 'Nada foi remanejado. O Nivor não tentará compensar esta sessão.', changed: false },
      ],
      alternative: 'Registrar como dia sem treino e revisar amanhã.',
      primaryCta: 'Entendi',
    };
  }

  /* Dados insuficientes / baixa confiança → decisão conservadora */
  if (confidence.level === 'insuficiente' || confidence.level === 'baixa') {
    const conservative = confidence.level === 'insuficiente';
    return {
      ...base,
      actionType: 'pedir_dados',
      safetyState: 'normal',
      headline: conservative
        ? 'Hoje, faça Costas + Bíceps como planejado, em 70 minutos.'
        : 'Hoje, faça Costas + Bíceps com intensidade conservadora, em 70 minutos.',
      shortReason: conservative
        ? 'Ainda não há dados suficientes para uma adaptação. Seu plano original foi mantido sem alteração automática.'
        : 'Com poucos dados de hoje, o Nivor evita mudanças grandes. O plano segue igual, com orientação de não buscar a falha nos compostos.',
      recommendedSession: PLANNED_SESSION,
      durationAfter: PLANNED_DURATION,
      setsAfter: 15,
      changes: conservative
        ? [
            {
              id: 'dc0',
              kind: 'mantido',
              label: 'Sessão de hoje',
              before: 'Costas + Bíceps · 70 min · 15 séries',
              after: 'Costas + Bíceps · 70 min · 15 séries',
            },
          ]
        : [
            {
              id: 'dc1',
              kind: 'intensidade',
              label: 'Exercícios compostos',
              before: 'Até a falha permitida',
              after: 'Evitar falha · manter 2 repetições em reserva',
            },
            {
              id: 'dc2',
              kind: 'mantido',
              label: 'Volume e duração',
              before: '15 séries · 70 min',
              after: '15 séries · 70 min',
            },
          ],
      rejectedAlternatives: [
        {
          label: 'Condensar ou reduzir volume',
          reason: 'Com dados incompletos, uma redução seria um palpite. O Nivor prefere manter o plano que você definiu.',
        },
      ],
      weekImpact: [
        { day: 'Hoje, terça', text: 'Plano original mantido', changed: false },
        { day: 'Restante da semana', text: 'Nenhum dia foi afetado', changed: false },
      ],
      alternative: 'Responder as perguntas que faltam para melhorar a recomendação.',
      primaryCta: 'Completar check-in',
    };
  }

  /* Nível 1 — Viabilidade: tempo disponível menor que o planejado */
  const shortOnTime =
    checkIn.availableMinutes !== null && checkIn.availableMinutes < PLANNED_DURATION - 5;
  const lowSleep = checkIn.sleepHours !== null && USER.sleepBaseline - checkIn.sleepHours > 0.5;
  const moderateEnergy = checkIn.energy !== null && checkIn.energy <= 3;

  if (shortOnTime) {
    const minutes = checkIn.availableMinutes as number;
    const avoidFailure = lowSleep || moderateEnergy;
    return {
      ...base,
      actionType: 'condensar',
      safetyState: checkIn.discomfortLevel === 'moderado' ? 'cautela' : 'normal',
      headline: `Hoje, faça Costas + Bíceps em ${minutes} minutos.`,
      shortReason: avoidFailure
        ? 'Reduzimos o volume porque você dormiu abaixo do seu padrão e possui menos tempo hoje. O grupo planejado continua adequado.'
        : 'Reduzimos o volume para caber no tempo disponível de hoje. O grupo planejado continua adequado.',
      recommendedSession: PLANNED_SESSION,
      durationAfter: minutes,
      setsAfter: 11,
      changes: avoidFailure ? OFFICIAL_CHANGES : OFFICIAL_CHANGES.filter((c) => c.kind !== 'intensidade'),
      rejectedAlternatives: OFFICIAL_REJECTED,
      weekImpact: OFFICIAL_WEEK_IMPACT,
      alternative: `Manter o plano original de ${PLANNED_DURATION} minutos e 15 séries.`,
      primaryCta: 'Aceitar adaptação',
    };
  }

  /* Nível 2 — Recuperação: sem conflito de tempo, mas sinais abaixo do padrão */
  if (lowSleep && moderateEnergy) {
    return {
      ...base,
      actionType: 'reduzir',
      safetyState: 'normal',
      headline: 'Hoje, faça Costas + Bíceps sem buscar a falha.',
      shortReason:
        'Você dormiu abaixo do seu padrão e sua energia está no meio da escala. Mantivemos a sessão e o volume, com menos exigência nos compostos.',
      recommendedSession: PLANNED_SESSION,
      durationAfter: PLANNED_DURATION,
      setsAfter: 14,
      changes: [
        {
          id: 'r1',
          kind: 'intensidade',
          label: 'Exercícios compostos',
          before: 'Até a falha permitida',
          after: 'Evitar falha · manter 2 repetições em reserva',
        },
        {
          id: 'r2',
          kind: 'series',
          label: 'Rosca inclinada',
          before: '3 séries',
          after: '2 séries',
        },
        {
          id: 'r3',
          kind: 'mantido',
          label: 'Grupo muscular e duração',
          before: 'Costas + Bíceps · 70 min',
          after: 'Costas + Bíceps · 70 min',
        },
      ],
      rejectedAlternatives: OFFICIAL_REJECTED.slice(0, 2),
      weekImpact: [
        { day: 'Hoje, terça', text: 'Costas + Bíceps · 14 séries em vez de 15', changed: true },
        { day: 'Restante da semana', text: 'Nenhum outro dia foi afetado', changed: false },
      ],
      alternative: `Manter o plano original de ${PLANNED_DURATION} minutos e 15 séries.`,
      primaryCta: 'Aceitar adaptação',
    };
  }

  /* Nível 3 — Manter: nenhuma mudança suficiente */
  return {
    ...base,
    actionType: 'manter',
    safetyState: 'normal',
    headline: 'Hoje, faça Costas + Bíceps em 70 minutos.',
    shortReason:
      'Seu estado está estável e o tempo disponível cobre a sessão. Não encontramos mudança suficiente para alterar o plano.',
    recommendedSession: PLANNED_SESSION,
    durationAfter: PLANNED_DURATION,
    setsAfter: 15,
    changes: [
      {
        id: 'k1',
        kind: 'mantido',
        label: 'Sessão de hoje',
        before: 'Costas + Bíceps · 70 min · 15 séries',
        after: 'Costas + Bíceps · 70 min · 15 séries',
      },
    ],
    rejectedAlternatives: [
      {
        label: 'Reduzir uma série por precaução',
        reason: 'Nenhum sinal está abaixo do seu padrão. Mudar sem motivo tornaria a recomendação menos previsível.',
      },
    ],
    weekImpact: [
      { day: 'Hoje, terça', text: 'Plano original mantido', changed: false },
      { day: 'Restante da semana', text: 'Nenhum dia foi afetado', changed: false },
    ],
    alternative: 'Ajustar manualmente a duração ou os exercícios.',
    primaryCta: 'Ver treino',
  };
}

export const OFFICIAL_DECISION = buildDecision(OFFICIAL_CHECKIN);
