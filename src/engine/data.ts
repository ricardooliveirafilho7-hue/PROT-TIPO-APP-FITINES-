/**
 * Cenário fictício oficial do protótipo.
 * Fonte: Fase 9 §4 / Fase 8 §D4 / Fase 14 §14.
 * Todos os dados são simulados. Nenhum dado de participante real é usado.
 */

import type { CheckIn, DecisionRecord, Exercise, WeekSession } from './types';

export const USER = {
  name: 'Rafael',
  age: 27,
  goal: 'Hipertrofia',
  level: 'Intermediário',
  weeklyFrequency: 5,
  preferredTime: '17h30',
  usualDuration: '60 a 75 min',
  place: 'Academia completa',
  weekOfUse: 4,
  sleepBaseline: 7.4, // 7h24 — padrão individual recente
  sleepBaselineLabel: '7h24',
};

/** Sessão planejada de hoje, antes de qualquer adaptação. */
export const PLANNED_DURATION = 70;
export const PLANNED_SESSION = 'Costas + Bíceps';

/** Check-in oficial do cenário: 6h18, energia 3/5, desconforto moderado nas pernas, 55 min. */
export const OFFICIAL_CHECKIN: CheckIn = {
  sleepHours: 6.3, // 6h18
  energy: 3,
  discomfortLevel: 'moderado',
  discomfortRegion: 'Pernas (quadríceps)',
  availableMinutes: 55,
  scheduleChanged: true,
  completedAt: '06:52',
};

export const EMPTY_CHECKIN: CheckIn = {
  sleepHours: null,
  energy: null,
  discomfortLevel: null,
  discomfortRegion: null,
  availableMinutes: null,
  scheduleChanged: null,
  completedAt: null,
};

/**
 * Programa de hoje: 15 séries / 70 min no plano original.
 * A adaptação remove 1 série de remada apoiada, 1 de rosca inclinada
 * e move o trabalho lombar para sexta-feira → 11 séries / 55 min.
 */
export const TODAY_EXERCISES: Exercise[] = [
  {
    id: 'ex-puxada',
    name: 'Puxada alta pronada',
    muscle: 'Dorsais',
    equipment: 'Polia alta',
    priority: 'principal',
    pattern: 'Tração vertical',
    plannedSets: 3,
    adaptedSets: 3,
    repRange: '8–10',
    targetRir: 2,
    restSeconds: 120,
    suggestedLoad: 68,
    lastSession: '68 kg × 9 · RIR 2 · há 7 dias',
    note: 'Exercício prioritário — preservado na condensação.',
  },
  {
    id: 'ex-remada-apoiada',
    name: 'Remada apoiada',
    muscle: 'Dorsais · Trapézio',
    equipment: 'Halteres',
    priority: 'principal',
    pattern: 'Tração horizontal',
    plannedSets: 3,
    adaptedSets: 2,
    repRange: '8–10',
    targetRir: 2,
    restSeconds: 120,
    suggestedLoad: 72,
    lastSession: '72 kg × 8 · RIR 1 · há 7 dias',
    note: 'Uma série removida para caber em 55 minutos.',
  },
  {
    id: 'ex-remada-unilateral',
    name: 'Remada unilateral',
    muscle: 'Dorsais',
    equipment: 'Haltere',
    priority: 'acessorio',
    pattern: 'Tração horizontal',
    plannedSets: 2,
    adaptedSets: 2,
    repRange: '10–12',
    targetRir: 2,
    restSeconds: 90,
    suggestedLoad: 32,
    lastSession: '32 kg × 11 · RIR 2 · há 7 dias',
  },
  {
    id: 'ex-lombar',
    name: 'Extensão lombar',
    muscle: 'Lombar',
    equipment: 'Banco romano',
    priority: 'acessorio',
    pattern: 'Extensão de quadril',
    plannedSets: 2,
    adaptedSets: 0,
    repRange: '12–15',
    targetRir: 3,
    restSeconds: 75,
    suggestedLoad: 0,
    lastSession: 'Peso corporal × 14 · há 7 dias',
    movedTo: 'Sexta-feira',
    note: 'Movido para sexta: hoje há menos tempo e sua lombar já é exigida nas remadas.',
  },
  {
    id: 'ex-rosca-inclinada',
    name: 'Rosca inclinada',
    muscle: 'Bíceps',
    equipment: 'Halteres',
    priority: 'acessorio',
    pattern: 'Flexão de cotovelo',
    plannedSets: 3,
    adaptedSets: 2,
    repRange: '10–12',
    targetRir: 2,
    restSeconds: 75,
    suggestedLoad: 14,
    lastSession: '14 kg × 11 · RIR 1 · há 7 dias',
    note: 'Uma série removida.',
  },
  {
    id: 'ex-rosca-martelo',
    name: 'Rosca martelo',
    muscle: 'Bíceps · Braquial',
    equipment: 'Halteres',
    priority: 'acessorio',
    pattern: 'Flexão de cotovelo',
    plannedSets: 2,
    adaptedSets: 2,
    repRange: '10–12',
    targetRir: 2,
    restSeconds: 75,
    suggestedLoad: 16,
    lastSession: '16 kg × 10 · RIR 2 · há 7 dias',
  },
];

