/**
 * Conjunto de ícones próprio, com peso óptico e grid consistentes (24px).
 * Ícone nunca substitui rótulo em ação crítica.
 */

export type IconName =
  | 'today'
  | 'plan'
  | 'workout'
  | 'progress'
  | 'check'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'close'
  | 'plus'
  | 'minus'
  | 'clock'
  | 'moon'
  | 'bolt'
  | 'pulse'
  | 'alert'
  | 'info'
  | 'shield'
  | 'offline'
  | 'sync'
  | 'swap'
  | 'condense'
  | 'move'
  | 'keep'
  | 'undo'
  | 'pause'
  | 'play'
  | 'flag'
  | 'question'
  | 'settings'
  | 'trend'
  | 'history'
  | 'edit'
  | 'target'
  | 'calendar'
  | 'eye-off';

const paths: Record<IconName, JSX.Element> = {
  today: (
    <>
      <path d="M12 3.5 4 8v8l8 4.5 8-4.5V8l-8-4.5Z" />
      <path d="M12 11.5v5" />
      <circle cx="12" cy="9" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  plan: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8.5 3.5v3M15.5 3.5v3" />
      <path d="M7.5 14h3M13.5 17h3" />
    </>
  ),
  workout: (
    <>
      <path d="M6.5 9v6M17.5 9v6M3.5 10.5v3M20.5 10.5v3" />
      <path d="M6.5 12h11" />
    </>
  ),
  progress: (
    <>
      <path d="M4 18.5V13M9.5 18.5V8M15 18.5v-4M20.5 18.5V5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  'chevron-down': <path d="m5 9 7 7 7-7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" />,
  bolt: <path d="M13.5 3 5.5 13.2h5.2L10.5 21l8-10.2h-5.2L13.5 3Z" />,
  pulse: <path d="M3 12.5h3.5l2-5.5 3.5 11 2.5-7 1.5 3H21" />,
  alert: (
    <>
      <path d="M12 4.5 2.8 20h18.4L12 4.5Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 5 6v6c0 4.2 3 7.3 7 8.8 4-1.5 7-4.6 7-8.8V6l-7-2.8Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  offline: (
    <>
      <path d="M4 8.5a13 13 0 0 1 5-2.8M15 5.7a13 13 0 0 1 5 2.8" />
      <path d="M7.5 12.2a8.5 8.5 0 0 1 3-1.8M13.5 10.4a8.5 8.5 0 0 1 3 1.8" />
      <path d="M10.2 15.6a4 4 0 0 1 3.6 0" />
      <circle cx="12" cy="18.8" r="0.9" fill="currentColor" stroke="none" />
      <path d="M3.5 3.5l17 17" />
    </>
  ),
  sync: (
    <>
      <path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M4 20v-4h4M20 4v4h-4" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
    </>
  ),
  condense: (
    <>
      <path d="M4 5h16M4 19h16" />
      <path d="m12 8.5-2.5 2.5M12 8.5l2.5 2.5M12 8.5V12" />
      <path d="m12 15.5-2.5-2.5M12 15.5l2.5-2.5M12 15.5V12" />
    </>
  ),
  move: (
    <>
      <path d="M5 12h12l-3.5-3.5M17 12l-3.5 3.5" />
      <path d="M20 5.5v13" />
    </>
  ),
  keep: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12h7" />
    </>
  ),
  undo: (
    <>
      <path d="M4 9h9.5a5 5 0 0 1 0 10H8" />
      <path d="M4 9l4-4M4 9l4 4" />
    </>
  ),
  pause: <path d="M9.5 5.5v13M14.5 5.5v13" />,
  play: <path d="M7.5 4.8 19 12 7.5 19.2V4.8Z" />,
  flag: (
    <>
      <path d="M6 21V4M6 4.8h11l-2.2 3.6L17 12H6" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.4a2.4 2.4 0 1 1 3.2 2.3c-.6.3-.9.8-.9 1.5v.4" />
      <circle cx="12" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.2v2.4M12 18.4v2.4M20.8 12h-2.4M5.6 12H3.2M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7M18.2 18.2l-1.7-1.7M7.5 7.5 5.8 5.8" />
    </>
  ),
  trend: (
    <>
      <path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" />
      <path d="M15.5 6.5h5v5" />
    </>
  ),
  history: (
    <>
      <path d="M3.8 12a8.2 8.2 0 1 0 2.6-6" />
      <path d="M3.5 4v4h4" />
      <path d="M12 8v4.4l3 1.8" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m14.5 5.5 4 4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8.5 3v3.6M15.5 3v3.6" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M10 5.4A9.6 9.6 0 0 1 12 5.2c5 0 8.4 4 9.4 6.8a11 11 0 0 1-2.5 3.6M6.4 7.2A12.6 12.6 0 0 0 2.6 12c1 2.8 4.4 6.8 9.4 6.8a9.7 9.7 0 0 0 3.6-.7" />
      <path d="M10.4 10.5a2.2 2.2 0 0 0 3.1 3.1" />
      <path d="M3.5 3.5l17 17" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
