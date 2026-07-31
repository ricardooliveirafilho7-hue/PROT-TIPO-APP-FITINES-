/**
 * Nivor System — primitivas reutilizáveis.
 * Cada componente tem estados, rótulo acessível e não depende só de cor.
 */

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { CONFIDENCE_BARS, CONFIDENCE_LABEL } from '../engine/decision';
import type { Confidence } from '../engine/types';

export { Icon };
export type { IconName };

/* ---------------------------------- Botão --------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export function Button({
  children,
  variant = 'secondary',
  size,
  block,
  icon,
  iconEnd,
  onClick,
  disabled,
  type = 'button',
  ariaLabel,
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm';
  block?: boolean;
  icon?: IconName;
  iconEnd?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      className={[
        'btn',
        `btn--${variant}`,
        size === 'sm' ? 'btn--sm' : '',
        block ? 'btn--block' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === 'sm' ? 16 : 18} />}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="btn btn--icon" onClick={onClick} aria-label={label}>
      <Icon name={icon} size={19} />
    </button>
  );
}

/* ---------------------------------- Chip ---------------------------------- */

export type ChipTone =
  | 'neutral'
  | 'informative'
  | 'positive'
  | 'caution'
  | 'critical'
  | 'offline';

export function Chip({
  children,
  tone = 'neutral',
  icon,
  size,
}: {
  children: ReactNode;
  tone?: ChipTone;
  icon?: IconName;
  size?: 'lg';
}) {
  return (
    <span className={`chip chip--${tone}${size === 'lg' ? ' chip--lg' : ''}`}>
      {icon && <Icon name={icon} size={13} strokeWidth={2} />}
      {children}
    </span>
  );
}

/* --------------------------- Indicador de confiança ------------------------ */

export function ConfidenceIndicator({
  level,
  onClick,
}: {
  level: Confidence;
  onClick?: () => void;
}) {
  const bars = CONFIDENCE_BARS[level];
  const content = (
    <>
      <span className="confidence__bars" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`confidence__bar${i < bars ? ' confidence__bar--on' : ''}`} />
        ))}
      </span>
      <span>{CONFIDENCE_LABEL[level]}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`confidence confidence--${level}`}
        onClick={onClick}
        aria-label={`${CONFIDENCE_LABEL[level]}. Toque para entender o que isso significa.`}
      >
        {content}
        <Icon name="info" size={13} strokeWidth={2} />
      </button>
    );
  }
  return (
    <span className={`confidence confidence--${level}`}>
      {content}
    </span>
  );
}

/* --------------------------------- Banner --------------------------------- */

export function Banner({
  tone = 'neutral',
  icon,
  title,
  children,
  action,
}: {
  tone?: 'neutral' | 'informative' | 'positive' | 'caution' | 'critical' | 'offline';
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`banner banner--${tone}`} role={tone === 'critical' ? 'alert' : 'status'}>
      <span className="banner__icon">
        <Icon name={icon} size={19} />
      </span>
      <div className="banner__body">
        <p className="t-card-title">{title}</p>
        {children && <div className="t-body-2">{children}</div>}
        {action}
      </div>
    </div>
  );
}

/* ---------------------------------- Sheet --------------------------------- */

export function Sheet({
  title,
  subtitle,
  onClose,
  children,
  footer,
  solid,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Conteúdo denso ou crítico usa superfície sólida em vez de vidro. */
  solid?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`sheet ${solid ? 'sheet--solid' : 'glass-transient'}`}
      >
        <div className="sheet__grabber" aria-hidden="true" />
        <div className="sheet__head">
          <div className="sheet__head-text">
            <h2 className="t-section" id={titleId}>
              {title}
            </h2>
            {subtitle && <p className="t-caption">{subtitle}</p>}
          </div>
          <IconButton icon="close" label="Fechar" onClick={onClose} />
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>
  );
}

/* -------------------------------- Escala 1–5 ------------------------------- */

