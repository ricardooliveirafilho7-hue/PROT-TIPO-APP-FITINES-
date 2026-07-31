/**
 * Tela Plano — Plano Vivo semanal, semana atualizada, comparação antes/depois,
 * conflitos, revisão semanal e histórico de decisões.
 */

import { Banner, Button, Chip, Icon } from '../system';
import { AdaptiveWeek, DecisionTimeline, WeekCompare, WeekImpactList } from '../nivor/components';
import { DECISION_HISTORY, WEEK } from '../engine/data';
import { useStore } from '../state/store';
import type { WeekSession } from '../engine/types';

export function Plan() {
  const { state, dispatch, decision, effectiveDuration, effectiveSets, planIsAdapted, openSheet } =
    useStore();

  const sessions: WeekSession[] = WEEK.map((s) => {
    if (s.id === 'w-ter') {
      return {
        ...s,
        status: state.workoutCompleted ? 'concluida' : planIsAdapted ? 'adaptada' : 'hoje',
        durationMin: effectiveDuration,
        detail: state.workoutCompleted
          ? `${effectiveSets} séries · concluído às 18h22`
          : planIsAdapted
            ? `${effectiveSets} séries em vez de ${decision.setsBefore} · 17h30`
            : `${decision.setsBefore} séries · 17h30`,
        changedByToday: planIsAdapted,
      };
    }
    if (s.id === 'w-sex' && planIsAdapted) {
      return {
        ...s,
        durationMin: 66,
        detail: '13 séries + extensão lombar movida de hoje · 17h30',
        changedByToday: true,
      };
    }
    return s;
  });

  const changedDays = sessions.filter((s) => s.changedByToday).length;

  return (
    <div className="app__content">
      {/* Resumo da semana: o que mudou hoje, em uma frase */}
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Resumo da semana</p>
            <p className="t-caption">5 sessões planejadas · 1 concluída · hipertrofia</p>
          </div>
          {planIsAdapted ? (
            <Chip tone="informative" icon="edit">
              {changedDays === 1 ? '1 dia mudou' : `${changedDays} dias mudaram`}
            </Chip>
          ) : (
            <Chip tone="neutral" icon="keep">
              Sem mudanças
            </Chip>
          )}
        </div>

        {planIsAdapted ? (
          <>
            <p className="t-body-2">
              A decisão de hoje condensou Costas + Bíceps para {effectiveDuration} minutos e moveu a
              extensão lombar para sexta. Nenhum treino foi perdido e nenhum outro dia mudou.
            </p>
            <div className="row row--wrap" style={{ gap: 6 }}>
              <Chip tone="neutral">Frequência preservada: 5 sessões</Chip>
              <Chip tone="neutral">Volume da semana: 74 → 72 séries</Chip>
            </div>
            <div className="btn-row">
              <Button variant="secondary" size="sm" onClick={() => openSheet('diff')} icon="condense">
                Ver antes e depois
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => dispatch({ type: 'decision-response', response: 'rejeitada' })}
                icon="undo"
              >
                Desfazer
              </Button>
            </div>
          </>
        ) : (
          <p className="t-body-2">
            {state.decisionResponse === 'rejeitada'
              ? 'Você manteve o plano original. Sua escolha foi registrada e não é tratada como erro.'
              : 'Nenhuma alteração foi aplicada nesta semana até agora.'}
          </p>
        )}
      </div>

      {/* Plano Vivo */}
      <div className="section-head">
        <h2 className="t-section">Plano Vivo</h2>
        <span className="t-caption">Toque em um dia</span>
      </div>
      <AdaptiveWeek sessions={sessions} onSelect={(id) => openSheet('session-detail', id)} />

      {/* Conflito de agenda */}
      <div className="section-head">
        <h2 className="t-section">Conflitos</h2>
      </div>
      {state.checkIn.scheduleChanged ? (
        <Banner
          tone="caution"
          icon="calendar"
          title="Quinta-feira: compromisso às 18h"
          action={
            <div className="btn-row" style={{ marginTop: 'var(--space-300)' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  dispatch({
                    type: 'toast',
                    toast: {
                      message: 'Quinta segue como descanso. Nenhuma sessão foi movida.',
                      actionLabel: 'Desfazer',
                    },
                  })
                }
              >
                Manter descanso
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() =>
                  dispatch({
                    type: 'toast',
                    toast: { message: 'Cardio leve movido para as 7h de quinta.' },
                  })
                }
              >
                Mover cardio para 7h
              </Button>
            </div>
          }
        >
          Quinta já era um dia de descanso, então o compromisso não afeta nenhuma sessão de força.
          Você só precisa decidir se quer manter o cardio leve.
        </Banner>
      ) : (
        <div className="card card--tight">
          <div className="row">
            <span className="changelist__icon" style={{ color: 'var(--status-positive)' }}>
              <Icon name="check" size={13} strokeWidth={2.2} />
            </span>
            <p className="t-body-2 grow">Nenhum conflito de agenda nesta semana.</p>
          </div>
        </div>
      )}

      {/* Impacto da decisão atual */}
      {planIsAdapted && (
        <>
          <div className="section-head">
            <h2 className="t-section">Impacto da decisão de hoje</h2>
          </div>
          <div className="card">
            <WeekImpactList decision={decision} />
          </div>
        </>
      )}

      {/* Comparação */}
      <div className="section-head">
        <h2 className="t-section">Plano anterior e plano atualizado</h2>
      </div>
      <WeekCompare decision={decision} />

      {/* Revisão semanal */}
      <div className="section-head">
        <h2 className="t-section">Revisão semanal</h2>
        <span className="t-caption">Domingo</span>
      </div>
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Balanço da semana passada</p>
            <p className="t-caption">4 de 5 sessões · 58 de 72 séries planejadas</p>
          </div>
          <Chip tone="neutral" icon="history">
            Pronta
          </Chip>
        </div>
        <Button variant="secondary" onClick={() => openSheet('week-review')} icon="history">
          Abrir revisão semanal
        </Button>
      </div>

      {/* Histórico de decisões */}
      <div className="section-head">
        <h2 className="t-section">Decisões anteriores</h2>
        <Button variant="tertiary" size="sm" onClick={() => openSheet('history')}>
          Ver tudo
        </Button>
      </div>
      <div className="card">
        <DecisionTimeline records={DECISION_HISTORY.slice(0, 2)} />
      </div>
    </div>
  );
}
