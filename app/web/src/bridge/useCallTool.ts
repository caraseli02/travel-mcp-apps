import React from "react";

type JsonRpcResponse = {
  id?: string;
  result?: unknown;
  error?: { message?: string };
};

const safeJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const postRpc = (method: string, params: Record<string, unknown>, timeout = 8000): Promise<unknown> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Bridge is not available outside the browser."));
  }

  return new Promise((resolve, reject) => {
    const id = `travel-widget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error(`${method} timed out`));
    }, timeout);

    function handleMessage(event: MessageEvent) {
      const message = (
        typeof event.data === "string" ? safeJson(event.data) : event.data
      ) as JsonRpcResponse | undefined;
      if (!message || message.id !== id) return;

      window.clearTimeout(timer);
      window.removeEventListener("message", handleMessage);
      if (message.error) {
        reject(new Error(message.error.message || "Bridge request failed"));
      } else {
        resolve(message.result);
      }
    }

    window.addEventListener("message", handleMessage);
    window.parent?.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
  });
};

export function useCallTool() {
  const [isCalling, setIsCalling] = React.useState(false);

  const callTool = React.useCallback(async (toolName: string, args: Record<string, unknown>) => {
    setIsCalling(true);
    try {
      if (typeof window !== "undefined" && (window as any).openai?.callTool) {
        return await (window as any).openai.callTool(toolName, args);
      }
      return await postRpc("tools/call", { name: toolName, arguments: args });
    } finally {
      setIsCalling(false);
    }
  }, []);

  const sendFollowUpMessage = React.useCallback(async (message: string) => {
    if (typeof window !== "undefined" && (window as any).openai?.sendFollowUpMessage) {
      await (window as any).openai.sendFollowUpMessage({ prompt: message });
      return;
    }
    window.parent?.postMessage(
      {
        jsonrpc: "2.0",
        method: "ui/message",
        params: { role: "user", content: [{ type: "text", text: message }] },
      },
      "*",
    );
  }, []);

  const requestClose = React.useCallback(async () => {
    if (typeof window !== "undefined" && (window as any).openai?.requestClose) {
      await (window as any).openai.requestClose();
    }
  }, []);

  return { callTool, sendFollowUpMessage, requestClose, isCalling };
}
