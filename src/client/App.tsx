import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { NavBar } from "./components/shared/NavBar";
import { AuthProvider } from "./components/shared/AuthProvider";
import { DemoModeBanner } from "./components/shared/DemoModeBanner";
import { PracticePanel } from "./components/PracticePanel/PracticePanel";
import { LessonsPanel } from "./components/LessonsPanel/LessonsPanel";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { ConversationPanel } from "./components/ConversationPanel/ConversationPanel";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
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
          <NavBar />
          <div className={styles.content}>
            <Routes>
              <Route path="/practice" element={<PracticePanel />} />
              <Route path="/lessons" element={<LessonsPanel />} />
              <Route path="/conversation" element={<ConversationPanel />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/practice" replace />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
