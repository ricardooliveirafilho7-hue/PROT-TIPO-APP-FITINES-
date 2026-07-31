/**
 * Telas 2–6 — Onboarding representativo (5 passos) + revisão do plano inicial.
 * Cinco perguntas, progresso salvo, nenhum pedido de permissão sem contexto.
 */

import { Button, Chip, ChipSet, Icon, MascotPresence, Stepper } from '../system';
import { AdaptiveWeek } from '../nivor/components';
import { WEEK } from '../engine/data';
import { useStore } from '../state/store';

const GOALS = [
  { value: 'hipertrofia', label: 'Ganhar massa muscular', description: 'Hipertrofia como prioridade' },
  { value: 'forca', label: 'Aumentar força', description: 'Progressão de carga nos principais' },
  { value: 'composicao', label: 'Melhorar composição corporal', description: 'Massa e gordura juntas' },
  { value: 'constancia', label: 'Manter constância', description: 'Frequência antes de intensidade' },
];

const LEVELS = [
  { value: 'iniciante', label: 'Iniciante', description: 'Menos de 1 ano de prática regular' },
  { value: 'intermediario', label: 'Intermediário', description: 'De 1 a 4 anos, executa os básicos' },
  { value: 'avancado', label: 'Avançado', description: 'Mais de 4 anos com progressão planejada' },
];

const PLACES = [
  { value: 'academia', label: 'Academia completa' },
  { value: 'casa', label: 'Em casa' },
  { value: 'ambos', label: 'Os dois' },
];

const EQUIPMENT = [
  { id: 'halteres', label: 'Halteres' },
  { id: 'barras', label: 'Barras' },
  { id: 'maquinas', label: 'Máquinas' },
  { id: 'polias', label: 'Polias' },
  { id: 'elasticos', label: 'Elásticos' },
  { id: 'corporal', label: 'Peso corporal' },
];

const RESTRICTIONS = [
  { id: 'agachamento-livre', label: 'Agachamento livre' },
  { id: 'desenvolvimento-atras', label: 'Desenvolvimento por trás' },
  { id: 'levantamento-terra', label: 'Levantamento terra' },
  { id: 'nenhuma', label: 'Nenhuma restrição' },
];

const STEPS = [
  'Qual é o seu objetivo principal?',
  'Qual é a sua experiência e frequência?',
  'Quanto tempo você tem?',
  'Onde você treina e com o quê?',
  'Seu plano inicial',
];

