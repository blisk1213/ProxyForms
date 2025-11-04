import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8082",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// For backward compatibility
export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
