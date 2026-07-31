/** Tela 1 — Boas-vindas. Uma frase de proposta, sem lista longa, sem paywall. */

import { Button, Icon } from '../system';
import { useStore } from '../state/store';

export function Welcome() {
  const { dispatch } = useStore();

  return (
    <div className="welcome">
      <div className="welcome__mark">
        <span className="welcome__logo" aria-hidden="true">
          N
        </span>
        <div>
          <p className="t-section">Nivor</p>
          <p className="t-caption">Seu plano muda com você.</p>
        </div>
      </div>

      <div className="welcome__body">
        <h1 className="t-display">
          Treino, recuperação e rotina em uma decisão clara para hoje.
        </h1>
        <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
          O Nivor usa seu plano, seu estado atual e o tempo que você tem para dizer o que fazer
          agora — e mostra o que isso muda no restante da semana.
        </p>

        <ul className="welcome__points">
          {[
            {
              icon: 'today' as const,
              title: 'Uma decisão por dia',
              text: 'O que fazer, quanto tempo leva e o que mudou.',
            },
            {
              icon: 'question' as const,
              title: 'Sempre explicada',
              text: 'Motivo, dados usados, dados ausentes e confiança.',
            },
            {
              icon: 'plan' as const,
              title: 'Você continua no controle',
              text: 'Aceitar, ajustar ou manter seu plano original.',
            },
          ].map((p) => (
            <li className="welcome__point" key={p.title}>
              <span className="welcome__point-icon">
                <Icon name={p.icon} size={15} strokeWidth={2} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="t-body-2 t-strong">{p.title}</span>
                <span className="t-caption">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="welcome__foot">
        <Button
          variant="primary"
          block
          onClick={() => {
            dispatch({ type: 'go', route: 'onboarding' });
            dispatch({ type: 'onboarding-step', step: 0 });
          }}
        >
          Começar
        </Button>
        <Button variant="tertiary" block onClick={() => dispatch({ type: 'go', route: 'app' })}>
          Já tenho um plano — ir direto para Hoje
        </Button>
        <p className="t-caption" style={{ textAlign: 'center' }}>
          Protótipo de pesquisa com dados fictícios. Não oferece diagnóstico, tratamento nem
          prescrição, e não substitui profissional habilitado.
        </p>
      </div>
    </div>
  );
}
