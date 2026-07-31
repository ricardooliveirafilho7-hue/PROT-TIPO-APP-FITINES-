/**
 * Treino ao vivo (LiveWorkoutShell + ExerciseBlock + SetRow).
 *
 * Prioriza velocidade e legibilidade: superfícies sólidas, sem blur,
 * alvos grandes, uma mão, sem animação longa. Estados: em andamento,
 * pausado, restaurado, offline, desconforto.
 */

import { Banner, Button, Chip, Icon, IconButton } from '../system';
import { TODAY_EXERCISES } from '../engine/data';
import { formatClock, useStore } from '../state/store';

export function LiveWorkout() {
  const { state, dispatch, effectiveDuration, openSheet } = useStore();

  const rejected = state.decisionResponse === 'rejeitada';
  const exercises = TODAY_EXERCISES.filter((e) => (rejected ? e.plannedSets > 0 : e.adaptedSets > 0));

  const allSets = exercises.flatMap((e) => state.sets[e.id] ?? []);
  const doneCount = allSets.filter((s) => s.done).length;
  const totalCount = allSets.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const paused = state.workoutPhase === 'paused';

  return (
    <div className="live">
      {/* Shell reduzida: sem navegação principal durante o treino */}
      <div className="live__bar">
        <IconButton
          icon="chevron-left"
          label="Sair do treino sem perder o registro"
          onClick={() => dispatch({ type: 'workout-phase', phase: 'pre' })}
        />
        <div className="grow">
          <p className="t-body-2 t-strong">Costas + Bíceps</p>
          <p className="t-caption t-num">
            {doneCount} de {totalCount} séries · meta {effectiveDuration} min
          </p>
        </div>
        <span className="live__timer t-num" aria-label={`Tempo de treino: ${formatClock(state.elapsedSeconds)}`}>
          {formatClock(state.elapsedSeconds)}
        </span>
        <IconButton
          icon={paused ? 'play' : 'pause'}
          label={paused ? 'Retomar treino' : 'Pausar treino'}
          onClick={() => dispatch({ type: 'workout-phase', phase: paused ? 'live' : 'paused' })}
        />
      </div>
      <div className="live__progress" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={totalCount} aria-label="Progresso da sessão">
        <div className="live__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="live__scroll">
        {paused && (
          <Banner
            tone="caution"
            icon="pause"
            title="Treino pausado"
            action={
              <div className="btn-row" style={{ marginTop: 'var(--space-300)' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon="play"
                  onClick={() => dispatch({ type: 'workout-phase', phase: 'live' })}
                >
                  Retomar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch({ type: 'workout-phase', phase: 'finished' })}
                >
                  Concluir como está
                </Button>
              </div>
            }
          >
            Suas {doneCount} séries já registradas estão salvas. O cronômetro parou e nada será
            perdido se você fechar o aplicativo.
          </Banner>
        )}

        {state.discomfortReported && (
          <Banner tone="critical" icon="alert" title="Desconforto registrado nesta sessão">
            Interrompa este exercício se o desconforto continuar. O Nivor não vai sugerir novos
            exercícios para esse grupo até você revisar esta informação. Se o sintoma persistir ou
            preocupar você, procure orientação de um profissional habilitado.
          </Banner>
        )}

        {state.connectivity === 'offline' && (
          <Banner tone="offline" icon="offline" title="Registrando neste aparelho">
            Sem conexão agora. Suas séries são salvas localmente e sincronizadas depois.
          </Banner>
        )}

        {state.restSeconds !== null && state.restSeconds > 0 && (
          <div className="rest" role="timer" aria-live="off">
            <Icon name="clock" size={19} />
            <div className="grow">
              <p className="t-body-2 t-strong">Descanso</p>
              <p className="t-caption">Próxima série quando quiser</p>
            </div>
            <span className="rest__time t-num">{formatClock(state.restSeconds)}</span>
            <Button variant="tertiary" size="sm" onClick={() => dispatch({ type: 'rest-stop' })}>
              Pular
            </Button>
          </div>
        )}

        {exercises.map((ex, i) => {
          const sets = state.sets[ex.id] ?? [];
          const sub = state.substitutions[ex.id];
          const isCurrent = ex.id === state.currentExerciseId;
          const allDone = sets.length > 0 && sets.every((s) => s.done);

          return (
            <section
              key={ex.id}
              className={[
                'exercise',
                isCurrent ? 'exercise--current' : '',
                allDone ? 'exercise--done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Exercício ${i + 1}: ${sub?.name ?? ex.name}`}
            >
              <div className="exercise__head">
                <span className="exercise__index t-num">{i + 1}</span>
                <div className="grow">
                  <p className="t-body-2 t-strong">{sub?.name ?? ex.name}</p>
                  <p className="t-caption">
                    {sub?.equipment ?? ex.equipment} · alvo {ex.repRange} reps · RIR {ex.targetRir}
                  </p>
                  <p className="t-caption">Última sessão: {ex.lastSession}</p>
                </div>
                {allDone && (
                  <Chip tone="positive" icon="check">
                    Feito
                  </Chip>
                )}
              </div>

              <div className="exercise__body">
                {/* Cabeçalho da tabela de séries */}
                <div className="setrow setrow--head" aria-hidden="true">
                  <span className="t-label" style={{ textAlign: 'center' }}>
                    #
                  </span>
                  <span className="t-label">Carga</span>
                  <span className="t-label">Reps</span>
                  <span className="t-label">RIR</span>
                  <span />
                </div>

                {sets.map((s) => (
                  <div
                    className={`setrow${s.done ? ' setrow--done' : ''}`}
                    key={s.index}
                    role="group"
                    aria-label={`Série ${s.index}`}
                  >
                    <span className="setrow__idx t-num">{s.index}</span>
                    <button
                      type="button"
                      className="setrow__field"
                      onClick={() => openSheet('edit-set', `${ex.id}:${s.index}:load`)}
                      aria-label={`Carga da série ${s.index}: ${s.load} quilos. Toque para editar.`}
                    >
                      {s.load}
                      <span className="setrow__field-unit">kg</span>
                    </button>
                    <button
                      type="button"
                      className="setrow__field"
                      onClick={() => openSheet('edit-set', `${ex.id}:${s.index}:reps`)}
                      aria-label={`Repetições da série ${s.index}: ${s.reps}. Toque para editar.`}
                    >
                      {s.reps}
                      <span className="setrow__field-unit">rep</span>
                    </button>
                    <button
                      type="button"
                      className="setrow__field"
                      onClick={() => openSheet('edit-set', `${ex.id}:${s.index}:rir`)}
                      aria-label={`Repetições em reserva da série ${s.index}: ${s.rir}. Toque para editar.`}
                    >
                      {s.rir}
                    </button>
                    <button
                      type="button"
                      className="setrow__check"
                      aria-pressed={s.done}
                      aria-label={
                        s.done ? `Desmarcar série ${s.index}` : `Concluir série ${s.index}`
                      }
                      onClick={() => {
                        dispatch({ type: 'set-toggle', exerciseId: ex.id, index: s.index });
                        dispatch({ type: 'current-exercise', id: ex.id });
                        if (!s.done) dispatch({ type: 'rest-start', seconds: ex.restSeconds });
                      }}
                    >
                      <Icon name="check" size={21} strokeWidth={2.6} />
                    </button>
                  </div>
                ))}

                {/* Ações secundárias compactas: não competem com as linhas de série */}
                <div className="exercise__actions">
                  <button
                    type="button"
                    className="exercise__action"
                    onClick={() => dispatch({ type: 'set-add', exerciseId: ex.id })}
                  >
                    <Icon name="plus" size={14} strokeWidth={2.2} />
                    Série
                  </button>
                  <button
                    type="button"
                    className="exercise__action"
                    onClick={() => openSheet('substitute', ex.id)}
                  >
                    <Icon name="swap" size={14} strokeWidth={2.2} />
                    Substituir
                  </button>
                  <button
                    type="button"
                    className="exercise__action"
                    onClick={() => openSheet('discomfort', ex.id)}
                  >
                    <Icon name="flag" size={14} strokeWidth={2.2} />
                    Desconforto
                  </button>
                </div>

                {ex.note && !rejected && <p className="t-caption">{ex.note}</p>}
              </div>
            </section>
          );
        })}
      </div>

      <div className="live__foot">
        <Button
          variant="primary"
          block
          icon="check"
          onClick={() => {
            dispatch({ type: 'workout-phase', phase: 'finished' });
            openSheet('post-workout');
          }}
        >
          {doneCount === totalCount ? 'Concluir treino' : `Concluir com ${doneCount} de ${totalCount} séries`}
        </Button>
        <p className="t-caption" style={{ textAlign: 'center' }}>
          Tudo é salvo automaticamente. Sair não apaga nenhuma série registrada.
        </p>
      </div>
    </div>
  );
}
