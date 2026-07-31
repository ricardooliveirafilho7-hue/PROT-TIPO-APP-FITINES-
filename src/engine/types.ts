/**
 * Modelo de domínio do protótipo.
 * Espelha o objeto de decisão descrito na Fase 13 §15 e na Fase 3 §22.
 * Nada aqui é diagnóstico: são estados operacionais de produto.
 */

export type Confidence = 'insuficiente' | 'baixa' | 'moderada' | 'alta';

export type ActionType =
  | 'manter'
  | 'condensar'
  | 'reduzir'
  | 'trocar'
  | 'reagendar'
  | 'recuperar'
  | 'pedir_dados'
  | 'bloqueio_seguranca';

export type SafetyState = 'normal' | 'cautela' | 'bloqueio';

export type SessionStatus =
  | 'concluida'
  | 'hoje'
  | 'planejada'
  | 'adaptada'
  | 'movida'
  | 'descanso'
  | 'revisao'
  | 'flexivel';

export type DecisionResponse = 'pendente' | 'aceita' | 'ajustada' | 'rejeitada';

export type ConnectivityState = 'online' | 'offline' | 'sync_pendente';

export type DiscomfortLevel = 'nenhum' | 'leve' | 'moderado' | 'forte';

export type MuscleState =
  | 'adequado'
  | 'moderado'
  | 'fadigado'
  | 'desconhecido'
  | 'bloqueado';

export interface CheckIn {
  /** Horas dormidas. `null` = não informado. */
  sleepHours: number | null;
  /** Energia percebida de 1 a 5. `null` = não informado. */
  energy: number | null;
  discomfortLevel: DiscomfortLevel | null;
  discomfortRegion: string | null;
  /** Minutos disponíveis hoje. `null` = não informado. */
  availableMinutes: number | null;
  /** Pergunta opcional. */
  scheduleChanged: boolean | null;
  completedAt: string | null;
}

export interface PlannedSet {
  reps: string;
  targetRir: number;
  /** Carga sugerida a partir do histórico comparável. */
  suggestedLoad: number | null;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  /** Prioritário = preservado quando a sessão é condensada. */
  priority: 'principal' | 'acessorio';
  pattern: string;
  plannedSets: number;
  adaptedSets: number;
  repRange: string;
  targetRir: number;
  restSeconds: number;
  suggestedLoad: number;
  /** Referência da última sessão comparável. */
  lastSession: string;
  /** Movido para outro dia pela adaptação. */
  movedTo?: string;
  note?: string;
}

export interface LoggedSet {
  index: number;
  load: number;
  reps: number;
  rir: number;
  done: boolean;
  type: 'trabalho' | 'aquecimento';
}

export interface WeekSession {
  id: string;
  dayLabel: string;
  dayShort: string;
  dayNumber: number;
  title: string;
  status: SessionStatus;
  durationMin: number | null;
  /** Duração antes da adaptação de hoje, quando houver. */
  originalDurationMin?: number | null;
  detail: string;
  /** Marcado como fixo pelo usuário: nunca movido automaticamente. */
  locked?: boolean;
  changedByToday?: boolean;
}

export interface DecisionChange {
  id: string;
  kind: 'series' | 'intensidade' | 'duracao' | 'movido' | 'mantido';
  label: string;
  before: string;
  after: string;
}

export interface WeekImpact {
  day: string;
  text: string;
  changed: boolean;
}

export interface Decision {
  id: string;
  ruleVersion: string;
  createdAt: string;
  actionType: ActionType;
  safetyState: SafetyState;

  /** Headline: a ação. Máximo de uma ação principal. */
  headline: string;
  /** Explicação curta, sem linguagem clínica. */
  shortReason: string;

  plannedSession: string;
  recommendedSession: string;
  durationBefore: number;
  durationAfter: number;
  setsBefore: number;
  setsAfter: number;
  suggestedTime: string;

  changes: DecisionChange[];
  supportingSignals: { label: string; value: string; direction: 'favoravel' | 'limitante' | 'contextual' }[];
  usedData: string[];
  missingData: string[];
  ignoredFactors: string[];
  rejectedAlternatives: { label: string; reason: string }[];

  confidence: Confidence;
  confidenceReason: string;
  validUntil: string;
  nextReview: string;

  weekImpact: WeekImpact[];
  alternative: string;

  primaryCta: string;
}

export interface DecisionRecord {
  id: string;
  date: string;
  action: string;
  response: DecisionResponse;
  outcome: string;
  confidence: Confidence;
}

export type ScenarioId =
  | 'oficial'
  | 'baixa_confianca'
  | 'dados_insuficientes'
  | 'seguranca'
  | 'plano_mantido';
