import React, { useEffect, useState } from "react";
import {
  makeStyles,
  tokens,
  Title2,
  Text,
  Card,
  CardHeader,
  Spinner,
  Divider,
} from "@fluentui/react-components";
import {
  Trophy24Regular,
  Timer24Regular,
  ArrowTrending24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    padding: "20px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    display: "block",
  },
  historyCard: {
    padding: "20px",
  },
  sessionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
});

interface ProgressData {
  totalSessions: number;
  averageScores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
  } | null;
  recentSessions: Array<{
    id: string;
    lessonId: string;
    exerciseId: string;
    scores: { overall: number; accuracy: number; fluency: number };
    timestamp: string;
  }>;
  lessonsCompleted: number;
}

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual user ID from Teams SSO
    const userId = "demo-user";
    fetch(`/api/progress/${userId}`)
      .then((r) => r.json())
      .then(setProgress)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  if (!progress || progress.totalSessions === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Trophy24Regular style={{ fontSize: "48px", marginBottom: "16px" }} />
          <Title2>No practice sessions yet</Title2>
          <Text block style={{ marginTop: "8px" }}>
            Head to the Practice tab to start your first pronunciation exercise!
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2>Your Progress</Title2>
        <Text block>Track your pronunciation improvement over time</Text>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <Timer24Regular />
          <span className={styles.statValue}>{progress.totalSessions}</span>
          <Text>Total Sessions</Text>
        </Card>
        <Card className={styles.statCard}>
          <Trophy24Regular />
          <span className={styles.statValue}>{progress.averageScores?.overall ?? 0}%</span>
          <Text>Average Score</Text>
        </Card>
        <Card className={styles.statCard}>
          <ArrowTrending24Regular />
          <span className={styles.statValue}>{progress.averageScores?.accuracy ?? 0}%</span>
          <Text>Accuracy</Text>
        </Card>
        <Card className={styles.statCard}>
          <ArrowTrending24Regular />
          <span className={styles.statValue}>{progress.lessonsCompleted}</span>
          <Text>Lessons Explored</Text>
        </Card>
      </div>

      <Card className={styles.historyCard}>
        <CardHeader header={<Text weight="semibold" size={400}>Recent Sessions</Text>} />
        <Divider />
        {progress.recentSessions.map((session) => (
          <div key={session.id} className={styles.sessionRow}>
            <div>
              <Text weight="semibold">{session.lessonId}</Text>
              <Text size={200} block>
                {new Date(session.timestamp).toLocaleDateString()} at{" "}
                {new Date(session.timestamp).toLocaleTimeString()}
              </Text>
            </div>
            <Text
              weight="semibold"
              style={{
                color:
                  session.scores.overall >= 80
                    ? tokens.colorPaletteGreenForeground1
                    : session.scores.overall >= 60
                    ? tokens.colorPaletteYellowForeground1
                    : tokens.colorPaletteRedForeground1,
              }}
            >
              {session.scores.overall}%
            </Text>
          </div>
        ))}
      </Card>
    </div>
  );
};
