"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { finalizeExpiredAuctions } from "@/lib/finalize";
import { prisma } from "@/lib/prisma";
import { AuctionStatus, Role } from "@prisma/client";
import { z } from "zod";

export async function createUser(_: unknown, formData: FormData) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) return { error: "Please provide valid name, email and password (8+ chars)." };

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Email is already in use." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: Role.USER }
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false
  });

  redirect("/");
}

export async function loginUser(_: unknown, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const res = await signIn("credentials", { email, password, redirect: false });
  if (res?.error) return { error: "Invalid email or password." };
  redirect("/");
}

export async function createBid(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in to bid." };

  const auctionItemId = String(formData.get("auctionItemId") || "");
  const amountDollars = Number(formData.get("amount") || 0);
  const bidCents = Math.round(amountDollars * 100);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.auctionItem.findUnique({ where: { id: auctionItemId }, include: { bids: { orderBy: { amount: "desc" }, take: 1 } } });
      if (!item) throw new Error("Auction not found.");
      if (item.status === AuctionStatus.CLOSED || item.endAt <= new Date()) throw new Error("Auction is closed.");

      const current = item.bids[0]?.amount ?? 0;
      const minAllowed = current > 0 ? current + item.bidIncrement : item.startingBid;
      if (bidCents < minAllowed) throw new Error(`Bid must be at least $${(minAllowed / 100).toFixed(2)}.`);

      const bid = await tx.bid.create({
        data: {
          amount: bidCents,
          auctionItemId,
          userId: session.user.id
        }
      });

      return bid;
    });

    revalidatePath("/");
    revalidatePath(`/item/${auctionItemId}`);
    revalidatePath("/me");
    return { success: `Bid placed: $${(result.amount / 100).toFixed(2)}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bid failed.";
    return { error: message };
  }
}

export async function createAuctionItem(_: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN) return { error: "Not authorized." };

  const schema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2),
    startingBid: z.coerce.number().positive(),
    bidIncrement: z.coerce.number().positive(),
    endAt: z.string().datetime(),
    imageUrls: z.string().min(5)
  });

  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    startingBid: formData.get("startingBid"),
    bidIncrement: formData.get("bidIncrement"),
    endAt: formData.get("endAt"),
    imageUrls: formData.get("imageUrls")
  });

  if (!parsed.success) return { error: "Invalid item details." };

  const imageUrls = parsed.data.imageUrls
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (imageUrls.length < 1) return { error: "Provide at least one image URL." };

  await prisma.auctionItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      startingBid: Math.round(parsed.data.startingBid * 100),
      bidIncrement: Math.round(parsed.data.bidIncrement * 100),
      endAt: new Date(parsed.data.endAt),
      imageUrls: JSON.stringify(imageUrls)
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: "Auction item created." };
}

export async function runFinalize() {
  await finalizeExpiredAuctions();
}
