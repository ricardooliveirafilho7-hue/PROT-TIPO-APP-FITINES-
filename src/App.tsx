import { useEffect, useRef, useState } from 'react';
import { Icon, IconButton, Toast, type IconName } from './system';
import { Welcome } from './screens/Welcome';
import { Onboarding } from './screens/Onboarding';
import { Today } from './screens/Today';
import { Plan } from './screens/Plan';
import { Workout } from './screens/Workout';
import { LiveWorkout } from './screens/LiveWorkout';
import { Progress } from './screens/Progress';
import { Sheets } from './screens/sheets';
import { GuidePanel } from './Guide';
import { useStore, type Tab } from './state/store';
import { USER } from './engine/data';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'hoje', label: 'Hoje', icon: 'today' },
  { id: 'plano', label: 'Plano', icon: 'plan' },
  { id: 'treino', label: 'Treino', icon: 'workout' },
  { id: 'progresso', label: 'Progresso', icon: 'progress' },
];

const TAB_TITLE: Record<Tab, { eyebrow: string; title: string }> = {
  hoje: { eyebrow: 'Terça-feira, 4 de agosto', title: `Olá, ${USER.name}` },
  plano: { eyebrow: '3 a 9 de agosto', title: 'Plano Vivo' },
  treino: { eyebrow: 'Hoje, 17h30', title: 'Treino' },
  progresso: { eyebrow: 'Últimas 4 semanas', title: 'Progresso' },
};

function AppShell() {
  const { state, dispatch, openSheet } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Ao trocar de aba, volta ao topo e devolve o foco ao título.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setScrolled(false);
  }, [state.tab]);

  const meta = TAB_TITLE[state.tab];

  return (
    <div className="app">
      <div className="topbar glass-nav" style={scrolled ? undefined : { background: 'transparent' }}>
        {/* O mascote aparece uma única vez por tela, junto da decisão — nunca acima dela. */}
        <div className="topbar__text">
          <p className="topbar__eyebrow">{meta.eyebrow}</p>
          <h1 className="t-page">{meta.title}</h1>
        </div>
        <div className="topbar__actions">
          {state.connectivity !== 'online' && (
            <IconButton
              icon={state.connectivity === 'offline' ? 'offline' : 'sync'}
              label={
                state.connectivity === 'offline'
                  ? 'Você está offline. Dados locais disponíveis.'
                  : 'Sincronização pendente'
              }
              onClick={() => dispatch({ type: 'sync-now' })}
            />
          )}
          <IconButton icon="settings" label="Preferências" onClick={() => openSheet('settings')} />
        </div>
      </div>

      <div
        className="app__scroll"
        ref={scrollRef}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}
      >
        {state.tab === 'hoje' && <Today />}
        {state.tab === 'plano' && <Plan />}
        {state.tab === 'treino' && <Workout />}
        {state.tab === 'progresso' && <Progress />}
      </div>

      <nav className="tabbar glass-nav" aria-label="Navegação principal">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tabbar__item"
            aria-current={state.tab === t.id ? 'page' : undefined}
            onClick={() => dispatch({ type: 'tab', tab: t.id })}
          >
            <Icon name={t.icon} size={20} strokeWidth={state.tab === t.id ? 2.1 : 1.7} />
            <span className="tabbar__label">{t.label}</span>
            <span className="tabbar__dot" aria-hidden="true" />
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const { state, dispatch } = useStore();

  const undo = (action?: string) => {
    if (!action) return;
    if (action.startsWith('undo-substitute')) {
      const id = action.split(':')[1];
      const next = { ...state.substitutions };
      delete next[id];
      dispatch({ type: 'pref', patch: { substitutions: next } });
    }
    if (action === 'undo-accept' || action === 'undo-adjust' || action === 'undo-reject') {
      dispatch({ type: 'decision-response', response: 'pendente' });
      dispatch({ type: 'pref', patch: { adjustedDuration: null } });
    }
    dispatch({ type: 'toast', toast: null });
  };

  return (
    <div className="stage">
      <div className="stage__frame">
        {state.route === 'welcome' && <Welcome />}
        {state.route === 'onboarding' && <Onboarding />}
        {state.route === 'app' && <AppShell />}

        {/* Treino ao vivo ocupa a shell inteira, sem navegação principal */}
        {state.route === 'app' &&
          (state.workoutPhase === 'live' || state.workoutPhase === 'paused') && <LiveWorkout />}

        <Sheets />

        {/* O toast só aparece quando não há sheet aberto: ele confirma uma ação
            concluída, não compete com a camada em foco. */}
        {state.toast && state.sheet === null && (
          <Toast
            message={state.toast.message}
            actionLabel={state.toast.actionLabel}
            onAction={state.toast.action ? () => undo(state.toast?.action) : undefined}
            onDismiss={() => dispatch({ type: 'toast', toast: null })}
          />
        )}
      </div>

      <aside className="stage__side">
        <GuidePanel />
      </aside>
    </div>
  );
}
