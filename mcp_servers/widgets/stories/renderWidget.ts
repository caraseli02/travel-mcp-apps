export interface Theme {
  colorScheme: "light" | "dark";
  spacing: "comfortable" | "compact";
}

export interface RenderWidgetOptions {
  url: string;
  mockData?: any;
  data?: any;
  toolOutput?: any;
  toolInput?: Record<string, any>;
  widgetState?: Record<string, any>;
  displayMode?: "inline" | "pip" | "fullscreen";
  theme?: Theme;
  height?: string;
  width?: string;
  onStateChange?: (state: Record<string, any>) => void;
  _meta?: Record<string, any>;
}

interface HostState {
  toolInput: Record<string, any>;
  toolOutput: any;
  displayMode: string;
  theme: Theme;
  widgetState: Record<string, any>;
  openInAppUrl?: string;
  _meta: Record<string, any>;
}

interface OpenAI {
  toolInput: Record<string, any>;
  toolOutput: any;
  displayMode: string;
  theme: Theme;
  widgetState: Record<string, any>;
  openInAppUrl?: string;
  _meta: Record<string, any>;
  setWidgetState: (nextState: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => Promise<Record<string, any>>;
  setOpenInAppUrl: (value: string) => Promise<string>;
  callTool: (name: string, input: Record<string, any>) => Promise<Record<string, any>>;
  sendFollowUpMessage: (message: string) => Promise<void>;
  requestClose: () => Promise<void>;
}

declare global {
  interface Window {
    openai?: OpenAI;
  }
}

const defaultTheme: Theme = {
  colorScheme: "light",
  spacing: "comfortable",
};

const dispatchHostUpdate = (targetWindow: Window, hostState: HostState): void => {
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

const installOpenAiHost = (
  iframe: HTMLIFrameElement,
  hostState: HostState,
  onStateChange?: (state: Record<string, any>) => void
): void => {
  const targetWindow = iframe.contentWindow;
  if (!targetWindow) return;

  const openai: OpenAI = {
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
    callTool(name, input) {
      const summary = name === "submit_trip_clarification"
        ? "Storybook captured the trip clarification answers."
        : `Storybook called ${name}.`;
      return Promise.resolve({
        structuredContent: {
          result: summary,
          tool: name,
          input,
        },
        result: summary,
        content: [{ type: "text", text: summary }],
        _meta: { "openai/closeWidget": name === "submit_trip_clarification" },
      });
    },
    sendFollowUpMessage(message) {
      console.info("Storybook follow-up message:", message);
      return Promise.resolve();
    },
    requestClose() {
      console.info("Storybook widget close requested");
      return Promise.resolve();
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
}: RenderWidgetOptions): HTMLDivElement => {
  const resolvedToolOutput = toolOutput ?? data ?? mockData;
  const hostState: HostState = {
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
