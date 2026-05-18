import React from "react";
import { createRoot } from "react-dom/client";
import { TripItinerary } from "../trip-components";
import { useToolOutput } from "../bridge/useToolOutput";
import "../index.css";

function App() {
  const data = useToolOutput();
  return <TripItinerary itinerary={data || { days: [] }} />;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
