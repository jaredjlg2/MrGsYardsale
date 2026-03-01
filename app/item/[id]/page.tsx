import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { BidForm } from "@/components/bid-form";
import { Countdown } from "@/components/countdown";
import { finalizeExpiredAuctions } from "@/lib/finalize";
import { prisma } from "@/lib/prisma";
import { formatUsd, maskName, parseImages } from "@/lib/utils";

export default async function ItemPage({ params }: { params: { id: string } }) {
  await finalizeExpiredAuctions();
  const session = await auth();

  const item = await prisma.auctionItem.findUnique({
    where: { id: params.id },
    include: {
      bids: { include: { user: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!item) notFound();

  const currentBid = item.bids.length ? Math.max(...item.bids.map((b) => b.amount)) : item.startingBid;
  const images = parseImages(item.imageUrls);
  const winner = item.status === "CLOSED" && item.bids[0] ? maskName(item.bids.sort((a,b)=>b.amount-a.amount)[0].user.name) : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Image src={images[0] || "https://placehold.co/800x800?text=No+Image"} alt={item.title} width={800} height={800} className="h-80 w-full rounded object-cover" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.slice(0, 3).map((img, i) => (
            <Image key={`${img}-${i}`} src={img} alt={`${item.title} ${i + 1}`} width={300} height={300} className="h-24 w-full rounded object-cover" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <p className="text-slate-700">{item.description}</p>
        <p>Starting bid: <strong>{formatUsd(item.startingBid)}</strong></p>
        <p>Current bid: <strong>{formatUsd(currentBid)}</strong></p>
        <p>Bid increment: <strong>{formatUsd(item.bidIncrement)}</strong></p>
        <Countdown endAt={item.endAt.toISOString()} closed={item.status === "CLOSED"} />

        {item.status === "CLOSED" && (
          <div className="rounded bg-slate-200 p-3 text-sm">
            <p>Final price: <strong>{formatUsd(currentBid)}</strong></p>
            <p>Winner: <strong>{winner || "No bids"}</strong></p>
          </div>
        )}

        {session?.user ? (
          <BidForm auctionItemId={item.id} disabled={item.status === "CLOSED" || item.endAt <= new Date()} />
        ) : (
          <p className="rounded border bg-white p-3 text-sm">Please log in to place bids.</p>
        )}

        <div className="rounded border bg-white p-4">
          <h2 className="mb-2 font-semibold">Bid history</h2>
          <ul className="space-y-2 text-sm">
            {item.bids.map((bid) => (
              <li key={bid.id} className="flex justify-between border-b pb-1">
                <span>{maskName(bid.user.name)}</span>
                <span>{formatUsd(bid.amount)}</span>
              </li>
            ))}
            {!item.bids.length && <li>No bids yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
