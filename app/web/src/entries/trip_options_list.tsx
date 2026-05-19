import React from "react";
import { createRoot } from "react-dom/client";
import { TravelOptionsList } from "../trip-components";
import { useToolOutput } from "../bridge/useToolOutput";
import "../index.css";

function App() {
  const data = useToolOutput();
  return <TravelOptionsList data={data || { options: [] }} />;
}

const rootElement = document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<App />);
