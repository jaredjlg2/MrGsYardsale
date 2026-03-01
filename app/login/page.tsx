import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { loginUser } from "@/app/actions";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <AuthForm action={loginUser} mode="login" />
      <p className="text-sm">Need an account? <Link href="/signup">Sign up</Link>.</p>
    </div>
  );
}
