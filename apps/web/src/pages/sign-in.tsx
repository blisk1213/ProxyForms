import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CornerUpLeft, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign in");
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      const redirect = router.query.redirect as string;
      router.push(redirect || "/blogs");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto my-32 flex max-w-sm flex-col gap-4 px-4">
      <div>
        <Link title="Back to home" className="text-zinc-400" href="/">
          <CornerUpLeft size={18} />
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and password to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-orange-500 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
