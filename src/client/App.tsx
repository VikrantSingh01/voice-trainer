import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { app } from "@microsoft/teams-js";
import { NavBar } from "./components/shared/NavBar";
import { AuthProvider } from "./components/shared/AuthProvider";
import { DemoModeBanner } from "./components/shared/DemoModeBanner";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { PracticePanel } from "./components/PracticePanel/PracticePanel";
import { LessonsPanel } from "./components/LessonsPanel/LessonsPanel";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { ConversationPanel } from "./components/ConversationPanel/ConversationPanel";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",        // inherits from #root which is 100% of body/html
    minHeight: "100vh",    // fallback: never collapse even if ancestor height unset
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    padding: "20px",
  },
});

const App: React.FC = () => {
  const styles = useStyles();

  return (
    <AuthProvider>
      <HashRouter>
        <div className={styles.root}>
          <DemoModeBanner />
          {!app.isInitialized() && <NavBar />}
          <div className={styles.content}>
            <Routes>
              <Route path="/practice" element={<ErrorBoundary fallbackLabel="Practice tab error"><PracticePanel /></ErrorBoundary>} />
              <Route path="/lessons" element={<ErrorBoundary fallbackLabel="Lessons tab error"><LessonsPanel /></ErrorBoundary>} />
              <Route path="/conversation" element={<ErrorBoundary fallbackLabel="Conversation tab error"><ConversationPanel /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary fallbackLabel="Dashboard tab error"><Dashboard /></ErrorBoundary>} />
              <Route path="*" element={<Navigate to="/practice" replace />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
