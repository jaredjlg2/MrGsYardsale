import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd, maskName } from "@/lib/utils";

export default async function MePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bids = await prisma.bid.findMany({
    where: { userId: session.user.id },
    include: { auctionItem: true },
    orderBy: { createdAt: "desc" }
  });

  const won = await prisma.auctionItem.findMany({
    where: { status: "CLOSED", bids: { some: { userId: session.user.id } } },
    include: { bids: { include: { user: true }, orderBy: { amount: "desc" }, take: 1 } }
  });

  const wonIds = won.filter((w) => w.bids[0]?.userId === session.user.id).map((w) => w.id);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 text-2xl font-bold">My bids</h1>
        <ul className="space-y-2">
          {bids.map((bid) => (
            <li key={bid.id} className="rounded border bg-white p-3 text-sm">
              <Link href={`/item/${bid.auctionItemId}`} className="font-semibold">{bid.auctionItem.title}</Link>
              <span className="ml-2">{formatUsd(bid.amount)}</span>
            </li>
          ))}
          {!bids.length && <li>No bids yet.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Auctions won</h2>
        <ul className="space-y-2">
          {won.filter((w) => wonIds.includes(w.id)).map((item) => (
            <li key={item.id} className="rounded border bg-white p-3 text-sm">
              <Link href={`/item/${item.id}`} className="font-semibold">{item.title}</Link>
              <span className="ml-2">Final: {formatUsd(item.bids[0].amount)}</span>
              <span className="ml-2 text-slate-500">Winner: {maskName(item.bids[0].user.name)}</span>
            </li>
          ))}
          {!wonIds.length && <li>No wins yet.</li>}
        </ul>
      </section>
    </div>
  );
}
