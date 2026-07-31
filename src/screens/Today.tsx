/**
 * Tela Hoje — estados normal, adaptado, baixa confiança, dados insuficientes,
 * segurança, carregando, offline, sincronização pendente, erro recuperável,
 * treino concluído.
 *
 * Hierarquia: a decisão vem primeiro. Estado do dia, linha do tempo e
 * gamificação ficam abaixo dela e com peso visual menor.
 */

import { Banner, Button, Chip, CoachMessage, Icon, LoadingBlock } from '../system';
import { DecisionHero } from '../nivor/DecisionHero';
import { ReadinessSummary } from '../nivor/components';
import { MUSCLE_STATES, USER, formatHours } from '../engine/data';
import { useStore } from '../state/store';

export function Today() {
  const {
    state,
    dispatch,
    decision,
    effectiveDuration,
    effectiveSets,
    openSheet,
  } = useStore();

  if (state.loading) {
    return (
      <div className="app__content">
        <LoadingBlock label="Carregando a recomendação de hoje" />
        <div className="card" aria-hidden="true">
          <div className="skeleton" style={{ height: 12, width: '30%' }} />
          <div className="skeleton" style={{ height: 64 }} />
        </div>
      </div>
    );
  }

  const safety = decision.safetyState === 'bloqueio';
  const needsCheckIn = !state.checkInDone;

  const readiness = [
    {
      id: 'sono',
      label: 'Sono',
      value: state.checkIn.sleepHours !== null ? formatHours(state.checkIn.sleepHours) : '—',
      note:
        state.checkIn.sleepHours !== null
          ? `Padrão: ${USER.sleepBaselineLabel}`
          : 'Sem registro hoje',
      icon: 'moon' as const,
    },
    {
      id: 'energia',
      label: 'Energia',
      value: state.checkIn.energy !== null ? `${state.checkIn.energy}/5` : '—',
      note: state.checkIn.energy !== null ? 'Informada hoje' : 'Sem registro hoje',
      icon: 'bolt' as const,
    },
    {
      id: 'grupos',
      label: 'Costas e bíceps',
      value: 'Adequados',
      note: 'Há 7 dias',
      icon: 'pulse' as const,
    },
    {
      id: 'tempo',
      label: 'Tempo hoje',
      value:
        state.checkIn.availableMinutes !== null ? `${state.checkIn.availableMinutes} min` : '—',
      note: state.checkIn.availableMinutes !== null ? 'Informado hoje' : 'Sem registro hoje',
      icon: 'clock' as const,
    },
  ];

  return (
    <div className="app__content">
      {/* Estados de sistema aparecem antes da decisão apenas quando afetam a confiança nela */}
      {state.connectivity === 'offline' && (
        <Banner tone="offline" icon="offline" title="Você está offline — dados locais disponíveis">
          Seu plano de hoje e seu treino estão salvos neste aparelho. Nada será perdido.
          {state.pendingOperations > 0 && (
            <> {state.pendingOperations} registro(s) aguardam sincronização.</>
          )}
        </Banner>
      )}

      {state.connectivity === 'sync_pendente' && (
        <Banner
          tone="informative"
          icon="sync"
          title="Sincronização pendente"
          action={
            <div style={{ marginTop: 'var(--space-200)' }}>
              <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'sync-now' })} icon="sync">
                Sincronizar agora
              </Button>
            </div>
          }
        >
          {state.pendingOperations || 4} registro(s) do seu treino estão salvos neste aparelho e serão
          enviados quando a conexão estabilizar.
        </Banner>
      )}

      {state.recoverableError && (
        <Banner
          tone="caution"
          icon="alert"
          title="Não foi possível atualizar agora"
          action={
            <div className="row" style={{ marginTop: 'var(--space-200)', gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch({ type: 'recoverable-error', value: false })}
                icon="sync"
              >
                Tentar novamente
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => dispatch({ type: 'recoverable-error', value: false })}
              >
                Usar dados anteriores
              </Button>
            </div>
          }
        >
          Estamos mostrando a recomendação gerada às 06h52. O treino e o registro continuam
          funcionando normalmente.
        </Banner>
      )}

      {/* Check-in pendente: pedido curto, acima da decisão provisória */}
      {needsCheckIn && !safety && (
        <Banner
          tone="informative"
          icon="question"
          title="Duas ou três respostas melhoram a recomendação de hoje"
          action={
            <div style={{ marginTop: 'var(--space-300)' }}>
              <Button variant="primary" size="sm" onClick={() => openSheet('checkin')} icon="play">
                Fazer check-in · 20 segundos
              </Button>
            </div>
          }
        >
          Sem elas, o Nivor mantém o seu plano original em vez de adivinhar.
        </Banner>
      )}

      {/* 1 — DECISÃO. Sempre o primeiro elemento de conteúdo. */}
      <DecisionHero
        decision={decision}
        response={state.decisionResponse}
        effectiveDuration={effectiveDuration}
        effectiveSets={effectiveSets}
        mascotVisible={state.mascotVisible}
        onPrimary={() => {
          if (safety) {
            dispatch({ type: 'tab', tab: 'plano' });
            return;
          }
          if (decision.actionType === 'pedir_dados' && !state.checkInDone) {
            openSheet('checkin');
            return;
          }
          if (state.decisionResponse === 'pendente' && decision.actionType !== 'manter') {
            dispatch({ type: 'decision-response', response: 'aceita' });
            dispatch({
              type: 'toast',
              toast: {
                message: 'Adaptação aceita. Sexta-feira recebeu a extensão lombar.',
                actionLabel: 'Desfazer',
                action: 'undo-accept',
              },
            });
            return;
          }
          dispatch({ type: 'workout-phase', phase: 'pre' });
          dispatch({ type: 'tab', tab: 'treino' });
        }}
        onExplain={() => openSheet('explanation')}
        onDiff={() => openSheet('diff')}
        onAdjust={() => openSheet('adjust')}
        onKeepOriginal={() => {
          if (state.decisionResponse === 'rejeitada') {
            dispatch({ type: 'decision-response', response: 'pendente' });
            return;
          }
          openSheet('reject');
        }}
        onConfidence={() => openSheet('confidence')}
        primaryLabelOverride={safety ? 'Ver plano da semana' : undefined}
      />

      {/* Estado de segurança: orientação sóbria, superfície sólida, sem mascote */}
      {safety && (
        <Banner tone="critical" icon="alert" title="O que fazer agora">
          Interrompa o exercício se o desconforto continuar. O Nivor não avalia a causa e não fará uma
          nova recomendação até você revisar esta informação. Procure orientação de um profissional
          habilitado se o sintoma persistir ou preocupar você.
        </Banner>
      )}

      {/* Confiança baixa: explicação sóbria, sem mascote como única explicação */}
      {(decision.confidence === 'baixa' || decision.confidence === 'insuficiente') && !safety && (
        <Banner
          tone="caution"
          icon="info"
          title={
            decision.confidence === 'insuficiente'
              ? 'Dados insuficientes para adaptar'
              : 'Confiança baixa nos dados de hoje'
          }
          action={
            <div style={{ marginTop: 'var(--space-200)' }}>
              <Button variant="secondary" size="sm" onClick={() => openSheet('checkin')} icon="edit">
                Completar as respostas
              </Button>
            </div>
          }
        >
          Faltam: {decision.missingData.slice(0, 2).join(' · ')}. Com menos dados, o Nivor faz mudanças
          menores, não maiores.
        </Banner>
      )}

      {/* Treino concluído */}
      {state.workoutCompleted && (
        <div className="card">
          <div className="card__head">
            <div className="card__head-text">
              <p className="t-card-title">Treino de hoje concluído</p>
              <p className="t-caption">Costas + Bíceps · {effectiveDuration} min · {effectiveSets} séries</p>
            </div>
            <Chip tone="positive" icon="check">
              Concluído
            </Chip>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openSheet('post-workout')} icon="trend">
            Ver resumo e impacto na semana
          </Button>
        </div>
      )}

      {/* 10 — contexto complementar, sempre abaixo da decisão */}
      <div className="section-head">
        <h2 className="t-section">Estado de hoje</h2>
        <Button variant="tertiary" size="sm" onClick={() => openSheet('data-quality')}>
          Origem dos dados
        </Button>
      </div>
      <ReadinessSummary items={readiness} onSelect={() => openSheet('data-quality')} />

      <p className="t-caption">
        Estes valores descrevem o seu dia, não a sua recuperação biológica. São uma estimativa
        operacional para orientar a sessão.
      </p>

      {/* Grupos musculares — texto sempre presente */}
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Grupos da sessão de hoje</p>
            <p className="t-caption">Baseado nas suas últimas sessões e no check-in</p>
          </div>
        </div>
        <div className="stack stack--sm">
          {MUSCLE_STATES.slice(0, 2).map((m) => (
            <div className="row row--between" key={m.muscle}>
              <div>
                <p className="t-body-2 t-strong">{m.muscle}</p>
                <p className="t-caption">{m.detail}</p>
              </div>
              <Chip tone="positive">Adequado</Chip>
            </div>
          ))}
          {state.checkIn.discomfortLevel === 'moderado' && (
            <div className="row row--between">
              <div>
                <p className="t-body-2 t-strong">Quadríceps</p>
                <p className="t-caption">Desconforto moderado · não exigido hoje</p>
              </div>
              <Chip tone="caution">Fadigado</Chip>
            </div>
          )}
        </div>
        <Button variant="tertiary" size="sm" onClick={() => dispatch({ type: 'tab', tab: 'progresso' })}>
          Ver todos os grupos
        </Button>
      </div>

      {/* Linha do tempo do dia */}
      <div className="section-head">
        <h2 className="t-section">Seu dia</h2>
      </div>
      <div className="card card--tight">
        {[
          { time: '06h52', label: 'Check-in respondido', done: state.checkInDone, icon: 'check' as const },
          { time: '07h00', label: 'Recomendação gerada', done: true, icon: 'today' as const },
          {
            time: '17h30',
            label: `Costas + Bíceps · ${effectiveDuration} min`,
            done: state.workoutCompleted,
            icon: 'workout' as const,
          },
          { time: 'Amanhã 07h', label: 'Próxima revisão do plano', done: false, icon: 'clock' as const },
        ].map((i) => (
          <div className="row" key={i.time} style={{ padding: '6px 0' }}>
            <span className="changelist__icon" style={i.done ? { color: 'var(--status-positive)' } : undefined}>
              <Icon name={i.done ? 'check' : i.icon} size={13} strokeWidth={2.2} />
            </span>
            <span className="t-caption t-num" style={{ minWidth: 62 }}>
              {i.time}
            </span>
            <span className="t-body-2 grow">{i.label}</span>
          </div>
        ))}
      </div>

      {/* Coach contextual — dentro da decisão, não como aba */}
      {!safety && (
        <CoachMessage
          state="atento"
          mascotVisible={state.mascotVisible}
          source="Texto gerado a partir da regra aplicada · sem IA generativa"
        >
          A sessão de hoje continua valendo pela semana inteira: nenhum treino foi perdido e o volume
          de costas segue dentro da faixa que você vem mantendo.
        </CoachMessage>
      )}

      {/* Momentum — reconhece decisões conscientes, não pune descanso */}
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Momentum: consistente</p>
            <p className="t-caption">4 semanas registrando · 3 adaptações conscientes</p>
          </div>
          <Chip tone="positive" icon="trend">
            Estável
          </Chip>
        </div>
        <div className="meter" aria-hidden="true">
          <div className="meter__fill meter__fill--positive" style={{ width: '72%' }} />
        </div>
        <p className="t-caption">
          Descansar e ajustar contam como consistência. Você não perde progresso por não treinar um
          dia.
        </p>
      </div>
    </div>
  );
}
