import Spinner from "@/components/Spinner";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignOut() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut().then(() => {
      router.push("/");
    });
  }, [signOut, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-slate-600">Signing out...</p>
      </div>
    </div>
  );
}