/** Alternativas equivalentes para a substituição de exercício. */
export const SUBSTITUTIONS: Record<
  string,
  { id: string; name: string; equipment: string; why: string; impact: string; available: boolean }[]
> = {
  'ex-remada-apoiada': [
    {
      id: 'sub-remada-maquina',
      name: 'Remada máquina (pegada neutra)',
      equipment: 'Máquina',
      why: 'Mesmo padrão de tração horizontal e mesmos músculos principais.',
      impact: 'Volume equivalente. Menor exigência lombar.',
      available: true,
    },
    {
      id: 'sub-remada-cavalinho',
      name: 'Remada cavalinho',
      equipment: 'Barra + triângulo',
      why: 'Tração horizontal com carga semelhante.',
      impact: 'Volume equivalente. Exigência lombar parecida com a original.',
      available: true,
    },
    {
      id: 'sub-remada-polia',
      name: 'Remada baixa na polia',
      equipment: 'Polia baixa',
      why: 'Tração horizontal com tensão constante.',
      impact: 'Volume equivalente. Estação ocupada agora.',
      available: false,
    },
  ],
};

/** Plano Vivo — semana. Terça é hoje. */
export const WEEK: WeekSession[] = [
  {
    id: 'w-seg',
    dayLabel: 'Segunda',
    dayShort: 'seg',
    dayNumber: 3,
    title: 'Peito + Tríceps',
    status: 'concluida',
    durationMin: 64,
    detail: '14 séries · esforço 7/10 · concluído às 18h34',
  },
  {
    id: 'w-ter',
    dayLabel: 'Terça',
    dayShort: 'ter',
    dayNumber: 4,
    title: 'Costas + Bíceps',
    status: 'hoje',
    durationMin: 70,
    originalDurationMin: 70,
    detail: '15 séries · 17h30',
  },
  {
    id: 'w-qua',
    dayLabel: 'Quarta',
    dayShort: 'qua',
    dayNumber: 5,
    title: 'Pernas',
    status: 'planejada',
    durationMin: 75,
    detail: '16 séries · 17h30',
  },
  {
    id: 'w-qui',
    dayLabel: 'Quinta',
    dayShort: 'qui',
    dayNumber: 6,
    title: 'Descanso ou cardio leve',
    status: 'descanso',
    durationMin: null,
    detail: 'Sem sessão de força planejada',
  },
  {
    id: 'w-sex',
    dayLabel: 'Sexta',
    dayShort: 'sex',
    dayNumber: 7,
    title: 'Ombros + posterior',
    status: 'planejada',
    durationMin: 60,
    detail: '13 séries · 17h30',
    locked: true,
  },
  {
    id: 'w-sab',
    dayLabel: 'Sábado',
    dayShort: 'sáb',
    dayNumber: 8,
    title: 'Sessão flexível',
    status: 'flexivel',
    durationMin: 50,
    detail: 'Grupo definido conforme a semana',
  },
  {
    id: 'w-dom',
    dayLabel: 'Domingo',
    dayShort: 'dom',
    dayNumber: 9,
    title: 'Revisão semanal',
    status: 'revisao',
    durationMin: null,
    detail: '5 minutos · balanço e plano da próxima semana',
  },
];

