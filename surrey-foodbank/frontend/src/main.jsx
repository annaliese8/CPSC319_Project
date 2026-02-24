import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { initDemoData } from "./utils/InitDemoData.jsx";
import App from "./App.jsx";

// Load demo data into local storage upon app launch
initDemoData();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
