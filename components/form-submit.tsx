"use client";

import { useFormStatus } from "react-dom";

export function FormSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-60"
      aria-label={label}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}
