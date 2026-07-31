/**
 * Componentes de produto do Nivor:
 * DecisionDiff, AdaptiveWeek, ReadinessSummary, MuscleStateMap,
 * gráficos com resumo textual e trilha de decisões.
 */

import type { ReactNode } from 'react';
import { Chip, Icon, type ChipTone, type IconName } from '../system';
import type {
  Decision,
  DecisionChange,
  DecisionRecord,
  MuscleState,
  SessionStatus,
  WeekSession,
} from '../engine/types';

/* ------------------------------- DecisionDiff ------------------------------ */

const CHANGE_ICON: Record<DecisionChange['kind'], IconName> = {
  series: 'minus',
  intensidade: 'target',
  duracao: 'clock',
  movido: 'move',
  mantido: 'keep',
};

export function DecisionDiff({ changes }: { changes: DecisionChange[] }) {
  return (
    <ul className="changelist">
      {changes.map((c) => (
        <li key={c.id} className="changelist__item">
          <span className="changelist__icon">
            <Icon name={CHANGE_ICON[c.kind]} size={13} strokeWidth={2.2} />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span className="t-body-2 t-strong">{c.label}</span>
            <span className="row row--wrap" style={{ gap: 6 }}>
              <span className="t-caption diffstrip__before">{c.before}</span>
              <Icon name="chevron-right" size={12} strokeWidth={2.4} />
              <span className="t-caption diffstrip__after">{c.after}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Comparação lado a lado do plano da semana: antes e depois. */
export function WeekCompare({ decision }: { decision: Decision }) {
  return (
    <div className="compare">
      <div className="compare__col">
        <div className="row row--between">
          <span className="t-label">Plano original</span>
          <Chip tone="neutral">Antes</Chip>
        </div>
        <div className="compare__line compare__line--changed">
          <span>Terça · Costas + Bíceps</span>
          <span>
            {decision.durationBefore} min · {decision.setsBefore} séries
          </span>
        </div>
        <div className="compare__line">
          <span>Quarta · Pernas</span>
          <span>75 min</span>
        </div>
        <div className="compare__line">
          <span>Quinta · Descanso</span>
          <span>—</span>
        </div>
        <div className="compare__line compare__line--changed">
          <span>Sexta · Ombros + posterior</span>
          <span>60 min</span>
        </div>
        <div className="compare__line">
          <span>Total da semana</span>
          <span>74 séries</span>
        </div>
      </div>

      <div className="compare__col compare__col--after">
        <div className="row row--between">
          <span className="t-label">Plano atualizado</span>
          <Chip tone="informative">Depois</Chip>
        </div>
        <div className="compare__line compare__line--changed">
          <span>Terça · Costas + Bíceps</span>
          <span>
            {decision.durationAfter} min · {decision.setsAfter} séries
          </span>
        </div>
        <div className="compare__line">
          <span>Quarta · Pernas</span>
          <span>75 min · igual</span>
        </div>
        <div className="compare__line">
          <span>Quinta · Descanso</span>
          <span>— · igual</span>
        </div>
        <div className="compare__line compare__line--changed">
          <span>Sexta · Ombros + posterior + lombar</span>
          <span>66 min</span>
        </div>
        <div className="compare__line">
          <span>Total da semana</span>
          <span>72 séries</span>
        </div>
      </div>
    </div>
  );
}

export function WeekImpactList({ decision }: { decision: Decision }) {
  return (
    <ul className="changelist">
      {decision.weekImpact.map((i) => (
        <li key={i.day} className="changelist__item">
          <span
            className="changelist__icon"
            style={
              i.changed
                ? { background: 'var(--status-informative-surface)', color: 'var(--status-informative)' }
                : undefined
            }
          >
            <Icon name={i.changed ? 'edit' : 'keep'} size={13} strokeWidth={2.2} />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="t-body-2 t-strong">
              {i.day} {i.changed ? '· mudou' : '· sem mudança'}
            </span>
            <span className="t-caption">{i.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- AdaptiveWeek ------------------------------ */

const STATUS_META: Record<SessionStatus, { label: string; tone: ChipTone; icon?: IconName }> = {
  concluida: { label: 'Concluída', tone: 'positive', icon: 'check' },
  hoje: { label: 'Hoje', tone: 'informative', icon: 'today' },
  planejada: { label: 'Planejada', tone: 'neutral' },
  adaptada: { label: 'Adaptada', tone: 'informative', icon: 'condense' },
  movida: { label: 'Movida', tone: 'informative', icon: 'move' },
  descanso: { label: 'Descanso', tone: 'neutral' },
  revisao: { label: 'Revisão', tone: 'neutral', icon: 'history' },
  flexivel: { label: 'Flexível', tone: 'neutral' },
};

export function AdaptiveWeek({
  sessions,
  onSelect,
}: {
  sessions: WeekSession[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="week">
      {sessions.map((s) => {
        const meta = STATUS_META[s.status];
        // A âncora de "hoje" não depende do status: um dia adaptado continua sendo hoje.
        const isToday = s.id === 'w-ter';
        return (
          <button
            key={s.id}
            type="button"
            className={[
              'weekday',
              isToday ? 'weekday--today' : '',
              s.status === 'descanso' || s.status === 'revisao' ? 'weekday--rest' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(s.id)}
            aria-label={`${s.dayLabel}, dia ${s.dayNumber}. ${s.title}. ${meta.label}. ${s.detail}`}
          >
            <span className="weekday__date">
              <span className="weekday__dow">{s.dayShort}</span>
              <span className="weekday__num t-num">{s.dayNumber}</span>
            </span>
            <span className="weekday__body">
              <span
                className={`weekday__title${s.status === 'concluida' ? ' weekday__title--done' : ''}`}
              >
                {s.title}
              </span>
              <span className="t-caption">{s.detail}</span>
              <span className="weekday__tags">
                <Chip tone={meta.tone} icon={meta.icon}>
                  {meta.label}
                </Chip>
                {s.changedByToday && (
                  <Chip tone="informative" icon="edit">
                    Mudou hoje
                  </Chip>
                )}
                {s.locked && (
                  <Chip tone="neutral" icon="shield">
                    Fixo
                  </Chip>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- ReadinessSummary ---------------------------- */
/** Nunca substitui a recomendação. Fica abaixo dela na Home. */

export function ReadinessSummary({
  items,
  onSelect,
}: {
  items: { id: string; label: string; value: string; note: string; icon: IconName; tone?: ChipTone }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="readiness">
      {items.map((i) => (
        <button
          key={i.id}
          type="button"
          className="readiness__item"
          onClick={() => onSelect(i.id)}
          aria-label={`${i.label}: ${i.value}. ${i.note}. Toque para ver o detalhe.`}
        >
          <span className="t-label">{i.label}</span>
          <span className="readiness__value">{i.value}</span>
          <span className="readiness__note">
            <Icon name={i.icon} size={12} strokeWidth={2} />
            {i.note}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ MuscleStateMap ----------------------------- */
/** Lista textual acessível — não depende de mapa colorido. */

const MUSCLE_META: Record<MuscleState, { label: string; tone: ChipTone; pct: number; fill: string }> = {
  adequado: { label: 'Adequado', tone: 'positive', pct: 100, fill: 'positive' },
  moderado: { label: 'Moderado', tone: 'caution', pct: 62, fill: 'caution' },
  fadigado: { label: 'Fadigado', tone: 'caution', pct: 34, fill: 'caution' },
  desconhecido: { label: 'Sem dado', tone: 'neutral', pct: 0, fill: 'neutral' },
  bloqueado: { label: 'Bloqueado por desconforto', tone: 'critical', pct: 0, fill: 'neutral' },
};

export function MuscleStateMap({
  items,
}: {
  items: { muscle: string; state: MuscleState; detail: string }[];
}) {
  return (
    <div className="musclelist">
      {items.map((m) => {
        const meta = MUSCLE_META[m.state];
        return (
          <div className="muscleitem" key={m.muscle}>
            <div className="stack stack--sm" style={{ gap: 5 }}>
              <span className="t-body-2 t-strong">{m.muscle}</span>
              <span className="t-caption">{m.detail}</span>
              <div className="meter" aria-hidden="true">
                <div
                  className={`meter__fill meter__fill--${meta.fill}`}
                  style={{ width: `${meta.pct}%` }}
                />
              </div>
            </div>
            <Chip tone={meta.tone}>{meta.label}</Chip>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Gráficos -------------------------------- */
/** Todo gráfico tem título, período, resumo em linguagem natural e alternativa textual. */

export function ChartFrame({
  title,
  period,
  summary,
  legend,
  children,
  tableLabel,
  tableRows,
}: {
  title: string;
  period: string;
  summary: string;
  legend?: { color: string; label: string }[];
  children: ReactNode;
  tableLabel: string;
  tableRows: { label: string; value: string }[];
}) {
  return (
    <div className="card">
      <div className="card__head-text">
        <p className="t-card-title">{title}</p>
        <p className="t-caption">{period}</p>
      </div>
      <div className="chart" role="img" aria-label={`${title}. ${summary}`}>
        {children}
      </div>
      {legend && (
        <div className="chart__legend">
          {legend.map((l) => (
            <span className="chart__legend-item" key={l.label}>
              <span className="chart__swatch" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <p className="t-body-2">{summary}</p>
      <details>
        <summary className="t-caption" style={{ cursor: 'pointer' }}>
          {tableLabel}
        </summary>
        <div className="stack stack--sm" style={{ marginTop: 'var(--space-200)' }}>
          {tableRows.map((r) => (
            <div className="row row--between" key={r.label}>
              <span className="t-caption">{r.label}</span>
              <span className="t-body-2 t-num">{r.value}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export function BarPairChart({
  data,
  max,
}: {
  data: { week: string; planned: number; done: number; partial?: boolean }[];
  max: number;
}) {
  return (
    <div className="chart__bars">
      {data.map((d) => (
        <div className="chart__bar-col" key={d.week}>
          <div
            style={{
              display: 'flex',
              gap: 3,
              alignItems: 'flex-end',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <div
              className="chart__bar chart__bar--planned"
              style={{ height: `${(d.planned / max) * 100}%` }}
            />
            <div
              className={`chart__bar${d.partial ? ' chart__bar--missing' : ''}`}
              style={{ height: `${(d.done / max) * 100}%` }}
            />
          </div>
          <span className="t-caption">{d.week}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({
  points,
  reference,
  referenceLabel,
}: {
  points: { label: string; value: number }[];
  reference?: number;
  referenceLabel?: string;
}) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values, reference ?? Infinity) * 0.94;
  const max = Math.max(...values, reference ?? -Infinity) * 1.04;
  const w = 300;
  const h = 96;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y(p.value)}`).join(' ');

  return (
    <>
      <svg
        className="chart__canvas"
        viewBox={`0 -6 ${w} ${h + 12}`}
        preserveAspectRatio="none"
        style={{ height: 96 }}
        aria-hidden="true"
      >
        {reference !== undefined && (
          <line
            x1="0"
            x2={w}
            y1={y(reference)}
            y2={y(reference)}
            stroke="var(--chart-reference)"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path
          d={path}
          fill="none"
          stroke="var(--chart-series-primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle
            key={p.label}
            cx={i * step}
            cy={y(p.value)}
            r="3"
            fill="var(--chart-series-primary)"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="row row--between" style={{ gap: 4 }}>
        {points.map((p) => (
          <span className="t-caption" key={p.label} style={{ flex: 1, textAlign: 'center' }}>
            {p.label}
          </span>
        ))}
      </div>
      {referenceLabel && <p className="t-caption">{referenceLabel}</p>}
    </>
  );
}

/* --------------------------- Histórico de decisões ------------------------- */

const RESPONSE_META: Record<
  DecisionRecord['response'],
  { label: string; marker: 'accepted' | 'rejected' | ''; icon: IconName }
> = {
  aceita: { label: 'Aceita', marker: 'accepted', icon: 'check' },
  ajustada: { label: 'Ajustada por você', marker: '', icon: 'edit' },
  rejeitada: { label: 'Plano original mantido', marker: 'rejected', icon: 'undo' },
  pendente: { label: 'Pendente', marker: '', icon: 'clock' },
};

export function DecisionTimeline({
  records,
  onSelect,
}: {
  records: DecisionRecord[];
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="timeline">
      {records.map((r) => {
        const meta = RESPONSE_META[r.response];
        const Wrapper = onSelect ? 'button' : 'div';
        return (
          <Wrapper
            key={r.id}
            className="timeline__item"
            {...(onSelect ? { type: 'button' as const, onClick: () => onSelect(r.id) } : {})}
          >
            <span className={`timeline__marker${meta.marker ? ` timeline__marker--${meta.marker}` : ''}`}>
              <Icon name={meta.icon} size={12} strokeWidth={2.4} />
            </span>
            <span className="timeline__body">
              <span className="t-caption">
                {r.date} · {r.id}
              </span>
              <span className="t-body-2 t-strong">{r.action}</span>
              <span className="row row--wrap" style={{ gap: 6 }}>
                <Chip tone={r.response === 'aceita' ? 'positive' : 'neutral'}>{meta.label}</Chip>
                <Chip tone="neutral">
                  {r.confidence === 'alta' ? 'Confiança alta' : 'Confiança moderada'}
                </Chip>
              </span>
              <span className="t-caption">{r.outcome}</span>
            </span>
          </Wrapper>
        );
      })}
    </div>
  );
}
