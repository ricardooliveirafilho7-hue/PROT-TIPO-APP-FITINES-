/**
 * Estado local do protótipo. Sem backend, sem autenticação, sem rede.
 * O localStorage guarda apenas preferências de exibição da demonstração.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { EMPTY_CHECKIN, OFFICIAL_CHECKIN, TODAY_EXERCISES } from '../engine/data';
import { buildDecision } from '../engine/decision';
import type {
  CheckIn,
  ConnectivityState,
  Decision,
  DecisionResponse,
  LoggedSet,
} from '../engine/types';

export type Route = 'welcome' | 'onboarding' | 'app';
export type Tab = 'hoje' | 'plano' | 'treino' | 'progresso';
export type WorkoutPhase = 'idle' | 'pre' | 'live' | 'paused' | 'finished';

export type SheetId =
  | 'checkin'
  | 'explanation'
  | 'diff'
  | 'confidence'
  | 'adjust'
  | 'reject'
  | 'substitute'
  | 'edit-set'
  | 'post-workout'
  | 'week-review'
  | 'history'
  | 'session-detail'
  | 'discomfort'
  | 'settings'
  | 'integrations'
  | 'data-quality';

export interface OnboardingAnswers {
  goal: string | null;
  level: string | null;
  frequency: number | null;
  duration: number | null;
  place: string | null;
  equipment: string[];
  restrictions: string[];
}

export interface AppState {
  route: Route;
  onboardingStep: number;
  onboarding: OnboardingAnswers;

  tab: Tab;
  sheet: SheetId | null;
  sheetPayload: string | null;

  /** Estado do check-in de hoje. */
  checkIn: CheckIn;
  checkInDone: boolean;

  /** Resposta do usuário à decisão. */
  decisionResponse: DecisionResponse;
  /** Duração escolhida quando o usuário ajusta manualmente. */
  adjustedDuration: number | null;
  rejectReason: string | null;

  /** Treino. */
  workoutPhase: WorkoutPhase;
  elapsedSeconds: number;
  restSeconds: number | null;
  currentExerciseId: string;
  sets: Record<string, LoggedSet[]>;
  substitutions: Record<string, { name: string; equipment: string }>;
  postWorkoutFeeling: string | null;
  workoutCompleted: boolean;
  discomfortReported: boolean;

  /** Estados de sistema demonstráveis. */
  connectivity: ConnectivityState;
  pendingOperations: number;
  loading: boolean;
  recoverableError: boolean;
  healthIntegrationConnected: boolean;

  /** Preferências. */
  mascotVisible: boolean;
  theme: 'dark' | 'light';
  contrast: 'normal' | 'high';
  transparency: 'normal' | 'reduced';
  motion: 'full' | 'reduced';
  textScale: '100' | '130' | '160' | '200';

  toast: { message: string; actionLabel?: string; action?: string } | null;
}

const initialSets = (): Record<string, LoggedSet[]> => {
  const map: Record<string, LoggedSet[]> = {};
  for (const ex of TODAY_EXERCISES) {
    if (ex.adaptedSets === 0) continue;
    map[ex.id] = Array.from({ length: ex.adaptedSets }, (_, i) => ({
      index: i + 1,
      load: ex.suggestedLoad,
      reps: parseInt(ex.repRange.split('–')[1] ?? '10', 10),
      rir: ex.targetRir,
      done: false,
      type: 'trabalho',
    }));
  }
  return map;
};

const initialState: AppState = {
  route: 'welcome',
  onboardingStep: 0,
  onboarding: {
    goal: 'hipertrofia',
    level: 'intermediario',
    frequency: 5,
    duration: 70,
    place: 'academia',
    equipment: ['halteres', 'barras', 'maquinas', 'polias'],
    restrictions: [],
  },

  tab: 'hoje',
  sheet: null,
  sheetPayload: null,

  checkIn: EMPTY_CHECKIN,
  checkInDone: false,

  decisionResponse: 'pendente',
  adjustedDuration: null,
  rejectReason: null,

  workoutPhase: 'idle',
  elapsedSeconds: 0,
  restSeconds: null,
  currentExerciseId: TODAY_EXERCISES[0].id,
  sets: initialSets(),
  substitutions: {},
  postWorkoutFeeling: null,
  workoutCompleted: false,
  discomfortReported: false,

  connectivity: 'online',
  pendingOperations: 0,
  loading: false,
  recoverableError: false,
  healthIntegrationConnected: false,

  mascotVisible: true,
  theme: 'dark',
  contrast: 'normal',
  transparency: 'normal',
  motion: 'full',
  textScale: '100',

  toast: null,
};

