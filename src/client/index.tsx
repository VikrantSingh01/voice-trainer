import React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, teamsLightTheme, teamsDarkTheme } from "@fluentui/react-components";
import { app } from "@microsoft/teams-js";
import App from "./App";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

function renderApp(theme = teamsLightTheme) {
  root.render(
    <React.StrictMode>
      <FluentProvider theme={theme}>
        <App />
      </FluentProvider>
    </React.StrictMode>
  );
}

// Shared promise so useTeamsAuth (and others) can await the same init — no double calls
export const teamsInitPromise: Promise<boolean> = (async () => {
  try {
    await app.initialize();
    return true;
  } catch {
    return false;
  }
})();

async function initializeApp() {
  // Render immediately — never leave Teams with a blank frame waiting for SDK init
  renderApp();

  const inTeams = await teamsInitPromise;

  if (inTeams) {
    // Tell Teams to remove its loading overlay immediately
    app.notifyAppLoaded();

    try {
      const context = await app.getContext();
      if (context.app.theme === "dark") {
        renderApp(teamsDarkTheme);
      }
    } catch {
      // Context fetch failed — keep default theme
    }

    // Tell Teams the app is fully ready
    app.notifySuccess();
  } else {
    console.log("Running outside Microsoft Teams");
  }
}

initializeApp();
