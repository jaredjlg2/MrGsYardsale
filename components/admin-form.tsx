"use client";

import { useFormState } from "react-dom";
import { createAuctionItem } from "@/app/actions";
import { FormSubmit } from "@/components/form-submit";

const initialState = { error: "", success: "" };

export function AdminForm() {
  const [state, formAction] = useFormState(createAuctionItem, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded border bg-white p-4">
      <input name="title" required placeholder="Title" className="w-full rounded border p-2" />
      <input name="category" required placeholder="Category" className="w-full rounded border p-2" />
      <textarea name="description" required placeholder="Description" className="w-full rounded border p-2" />
      <div className="grid grid-cols-2 gap-2">
        <input name="startingBid" type="number" step="0.01" required placeholder="Starting bid (USD)" className="rounded border p-2" />
        <input name="bidIncrement" type="number" step="0.01" required placeholder="Increment (USD)" className="rounded border p-2" />
      </div>
      <input name="endAt" type="datetime-local" required className="w-full rounded border p-2" />
      <textarea name="imageUrls" required placeholder="One image URL per line" className="w-full rounded border p-2" rows={4} />
      <FormSubmit label="Create auction" />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">{state.success}</p>}
    </form>
  );
}
