import React from "react";
import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Text,
  Badge,
  Divider,
} from "@fluentui/react-components";
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Warning24Filled,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  card: {
    padding: "20px",
  },
  scoresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  scoreItem: {
    textAlign: "center",
    padding: "16px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  scoreValue: {
    fontSize: "32px",
    fontWeight: tokens.fontWeightBold,
    display: "block",
    lineHeight: "1.2",
  },
  wordsSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  wordBadge: {
    padding: "6px 12px",
    cursor: "default",
  },
  phonemeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "8px",
  },
});

interface ScoreDisplayProps {
  result: {
    text: string;
    scores: {
      accuracy: number;
      fluency: number;
      completeness: number;
      prosody: number;
      overall: number;
    };
    words: Array<{
      word: string;
      accuracy: number;
      error: string;
      phonemes: Array<{ phoneme: string; accuracy: number }>;
    }>;
  };
}

function getScoreColor(score: number): "success" | "warning" | "danger" | "informative" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  if (score >= 40) return "danger";
  return "danger";
}

function getScoreIcon(score: number) {
  if (score >= 80) return <CheckmarkCircle24Filled primaryFill={tokens.colorPaletteGreenForeground1} />;
  if (score >= 60) return <Warning24Filled primaryFill={tokens.colorPaletteYellowForeground1} />;
  return <DismissCircle24Filled primaryFill={tokens.colorPaletteRedForeground1} />;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ result }) => {
  const styles = useStyles();

  const scoreCategories = [
    { label: "Overall", value: result.scores.overall },
    { label: "Accuracy", value: result.scores.accuracy },
    { label: "Fluency", value: result.scores.fluency },
    { label: "Completeness", value: result.scores.completeness },
    { label: "Prosody", value: result.scores.prosody },
  ];

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Text weight="semibold" size={400}>Pronunciation Assessment</Text>}
        description={<Text>You said: &quot;{result.text}&quot;</Text>}
      />

      <div className={styles.scoresGrid}>
        {scoreCategories.map((cat) => (
          <div key={cat.label} className={styles.scoreItem}>
            {getScoreIcon(cat.value)}
            <span className={styles.scoreValue} style={{
              color: cat.value >= 80
                ? tokens.colorPaletteGreenForeground1
                : cat.value >= 60
                ? tokens.colorPaletteYellowForeground1
                : tokens.colorPaletteRedForeground1,
            }}>
              {cat.value}
            </span>
            <Text size={200}>{cat.label}</Text>
          </div>
        ))}
      </div>

      <Divider />

      <Text weight="semibold" block style={{ marginTop: "16px" }}>
        Word-by-Word Breakdown
      </Text>
      <div className={styles.wordsSection}>
        {result.words.map((word, idx) => (
          <div key={idx}>
            <Badge
              className={styles.wordBadge}
              appearance="filled"
              color={getScoreColor(word.accuracy)}
              size="large"
            >
              {word.word} ({word.accuracy}%)
            </Badge>
            {word.phonemes && word.phonemes.length > 0 && (
              <div className={styles.phonemeList}>
                {word.phonemes.map((p, pi) => (
                  <Badge
                    key={pi}
                    appearance="outline"
                    color={getScoreColor(p.accuracy)}
                    size="small"
                  >
                    /{p.phoneme}/ {p.accuracy}%
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
