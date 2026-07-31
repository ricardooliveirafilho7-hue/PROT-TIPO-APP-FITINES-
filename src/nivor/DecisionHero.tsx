/**
 * DecisionHero — componente central da Home.
 *
 * Hierarquia obrigatória (Fase 11 §8.2 / Fase 10 §15.1):
 *   1 recomendação · 2 horário · 3 duração · 4 mudança · 5 motivo
 *   6 confiança · 7 próxima revisão · 8 ação principal · 9 alternativa
 *
 * Regras: uma única ação principal; nunca três scores como título;
 * segurança remove celebração e material translúcido.
 */

import { Button, Chip, ConfidenceIndicator, Icon, MascotPresence } from '../system';
import type { Decision, DecisionResponse } from '../engine/types';

const ACTION_LABEL: Record<Decision['actionType'], { label: string; tone: 'informative' | 'positive' | 'caution' | 'critical' | 'neutral'; icon: 'condense' | 'keep' | 'swap' | 'move' | 'alert' | 'question' }> = {
  manter: { label: 'Plano mantido', tone: 'positive', icon: 'keep' },
  condensar: { label: 'Plano ajustado', tone: 'informative', icon: 'condense' },
  reduzir: { label: 'Plano ajustado', tone: 'informative', icon: 'condense' },
  trocar: { label: 'Sessão trocada', tone: 'informative', icon: 'swap' },
  reagendar: { label: 'Sessão movida', tone: 'informative', icon: 'move' },
  recuperar: { label: 'Recuperação sugerida', tone: 'caution', icon: 'keep' },
  pedir_dados: { label: 'Decisão conservadora', tone: 'caution', icon: 'question' },
  bloqueio_seguranca: { label: 'Recomendação interrompida', tone: 'critical', icon: 'alert' },
};

