const defaultTheme = {
  colorScheme: "light",
  spacing: "comfortable",
};

const dispatchHostUpdate = (targetWindow, hostState) => {
  targetWindow.dispatchEvent(
    new CustomEvent("openai:set_globals", {
      detail: { globals: hostState },
    })
  );

  targetWindow.postMessage(
    {
      jsonrpc: "2.0",
      method: "ui/notifications/tool-result",
      params: {
        structuredContent: hostState.toolOutput,
        toolOutput: hostState.toolOutput,
        _meta: hostState._meta,
      },
    },
    "*"
  );
};

const installOpenAiHost = (iframe, hostState, onStateChange) => {
  const targetWindow = iframe.contentWindow;
  if (!targetWindow) return;

  const openai = {
    ...hostState,
    setWidgetState(nextState) {
      hostState.widgetState =
        typeof nextState === "function" ? nextState(hostState.widgetState) : nextState;
      openai.widgetState = hostState.widgetState;
      onStateChange?.(hostState.widgetState);
      dispatchHostUpdate(targetWindow, hostState);
      return Promise.resolve(hostState.widgetState);
    },
    setOpenInAppUrl(value) {
      hostState.openInAppUrl = value;
      openai.openInAppUrl = value;
      return Promise.resolve(value);
    },
  };

  targetWindow.openai = openai;
  dispatchHostUpdate(targetWindow, hostState);
};

export const renderWidget = ({
  url,
  mockData,
  data,
  toolOutput,
  toolInput = {},
  widgetState = {},
  displayMode = "inline",
  theme = defaultTheme,
  height = "700px",
  width = "min(900px, 100%)",
  onStateChange,
  _meta = {},
}) => {
  const resolvedToolOutput = toolOutput ?? data ?? mockData;
  const hostState = {
    toolInput,
    toolOutput: resolvedToolOutput,
    displayMode,
    theme,
    widgetState,
    _meta,
  };

  const container = document.createElement('div');
  container.style.width = width;
  container.style.margin = '0 auto';

  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = `Widget preview: ${url}`;
  iframe.style.width = '100%';
  iframe.style.height = height;
  iframe.style.border = 'none';

  iframe.addEventListener('load', () => {
    installOpenAiHost(iframe, hostState, onStateChange);
  });

  container.appendChild(iframe);
  return container;
};
