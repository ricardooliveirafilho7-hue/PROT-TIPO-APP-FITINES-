/**
 * Todas as camadas transitórias: check-in, explicação, comparação,
 * confiança, ajuste, rejeição, substituição, edição de série, pós-treino,
 * revisão semanal, histórico, detalhe de sessão, desconforto, integrações
 * e qualidade dos dados.
 */

import { useState } from 'react';
import {
  Banner,
  Button,
  Chip,
  ChipSet,
  CoachMessage,
  ConfidenceIndicator,
  Icon,
  Scale,
  Sheet,
  Stepper,
} from '../system';
import { DecisionDiff, DecisionTimeline, WeekCompare, WeekImpactList } from '../nivor/components';
import {
  DECISION_HISTORY,
  PLANNED_DURATION,
  SUBSTITUTIONS,
  TODAY_EXERCISES,
  USER,
  WEEK,
  formatHours,
} from '../engine/data';
import { CONFIDENCE_DISCLAIMER, CONFIDENCE_LABEL, RULE_VERSION } from '../engine/decision';
import { useStore } from '../state/store';
import type { DiscomfortLevel } from '../engine/types';

export function Sheets() {
  const { state, dispatch, decision, effectiveDuration, effectiveSets, closeSheet, openSheet } =
    useStore();

  switch (state.sheet) {
    case 'checkin':
      return <CheckInSheet />;
    case 'explanation':
      return <ExplanationSheet />;
    case 'diff':
      return <DiffSheet />;
    case 'confidence':
      return <ConfidenceSheet />;
    case 'adjust':
      return <AdjustSheet />;
    case 'reject':
      return <RejectSheet />;
    case 'substitute':
      return <SubstituteSheet />;
    case 'edit-set':
      return <EditSetSheet />;
    case 'post-workout':
      return <PostWorkoutSheet />;
    case 'week-review':
      return <WeekReviewSheet />;
    case 'history':
      return (
        <Sheet
          title="Histórico de decisões"
          subtitle="O que o Nivor recomendou e o que você escolheu"
          onClose={closeSheet}
          solid
        >
          <DecisionTimeline records={DECISION_HISTORY} />
          <Banner tone="neutral" icon="info" title="Memória de decisão">
            O Nivor registra a decisão, a versão da regra ({RULE_VERSION}) e a sua resposta. Rejeitar
            uma recomendação nunca é tratado como erro — é informação sobre a sua preferência.
          </Banner>
        </Sheet>
      );
    case 'session-detail':
      return <SessionDetailSheet />;
    case 'discomfort':
      return <DiscomfortSheet />;
    case 'integrations':
      return (
        <Sheet
          title="Conectar dados de saúde"
          subtitle="Opcional — o Nivor funciona sem isso"
          onClose={closeSheet}
          footer={
            <>
              <Button
                variant="primary"
                block
                onClick={() => {
                  dispatch({ type: 'toggle-integration' });
                  closeSheet();
                }}
              >
                Conectar sono e frequência cardíaca
              </Button>
              <Button variant="tertiary" block onClick={closeSheet}>
                Continuar sem conectar
              </Button>
            </>
          }
        >
          <div className="stack">
            <div className="card card--tight">
              <p className="t-card-title">Qual dado</p>
              <p className="t-body-2">Duração do sono e frequência cardíaca de repouso.</p>
            </div>
            <div className="card card--tight">
              <p className="t-card-title">Para quê</p>
              <p className="t-body-2">
                Preencher automaticamente o campo de sono do check-in e melhorar a confiança dos dias
                em que você esquecer de responder.
              </p>
            </div>
            <div className="card card--tight">
              <p className="t-card-title">O que continua funcionando sem isso</p>
              <p className="t-body-2">
                Tudo. Plano, decisão diária, explicação, treino ao vivo e revisão semanal não dependem
                de nenhum dispositivo.
              </p>
            </div>
            <div className="card card--tight">
              <p className="t-card-title">Como revogar</p>
              <p className="t-body-2">
                Em Progresso, na seção Origem dos dados, a qualquer momento. Os dados já importados
                podem ser apagados junto.
              </p>
            </div>
            <p className="t-caption">
              Neste protótipo nenhuma permissão real é solicitada e nenhum dado de saúde é lido.
            </p>
          </div>
        </Sheet>
      );
    case 'data-quality':
      return (
        <Sheet title="Origem e qualidade dos dados" onClose={closeSheet} solid>
          <div className="stack stack--sm">
            {[
              {
                label: 'Sono de hoje',
                value:
                  state.checkIn.sleepHours !== null
                    ? `${formatHours(state.checkIn.sleepHours)} · informado por você às 06h52`
                    : 'Não informado hoje',
                fresh: state.checkIn.sleepHours !== null,
              },
              {
                label: 'Energia',
                value:
                  state.checkIn.energy !== null
                    ? `${state.checkIn.energy} de 5 · informado por você às 06h52`
                    : 'Não informado hoje',
                fresh: state.checkIn.energy !== null,
              },
              {
                label: 'Tempo disponível',
                value:
                  state.checkIn.availableMinutes !== null
                    ? `${state.checkIn.availableMinutes} min · informado por você às 06h52`
                    : 'Não informado hoje',
                fresh: state.checkIn.availableMinutes !== null,
              },
              {
                label: 'Sessões de costas',
                value: 'Calculado a partir dos seus 3 últimos treinos',
                fresh: true,
              },
              {
                label: 'Padrão de sono',
                value: `${USER.sleepBaselineLabel} · média das últimas 2 semanas`,
                fresh: true,
              },
              {
                label: 'Variabilidade da frequência cardíaca',
                value: 'Indisponível · nenhum dispositivo conectado',
                fresh: false,
              },
            ].map((r) => (
              <div className="row row--between" key={r.label} style={{ paddingBlock: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="grow">
                  <p className="t-body-2 t-strong">{r.label}</p>
                  <p className="t-caption">{r.value}</p>
                </div>
                <Chip tone={r.fresh ? 'positive' : 'neutral'}>{r.fresh ? 'Atual' : 'Ausente'}</Chip>
              </div>
            ))}
          </div>
          <Banner tone="neutral" icon="info" title="Dado ausente não é dado ruim">
            Quando falta informação, o Nivor reduz a confiança e faz mudanças menores. Ele nunca
            trata a ausência como se fosse um valor zero.
          </Banner>
        </Sheet>
      );
    case 'settings':
      return <SettingsSheet />;
    default:
      return null;
  }

  /* ------------------------------ Check-in ------------------------------- */

  function CheckInSheet() {
    const c = state.checkIn;
    const answered = [c.sleepHours, c.energy, c.discomfortLevel, c.availableMinutes].filter(
      (v) => v !== null,
    ).length;

    return (
      <Sheet
        title="Check-in de hoje"
        subtitle="Quatro perguntas · cerca de 20 segundos · você pode pular qualquer uma"
        onClose={closeSheet}
        solid
        footer={
          <>
            <div className="progressdots" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`progressdots__dot${i < answered ? ' progressdots__dot--on' : ''}`} />
              ))}
            </div>
            <Button
              variant="primary"
              block
              onClick={() => dispatch({ type: 'checkin-submit' })}
              disabled={answered === 0}
            >
              {answered === 4 ? 'Ver a recomendação de hoje' : `Continuar com ${answered} de 4 respostas`}
            </Button>
            <Button
              variant="tertiary"
              block
              size="sm"
              onClick={() => dispatch({ type: 'prefill-official-checkin' })}
            >
              Preencher com o cenário do Rafael (demonstração)
            </Button>
          </>
        }
      >
        <Stepper
          label="Quanto você dormiu?"
          value={c.sleepHours !== null ? Math.round(c.sleepHours * 60) : null}
          fallback={Math.round(USER.sleepBaseline * 60)}
          onChange={(v) => dispatch({ type: 'checkin-patch', patch: { sleepHours: v / 60 } })}
          min={180}
          max={720}
          step={15}
          unit=""
          format={(v) => formatHours(v / 60)}
          optionalNote={`Seu padrão recente é ${USER.sleepBaselineLabel}.`}
        />

        <Scale
          label="Como está sua energia?"
          value={c.energy}
          onChange={(v) => dispatch({ type: 'checkin-patch', patch: { energy: v } })}
          anchors={['1 · muito baixa', '5 · muito alta']}
        />

        <ChipSet<DiscomfortLevel>
          label="Existe desconforto que afete o treino?"
          hint="Se houver, diga o quanto incomoda. O Nivor não avalia a causa."
          options={[
            { value: 'nenhum', label: 'Nenhum' },
            { value: 'leve', label: 'Leve' },
            { value: 'moderado', label: 'Moderado' },
            { value: 'forte', label: 'Forte' },
          ]}
          value={c.discomfortLevel}
          onChange={(v) =>
            dispatch({
              type: 'checkin-patch',
              patch: {
                discomfortLevel: v,
                discomfortRegion: v === 'nenhum' ? null : (c.discomfortRegion ?? 'Pernas (quadríceps)'),
              },
            })
          }
        />

        {c.discomfortLevel && c.discomfortLevel !== 'nenhum' && (
          <ChipSet
            hint="Onde?"
            options={[
              { value: 'Pernas (quadríceps)', label: 'Pernas' },
              { value: 'Costas', label: 'Costas' },
              { value: 'Ombros', label: 'Ombros' },
              { value: 'Braços', label: 'Braços' },
            ]}
            value={c.discomfortRegion}
            onChange={(v) => dispatch({ type: 'checkin-patch', patch: { discomfortRegion: v } })}
          />
        )}

        <Stepper
          label="Quanto tempo você tem hoje?"
          value={c.availableMinutes}
          fallback={PLANNED_DURATION}
          onChange={(v) => dispatch({ type: 'checkin-patch', patch: { availableMinutes: v } })}
          min={20}
          max={120}
          step={5}
          unit="min"
          optionalNote={`A sessão planejada para hoje leva ${PLANNED_DURATION} minutos.`}
        />

        <ChipSet
          label="Algo mudou na sua agenda? (opcional)"
          options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' },
          ]}
          value={c.scheduleChanged === null ? null : c.scheduleChanged ? 'sim' : 'nao'}
          onChange={(v) => dispatch({ type: 'checkin-patch', patch: { scheduleChanged: v === 'sim' } })}
          optionalNote="Responder esta pergunta aumenta a confiança da recomendação."
        />

        <p className="t-caption">
          Você pode pular qualquer pergunta. Com menos respostas o Nivor mantém o seu plano em vez de
          adivinhar.
        </p>
      </Sheet>
    );
  }

  /* ----------------------------- Explicação ------------------------------ */

  function ExplanationSheet() {
    return (
      <Sheet
        title="Por que esta recomendação"
        subtitle={`${decision.id} · ${RULE_VERSION}`}
        onClose={closeSheet}
        solid
        footer={
          <Button variant="secondary" block onClick={() => openSheet('diff')} icon="condense">
            Ver a comparação antes e depois
          </Button>
        }
      >
        <div className="card card--tight">
          <p className="t-label">Ação</p>
          <p className="t-body t-strong">{decision.headline}</p>
          <p className="t-body-2">{decision.shortReason}</p>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Fatores considerados
          </p>
          <div className="stack stack--sm">
            {decision.supportingSignals.map((s) => (
              <div className="row" key={s.label} style={{ alignItems: 'flex-start', gap: 10 }}>
                <span
                  className="changelist__icon"
                  style={{
                    color:
                      s.direction === 'favoravel'
                        ? 'var(--status-positive)'
                        : s.direction === 'limitante'
                          ? 'var(--status-caution)'
                          : 'var(--icon-secondary)',
                  }}
                >
                  <Icon
                    name={s.direction === 'favoravel' ? 'check' : s.direction === 'limitante' ? 'minus' : 'info'}
                    size={13}
                    strokeWidth={2.2}
                  />
                </span>
                <div className="grow">
                  <p className="t-body-2 t-strong">
                    {s.label}
                    <span className="t-caption">
                      {' · '}
                      {s.direction === 'favoravel'
                        ? 'favorável'
                        : s.direction === 'limitante'
                          ? 'limitante'
                          : 'contextual'}
                    </span>
                  </p>
                  <p className="t-caption">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Dados utilizados
          </p>
          <ul className="guide__list t-body-2">
            {decision.usedData.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Dados ausentes
          </p>
          <ul className="guide__list t-body-2">
            {decision.missingData.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Fatores ignorados de propósito
          </p>
          <ul className="guide__list t-body-2">
            {decision.ignoredFactors.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Alternativas avaliadas e descartadas
          </p>
          <div className="stack stack--sm">
            {decision.rejectedAlternatives.map((a) => (
              <div className="card card--tight" key={a.label}>
                <p className="t-body-2 t-strong">{a.label}</p>
                <p className="t-caption">{a.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card card--tight">
          <div className="row row--between row--wrap">
            <ConfidenceIndicator level={decision.confidence} />
            <span className="t-caption">Válida até {decision.validUntil}</span>
          </div>
          <p className="t-body-2">{decision.confidenceReason}</p>
          <p className="t-caption">{CONFIDENCE_DISCLAIMER}</p>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Impacto no restante da semana
          </p>
          <WeekImpactList decision={decision} />
        </div>

        <Banner tone="neutral" icon="clock" title="Quando será revisada">
          {decision.nextReview}. Se sua agenda ou o seu estado mudarem antes disso, você pode refazer o
          check-in a qualquer momento.
        </Banner>

        <p className="t-caption">
          Esta é uma recomendação de treino gerada por regras determinísticas. Não é diagnóstico, não
          é prescrição e não substitui um profissional de Educação Física.
        </p>
      </Sheet>
    );
  }

  /* -------------------------- Comparação / Diff -------------------------- */

  function DiffSheet() {
    return (
      <Sheet
        title="Antes e depois"
        subtitle={`${decision.durationBefore} min · ${decision.setsBefore} séries → ${effectiveDuration} min · ${effectiveSets} séries`}
        onClose={closeSheet}
        solid
        footer={
          state.decisionResponse === 'pendente' ? (
            <>
              <Button
                variant="primary"
                block
                onClick={() => {
                  dispatch({ type: 'decision-response', response: 'aceita' });
                  dispatch({
                    type: 'toast',
                    toast: {
                      message: 'Adaptação aceita. Sexta-feira recebeu a extensão lombar.',
                      actionLabel: 'Desfazer',
                      action: 'undo-accept',
                    },
                  });
                }}
              >
                Aceitar adaptação
              </Button>
              <div className="btn-row">
                <Button variant="secondary" size="sm" onClick={() => openSheet('adjust')}>
                  Ajustar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openSheet('reject')}>
                  Manter plano original
                </Button>
              </div>
            </>
          ) : (
            <Button variant="secondary" block onClick={closeSheet}>
              Fechar
            </Button>
          )
        }
      >
        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            O que mudou na sessão de hoje
          </p>
          <DecisionDiff changes={decision.changes} />
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Exercício por exercício
          </p>
          <div className="stack stack--sm">
            {TODAY_EXERCISES.map((ex) => {
              const changed = ex.adaptedSets !== ex.plannedSets;
              return (
                <div className="row row--between" key={ex.id} style={{ paddingBlock: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="grow">
                    <p className="t-body-2 t-strong">{ex.name}</p>
                    {ex.movedTo && <p className="t-caption">Movido para {ex.movedTo}</p>}
                  </div>
                  <span className="row" style={{ gap: 6 }}>
                    <span className={`t-caption${changed ? ' diffstrip__before' : ''}`}>
                      {ex.plannedSets} séries
                    </span>
                    {changed && (
                      <>
                        <Icon name="chevron-right" size={12} strokeWidth={2.4} />
                        <span className="t-body-2 diffstrip__after">
                          {ex.adaptedSets === 0 ? 'sexta' : `${ex.adaptedSets} séries`}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            O que isso faz com a semana
          </p>
          <WeekCompare decision={decision} />
        </div>

        <CoachMessage state="atento" mascotVisible={state.mascotVisible}>
          Nenhuma sessão foi perdida e o grupo planejado continua o mesmo. A diferença na semana é de
          duas séries.
        </CoachMessage>
      </Sheet>
    );
  }

  /* ------------------------------ Confiança ------------------------------ */

  function ConfidenceSheet() {
    return (
      <Sheet
        title="O que significa a confiança"
        onClose={closeSheet}
        solid
        footer={
          <Button variant="secondary" block onClick={() => openSheet('checkin')} icon="edit">
            Completar o check-in de hoje
          </Button>
        }
      >
        <div className="card card--tight">
          <ConfidenceIndicator level={decision.confidence} />
          <p className="t-body-2">{decision.confidenceReason}</p>
        </div>

        <Banner tone="caution" icon="info" title="Não é uma probabilidade de acerto">
          {CONFIDENCE_DISCLAIMER}
        </Banner>

        <div className="stack stack--sm">
          {(['alta', 'moderada', 'baixa', 'insuficiente'] as const).map((lvl) => (
            <div
              className="card card--tight"
              key={lvl}
              style={
                lvl === decision.confidence
                  ? { borderColor: 'var(--border-selected)', background: 'var(--surface-selected)' }
                  : undefined
              }
            >
              <div className="row row--between">
                <p className="t-body-2 t-strong">{CONFIDENCE_LABEL[lvl]}</p>
                {lvl === decision.confidence && <Chip tone="informative">Hoje</Chip>}
              </div>
              <p className="t-caption">
                {lvl === 'alta' && 'Dados atuais, consistentes e histórico suficiente.'}
                {lvl === 'moderada' && 'Dados atuais, mas histórico curto ou sinais mistos.'}
                {lvl === 'baixa' && 'Faltam dados ou os sinais se contradizem. Mudanças ficam menores.'}
                {lvl === 'insuficiente' && 'Não há base para adaptar. O plano original é mantido.'}
              </p>
            </div>
          ))}
        </div>

        <div className="card card--tight">
          <p className="t-card-title">O que melhoraria a confiança hoje</p>
          <ul className="guide__list t-body-2">
            {decision.missingData.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </Sheet>
    );
  }

  /* -------------------------------- Ajustar ------------------------------ */

  function AdjustSheet() {
    const [minutes, setMinutes] = useState(state.adjustedDuration ?? effectiveDuration);
    const estimatedSets = Math.min(
      decision.setsBefore,
      decision.setsAfter + Math.floor(Math.max(0, minutes - decision.durationAfter) / 5),
    );

    return (
      <Sheet
        title="Ajustar a sessão de hoje"
        subtitle="Você edita os detalhes sem descartar a lógica toda"
        onClose={closeSheet}
        solid
        footer={
          <>
            <Button
              variant="primary"
              block
              onClick={() => {
                dispatch({ type: 'adjust-duration', minutes });
                dispatch({
                  type: 'toast',
                  toast: {
                    message: `Sessão ajustada para ${minutes} minutos e ${estimatedSets} séries.`,
                    actionLabel: 'Desfazer',
                    action: 'undo-adjust',
                  },
                });
              }}
            >
              Aplicar {minutes} minutos
            </Button>
            <Button variant="tertiary" block onClick={closeSheet}>
              Cancelar
            </Button>
          </>
        }
      >
        <Stepper
          label="Duração da sessão"
          value={minutes}
          onChange={setMinutes}
          min={25}
          max={90}
          step={5}
          unit="min"
        />

        <div className="card card--tight">
          <div className="row row--between">
            <span className="t-body-2">Séries estimadas</span>
            <span className="t-body-2 t-strong t-num">{estimatedSets}</span>
          </div>
          <div className="row row--between">
            <span className="t-body-2">Exercícios prioritários</span>
            <span className="t-body-2 t-strong">
              {minutes >= 40 ? 'Preservados' : 'Apenas puxada e remada'}
            </span>
          </div>
          <div className="row row--between">
            <span className="t-body-2">Impacto na semana</span>
            <span className="t-body-2 t-strong">
              {minutes >= decision.durationBefore ? 'Nenhum' : 'Extensão lombar na sexta'}
            </span>
          </div>
        </div>

        {minutes < 35 && (
          <Banner tone="caution" icon="info" title="Sessão bem curta">
            Com menos de 35 minutos, sobram apenas os dois exercícios principais. Ainda é uma sessão
            válida, com menos volume para as costas nesta semana.
          </Banner>
        )}

        <p className="t-caption">
          Ajustar não é rejeitar. O Nivor mantém o motivo original da adaptação e registra a sua
          preferência de duração.
        </p>
      </Sheet>
    );
  }

  /* ------------------------------- Rejeitar ------------------------------ */

  function RejectSheet() {
    const [reason, setReason] = useState<string | null>(null);
    return (
      <Sheet
        title="Manter o plano original"
        subtitle={`${decision.durationBefore} minutos · ${decision.setsBefore} séries`}
        onClose={closeSheet}
        solid
        footer={
          <>
            <Button
              variant="primary"
              block
              onClick={() => {
                dispatch({ type: 'decision-response', response: 'rejeitada', reason });
                dispatch({
                  type: 'toast',
                  toast: {
                    message: 'Plano original mantido. Sua escolha foi registrada.',
                    actionLabel: 'Desfazer',
                    action: 'undo-reject',
                  },
                });
              }}
            >
              Manter plano original
            </Button>
            <Button variant="tertiary" block onClick={closeSheet}>
              Voltar
            </Button>
          </>
        }
      >
        <Banner tone="neutral" icon="info" title="Sua escolha não é tratada como erro">
          O Nivor registra a rejeição para aprender sua preferência. Depois do treino, ele vai
          perguntar como a sessão foi.
        </Banner>

        <ChipSet
          label="Quer dizer o motivo? (opcional)"
          options={[
            { value: 'tempo', label: 'Consigo o tempo todo hoje' },
            { value: 'leve', label: 'A redução ficou leve demais' },
            { value: 'pesada', label: 'A redução ficou pesada demais' },
            { value: 'prefiro', label: 'Prefiro seguir meu plano' },
            { value: 'nao-entendi', label: 'Não entendi a mudança' },
          ]}
          value={reason}
          onChange={setReason}
          stack
        />

        <div className="card card--tight">
          <p className="t-card-title">O que volta ao plano original</p>
          <ul className="guide__list t-body-2">
            <li>Remada apoiada volta para 3 séries</li>
            <li>Rosca inclinada volta para 3 séries</li>
            <li>Extensão lombar permanece hoje e sai da sexta</li>
            <li>Duração volta para {decision.durationBefore} minutos</li>
          </ul>
        </div>
      </Sheet>
    );
  }

  /* ----------------------------- Substituição ---------------------------- */

  function SubstituteSheet() {
    const exId = state.sheetPayload ?? 'ex-remada-apoiada';
    const exercise = TODAY_EXERCISES.find((e) => e.id === exId);
    const options = SUBSTITUTIONS[exId] ?? SUBSTITUTIONS['ex-remada-apoiada'];
    const [reason, setReason] = useState<string | null>('ocupado');

    return (
      <Sheet
        title="Substituir exercício"
        subtitle={exercise?.name}
        onClose={closeSheet}
        solid
      >
        <ChipSet
          label="Por que substituir?"
          options={[
            { value: 'ocupado', label: 'Equipamento ocupado' },
            { value: 'indisponivel', label: 'Equipamento indisponível' },
            { value: 'desconforto', label: 'Desconforto no movimento' },
            { value: 'preferencia', label: 'Preferência' },
          ]}
          value={reason}
          onChange={setReason}
        />

        <div>
          <p className="t-label" style={{ marginBottom: 'var(--space-200)' }}>
            Alternativas equivalentes
          </p>
          <div className="stack stack--sm">
            {options.map((o) => (
              <div className="card card--tight" key={o.id}>
                <div className="row row--between">
                  <div className="grow">
                    <p className="t-body-2 t-strong">{o.name}</p>
                    <p className="t-caption">{o.equipment}</p>
                  </div>
                  {!o.available && <Chip tone="caution">Ocupado agora</Chip>}
                </div>
                <p className="t-caption">
                  <span className="t-strong">Por que é equivalente:</span> {o.why}
                </p>
                <p className="t-caption">
                  <span className="t-strong">O que muda:</span> {o.impact}
                </p>
                <Button
                  variant={o.available ? 'secondary' : 'tertiary'}
                  size="sm"
                  disabled={!o.available}
                  onClick={() =>
                    dispatch({
                      type: 'substitute',
                      exerciseId: exId,
                      name: o.name,
                      equipment: o.equipment,
                    })
                  }
                >
                  {o.available ? 'Usar este exercício' : 'Indisponível agora'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <p className="t-caption">
          A substituição vale apenas para hoje. O Nivor registra o motivo para propor melhor da
          próxima vez.
        </p>
      </Sheet>
    );
  }

  /* ---------------------------- Edição de série -------------------------- */

  function EditSetSheet() {
    const [exId, idxStr, field] = (state.sheetPayload ?? '::').split(':');
    const index = Number(idxStr);
    const set = (state.sets[exId] ?? []).find((s) => s.index === index);
    const exercise = TODAY_EXERCISES.find((e) => e.id === exId);
    const [value, setValue] = useState<number>(
      field === 'load' ? (set?.load ?? 0) : field === 'reps' ? (set?.reps ?? 10) : (set?.rir ?? 2),
    );

    if (!set || !exercise) return null;

    const config =
      field === 'load'
        ? { label: 'Carga', min: 0, max: 200, step: 2, unit: 'kg' }
        : field === 'reps'
          ? { label: 'Repetições', min: 1, max: 40, step: 1, unit: 'reps' }
          : { label: 'Repetições em reserva (RIR)', min: 0, max: 6, step: 1, unit: 'RIR' };

    return (
      <Sheet
        title={`${config.label} · série ${index}`}
        subtitle={exercise.name}
        onClose={closeSheet}
        solid
        footer={
          <>
            <Button
              variant="primary"
              block
              onClick={() =>
                dispatch({
                  type: 'set-update',
                  exerciseId: exId,
                  index,
                  patch:
                    field === 'load' ? { load: value } : field === 'reps' ? { reps: value } : { rir: value },
                })
              }
            >
              Salvar
            </Button>
            <Button variant="tertiary" block onClick={closeSheet}>
              Cancelar
            </Button>
          </>
        }
      >
        <Stepper
          label={config.label}
          value={value}
          onChange={setValue}
          min={config.min}
          max={config.max}
          step={config.step}
          unit={config.unit}
        />

        <div className="card card--tight">
          <p className="t-card-title">Referência</p>
          <p className="t-body-2">Última sessão: {exercise.lastSession}</p>
          <p className="t-body-2">
            Alvo de hoje: {exercise.repRange} repetições com RIR {exercise.targetRir}
          </p>
        </div>

        {field === 'rir' && (
          <Banner tone="neutral" icon="info" title="O que é RIR">
            Repetições em reserva: quantas você ainda conseguiria fazer ao encerrar a série. RIR 2
            significa parar duas repetições antes da falha.
          </Banner>
        )}

        {field === 'load' && (
          <div className="btn-row">
            <Button variant="secondary" size="sm" onClick={() => setValue(exercise.suggestedLoad)}>
              Repetir carga anterior
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setValue(Math.max(0, value - 5))}>
              Reduzir 5 kg
            </Button>
          </div>
        )}
      </Sheet>
    );
  }

  /* ------------------------------ Pós-treino ----------------------------- */

  function PostWorkoutSheet() {
    const [feeling, setFeeling] = useState<string | null>(state.postWorkoutFeeling);
    const [effort, setEffort] = useState<number | null>(7);
    const done = Object.values(state.sets)
      .flat()
      .filter((s) => s.done).length;
    const volume = Object.entries(state.sets).reduce((acc, [, sets]) => {
      return acc + sets.filter((s) => s.done).reduce((a, s) => a + s.load * s.reps, 0);
    }, 0);

    return (
      <Sheet
        title="Treino concluído"
        subtitle={`Costas + Bíceps · ${effectiveDuration} min`}
        onClose={closeSheet}
        solid
        footer={
          <>
            <Button
              variant="primary"
              block
              onClick={() => {
                if (feeling) dispatch({ type: 'post-workout', feeling });
                dispatch({ type: 'tab', tab: 'plano' });
                dispatch({
                  type: 'toast',
                  toast: { message: 'Resultado registrado. Sua semana foi atualizada.' },
                });
              }}
            >
              Ver o impacto na semana
            </Button>
            <Button variant="tertiary" block onClick={closeSheet}>
              Fechar
            </Button>
          </>
        }
      >
        <div className="card card--tight">
          <div className="hero__meta" style={{ borderBlock: 'none', paddingBlock: 0 }}>
            <div className="hero__meta-item">
              <span className="t-label">Séries</span>
              <span className="hero__meta-value">{done}</span>
            </div>
            <div className="hero__meta-item">
              <span className="t-label">Volume</span>
              <span className="hero__meta-value">{(volume / 1000).toFixed(1)} t</span>
            </div>
            <div className="hero__meta-item">
              <span className="t-label">Duração</span>
              <span className="hero__meta-value">{effectiveDuration} min</span>
            </div>
          </div>
        </div>

        <div className="card card--tight">
          <p className="t-card-title">Comparação com o planejado</p>
          <div className="compare__line">
            <span>Planejado originalmente</span>
            <span>
              {decision.setsBefore} séries · {decision.durationBefore} min
            </span>
          </div>
          <div className="compare__line compare__line--changed">
            <span>Recomendado hoje</span>
            <span>
              {effectiveSets} séries · {effectiveDuration} min
            </span>
          </div>
          <div className="compare__line compare__line--changed">
            <span>Realizado</span>
            <span>{done} séries</span>
          </div>
        </div>

        <Scale
          label="Como foi o esforço da sessão?"
          hint="De 1, muito fácil, a 10, máximo. Usamos junto com a duração."
          value={effort !== null ? Math.min(5, Math.ceil(effort / 2)) : null}
          onChange={(v) => setEffort(v * 2)}
          anchors={['1 · muito fácil', '5 · máximo']}
        />

        <ChipSet
          label="A sessão pareceu adequada?"
          options={[
            { value: 'adequada', label: 'Adequada' },
            { value: 'leve', label: 'Leve demais' },
            { value: 'pesada', label: 'Pesada demais' },
            { value: 'curta', label: 'Faltou tempo' },
          ]}
          value={feeling}
          onChange={setFeeling}
        />

        {feeling === 'leve' && (
          <Banner tone="informative" icon="info" title="Registrado">
            Se isso se repetir, o Nivor vai condensar menos em dias parecidos. Uma única resposta não
            muda a regra.
          </Banner>
        )}

        <div className="card card--tight">
          <p className="t-card-title">O que isso atualiza</p>
          <ul className="guide__list t-body-2">
            <li>Costas e bíceps passam a contar 7 dias até a próxima exposição</li>
            <li>A carga da puxada alta entra na sua tendência de progressão</li>
            <li>A semana fica com 72 séries realizadas de 74 planejadas</li>
            <li>A próxima revisão acontece amanhã às 7h</li>
          </ul>
        </div>

        <CoachMessage state="celebrando" mascotVisible={state.mascotVisible}>
          Sessão condensada e concluída. A semana continua completa: nenhum treino foi perdido.
        </CoachMessage>
      </Sheet>
    );
  }

  /* --------------------------- Revisão semanal --------------------------- */

  function WeekReviewSheet() {
    return (
      <Sheet
        title="Revisão semanal"
        subtitle="Semana de 27 de julho a 2 de agosto"
        onClose={closeSheet}
        solid
        footer={
          <>
            <Button
              variant="primary"
              block
              onClick={() => {
                closeSheet();
                dispatch({
                  type: 'toast',
                  toast: { message: 'Próxima semana confirmada com 5 sessões.' },
                });
              }}
            >
              Aceitar a próxima semana
            </Button>
            <Button variant="tertiary" block onClick={closeSheet}>
              Ajustar prioridades
            </Button>
          </>
        }
      >
        <div className="card card--tight">
          <p className="t-card-title">O que aconteceu</p>
          <div className="stack stack--sm">
            {[
              { label: 'Sessões realizadas', value: '4 de 5' },
              { label: 'Séries realizadas', value: '58 de 72' },
              { label: 'Adaptações aceitas', value: '2 de 3' },
              { label: 'Check-ins concluídos', value: '6 de 7' },
            ].map((r) => (
              <div className="row row--between" key={r.label}>
                <span className="t-body-2">{r.label}</span>
                <span className="t-body-2 t-strong t-num">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card--tight">
          <p className="t-card-title">O que funcionou</p>
          <p className="t-body-2">
            As duas sessões condensadas foram concluídas integralmente. Nas semanas em que você
            aceitou condensar, a taxa de conclusão foi maior do que quando manteve a sessão longa.
          </p>
          <p className="t-caption">
            Baseado em 6 sessões comparáveis. É uma associação observada, não uma relação de causa.
          </p>
        </div>

        <div className="card card--tight">
          <p className="t-card-title">O que ainda está incerto</p>
          <p className="t-body-2">
            Quatro semanas ainda são poucas para dizer se a redução de volume afetou seu progresso em
            costas. Precisaríamos de mais duas ou três exposições comparáveis.
          </p>
        </div>

        <div className="card card--tight">
          <p className="t-card-title">Sessão perdida na sexta</p>
          <p className="t-body-2">
            Você não treinou na sexta-feira passada. O Nivor não vai tentar compensar essa sessão. A
            semana recomeça do estado atual.
          </p>
        </div>

        <div className="card card--tight">
          <p className="t-card-title">Proposta para a próxima semana</p>
          <ul className="guide__list t-body-2">
            <li>Manter 5 sessões e a prioridade em costas</li>
            <li>Reduzir a sessão de sexta para 60 minutos, que é quando você tem menos tempo</li>
            <li>Aumentar 2,5 kg na puxada alta se o RIR se mantiver em 2</li>
          </ul>
        </div>

        <CoachMessage state="neutro" mascotVisible={state.mascotVisible}>
          Uma semana com quatro sessões e duas adaptações conscientes é uma boa semana. Constância
          flexível conta mais do que uma sequência perfeita.
        </CoachMessage>
      </Sheet>
    );
  }

  /* --------------------------- Detalhe de sessão ------------------------- */

  function SessionDetailSheet() {
    const session = WEEK.find((w) => w.id === state.sheetPayload) ?? WEEK[1];
    const isToday = session.id === 'w-ter';

    return (
      <Sheet title={session.title} subtitle={`${session.dayLabel}, ${session.dayNumber} de agosto`} onClose={closeSheet} solid
        footer={
          isToday ? (
            <Button
              variant="primary"
              block
              icon="play"
              onClick={() => {
                closeSheet();
                dispatch({ type: 'tab', tab: 'treino' });
              }}
            >
              Abrir treino de hoje
            </Button>
          ) : (
            <Button variant="secondary" block onClick={closeSheet}>
              Fechar
            </Button>
          )
        }
      >
        <div className="card card--tight">
          <div className="row row--between row--wrap" style={{ gap: 8 }}>
            <Chip tone="neutral" icon="clock">
              {session.durationMin ? `${session.durationMin} min` : 'Sem sessão'}
            </Chip>
            {session.locked && (
              <Chip tone="neutral" icon="shield">
                Dia fixo — não é movido automaticamente
              </Chip>
            )}
            {session.changedByToday && (
              <Chip tone="informative" icon="edit">
                Alterado pela decisão de hoje
              </Chip>
            )}
          </div>
          <p className="t-body-2">{session.detail}</p>
        </div>

        {session.status === 'concluida' && (
          <div className="card card--tight">
            <p className="t-card-title">Resultado</p>
            <p className="t-body-2">
              14 séries realizadas de 14 planejadas. Esforço 7 de 10. Nenhuma substituição.
            </p>
          </div>
        )}

        {session.status === 'descanso' && (
          <Banner tone="neutral" icon="keep" title="Descanso é parte do plano">
            Este dia não conta como falha e não reduz a sua consistência.
          </Banner>
        )}

        {session.id === 'w-sex' && (
          <div className="card card--tight">
            <p className="t-card-title">O que mudou aqui</p>
            <p className="t-body-2">
              A extensão lombar de hoje foi movida para esta sessão. A duração passa de 60 para 66
              minutos.
            </p>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => openSheet('diff')}
              icon="condense"
            >
              Ver a comparação
            </Button>
          </div>
        )}

        <div className="card card--tight">
          <p className="t-card-title">Opções</p>
          <div className="btn-row">
            <Button
              variant="secondary"
              size="sm"
              icon="move"
              disabled={session.locked}
              onClick={() => {
                closeSheet();
                dispatch({
                  type: 'toast',
                  toast: {
                    message: session.locked
                      ? 'Dia fixo não é movido.'
                      : 'Compare as datas viáveis antes de confirmar.',
                  },
                });
              }}
            >
              {session.locked ? 'Dia fixo' : 'Mover sessão'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="shield"
              onClick={() => {
                closeSheet();
                dispatch({
                  type: 'toast',
                  toast: {
                    message: session.locked
                      ? 'Dia desbloqueado. Agora pode ser movido.'
                      : 'Dia marcado como fixo. Não será movido automaticamente.',
                  },
                });
              }}
            >
              {session.locked ? 'Desbloquear dia' : 'Marcar como fixo'}
            </Button>
          </div>
        </div>
      </Sheet>
    );
  }

  /* ------------------------------ Desconforto ---------------------------- */

  function DiscomfortSheet() {
    const [level, setLevel] = useState<DiscomfortLevel | null>(null);
    const [region, setRegion] = useState<string | null>(null);
    const severe = level === 'forte';

    return (
      <Sheet
        title="Informar desconforto"
        subtitle="O Nivor não avalia a causa e não dá diagnóstico"
        onClose={closeSheet}
        solid
        footer={
          <>
            <Button
              variant="primary"
              block
              disabled={!level}
              onClick={() => {
                if (severe) {
                  dispatch({ type: 'report-discomfort' });
                  dispatch({
                    type: 'checkin-patch',
                    patch: { discomfortLevel: 'forte', discomfortRegion: region },
                  });
                  dispatch({ type: 'tab', tab: 'hoje' });
                } else {
                  dispatch({
                    type: 'checkin-patch',
                    patch: { discomfortLevel: level, discomfortRegion: region },
                  });
                  closeSheet();
                  dispatch({
                    type: 'toast',
                    toast: { message: 'Desconforto registrado. A sessão de hoje foi revista.' },
                  });
                }
              }}
            >
              {severe ? 'Interromper as recomendações' : 'Registrar'}
            </Button>
            <Button variant="tertiary" block onClick={closeSheet}>
              Cancelar
            </Button>
          </>
        }
      >
        <ChipSet<DiscomfortLevel>
          label="Quanto incomoda?"
          options={[
            { value: 'leve', label: 'Leve', description: 'Percebo, mas não muda a execução' },
            { value: 'moderado', label: 'Moderado', description: 'Muda como eu executo o movimento' },
            { value: 'forte', label: 'Forte', description: 'Impede ou piora durante o movimento' },
          ]}
          value={level}
          onChange={setLevel}
          stack
        />

        <ChipSet
          label="Onde?"
          options={[
            { value: 'Ombro', label: 'Ombro' },
            { value: 'Costas', label: 'Costas' },
            { value: 'Cotovelo', label: 'Cotovelo' },
            { value: 'Pernas (quadríceps)', label: 'Pernas' },
          ]}
          value={region}
          onChange={setRegion}
        />

        {severe && (
          <Banner tone="critical" icon="alert" title="Com desconforto forte, o Nivor para aqui">
            Não vamos adaptar nem sugerir outro exercício. Desconforto incomum merece atenção.
            Considere interromper e buscar orientação de um profissional habilitado que possa avaliar
            você diretamente.
          </Banner>
        )}

        {level === 'moderado' && (
          <Banner tone="caution" icon="info" title="O que acontece">
            Os exercícios que exigem essa região saem da sessão de hoje. O restante do treino
            continua, e o Nivor revisa isso amanhã.
          </Banner>
        )}

        <p className="t-caption">
          Este protótipo é uma pesquisa de produto. Ele não avalia condições de saúde e não substitui
          um profissional habilitado.
        </p>
      </Sheet>
    );
  }

  /* ------------------------------ Preferências --------------------------- */

  function SettingsSheet() {
    return (
      <Sheet title="Preferências" onClose={closeSheet} solid>
        <div className="card card--tight">
          <p className="t-card-title">Perfil</p>
          <div className="stack stack--sm">
            {[
              { label: 'Nome', value: USER.name },
              { label: 'Objetivo', value: USER.goal },
              { label: 'Experiência', value: USER.level },
              { label: 'Frequência', value: `${USER.weeklyFrequency} treinos por semana` },
              { label: 'Usando o Nivor há', value: `${USER.weekOfUse} semanas` },
            ].map((r) => (
              <div className="row row--between" key={r.label}>
                <span className="t-body-2">{r.label}</span>
                <span className="t-body-2 t-strong">{r.value}</span>
              </div>
            ))}
          </div>
          <p className="t-caption">Dados fictícios. Nenhum dado pessoal real é usado no protótipo.</p>
        </div>

        <div className="card card--tight">
          <p className="t-card-title">Nível de automação</p>
          <ChipSet
            options={[
              { value: 'manual', label: 'Só sugerir', description: 'Nada muda sem você confirmar' },
              {
                value: 'assistido',
                label: 'Assistido',
                description: 'Pequenas mudanças após confirmação rápida',
              },
            ]}
            value="assistido"
            onChange={() => undefined}
            stack
          />
        </div>

        <div className="card card--tight">
          <p className="t-card-title">Seus dados</p>
          <div className="stack stack--sm">
            <Button variant="secondary" size="sm" icon="history">
              Exportar meus dados
            </Button>
            <Button variant="destructive" size="sm">
              Excluir todos os dados
            </Button>
          </div>
          <p className="t-caption">
            Exportação e exclusão nunca ficam bloqueadas. Neste protótipo, os botões não executam
            nenhuma operação real.
          </p>
        </div>
      </Sheet>
    );
  }
}