export function Scale({
  label,
  hint,
  value,
  onChange,
  anchors,
  optionalNote,
}: {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (v: number) => void;
  anchors: [string, string];
  optionalNote?: string;
}) {
  const groupId = useId();
  return (
    <div className="checkin-field">
      <div className="checkin-field__head">
        <label className="t-card-title" id={groupId}>
          {label}
        </label>
        {value !== null && <span className="t-body-2 t-num">{value} de 5</span>}
      </div>
      {hint && <p className="t-caption">{hint}</p>}
      <div className="scale" role="radiogroup" aria-labelledby={groupId}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            className="scale__option"
            onClick={() => onChange(n)}
            aria-label={`${n} de 5`}
          >
            <span className="scale__option-num t-num">{n}</span>
            {/* Marca de seleção: o estado não depende apenas da cor. */}
            <span className="scale__option-tick" aria-hidden="true">
              <Icon name="check" size={12} strokeWidth={3} />
            </span>
          </button>
        ))}
      </div>
      <div className="scale__anchors">
        <span className="t-caption">{anchors[0]}</span>
        <span className="t-caption" style={{ textAlign: 'end' }}>
          {anchors[1]}
        </span>
      </div>
      {optionalNote && (
        <p className="t-caption" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="info" size={13} strokeWidth={2} />
          {optionalNote}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- Stepper -------------------------------- */

export function Stepper({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  format,
  optionalNote,
  fallback,
}: {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  format?: (v: number) => string;
  optionalNote?: string;
  /** Ponto de partida mostrado enquanto a pergunta não foi respondida. */
  fallback?: number;
}) {
  // `value === null` significa "ainda não informado". O stepper mostra um ponto
  // de partida plausível, mas ele só vira resposta depois de um toque — o Nivor
  // não registra como dado algo que o usuário não confirmou.
  const answered = value !== null;
  const current = value ?? fallback ?? min;
  const labelId = useId();
  return (
    <div className="checkin-field">
      <div className="checkin-field__head">
        <span className="t-card-title" id={labelId}>
          {label}
        </span>
        {!answered && <span className="t-caption">Não informado</span>}
      </div>
      {hint && <p className="t-caption">{hint}</p>}
      <div className={`stepper${answered ? '' : ' stepper--unset'}`}>
        <button
          type="button"
          className="stepper__btn"
          onClick={() => onChange(Math.max(min, current - step))}
          disabled={current <= min}
          aria-label={`Diminuir ${label.toLowerCase()}`}
        >
          <Icon name="minus" size={20} strokeWidth={2.2} />
        </button>
        <span
          className="stepper__value"
          role="spinbutton"
          aria-labelledby={labelId}
          aria-valuenow={current}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={`${format ? format(current) : current} ${unit}`}
        >
          {format ? format(current) : current}
          <span className="stepper__unit">{unit}</span>
        </span>
        <button
          type="button"
          className="stepper__btn"
          onClick={() => onChange(Math.min(max, current + step))}
          disabled={current >= max}
          aria-label={`Aumentar ${label.toLowerCase()}`}
        >
          <Icon name="plus" size={20} strokeWidth={2.2} />
        </button>
      </div>
      {optionalNote && (
        <p className="t-caption" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="info" size={13} strokeWidth={2} />
          {optionalNote}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- ChipSet --------------------------------- */

export function ChipSet<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  stack,
  optionalNote,
}: {
  label?: string;
  hint?: string;
  options: { value: T; label: string; description?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  stack?: boolean;
  optionalNote?: string;
}) {
  const groupId = useId();
  const body = (
    <>
      {hint && <p className="t-caption">{hint}</p>}
      <div
        className={`chipset${stack ? ' chipset--stack' : ''}`}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className="chipset__option"
            onClick={() => onChange(o.value)}
          >
            <span className="chipset__option-body">
              <span>{o.label}</span>
              {o.description && <span className="t-caption">{o.description}</span>}
            </span>
            <span className="chipset__check" aria-hidden="true">
              <Icon name="check" size={17} strokeWidth={2.4} />
            </span>
          </button>
        ))}
      </div>
      {optionalNote && (
        <p className="t-caption" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="info" size={13} strokeWidth={2} />
          {optionalNote}
        </p>
      )}
    </>
  );

  if (!label) return <div className="stack stack--sm">{body}</div>;

  return (
    <div className="checkin-field">
      <div className="checkin-field__head">
        <span className="t-card-title" id={groupId}>
          {label}
        </span>
      </div>
      {body}
    </div>
  );
}

/* -------------------------------- Switch ---------------------------------- */

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="guide__toggle-row">
      <div className="grow">
        <p className="t-body-2 t-strong">{label}</p>
        {description && <p className="t-caption">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch__knob" />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="segmented__option"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

export function Skeleton({ height, width }: { height: number; width?: string }) {
  return (
    <div
      className="skeleton"
      style={{ height, width: width ?? '100%' }}
      aria-hidden="true"
    />
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="card" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton height={14} width="42%" />
      <Skeleton height={30} width="88%" />
      <Skeleton height={14} width="70%" />
      <Skeleton height={44} />
    </div>
  );
}

/* --------------------------------- Empty ---------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty__art">
        <Icon name={icon} size={24} />
      </span>
      <div className="stack stack--sm">
        <p className="t-card-title">{title}</p>
        <p className="t-body-2">{description}</p>
      </div>
      {action}
    </div>
  );
}

/* ----------------------------- MascotPresence ----------------------------- */
/**
 * Presença abstrata e substituível (Flux, Turi e Niv seguem em avaliação —
 * Fase 12 §15.4). Nunca aparece acima da decisão, nunca em estado de segurança
 * e pode ser ocultada sem quebrar nenhuma tarefa.
 */

export type MascotState =
  | 'neutro'
  | 'atento'
  | 'cauteloso'
  | 'descansando'
  | 'celebrando';

const MASCOT_MODIFIER: Record<MascotState, string> = {
  neutro: 'neutral',
  atento: 'attentive',
  cauteloso: 'cautious',
  descansando: 'resting',
  celebrando: 'celebrating',
};

export function MascotPresence({
  state = 'neutro',
  size = 'avatar',
  visible = true,
}: {
  state?: MascotState;
  size?: 'micro' | 'avatar' | 'card';
  visible?: boolean;
}) {
  if (!visible) return null;
  const px = size === 'micro' ? 24 : size === 'avatar' ? 34 : 44;
  return (
    <span
      className={`mascot mascot--${size} mascot--${MASCOT_MODIFIER[state]}`}
      aria-hidden="true"
    >
      <svg width={px * 0.62} height={px * 0.62} viewBox="0 0 24 24" fill="none">
        <g className="mascot__core">
          <circle cx="12" cy="12" r="4.4" fill="currentColor" opacity="0.9" />
          <circle cx="12" cy="12" r="7.6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </g>
        {state === 'cauteloso' && (
          <path
            d="M6 12h3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
        )}
        {state === 'celebrando' && (
          <path
            d="M12 2.2v1.8M21.8 12h-1.8M12 21.8v-1.8M2.2 12H4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
        )}
        {state === 'descansando' && (
          <path
            d="M8.6 12h6.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
        )}
      </svg>
    </span>
  );
}

/** Mensagem do coach: sempre identifica a origem (regra ou template). */
export function CoachMessage({
  children,
  state = 'neutro',
  source = 'Explicação gerada a partir da regra aplicada',
  mascotVisible = true,
}: {
  children: ReactNode;
  state?: MascotState;
  source?: string;
  mascotVisible?: boolean;
}) {
  return (
    <div className="coach">
      {mascotVisible ? (
        <MascotPresence state={state} size="card" />
      ) : (
        <span className="banner__icon" style={{ marginTop: 2 }}>
          <Icon name="info" size={19} />
        </span>
      )}
      <div className="coach__body">
        <p className="t-body-2" style={{ color: 'var(--text-primary)' }}>
          {children}
        </p>
        <p className="t-caption">{source}</p>
      </div>
    </div>
  );
}

/* ---------------------------------- Toast --------------------------------- */

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(t);
  }, [onDismiss, message]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="t-body-2 grow" style={{ color: 'var(--text-primary)' }}>
        {message}
      </span>
      {actionLabel && onAction && (
        <Button variant="tertiary" size="sm" onClick={onAction} icon="undo">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------ Linha de item ------------------------------ */

export function ListRow({
  title,
  description,
  meta,
  onClick,
  icon,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  onClick?: () => void;
  icon?: IconName;
}) {
  const inner = (
    <>
      {icon && (
        <span className="changelist__icon">
          <Icon name={icon} size={14} strokeWidth={2} />
        </span>
      )}
      <span className="grow" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="t-body-2 t-strong">{title}</span>
        {description && <span className="t-caption">{description}</span>}
      </span>
      {meta}
      {onClick && <Icon name="chevron-right" size={17} className="chevron" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="row"
        onClick={onClick}
        style={{
          width: '100%',
          textAlign: 'start',
          padding: 'var(--space-300) 0',
          borderBottom: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          minHeight: 'var(--target-min)',
        }}
      >
        {inner}
      </button>
    );
  }
  return (
    <div
      className="row"
      style={{
        padding: 'var(--space-300) 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {inner}
    </div>
  );
}
