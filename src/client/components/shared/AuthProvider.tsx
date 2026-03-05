import React, { createContext, useContext, ReactNode } from "react";
import { useTeamsAuth } from "../../hooks/useTeamsAuth";

interface User {
  userId: string;
  displayName: string;
  email: string;
  mode: "sso" | "demo";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInTeams: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isInTeams: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useTeamsAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
