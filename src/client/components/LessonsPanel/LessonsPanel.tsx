import React, { useEffect, useState } from "react";
import {
  makeStyles,
  tokens,
  Title2,
  Text,
  Card,
  CardHeader,
  Badge,
  Button,
  Spinner,
} from "@fluentui/react-components";
import { BookOpen24Regular, ArrowRight24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    ":hover": {
      boxShadow: tokens.shadow8,
    },
  },
  cardContent: {
    padding: "16px",
  },
  tags: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  exerciseList: {
    padding: "20px",
  },
  exerciseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
});

interface LessonSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  exerciseCount: number;
}

interface Exercise {
  id: string;
  type: string;
  text: string;
  ipa: string;
  hint?: string;
}

interface LessonDetail {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}

const difficultyColor: Record<string, "informative" | "warning" | "danger"> = {
  beginner: "informative",
  intermediate: "warning",
  advanced: "danger",
};

export const LessonsPanel: React.FC = () => {
  const styles = useStyles();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => r.json())
      .then(setLessons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openLesson = async (id: string) => {
    const res = await fetch(`/api/lessons/${id}`);
    const data = await res.json();
    setSelectedLesson(data);
  };

  if (loading) return <Spinner label="Loading lessons..." />;

  if (selectedLesson) {
    return (
      <div className={styles.container}>
        <Button
          appearance="subtle"
          onClick={() => setSelectedLesson(null)}
          style={{ marginBottom: "16px" }}
        >
          ← Back to Lessons
        </Button>
        <Title2>{selectedLesson.title}</Title2>
        <Text block style={{ marginBottom: "16px" }}>
          {selectedLesson.description}
        </Text>
        <Card className={styles.exerciseList}>
          {selectedLesson.exercises.map((ex, idx) => (
            <div key={ex.id} className={styles.exerciseItem}>
              <div>
                <Badge appearance="outline" size="small" style={{ marginRight: "8px" }}>
                  {ex.type}
                </Badge>
                <Text weight="semibold">{ex.text}</Text>
                <Text size={200} style={{ marginLeft: "8px", fontStyle: "italic" }}>
                  {ex.ipa}
                </Text>
                {ex.hint && (
                  <Text block size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    💡 {ex.hint}
                  </Text>
                )}
              </div>
              <Button
                appearance="subtle"
                icon={<ArrowRight24Regular />}
                onClick={() => {
                  // Navigate to practice with this text pre-filled
                  window.location.hash = `/practice?text=${encodeURIComponent(ex.text)}`;
                }}
              >
                Practice
              </Button>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2>Lessons</Title2>
        <Text block>Structured exercises to improve your pronunciation</Text>
      </div>
      <div className={styles.grid}>
        {lessons.map((lesson) => (
          <Card key={lesson.id} className={styles.card} onClick={() => openLesson(lesson.id)}>
            <CardHeader
              image={<BookOpen24Regular />}
              header={<Text weight="semibold">{lesson.title}</Text>}
              description={<Text size={200}>{lesson.description}</Text>}
            />
            <div className={styles.cardContent}>
              <Text size={200}>{lesson.exerciseCount} exercises</Text>
              <div className={styles.tags}>
                <Badge appearance="outline" color={difficultyColor[lesson.difficulty] || "informative"}>
                  {lesson.difficulty}
                </Badge>
                <Badge appearance="outline">{lesson.category}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
