import React from "react";
import { createRoot } from "react-dom/client";
import { TravelMediaAlbum } from "../trip-components";
import { useToolOutput } from "../bridge/useToolOutput";
import "../index.css";

function App() {
  const data = useToolOutput();
  return <TravelMediaAlbum data={data || { media: [] }} />;
}

const rootElement = document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<App />);