/** Estado por grupo muscular — texto sempre presente, nunca só cor. */
export const MUSCLE_STATES = [
  { muscle: 'Dorsais', state: 'adequado' as const, detail: 'Última exposição há 7 dias' },
  { muscle: 'Bíceps', state: 'adequado' as const, detail: 'Última exposição há 7 dias' },
  { muscle: 'Peito · Tríceps', state: 'moderado' as const, detail: 'Treinados ontem' },
  { muscle: 'Quadríceps', state: 'fadigado' as const, detail: 'Desconforto moderado relatado hoje' },
  { muscle: 'Ombros', state: 'adequado' as const, detail: 'Última exposição há 4 dias' },
  { muscle: 'Posterior de coxa', state: 'desconhecido' as const, detail: 'Sem dado recente' },
];

/** Histórico de decisões — memória do sistema. */
export const DECISION_HISTORY: DecisionRecord[] = [
  {
    id: 'NVR-D-0412',
    date: 'Segunda, 3',
    action: 'Manter Peito + Tríceps, 65 min',
    response: 'aceita',
    outcome: 'Executado em 64 min · esforço 7/10',
    confidence: 'alta',
  },
  {
    id: 'NVR-D-0409',
    date: 'Sábado, 1',
    action: 'Reagendar Ombros para sexta',
    response: 'rejeitada',
    outcome: 'Plano original mantido · treino realizado no sábado',
    confidence: 'moderada',
  },
  {
    id: 'NVR-D-0405',
    date: 'Sexta, 30',
    action: 'Condensar Pernas para 45 min',
    response: 'ajustada',
    outcome: 'Você manteve o agachamento e removeu a cadeira extensora',
    confidence: 'moderada',
  },
  {
    id: 'NVR-D-0401',
    date: 'Quarta, 28',
    action: 'Manter plano · nenhuma alteração necessária',
    response: 'aceita',
    outcome: 'Executado conforme planejado',
    confidence: 'alta',
  },
];

/** Séries por semana, últimas 4 semanas — planejado vs realizado. */
export const VOLUME_HISTORY = [
  { week: 'S1', planned: 68, done: 61 },
  { week: 'S2', planned: 70, done: 70 },
  { week: 'S3', planned: 72, done: 58 },
  { week: 'S4', planned: 74, done: 43, partial: true },
];

/** Tendência de carga na puxada alta (kg × reps → e1RM estimado). */
export const STRENGTH_HISTORY = [
  { label: 'há 4 sem', value: 62, note: '62 kg × 9' },
  { label: 'há 3 sem', value: 64, note: '64 kg × 9' },
  { label: 'há 2 sem', value: 66, note: '66 kg × 8' },
  { label: 'há 1 sem', value: 68, note: '68 kg × 9' },
];

export const SLEEP_HISTORY = [
  { label: 'Qui', hours: 7.5 },
  { label: 'Sex', hours: 7.2 },
  { label: 'Sáb', hours: 8.1 },
  { label: 'Dom', hours: 7.4 },
  { label: 'Seg', hours: 6.9 },
  { label: 'Ter', hours: 6.3 },
];

export function formatHours(h: number): string {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

export function formatDuration(min: number): string {
  return `${min} min`;
}
