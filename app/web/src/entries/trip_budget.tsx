import React from "react";
import { createRoot } from "react-dom/client";
import { TripBudget } from "../trip-components";
import { useToolOutput } from "../bridge/useToolOutput";
import "../index.css";

function App() {
  const data = useToolOutput();
  return <TripBudget budget={data || { rows: [] }} />;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
