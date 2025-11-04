import { SignIn } from "@clerk/nextjs";
import { CornerUpLeft } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="mx-auto my-32 flex max-w-sm flex-col gap-4 px-4">
      <div>
        <Link title="Back to home" className="text-zinc-400" href="/">
          <CornerUpLeft size={18} />
        </Link>
      </div>
      <div className="flex justify-center">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none",
            },
          }}
          redirectUrl="/blogs"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
