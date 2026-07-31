/**
 * Painel do moderador — fica FORA do dispositivo.
 * Serve para conduzir a sessão de teste: pular para qualquer estado,
 * alternar os eixos de acessibilidade e ligar/desligar o mascote
 * (comparação com e sem personagem, exigida pela Fase 12 §15.4).
 */

import { Button, Segmented, Switch } from './system';
import { useStore } from './state/store';
import { OFFICIAL_CHECKIN } from './engine/data';

export function GuidePanel() {
  const { state, dispatch, openSheet } = useStore();

  /** Em telas estreitas o painel fica abaixo do aparelho: volta ao topo após agir. */
  const backToDevice = () => window.scrollTo({ top: 0, behavior: 'auto' });

  /** Cada salto parte de um treino limpo: nenhum estado antigo vaza entre cenários. */
  const jumpTo = (fn: () => void) => {
    dispatch({ type: 'go', route: 'app' });
    dispatch({ type: 'reset-workout' });
    fn();
    backToDevice();
  };

  return (
    <div className="guide">
      <div className="guide__card">
        <div>
          <p className="t-section">Nivor — protótipo de validação</p>
          <p className="t-caption">
            Conceito: decisão adaptativa + Plano Vivo. Cenário fictício do Rafael, 27 anos,
            hipertrofia, 5 treinos por semana. Sem backend, sem conta, sem IA generativa e sem
            integração de saúde real.
          </p>
        </div>
        <p className="t-caption">
          Este painel existe só para conduzir o teste. Ele não faz parte do aplicativo e não aparece
          no celular.
        </p>
      </div>

      <div className="guide__card">
        <p className="t-card-title">Fluxo principal</p>
        <ol className="guide__list t-caption">
          <li>Boas-vindas e onboarding em 5 passos</li>
          <li>Revisar o plano inicial e abrir Hoje</li>
          <li>Fazer o check-in e receber a decisão</li>
          <li>Abrir a explicação e a comparação antes/depois</li>
          <li>Aceitar, ajustar ou manter o plano original</li>
          <li>Ver a semana atualizada em Plano</li>
          <li>Iniciar o treino, registrar séries e substituir um exercício</li>
          <li>Pausar, concluir e responder o pós-treino</li>
          <li>Abrir a revisão semanal e o histórico de decisões</li>
        </ol>
      </div>

      <div className="guide__card">
        <p className="t-card-title">Ir direto para um estado</p>
        <div className="guide__jump">
          <button
            className="guide__jump-btn"
            onClick={() => {
              dispatch({ type: 'reset-demo' });
              dispatch({ type: 'go', route: 'welcome' });
              backToDevice();
            }}
          >
            Boas-vindas
          </button>
          <button
            className="guide__jump-btn"
            onClick={() => {
              dispatch({ type: 'go', route: 'onboarding' });
              dispatch({ type: 'onboarding-step', step: 0 });
              backToDevice();
            }}
          >
            Onboarding
          </button>
          <button
            className="guide__jump-btn"
            onClick={() => {
              dispatch({ type: 'go', route: 'onboarding' });
              dispatch({ type: 'onboarding-step', step: 4 });
              backToDevice();
            }}
          >
            Plano inicial
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'checkin-reset' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Hoje — sem check-in
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Hoje — plano adaptado
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                openSheet('checkin');
              })
            }
          >
            Check-in diário
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                openSheet('explanation');
              })
            }
          >
            Explicação
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                openSheet('diff');
              })
            }
          >
            Antes e depois
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'decision-response', response: 'aceita' });
                dispatch({ type: 'tab', tab: 'plano' });
              })
            }
          >
            Semana atualizada
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'tab', tab: 'treino' });
              })
            }
          >
            Pré-treino
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'workout-phase', phase: 'live' });
              })
            }
          >
            Treino ao vivo
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'workout-phase', phase: 'live' });
                openSheet('substitute', 'ex-remada-apoiada');
              })
            }
          >
            Substituir exercício
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'workout-phase', phase: 'paused' });
              })
            }
          >
            Treino pausado
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'workout-phase', phase: 'finished' });
                openSheet('post-workout');
              })
            }
          >
            Pós-treino
          </button>
          <button
            className="guide__jump-btn"
            onClick={() => jumpTo(() => openSheet('week-review'))}
          >
            Revisão semanal
          </button>
          <button className="guide__jump-btn" onClick={() => jumpTo(() => openSheet('history'))}>
            Histórico de decisões
          </button>
          <button
            className="guide__jump-btn"
            onClick={() => jumpTo(() => dispatch({ type: 'tab', tab: 'progresso' }))}
          >
            Progresso
          </button>
        </div>
      </div>

      <div className="guide__card">
        <p className="t-card-title">Estados do motor</p>
        <p className="t-caption">
          A decisão é recalculada a partir do check-in por regras determinísticas. Estes atalhos
          mudam as entradas, não o texto.
        </p>
        <div className="guide__jump">
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Condensar (oficial)
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'checkin-reset' });
                dispatch({
                  type: 'checkin-patch',
                  patch: { ...OFFICIAL_CHECKIN, availableMinutes: 75, discomfortLevel: 'nenhum', energy: 5, sleepHours: 7.5 },
                });
                dispatch({ type: 'checkin-submit' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Plano mantido
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'checkin-reset' });
                dispatch({
                  type: 'checkin-patch',
                  patch: { sleepHours: 6.3, energy: 3, discomfortLevel: null, availableMinutes: null },
                });
                dispatch({ type: 'checkin-submit' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Confiança baixa
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'checkin-reset' });
                dispatch({ type: 'checkin-patch', patch: { energy: 3 } });
                dispatch({ type: 'checkin-submit' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Dados insuficientes
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({
                  type: 'checkin-patch',
                  patch: {
                    ...OFFICIAL_CHECKIN,
                    discomfortLevel: 'forte',
                    discomfortRegion: 'Ombro',
                  },
                });
                dispatch({ type: 'checkin-submit' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Segurança
          </button>
          <button
            className="guide__jump-btn"
            onClick={() =>
              jumpTo(() => {
                dispatch({ type: 'prefill-official-checkin' });
                dispatch({ type: 'decision-response', response: 'rejeitada' });
                dispatch({ type: 'tab', tab: 'hoje' });
              })
            }
          >
            Recomendação rejeitada
          </button>
        </div>
      </div>

      <div className="guide__card">
        <p className="t-card-title">Estados de sistema</p>
        <div className="stack stack--sm">
          <Segmented
            label="Conectividade"
            value={state.connectivity}
            onChange={(v) => dispatch({ type: 'connectivity', value: v })}
            options={[
              { value: 'online', label: 'Online' },
              { value: 'offline', label: 'Offline' },
              { value: 'sync_pendente', label: 'Sync pendente' },
            ]}
          />
          <Switch
            label="Erro recuperável"
            description="Falha ao atualizar, com dados anteriores utilizáveis"
            checked={state.recoverableError}
            onChange={(v) => dispatch({ type: 'recoverable-error', value: v })}
          />
          <Switch
            label="Carregando"
            description="Esqueleto da Home enquanto a decisão é preparada"
            checked={state.loading}
            onChange={(v) => {
              dispatch({ type: 'loading', value: v });
              if (v) window.setTimeout(() => dispatch({ type: 'loading', value: false }), 2200);
            }}
          />
          <Switch
            label="Integração de saúde conectada"
            description="Demonstra o estado 'não conectada' por padrão"
            checked={state.healthIntegrationConnected}
            onChange={() => dispatch({ type: 'toggle-integration' })}
          />
        </div>
      </div>

      <div className="guide__card">
        <p className="t-card-title">Acessibilidade e aparência</p>
        <div className="stack stack--sm">
          <Segmented
            label="Tema"
            value={state.theme}
            onChange={(v) => dispatch({ type: 'pref', patch: { theme: v } })}
            options={[
              { value: 'dark', label: 'Escuro' },
              { value: 'light', label: 'Claro' },
            ]}
          />
          <Segmented
            label="Tamanho do texto"
            value={state.textScale}
            onChange={(v) => dispatch({ type: 'pref', patch: { textScale: v } })}
            options={[
              { value: '100', label: '100%' },
              { value: '130', label: '130%' },
              { value: '160', label: '160%' },
              { value: '200', label: '200%' },
            ]}
          />
          <Switch
            label="Alto contraste"
            checked={state.contrast === 'high'}
            onChange={(v) => dispatch({ type: 'pref', patch: { contrast: v ? 'high' : 'normal' } })}
          />
          <Switch
            label="Transparência reduzida"
            description="Troca todo o vidro por superfícies sólidas equivalentes"
            checked={state.transparency === 'reduced'}
            onChange={(v) =>
              dispatch({ type: 'pref', patch: { transparency: v ? 'reduced' : 'normal' } })
            }
          />
          <Switch
            label="Movimento reduzido"
            checked={state.motion === 'reduced'}
            onChange={(v) => dispatch({ type: 'pref', patch: { motion: v ? 'reduced' : 'full' } })}
          />
          <Switch
            label="Mascote visível"
            description="Compare a experiência com e sem personagem"
            checked={state.mascotVisible}
            onChange={(v) => dispatch({ type: 'pref', patch: { mascotVisible: v } })}
          />
        </div>
      </div>

      <div className="guide__card">
        <p className="t-card-title">Limites deste protótipo</p>
        <ul className="guide__list t-caption">
          <li>Dados simulados e estado local. Nenhum backend, conta ou cobrança.</li>
          <li>A lógica é determinística e serve para demonstrar o produto, não para validar treino.</li>
          <li>Não há diagnóstico, prescrição nem avaliação de condição de saúde.</li>
          <li>Nenhum dado de participante real é usado.</li>
          <li>Paleta, tipografia e mascote continuam provisórios até os testes.</li>
        </ul>
        <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'reset-demo' })} icon="undo">
          Reiniciar demonstração
        </Button>
      </div>
    </div>
  );
}
