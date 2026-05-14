import React from "react";

type WidgetBridge = {
  widgetState?: Record<string, unknown>;
  setWidgetState?: (state: Record<string, unknown>) => Promise<void> | void;
};

const getBridge = (): WidgetBridge | undefined => {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { openai?: WidgetBridge }).openai;
};

const readWidgetValue = <T,>(key: string, fallback: T): T => {
  const value = getBridge()?.widgetState?.[key];
  return value === undefined ? fallback : (value as T);
};

export function useWidgetState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setLocalValue] = React.useState<T>(() => readWidgetValue(key, initialValue));

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (nextValue) => {
      setLocalValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (current: T) => T)(currentValue)
            : nextValue;
        const bridge = getBridge();
        if (bridge?.setWidgetState) {
          const currentWidgetState = bridge.widgetState ?? {};
          const nextWidgetState = { ...currentWidgetState, [key]: resolvedValue };
          bridge.widgetState = nextWidgetState;
          Promise.resolve(bridge.setWidgetState(nextWidgetState)).catch(() => {});
        }
        return resolvedValue;
      });
    },
    [key],
  );

  React.useEffect(() => {
    setLocalValue(readWidgetValue(key, initialValue));
  }, [initialValue, key]);

  return [value, setValue];
}
