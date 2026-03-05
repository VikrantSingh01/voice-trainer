import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  makeStyles,
  Tab,
  TabList,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  Mic24Regular,
  BookOpen24Regular,
  DataBarVertical24Regular,
  Chat24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    padding: "8px 20px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginRight: "24px",
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
  },
});

const tabs = [
  { value: "/practice", label: "Practice", icon: <Mic24Regular /> },
  { value: "/lessons", label: "Lessons", icon: <BookOpen24Regular /> },
  { value: "/conversation", label: "Conversation", icon: <Chat24Regular /> },
  { value: "/dashboard", label: "Dashboard", icon: <DataBarVertical24Regular /> },
];

export const NavBar: React.FC = () => {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = tabs.find((t) => location.pathname.startsWith(t.value))?.value || "/practice";

  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <Text size={500} className={styles.title}>
          🎤 Voice Trainer
        </Text>
      </div>
      <TabList
        selectedValue={currentTab}
        onTabSelect={(_e, data) => navigate(data.value as string)}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </div>
  );
};
