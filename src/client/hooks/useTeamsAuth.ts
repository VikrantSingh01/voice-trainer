import { useState, useEffect, useCallback } from "react";
import { app, authentication } from "@microsoft/teams-js";

interface User {
  userId: string;
  displayName: string;
  email: string;
  mode: "sso" | "demo";
}

export function useTeamsAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInTeams, setIsInTeams] = useState(false);

  const authenticate = useCallback(async () => {
    try {
      // Try Teams SSO first
      await app.initialize();
      setIsInTeams(true);

      try {
        const token = await authentication.getAuthToken();
        const response = await fetch("/api/auth/token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setLoading(false);
          return;
        }
      } catch (ssoError) {
        console.log("SSO token retrieval failed, using Teams context");
      }

      // Fall back to Teams context
      const context = await app.getContext();
      setUser({
        userId: context.user?.id || "teams-user",
        displayName: context.user?.displayName || "Teams User",
        email: context.user?.loginHint || "",
        mode: "demo",
      });
    } catch {
      // Not in Teams — use demo mode
      console.log("Running outside Teams, using demo mode");
      setUser({
        userId: "demo-user",
        displayName: "Demo User",
        email: "demo@example.com",
        mode: "demo",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return { user, loading, isInTeams };
}
