import { useEffect, useState } from "react";

export function useToolOutput() {
  const [data, setData] = useState<any>(() => {
    const raw = (window as any).openai?.toolOutput;
    return raw?.structuredContent ?? raw?.toolOutput ?? raw;
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let message = event.data;
      if (typeof message === "string") {
        try {
          message = JSON.parse(message);
        } catch {
          return;
        }
      }
      if (message?.jsonrpc === "2.0" && message.method === "ui/notifications/tool-result") {
        const raw = message.params;
        setData(raw?.structuredContent ?? raw?.toolOutput ?? raw);
      }
    };

    const handleGlobals = (event: any) => {
      const raw = event.detail?.globals?.toolOutput ?? (window as any).openai?.toolOutput;
      setData(raw?.structuredContent ?? raw?.toolOutput ?? raw);
    };

    window.addEventListener("message", handleMessage, { passive: true });
    window.addEventListener("openai:set_globals", handleGlobals, { passive: true });

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("openai:set_globals", handleGlobals);
    };
  }, []);

  // Poll for late output injection (ChatGPT Developer Mode specific)
  useEffect(() => {
    let checksRemaining = 50;
    const checkForLateOutput = setInterval(() => {
      const raw = (window as any).openai?.toolOutput;
      if (raw) {
        setData(raw?.structuredContent ?? raw?.toolOutput ?? raw);
        clearInterval(checkForLateOutput);
      }
      checksRemaining -= 1;
      if (checksRemaining <= 0) clearInterval(checkForLateOutput);
    }, 100);

    return () => clearInterval(checkForLateOutput);
  }, []);

  return data;
}
