import { useUser } from "@clerk/nextjs";
import { PropsWithChildren } from "react";

export function LoggedInUser({ children }: PropsWithChildren) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
