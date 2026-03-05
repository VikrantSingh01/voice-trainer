import React, { useEffect, useState } from "react";
import { makeStyles, tokens, Text, MessageBar, MessageBarBody, Link } from "@fluentui/react-components";

const useStyles = makeStyles({
  banner: {
    borderRadius: 0,
  },
});

export const DemoModeBanner: React.FC = () => {
  const styles = useStyles();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setIsDemoMode(data.demoMode))
      .catch(() => setIsDemoMode(true));
  }, []);

  if (!isDemoMode) return null;

  return (
    <MessageBar intent="warning" className={styles.banner}>
      <MessageBarBody>
        <Text size={200}>
          ⚡ <strong>Demo Mode</strong> — Using simulated AI scores. To enable real pronunciation assessment,{" "}
          <Link href="https://github.com/VikrantSingh01/voice-trainer#-getting-started" target="_blank" inline>
            configure your Azure credentials
          </Link>.
        </Text>
      </MessageBarBody>
    </MessageBar>
  );
};
