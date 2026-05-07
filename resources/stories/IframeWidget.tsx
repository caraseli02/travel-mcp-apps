/**
 * A thin React wrapper so @storybook/react-vite can render HTML-iframe
 * widget stories produced by renderWidget().
 */
import React, { useEffect, useRef } from "react";
import { renderWidget, type RenderWidgetOptions } from "./renderWidget";

export interface IframeWidgetProps extends RenderWidgetOptions {}

export const IframeWidget: React.FC<IframeWidgetProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    el.appendChild(renderWidget(props));
    // re-run when key props change (storybook controls)
  }, [JSON.stringify(props)]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} style={{ width: props.width ?? "min(900px, 100%)", margin: "0 auto" }} />;
};
