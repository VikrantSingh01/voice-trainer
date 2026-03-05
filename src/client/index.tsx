import React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, teamsLightTheme, teamsDarkTheme } from "@fluentui/react-components";
import { app } from "@microsoft/teams-js";
import App from "./App";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

async function initializeApp() {
  let theme = teamsLightTheme;

  try {
    await app.initialize();
    const context = await app.getContext();
    if (context.app.theme === "dark") {
      theme = teamsDarkTheme;
    }
  } catch {
    // Running outside Teams — use light theme
    console.log("Running outside Microsoft Teams");
  }

  root.render(
    <React.StrictMode>
      <FluentProvider theme={theme}>
        <App />
      </FluentProvider>
    </React.StrictMode>
  );
}

initializeApp();
