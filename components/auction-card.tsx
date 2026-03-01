import Link from "next/link";
import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { formatUsd, parseImages } from "@/lib/utils";

type CardProps = {
  id: string;
  title: string;
  currentBid: number;
  bidsCount: number;
  endAt: string;
  status: "OPEN" | "CLOSED";
  imageUrls: string;
};

export function AuctionCard({ id, title, currentBid, bidsCount, endAt, status, imageUrls }: CardProps) {
  const images = parseImages(imageUrls);

  return (
    <Link href={`/item/${id}`} className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <Image src={images[0] || "https://placehold.co/800x800?text=No+Image"} width={600} height={600} alt={title} className="h-48 w-full object-cover" />
      <div className="space-y-2 p-3">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm">Current bid: <span className="font-semibold">{formatUsd(currentBid)}</span></p>
        <p className="text-xs text-slate-600">{bidsCount} bids</p>
        <Countdown endAt={endAt} closed={status === "CLOSED"} />
      </div>
    </Link>
  );
}
