/**
 * Tela Treino — detalhes da sessão e pré-treino.
 * O treino ao vivo é uma shell separada (LiveWorkout).
 */

import { Banner, Button, Chip, Icon } from '../system';
import { TODAY_EXERCISES } from '../engine/data';
import { useStore } from '../state/store';

export function Workout() {
  const { state, dispatch, decision, effectiveDuration, effectiveSets, planIsAdapted, openSheet } =
    useStore();

  const rejected = state.decisionResponse === 'rejeitada';
  const exercises = TODAY_EXERCISES.filter((e) => (rejected ? e.plannedSets > 0 : e.adaptedSets > 0));
  const moved = TODAY_EXERCISES.filter((e) => !rejected && e.adaptedSets === 0 && e.movedTo);

  if (state.workoutCompleted) {
    return (
      <div className="app__content">
        <div className="card">
          <div className="card__head">
            <div className="card__head-text">
              <p className="t-card-title">Costas + Bíceps concluído</p>
              <p className="t-caption">Hoje, 17h30 · {effectiveDuration} min</p>
            </div>
            <Chip tone="positive" icon="check">
              Concluído
            </Chip>
          </div>
          <Button variant="primary" onClick={() => openSheet('post-workout')} icon="trend">
            Ver resumo da sessão
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              dispatch({ type: 'workout-phase', phase: 'idle' });
              dispatch({ type: 'pref', patch: { workoutCompleted: false } });
            }}
            icon="undo"
          >
            Reabrir sessão de hoje (demonstração)
          </Button>
        </div>
        <Banner tone="informative" icon="calendar" title="Próxima sessão">
          Quarta-feira, Pernas, 75 minutos. O Nivor revisará essa sessão amanhã de manhã com o seu
          próximo check-in.
        </Banner>
      </div>
    );
  }

  return (
    <div className="app__content">
      {/* Pré-treino */}
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Costas + Bíceps</p>
            <p className="t-caption">Hoje, 17h30 · academia completa</p>
          </div>
          {planIsAdapted ? (
            <Chip tone="informative" icon="condense">
              Adaptado
            </Chip>
          ) : (
            <Chip tone="neutral" icon="keep">
              Original
            </Chip>
          )}
        </div>

        <div className="hero__meta" style={{ borderBlock: '1px solid var(--border-subtle)' }}>
          <div className="hero__meta-item">
            <span className="t-label">Duração</span>
            <span className="hero__meta-value">{effectiveDuration} min</span>
          </div>
          <div className="hero__meta-item">
            <span className="t-label">Séries</span>
            <span className="hero__meta-value">{rejected ? decision.setsBefore : effectiveSets}</span>
          </div>
          <div className="hero__meta-item">
            <span className="t-label">Exercícios</span>
            <span className="hero__meta-value">{exercises.length}</span>
          </div>
        </div>

        {planIsAdapted && (
          <div className="row row--wrap" style={{ gap: 6 }}>
            <Chip tone="informative" icon="minus">
              1 série de remada
            </Chip>
            <Chip tone="informative" icon="minus">
              1 série de rosca
            </Chip>
            <Chip tone="informative" icon="target">
              Sem falha nos compostos
            </Chip>
          </div>
        )}

        <Button
          variant="primary"
          block
          icon="play"
          onClick={() => dispatch({ type: 'workout-phase', phase: 'live' })}
        >
          Iniciar treino
        </Button>
        <div className="btn-row">
          <Button variant="secondary" size="sm" onClick={() => openSheet('adjust')} icon="clock">
            Tenho menos tempo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openSheet('discomfort')} icon="flag">
            Informar desconforto
          </Button>
        </div>
      </div>

      <Banner tone="offline" icon="offline" title="Disponível sem internet">
        A sessão inteira está salva neste aparelho. Você pode registrar as séries mesmo sem conexão.
      </Banner>

      {/* Lista de exercícios — superfície sólida */}
      <div className="section-head">
        <h2 className="t-section">Exercícios</h2>
        <span className="t-caption">{exercises.length} nesta sessão</span>
      </div>

      <div className="stack stack--sm">
        {exercises.map((ex, i) => {
          const sub = state.substitutions[ex.id];
          const sets = rejected ? ex.plannedSets : ex.adaptedSets;
          const reduced = !rejected && ex.adaptedSets < ex.plannedSets;
          return (
            <div className="exercise" key={ex.id}>
              <div className="exercise__head">
                <span className="exercise__index t-num">{i + 1}</span>
                <div className="grow">
                  <p className="t-body-2 t-strong">{sub?.name ?? ex.name}</p>
                  <p className="t-caption">
                    {sub?.equipment ?? ex.equipment} · {ex.muscle}
                  </p>
                </div>
                <span className="t-body-2 t-num" style={{ color: 'var(--text-secondary)' }}>
                  {sets} × {ex.repRange}
                </span>
              </div>
              <div className="exercise__body">
                <div className="row row--wrap" style={{ gap: 6, paddingBlock: 4 }}>
                  <Chip tone="neutral">RIR alvo {ex.targetRir}</Chip>
                  <Chip tone="neutral">Descanso {ex.restSeconds}s</Chip>
                  {ex.priority === 'principal' && <Chip tone="neutral" icon="target">Prioritário</Chip>}
                  {reduced && (
                    <Chip tone="informative" icon="minus">
                      {ex.plannedSets} → {ex.adaptedSets} séries
                    </Chip>
                  )}
                  {sub && (
                    <Chip tone="informative" icon="swap">
                      Substituído
                    </Chip>
                  )}
                </div>
                <p className="t-caption">Última sessão: {ex.lastSession}</p>
                {reduced && ex.note && <p className="t-caption">{ex.note}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercícios movidos */}
      {moved.length > 0 && (
        <>
          <div className="section-head">
            <h2 className="t-section">Movido para outro dia</h2>
          </div>
          {moved.map((ex) => (
            <div className="card card--tight" key={ex.id}>
              <div className="row">
                <span className="changelist__icon">
                  <Icon name="move" size={13} strokeWidth={2.2} />
                </span>
                <div className="grow">
                  <p className="t-body-2 t-strong">{ex.name}</p>
                  <p className="t-caption">
                    {ex.plannedSets} séries · agora em {ex.movedTo}
                  </p>
                </div>
              </div>
              <p className="t-caption">{ex.note}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
