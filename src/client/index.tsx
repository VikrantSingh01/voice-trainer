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

async function initializeApp() {
  // Render immediately — never leave Teams with a blank frame waiting for SDK init
  renderApp();

  try {
    await app.initialize();
    // Required: tells Teams to remove its loading overlay and show the app content
    app.notifyAppLoaded();

    const context = await app.getContext();
    if (context.app.theme === "dark") {
      // Re-render with correct theme; FluentProvider swaps tokens in place
      renderApp(teamsDarkTheme);
    }
    // Required: tells Teams the app is fully ready
    app.notifySuccess();
  } catch {
    // Running outside Teams — already rendered above with default theme
    console.log("Running outside Microsoft Teams");
  }
}

initializeApp();