type Action =
  | { type: 'go'; route: Route }
  | { type: 'onboarding-step'; step: number }
  | { type: 'onboarding-answer'; patch: Partial<OnboardingAnswers> }
  | { type: 'tab'; tab: Tab }
  | { type: 'sheet'; sheet: SheetId | null; payload?: string | null }
  | { type: 'checkin-patch'; patch: Partial<CheckIn> }
  | { type: 'checkin-submit' }
  | { type: 'checkin-reset' }
  | { type: 'prefill-official-checkin' }
  | { type: 'decision-response'; response: DecisionResponse; reason?: string | null }
  | { type: 'adjust-duration'; minutes: number }
  | { type: 'workout-phase'; phase: WorkoutPhase }
  | { type: 'tick' }
  | { type: 'rest-start'; seconds: number }
  | { type: 'rest-stop' }
  | { type: 'set-toggle'; exerciseId: string; index: number }
  | { type: 'set-update'; exerciseId: string; index: number; patch: Partial<LoggedSet> }
  | { type: 'set-add'; exerciseId: string }
  | { type: 'current-exercise'; id: string }
  | { type: 'substitute'; exerciseId: string; name: string; equipment: string }
  | { type: 'report-discomfort' }
  | { type: 'post-workout'; feeling: string }
  | { type: 'connectivity'; value: ConnectivityState }
  | { type: 'sync-now' }
  | { type: 'loading'; value: boolean }
  | { type: 'recoverable-error'; value: boolean }
  | { type: 'toggle-integration' }
  | { type: 'pref'; patch: Partial<AppState> }
  | { type: 'toast'; toast: AppState['toast'] }
  | { type: 'reset-workout' }
  | { type: 'reset-demo' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'go':
      return { ...state, route: action.route, sheet: null };

    case 'onboarding-step':
      return { ...state, onboardingStep: action.step };

    case 'onboarding-answer':
      return { ...state, onboarding: { ...state.onboarding, ...action.patch } };

    case 'tab':
      return { ...state, tab: action.tab, sheet: null };

    case 'sheet':
      return { ...state, sheet: action.sheet, sheetPayload: action.payload ?? null };

    case 'checkin-patch':
      return { ...state, checkIn: { ...state.checkIn, ...action.patch } };

    case 'checkin-submit':
      return {
        ...state,
        checkInDone: true,
        checkIn: { ...state.checkIn, completedAt: '06:52' },
        sheet: null,
        decisionResponse: 'pendente',
      };

    case 'checkin-reset':
      return {
        ...state,
        checkIn: EMPTY_CHECKIN,
        checkInDone: false,
        decisionResponse: 'pendente',
        adjustedDuration: null,
        rejectReason: null,
      };

    case 'prefill-official-checkin':
      return {
        ...state,
        checkIn: { ...OFFICIAL_CHECKIN },
        checkInDone: true,
        decisionResponse: 'pendente',
        adjustedDuration: null,
        rejectReason: null,
        // Preencher pelo atalho equivale a concluir o check-in: a camada
        // transitória precisa sair da frente da decisão.
        sheet: null,
      };

    case 'decision-response':
      return {
        ...state,
        decisionResponse: action.response,
        rejectReason: action.reason ?? null,
        sheet: null,
      };

    case 'adjust-duration':
      return {
        ...state,
        adjustedDuration: action.minutes,
        decisionResponse: 'ajustada',
        sheet: null,
      };

    case 'workout-phase':
      return {
        ...state,
        workoutPhase: action.phase,
        elapsedSeconds: action.phase === 'live' && state.workoutPhase === 'idle' ? 0 : state.elapsedSeconds,
        workoutCompleted: action.phase === 'finished' ? true : state.workoutCompleted,
      };

    case 'tick':
      return {
        ...state,
        elapsedSeconds: state.elapsedSeconds + 1,
        restSeconds:
          state.restSeconds !== null && state.restSeconds > 0 ? state.restSeconds - 1 : state.restSeconds,
      };

    case 'rest-start':
      return { ...state, restSeconds: action.seconds };

    case 'rest-stop':
      return { ...state, restSeconds: null };

    case 'set-toggle': {
      const list = state.sets[action.exerciseId] ?? [];
      const next = list.map((s) => (s.index === action.index ? { ...s, done: !s.done } : s));
      return {
        ...state,
        sets: { ...state.sets, [action.exerciseId]: next },
        pendingOperations:
          state.connectivity === 'online' ? state.pendingOperations : state.pendingOperations + 1,
      };
    }

    case 'set-update': {
      const list = state.sets[action.exerciseId] ?? [];
      const next = list.map((s) => (s.index === action.index ? { ...s, ...action.patch } : s));
      return { ...state, sets: { ...state.sets, [action.exerciseId]: next }, sheet: null };
    }

    case 'set-add': {
      const list = state.sets[action.exerciseId] ?? [];
      const last = list[list.length - 1];
      return {
        ...state,
        sets: {
          ...state.sets,
          [action.exerciseId]: [
            ...list,
            {
              index: list.length + 1,
              load: last?.load ?? 0,
              reps: last?.reps ?? 10,
              rir: last?.rir ?? 2,
              done: false,
              type: 'trabalho',
            },
          ],
        },
      };
    }

    case 'current-exercise':
      return { ...state, currentExerciseId: action.id };

    case 'substitute':
      return {
        ...state,
        substitutions: {
          ...state.substitutions,
          [action.exerciseId]: { name: action.name, equipment: action.equipment },
        },
        sheet: null,
        toast: {
          message: `Exercício substituído por ${action.name}. Volume equivalente preservado.`,
          actionLabel: 'Desfazer',
          action: `undo-substitute:${action.exerciseId}`,
        },
      };

    case 'report-discomfort':
      return { ...state, discomfortReported: true, sheet: null, workoutPhase: 'paused' };

    case 'post-workout':
      return { ...state, postWorkoutFeeling: action.feeling };

    case 'connectivity':
      return {
        ...state,
        connectivity: action.value,
        pendingOperations: action.value === 'online' ? 0 : state.pendingOperations,
      };

    case 'sync-now':
      return {
        ...state,
        connectivity: 'online',
        pendingOperations: 0,
        toast: { message: 'Tudo sincronizado. Nenhum registro foi perdido.' },
      };

    case 'loading':
      return { ...state, loading: action.value };

    case 'recoverable-error':
      return { ...state, recoverableError: action.value };

    case 'toggle-integration':
      return { ...state, healthIntegrationConnected: !state.healthIntegrationConnected };

    case 'pref':
      return { ...state, ...action.patch };

    case 'toast':
      return { ...state, toast: action.toast };

    case 'reset-workout':
      return {
        ...state,
        workoutPhase: 'idle',
        elapsedSeconds: 0,
        restSeconds: null,
        currentExerciseId: TODAY_EXERCISES[0].id,
        sets: initialSets(),
        substitutions: {},
        postWorkoutFeeling: null,
        workoutCompleted: false,
        discomfortReported: false,
      };

    case 'reset-demo':
      return {
        ...initialState,
        sets: initialSets(),
        theme: state.theme,
        contrast: state.contrast,
        transparency: state.transparency,
        motion: state.motion,
        textScale: state.textScale,
        mascotVisible: state.mascotVisible,
      };

    default:
      return state;
  }
}

