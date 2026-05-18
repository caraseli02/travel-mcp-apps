import React from "react";
import { createRoot } from "react-dom/client";
import { TripBoard } from "../trip-components";
import { useToolOutput } from "../bridge/useToolOutput";
import "../index.css";

function App() {
  const data = useToolOutput();
  return <TripBoard board={data || { lanes: {} }} />;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
