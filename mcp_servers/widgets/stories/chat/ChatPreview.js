import { renderWidget } from '../renderWidget.js';
import { chatScenarios } from './scenarios.js';

const styles = `
  .chat-preview {
    min-height: 100vh;
    background: #f7f7f4;
    color: #171412;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .chat-shell {
    max-width: 980px;
    margin: 0 auto;
    padding: 24px 18px 48px;
  }

  .chat-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
    padding: 0 0 18px;
    border-bottom: 1px solid #e3ded7;
  }

  .chat-kicker {
    margin: 0 0 4px;
    color: #81796f;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .chat-title {
    margin: 0;
    font-size: 22px;
    line-height: 1.2;
  }

  .chat-meta {
    color: #6f6a64;
    font-size: 13px;
    white-space: nowrap;
  }

  .chat-thread {
    display: grid;
    gap: 18px;
    padding-top: 22px;
  }

  .chat-turn {
    display: grid;
    gap: 8px;
  }

  .chat-turn.user {
    justify-items: end;
  }

  .chat-bubble {
    max-width: min(720px, 88%);
    padding: 12px 14px;
    border: 1px solid #e3ded7;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(23, 20, 18, 0.04);
  }

  .chat-turn.user .chat-bubble {
    background: #171412;
    color: #ffffff;
    border-color: #171412;
  }

  .chat-bubble p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .tool-card {
    width: 100%;
    overflow: hidden;
    border: 1px solid #ded8cf;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(23, 20, 18, 0.04);
  }

  .tool-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid #ebe6df;
    background: #fbfaf8;
  }

  .tool-name,
  .tool-status {
    margin: 0;
    font-size: 12px;
    line-height: 1.2;
  }

  .tool-name {
    color: #73351e;
    font-weight: 700;
  }

  .tool-status {
    color: #6f6a64;
  }

  .tool-widget {
    padding: 0;
  }

  @media (max-width: 720px) {
    .chat-shell {
      padding: 16px 10px 32px;
    }

    .chat-header {
      align-items: start;
      flex-direction: column;
    }

    .chat-meta {
      white-space: normal;
    }

    .chat-bubble {
      max-width: 94%;
    }
  }
`;

const createTextTurn = (turn) => {
  const wrapper = document.createElement('article');
  wrapper.className = `chat-turn ${turn.role}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  const text = document.createElement('p');
  text.textContent = turn.text;
  bubble.appendChild(text);
  wrapper.appendChild(bubble);

  return wrapper;
};

const createToolTurn = (turn, hostArgs) => {
  const wrapper = document.createElement('article');
  wrapper.className = 'chat-turn tool';

  const card = document.createElement('section');
  card.className = 'tool-card';

  const header = document.createElement('header');
  header.className = 'tool-card-header';

  const name = document.createElement('p');
  name.className = 'tool-name';
  name.textContent = turn.label || 'tool';

  const status = document.createElement('p');
  status.className = 'tool-status';
  status.textContent = turn.status || 'Results ready';

  header.append(name, status);

  const widgetSlot = document.createElement('div');
  widgetSlot.className = 'tool-widget';
  widgetSlot.appendChild(
    renderWidget({
      ...turn.widget,
      displayMode: hostArgs.displayMode,
      theme: hostArgs.theme,
      widgetState: hostArgs.widgetState,
      width: '100%',
    })
  );

  card.append(header, widgetSlot);
  wrapper.appendChild(card);
  return wrapper;
};

export const createChatPreview = ({
  scenarioId = 'weather-activities-packing',
  displayMode = 'inline',
  theme = { colorScheme: 'light', spacing: 'comfortable' },
  widgetState = {},
} = {}) => {
  const scenario = chatScenarios[scenarioId] ?? chatScenarios['weather-activities-packing'];

  const root = document.createElement('main');
  root.className = 'chat-preview';

  const style = document.createElement('style');
  style.textContent = styles;
  root.appendChild(style);

  const shell = document.createElement('section');
  shell.className = 'chat-shell';

  const header = document.createElement('header');
  header.className = 'chat-header';
  header.innerHTML = `
    <div>
      <p class="chat-kicker">Chat preview</p>
      <h1 class="chat-title"></h1>
    </div>
    <p class="chat-meta">Simulated Apps SDK host</p>
  `;
  header.querySelector('.chat-title').textContent = scenario.title;

  const thread = document.createElement('section');
  thread.className = 'chat-thread';
  thread.setAttribute('aria-label', scenario.title);

  scenario.turns.forEach((turn) => {
    thread.appendChild(
      turn.role === 'tool'
        ? createToolTurn(turn, { displayMode, theme, widgetState })
        : createTextTurn(turn)
    );
  });

  shell.append(header, thread);
  root.appendChild(shell);
  return root;
};
