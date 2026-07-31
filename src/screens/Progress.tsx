/**
 * Tela Progresso — tendências úteis com resumo textual obrigatório.
 * Nada de score decorativo, nada de causalidade a partir de correlação.
 */

import { Banner, Button, Chip } from '../system';
import {
  BarPairChart,
  ChartFrame,
  DecisionTimeline,
  LineChart,
  MuscleStateMap,
} from '../nivor/components';
import {
  DECISION_HISTORY,
  MUSCLE_STATES,
  SLEEP_HISTORY,
  STRENGTH_HISTORY,
  USER,
  VOLUME_HISTORY,
} from '../engine/data';
import { useStore } from '../state/store';

export function Progress() {
  const { state, dispatch, openSheet } = useStore();

  const acceptedCount = DECISION_HISTORY.filter((d) => d.response === 'aceita').length;

  return (
    <div className="app__content">
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Últimas 4 semanas</p>
            <p className="t-caption">Hipertrofia · 4ª semana usando o Nivor</p>
          </div>
          <Chip tone="neutral">Histórico curto</Chip>
        </div>
        <p className="t-body-2">
          Você está progredindo em costas. Nas demais áreas, quatro semanas ainda são pouco para uma
          conclusão firme — o Nivor prefere dizer isso a inventar uma tendência.
        </p>
      </div>

      {/* Força */}
      <ChartFrame
        title="Puxada alta — carga por sessão"
        period="Últimas 4 exposições comparáveis"
        summary="A carga subiu de 62 kg para 68 kg em quatro semanas, sempre com 8 a 9 repetições e RIR entre 1 e 2. É progresso provável, com 4 pontos de comparação."
        tableLabel="Ver os valores em lista"
        tableRows={STRENGTH_HISTORY.map((s) => ({ label: s.label, value: s.note }))}
      >
        <LineChart
          points={STRENGTH_HISTORY.map((s) => ({ label: s.label, value: s.value }))}
          referenceLabel="Comparação válida apenas entre sessões com o mesmo exercício, faixa de repetições e RIR."
        />
      </ChartFrame>

      {/* Volume */}
      <ChartFrame
        title="Séries por semana — planejado e realizado"
        period="Últimas 4 semanas"
        summary="Você realizou 61, 70 e 58 séries nas três primeiras semanas. A semana atual está em andamento, com 43 de 74 séries até agora — por isso aparece com marcação diferente."
        legend={[
          { color: 'var(--chart-series-secondary)', label: 'Planejado' },
          { color: 'var(--chart-series-primary)', label: 'Realizado' },
        ]}
        tableLabel="Ver os valores em lista"
        tableRows={VOLUME_HISTORY.map((v) => ({
          label: v.week,
          value: `${v.done} de ${v.planned} séries${v.partial ? ' (em andamento)' : ''}`,
        }))}
      >
        <BarPairChart data={VOLUME_HISTORY} max={80} />
      </ChartFrame>

      {/* Sono */}
      <ChartFrame
        title="Sono — últimas 6 noites"
        period="Informado por você · nenhum dispositivo conectado"
        summary={`Seu padrão recente é de ${USER.sleepBaselineLabel}. As duas últimas noites ficaram abaixo disso, sendo hoje a mais curta, com 6h18. Uma noite isolada não muda o plano; duas noites seguidas reduzem a confiança e favorecem sessões mais curtas.`}
        tableLabel="Ver as noites em lista"
        tableRows={SLEEP_HISTORY.map((s) => ({
          label: s.label,
          value: `${Math.floor(s.hours)}h${String(Math.round((s.hours % 1) * 60)).padStart(2, '0')}`,
        }))}
      >
        <LineChart
          points={SLEEP_HISTORY.map((s) => ({ label: s.label, value: s.hours }))}
          reference={USER.sleepBaseline}
          referenceLabel={`A linha tracejada marca o seu padrão recente (${USER.sleepBaselineLabel}).`}
        />
      </ChartFrame>

      {/* Estado por grupo muscular */}
      <div className="section-head">
        <h2 className="t-section">Grupos musculares</h2>
      </div>
      <div className="card">
        <p className="t-caption">
          Estimativa operacional a partir das suas sessões e do que você relatou. Não é uma medição
          do tecido muscular.
        </p>
        <MuscleStateMap items={MUSCLE_STATES} />
      </div>

      {/* Consistência — sem streak punitiva */}
      <div className="card">
        <div className="card__head">
          <div className="card__head-text">
            <p className="t-card-title">Consistência</p>
            <p className="t-caption">Semanas com pelo menos 4 sessões: 3 de 4</p>
          </div>
          <Chip tone="positive">Estável</Chip>
        </div>
        <div className="stack stack--sm">
          {[
            { label: 'Sessões planejadas × realizadas', value: '18 de 20' },
            { label: 'Adaptações aceitas', value: `${acceptedCount} de 4` },
            { label: 'Retornos após ausência', value: '1 · sem tentativa de compensar' },
            { label: 'Check-ins concluídos', value: '22 · mediana de 17 segundos' },
          ].map((r) => (
            <div className="row row--between" key={r.label}>
              <span className="t-body-2">{r.label}</span>
              <span className="t-body-2 t-strong t-num">{r.value}</span>
            </div>
          ))}
        </div>
        <p className="t-caption">
          Dias de descanso recomendados contam como semana cumprida. Não existe sequência a perder.
        </p>
      </div>

      {/* Integração não conectada */}
      <div className="section-head">
        <h2 className="t-section">Origem dos dados</h2>
      </div>
      {state.healthIntegrationConnected ? (
        <Banner
          tone="positive"
          icon="check"
          title="Integração de saúde conectada"
          action={
            <div style={{ marginTop: 'var(--space-200)' }}>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => dispatch({ type: 'toggle-integration' })}
              >
                Desconectar
              </Button>
            </div>
          }
        >
          Sono e frequência cardíaca de repouso estão sendo lidos. Última sincronização há 2 horas.
        </Banner>
      ) : (
        <Banner
          tone="neutral"
          icon="pulse"
          title="Nenhuma integração de saúde conectada"
          action={
            <div style={{ marginTop: 'var(--space-200)' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openSheet('integrations')}
                icon="info"
              >
                Ver o que mudaria
              </Button>
            </div>
          }
        >
          Todos os dados vêm dos seus check-ins e treinos. O Nivor funciona assim, sem smartwatch.
          Conectar aumentaria a confiança em alguns dias, não liberaria funções.
        </Banner>
      )}

      {/* Histórico de decisões completo */}
      <div className="section-head">
        <h2 className="t-section">Histórico de decisões</h2>
      </div>
      <div className="card">
        <DecisionTimeline records={DECISION_HISTORY} />
        <p className="t-caption">
          Cada decisão guarda a versão da regra usada, os dados considerados e a sua resposta.
        </p>
      </div>
    </div>
  );
}
