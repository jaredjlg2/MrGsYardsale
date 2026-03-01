import { AuctionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function finalizeExpiredAuctions() {
  const now = new Date();
  const expired = await prisma.auctionItem.findMany({
    where: { status: AuctionStatus.OPEN, endAt: { lte: now } },
    select: { id: true }
  });

  if (!expired.length) return 0;

  await prisma.auctionItem.updateMany({
    where: {
      id: { in: expired.map((a) => a.id) },
      status: AuctionStatus.OPEN,
      endAt: { lte: now }
    },
    data: { status: AuctionStatus.CLOSED }
  });

  return expired.length;
}