export function Onboarding() {
  const { state, dispatch } = useStore();
  const step = state.onboardingStep;
  const a = state.onboarding;

  const canAdvance =
    (step === 0 && a.goal) ||
    (step === 1 && a.level && a.frequency) ||
    step === 2 ||
    (step === 3 && a.place) ||
    step === 4;

  const next = () => {
    if (step < 4) dispatch({ type: 'onboarding-step', step: step + 1 });
    else dispatch({ type: 'go', route: 'app' });
  };
  const back = () => {
    if (step === 0) dispatch({ type: 'go', route: 'welcome' });
    else dispatch({ type: 'onboarding-step', step: step - 1 });
  };

  const toggleList = (key: 'equipment' | 'restrictions', id: string) => {
    const list = a[key];
    const nextList = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    dispatch({ type: 'onboarding-answer', patch: { [key]: nextList } });
  };

  return (
    <div className="onboarding">
      <div className="onboarding__head">
        <div className="row row--between">
          <Button variant="tertiary" size="sm" icon="chevron-left" onClick={back}>
            {step === 0 ? 'Voltar' : 'Anterior'}
          </Button>
          <span className="t-caption t-num">Passo {step + 1} de 5</span>
        </div>
        <div className="progressdots" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5} aria-label="Progresso do onboarding">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`progressdots__dot${i <= step ? ' progressdots__dot--on' : ''}`} />
          ))}
        </div>
        <h1 className="t-page">{STEPS[step]}</h1>
      </div>

      <div className="onboarding__body">
        {step === 0 && (
          <>
            <p className="t-body-2">
              Você pode mudar depois. O objetivo define as prioridades da semana, não uma promessa de
              resultado.
            </p>
            <ChipSet
              options={GOALS}
              value={a.goal}
              onChange={(v) => dispatch({ type: 'onboarding-answer', patch: { goal: v } })}
              stack
            />
          </>
        )}

        {step === 1 && (
          <>
            <ChipSet
              label="Experiência"
              options={LEVELS}
              value={a.level}
              onChange={(v) => dispatch({ type: 'onboarding-answer', patch: { level: v } })}
              stack
            />
            <Stepper
              label="Treinos por semana"
              hint="Quantas sessões você consegue manter em uma semana comum."
              value={a.frequency}
              onChange={(v) => dispatch({ type: 'onboarding-answer', patch: { frequency: v } })}
              min={2}
              max={7}
              step={1}
              unit="por semana"
            />
          </>
        )}

        {step === 2 && (
          <>
            <Stepper
              label="Duração habitual da sessão"
              hint="Usamos isso para montar sessões que cabem na sua rotina."
              value={a.duration}
              onChange={(v) => dispatch({ type: 'onboarding-answer', patch: { duration: v } })}
              min={25}
              max={120}
              step={5}
              unit="min"
              optionalNote="Se um dia você tiver menos tempo, o Nivor condensa a sessão em vez de cancelá-la."
            />
            <div className="card">
              <p className="t-card-title">Horário preferido</p>
              <div className="chipset">
                {['Manhã', 'Almoço', '17h30', 'Noite'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className="chipset__option"
                    aria-checked={h === '17h30'}
                    role="radio"
                  >
                    {h}
                    <span className="chipset__check" aria-hidden="true">
                      <Icon name="check" size={16} strokeWidth={2.4} />
                    </span>
                  </button>
                ))}
              </div>
              <p className="t-caption">
                Seu horário é uma preferência, não uma regra. Dias marcados como fixos nunca são
                movidos automaticamente.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <ChipSet
              label="Onde você treina"
              options={PLACES}
              value={a.place}
              onChange={(v) => dispatch({ type: 'onboarding-answer', patch: { place: v } })}
            />
            <div className="checkin-field">
              <div className="checkin-field__head">
                <span className="t-card-title">Equipamento disponível</span>
              </div>
              <div className="chipset">
                {EQUIPMENT.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className="chipset__option"
                    aria-pressed={a.equipment.includes(e.id)}
                    onClick={() => toggleList('equipment', e.id)}
                  >
                    {e.label}
                    <span className="chipset__check" aria-hidden="true">
                      <Icon name="check" size={16} strokeWidth={2.4} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="checkin-field">
              <div className="checkin-field__head">
                <span className="t-card-title">Exercícios a evitar</span>
              </div>
              <p className="t-caption">
                Opcional. O Nivor não pede detalhes de saúde e não avalia lesões. Se um movimento
                incomoda, ele deixa de ser sugerido.
              </p>
              <div className="chipset">
                {RESTRICTIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="chipset__option"
                    aria-pressed={a.restrictions.includes(r.id)}
                    onClick={() => toggleList('restrictions', r.id)}
                  >
                    {r.label}
                    <span className="chipset__check" aria-hidden="true">
                      <Icon name="check" size={16} strokeWidth={2.4} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="banner banner--informative">
              <span className="banner__icon">
                <Icon name="info" size={19} />
              </span>
              <div className="banner__body">
                <p className="t-card-title">Nenhuma permissão agora</p>
                <p className="t-body-2">
                  O Nivor funciona sem smartwatch e sem acesso a dados de saúde. Você pode conectar
                  depois, quando isso melhorar alguma recomendação específica.
                </p>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="banner banner--informative">
              <span className="banner__icon">
                <Icon name="info" size={19} />
              </span>
              <div className="banner__body">
                <p className="t-card-title">Esta primeira semana é provisória</p>
                <p className="t-body-2">
                  Montamos a partir do que você respondeu. Ainda estamos conhecendo o seu padrão, então
                  as primeiras recomendações serão conservadoras.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <div className="card__head-text">
                  <p className="t-card-title">Hipertrofia · 5 sessões por semana</p>
                  <p className="t-caption">Intermediário · sessões de até 70 min · academia completa</p>
                </div>
                <MascotPresence state="neutro" size="card" visible={state.mascotVisible} />
              </div>
              <div className="row row--wrap" style={{ gap: 6 }}>
                <Chip tone="neutral" icon="target">
                  Prioridade: costas e ombros
                </Chip>
                <Chip tone="neutral" icon="clock">
                  Revisão: domingo
                </Chip>
              </div>
            </div>

            <div className="section-head">
              <h2 className="t-section">Sua semana</h2>
              <span className="t-caption">Provisória</span>
            </div>
            <AdaptiveWeek sessions={WEEK} onSelect={() => undefined} />
          </>
        )}
      </div>

      <div className="onboarding__foot">
        <Button variant="primary" block onClick={next} disabled={!canAdvance}>
          {step === 4 ? 'Confirmar semana e ver Hoje' : 'Continuar'}
        </Button>
        {step === 4 && (
          <Button variant="tertiary" block onClick={() => dispatch({ type: 'go', route: 'app' })}>
            Ajustar depois
          </Button>
        )}
        {step < 4 && (
          <p className="t-caption" style={{ textAlign: 'center' }}>
            Suas respostas ficam salvas se você sair antes de terminar.
          </p>
        )}
      </div>
    </div>
  );
}
