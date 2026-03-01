import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { createUser } from "@/app/actions";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      <AuthForm action={createUser} mode="signup" />
      <p className="text-sm">Already registered? <Link href="/login">Log in</Link>.</p>
    </div>
  );
}