export function DecisionHero({
  decision,
  response,
  effectiveDuration,
  effectiveSets,
  mascotVisible,
  onPrimary,
  onExplain,
  onDiff,
  onAdjust,
  onKeepOriginal,
  onConfidence,
  primaryLabelOverride,
}: {
  decision: Decision;
  response: DecisionResponse;
  effectiveDuration: number;
  effectiveSets: number;
  mascotVisible: boolean;
  onPrimary: () => void;
  onExplain: () => void;
  onDiff: () => void;
  onAdjust: () => void;
  onKeepOriginal: () => void;
  onConfidence: () => void;
  primaryLabelOverride?: string;
}) {
  const safety = decision.safetyState === 'bloqueio';
  const meta = ACTION_LABEL[decision.actionType];
  const answered = response !== 'pendente';
  const rejected = response === 'rejeitada';
  const changed = decision.actionType !== 'manter' && decision.actionType !== 'bloqueio_seguranca';

  const headline = rejected
    ? `Hoje, faça ${decision.plannedSession} em ${decision.durationBefore} minutos.`
    : response === 'ajustada'
      ? `Hoje, faça ${decision.plannedSession} em ${effectiveDuration} minutos.`
      : decision.headline;

  const reason = rejected
    ? 'Plano original mantido. Sua escolha foi registrada e não será tratada como erro.'
    : decision.shortReason;

  return (
    <section
      className={safety ? 'surface surface--security hero' : 'glass-action hero'}
      aria-label="Recomendação de hoje"
    >
      {/* 4 — estado da decisão + presença discreta do mascote (nunca acima da decisão) */}
      <div className="hero__top">
        <div className="hero__state">
          {rejected ? (
            <Chip tone="neutral" icon="keep">
              Plano original mantido
            </Chip>
          ) : response === 'ajustada' ? (
            <Chip tone="informative" icon="edit">
              Ajustado por você
            </Chip>
          ) : (
            <Chip tone={meta.tone} icon={meta.icon}>
              {response === 'aceita' ? 'Adaptação aceita' : meta.label}
            </Chip>
          )}
          {!safety && (
            <span className="t-caption">Gerada às {decision.createdAt}</span>
          )}
        </div>
        {/* Mascote nunca aparece em estado de segurança. */}
        {!safety && (
          <MascotPresence
            state={decision.confidence === 'baixa' || decision.confidence === 'insuficiente' ? 'cauteloso' : 'atento'}
            size="avatar"
            visible={mascotVisible}
          />
        )}
      </div>

      {/* 1 — a recomendação */}
      <div className="hero__headline">
        <h1 className="t-display">{headline}</h1>
      </div>

      {/* 2 e 3 — horário e duração */}
      {!safety && (
        <div className="hero__meta">
          <div className="hero__meta-item">
            <span className="t-label">Horário</span>
            <span className="hero__meta-value">{decision.suggestedTime}</span>
          </div>
          <div className="hero__meta-item">
            <span className="t-label">Duração</span>
            <span className="hero__meta-value">{effectiveDuration} min</span>
          </div>
          <div className="hero__meta-item">
            <span className="t-label">Séries</span>
            <span className="hero__meta-value">{effectiveSets}</span>
          </div>
        </div>
      )}

      {/* 4 — o que mudou, em uma linha comparável */}
      {changed && !rejected && (
        <button
          type="button"
          className="diffstrip"
          onClick={onDiff}
          aria-label={`Ver comparação: de ${decision.durationBefore} minutos e ${decision.setsBefore} séries para ${effectiveDuration} minutos e ${effectiveSets} séries`}
        >
          <Icon name="condense" size={15} strokeWidth={2} />
          <span className="t-body-2 diffstrip__before">
            {decision.durationBefore} min · {decision.setsBefore} séries
          </span>
          <Icon name="chevron-right" size={14} strokeWidth={2.4} />
          <span className="t-body-2 diffstrip__after">
            {effectiveDuration} min · {effectiveSets} séries
          </span>
          <span className="t-caption" style={{ marginInlineStart: 'auto' }}>
            Ver detalhes
          </span>
        </button>
      )}

      {/* 5 — o motivo, curto */}
      <div className="hero__reason">
        <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
          {reason}
        </p>
        <div>
          <Button variant="tertiary" size="sm" onClick={onExplain} icon="question">
            Ver explicação completa
          </Button>
        </div>
      </div>

      {/* 8 e 9 — ação principal e alternativas reais */}
      <div className="hero__actions">
        <Button variant="primary" block onClick={onPrimary} icon={safety ? 'shield' : 'play'}>
          {primaryLabelOverride ??
            (answered && !rejected
              ? 'Começar treino'
              : rejected
                ? 'Começar treino original'
                : decision.primaryCta)}
        </Button>

        {!safety && !answered && changed && (
          <div className="btn-row">
            <Button variant="secondary" size="sm" onClick={onAdjust} icon="edit">
              Ajustar
            </Button>
            <Button variant="secondary" size="sm" onClick={onKeepOriginal} icon="undo">
              Manter plano original
            </Button>
          </div>
        )}

        {!safety && answered && (
          <Button
            variant="tertiary"
            size="sm"
            block
            onClick={onKeepOriginal}
            icon="undo"
          >
            {rejected ? 'Reconsiderar a adaptação' : 'Desfazer e manter plano original'}
          </Button>
        )}
      </div>

      {/* 6 e 7 — confiança e próxima revisão.
          Em estado de segurança não existe "validade": a recomendação está suspensa. */}
      {!safety && (
        <div className="hero__footnote">
          <ConfidenceIndicator level={decision.confidence} onClick={onConfidence} />
          <span className="t-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon name="clock" size={13} strokeWidth={2} />
            Válida até {decision.validUntil}
          </span>
        </div>
      )}
      <p className="t-caption">
        {safety
          ? `O Nivor revisa isto ${decision.nextReview}. Você também pode ${decision.alternative.toLowerCase()}`
          : `Próxima revisão: ${decision.nextReview}. Alternativa: ${decision.alternative.toLowerCase()}`}
      </p>
    </section>
  );
}
