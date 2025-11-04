import { useEffect } from "react";
import { useRouter } from "next/router";
import { signOut } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut();
      router.push("/");
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-sm text-zinc-500">Signing out...</p>
      </div>
    </div>
  );
}
