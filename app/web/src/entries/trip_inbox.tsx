import React from "react";
import { createRoot } from "react-dom/client";
import { TripInbox } from "../trip-components";
import { useToolOutput } from "../bridge/useToolOutput";
import "../index.css";

function App() {
  const data = useToolOutput();
  return <TripInbox inbox={data || { items: [] }} />;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
