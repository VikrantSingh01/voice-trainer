import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { NavBar } from "./components/shared/NavBar";
import { PracticePanel } from "./components/PracticePanel/PracticePanel";
import { LessonsPanel } from "./components/LessonsPanel/LessonsPanel";
import { Dashboard } from "./components/Dashboard/Dashboard";

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
    <HashRouter>
      <div className={styles.root}>
        <NavBar />
        <div className={styles.content}>
          <Routes>
            <Route path="/practice" element={<PracticePanel />} />
            <Route path="/lessons" element={<LessonsPanel />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/practice" replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
