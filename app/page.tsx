import { AuctionStatus } from "@prisma/client";
import { AuctionCard } from "@/components/auction-card";
import { finalizeExpiredAuctions } from "@/lib/finalize";
import { prisma } from "@/lib/prisma";

export default async function Home({ searchParams }: { searchParams: { sort?: string } }) {
  await finalizeExpiredAuctions();
  const sort = searchParams.sort === "new" ? "new" : "ending";

  const items = await prisma.auctionItem.findMany({
    orderBy: sort === "new" ? { createdAt: "desc" } : { endAt: "asc" },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 }, _count: { select: { bids: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Auctions</h1>
        <div className="space-x-3 text-sm">
          <a href="/?sort=ending" className={sort === "ending" ? "font-semibold underline" : ""}>Ending soon</a>
          <a href="/?sort=new" className={sort === "new" ? "font-semibold underline" : ""}>Newly listed</a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <AuctionCard
            key={item.id}
            id={item.id}
            title={item.title}
            currentBid={item.bids[0]?.amount ?? item.startingBid}
            bidsCount={item._count.bids}
            endAt={item.endAt.toISOString()}
            status={item.status as AuctionStatus}
            imageUrls={item.imageUrls}
          />
        ))}
      </div>
    </div>
  );
}
