import { useSession } from "@/lib/auth-client";
import { PropsWithChildren } from "react";

export function LoggedInUser({ children }: PropsWithChildren) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
