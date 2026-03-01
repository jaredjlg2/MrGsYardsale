"use client";

import { useFormState } from "react-dom";
import { createBid } from "@/app/actions";
import { FormSubmit } from "@/components/form-submit";

const initialState = { error: "", success: "" };

export function BidForm({ auctionItemId, disabled }: { auctionItemId: string; disabled: boolean }) {
  const [state, formAction] = useFormState(createBid, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded border bg-white p-4">
      <input type="hidden" name="auctionItemId" value={auctionItemId} />
      <label className="block text-sm font-medium" htmlFor="amount">Your bid (USD)</label>
      <input id="amount" name="amount" type="number" min="0" step="0.01" required disabled={disabled} className="w-full rounded border p-2" />
      <FormSubmit label={disabled ? "Auction Closed" : "Place Bid"} />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">{state.success}</p>}
    </form>
  );
}
