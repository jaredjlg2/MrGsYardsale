import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminForm } from "@/components/admin-form";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const items = await prisma.auctionItem.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { bids: true } } } });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="mb-3 text-2xl font-bold">Create Auction Item</h1>
        <AdminForm />
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold">All Auctions</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded border bg-white p-3 text-sm">
              <p className="font-semibold">{item.title}</p>
              <p>Status: {item.status} • Bids: {item._count.bids}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
