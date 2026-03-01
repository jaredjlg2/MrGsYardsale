"use client";

import { useFormState } from "react-dom";
import { FormSubmit } from "@/components/form-submit";

export function AuthForm({
  action,
  mode
}: {
  action: (prev: unknown, formData: FormData) => Promise<{ error?: string } | void>;
  mode: "login" | "signup";
}) {
  const [state, formAction] = useFormState(action, { error: "" });

  return (
    <form action={formAction} className="space-y-4 rounded border bg-white p-6">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="mb-1 block text-sm">Name</label>
          <input id="name" name="name" required className="w-full rounded border p-2" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm">Email</label>
        <input id="email" name="email" type="email" required className="w-full rounded border p-2" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm">Password</label>
        <input id="password" name="password" type="password" required className="w-full rounded border p-2" />
      </div>
      <FormSubmit label={mode === "login" ? "Sign in" : "Create account"} />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