/* -------------------------------------------------------------------------- */

interface Store {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  decision: Decision;
  /** Duração efetivamente aplicada depois da resposta do usuário. */
  effectiveDuration: number;
  effectiveSets: number;
  planIsAdapted: boolean;
  openSheet: (id: SheetId, payload?: string) => void;
  closeSheet: () => void;
}

const StoreContext = createContext<Store | null>(null);

const PREF_KEY = 'nivor.proto.prefs.v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return init;
      const prefs = JSON.parse(raw) as Partial<AppState>;
      return { ...init, ...prefs };
    } catch {
      return init;
    }
  });

  // Persiste apenas preferências de exibição.
  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({
          theme: state.theme,
          contrast: state.contrast,
          transparency: state.transparency,
          motion: state.motion,
          textScale: state.textScale,
          mascotVisible: state.mascotVisible,
        }),
      );
    } catch {
      /* protótipo: ignorar indisponibilidade de storage */
    }
  }, [state.theme, state.contrast, state.transparency, state.motion, state.textScale, state.mascotVisible]);

  // Aplica os eixos de modo no documento.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = state.theme;
    root.dataset.contrast = state.contrast;
    root.dataset.transparency = state.transparency;
    root.dataset.motion = state.motion;
    root.dataset.textScale = state.textScale;
    root.lang = 'pt-BR';
  }, [state.theme, state.contrast, state.transparency, state.motion, state.textScale]);

  // Cronômetro do treino ao vivo.
  useEffect(() => {
    if (state.workoutPhase !== 'live') return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(id);
  }, [state.workoutPhase]);

  const decision = useMemo(() => buildDecision(state.checkIn), [state.checkIn]);

  const effectiveDuration = useMemo(() => {
    if (state.decisionResponse === 'rejeitada') return decision.durationBefore;
    if (state.decisionResponse === 'ajustada' && state.adjustedDuration !== null)
      return state.adjustedDuration;
    if (state.decisionResponse === 'aceita') return decision.durationAfter;
    return decision.durationAfter;
  }, [state.decisionResponse, state.adjustedDuration, decision]);

  const effectiveSets = useMemo(() => {
    if (state.decisionResponse === 'rejeitada') return decision.setsBefore;
    if (state.decisionResponse === 'ajustada' && state.adjustedDuration !== null) {
      // Aproximação simples e determinística: 1 série a cada ~5 minutos extras.
      const extra = Math.max(0, state.adjustedDuration - decision.durationAfter);
      return Math.min(decision.setsBefore, decision.setsAfter + Math.floor(extra / 5));
    }
    return decision.setsAfter;
  }, [state.decisionResponse, state.adjustedDuration, decision]);

  const planIsAdapted =
    state.decisionResponse !== 'rejeitada' && decision.actionType !== 'manter' && state.checkInDone;

  const openSheet = useCallback(
    (id: SheetId, payload?: string) => dispatch({ type: 'sheet', sheet: id, payload }),
    [],
  );
  const closeSheet = useCallback(() => dispatch({ type: 'sheet', sheet: null }), []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      decision,
      effectiveDuration,
      effectiveSets,
      planIsAdapted,
      openSheet,
      closeSheet,
    }),
    [state, decision, effectiveDuration, effectiveSets, planIsAdapted, openSheet, closeSheet],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa estar dentro de StoreProvider');
  return ctx;
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
