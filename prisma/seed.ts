import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hrs(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function main() {
  await prisma.bid.deleteMany();
  await prisma.auctionItem.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin1234", 10);
  const userHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@localbid.test",
      name: "Admin User",
      passwordHash: adminHash,
      role: Role.ADMIN
    }
  });

  const jane = await prisma.user.create({
    data: { email: "jane@example.test", name: "Janed", passwordHash: userHash, role: Role.USER }
  });

  const john = await prisma.user.create({
    data: { email: "john@example.test", name: "Johnd", passwordHash: userHash, role: Role.USER }
  });

  const items = await prisma.auctionItem.createMany({
    data: [
      {
        title: '55” 4K Smart TV (Open Box)',
        description: "Open-box 55 inch 4K TV with remote and stand.",
        category: "Electronics",
        startingBid: 12000,
        bidIncrement: 1000,
        endAt: hrs(2),
        imageUrls: JSON.stringify([
          "https://picsum.photos/seed/tv1/800/800",
          "https://picsum.photos/seed/tv2/800/800",
          "https://picsum.photos/seed/tv3/800/800"
        ])
      },
      {
        title: "20V Cordless Drill Kit",
        description: "Drill, battery and charger in good condition.",
        category: "Tools",
        startingBid: 3000,
        bidIncrement: 500,
        endAt: hrs(4),
        imageUrls: JSON.stringify([
          "https://picsum.photos/seed/drill1/800/800",
          "https://picsum.photos/seed/drill2/800/800",
          "https://picsum.photos/seed/drill3/800/800"
        ])
      },
      {
        title: "5-Quart Stand Mixer",
        description: "Classic stand mixer with bowl and whisk.",
        category: "Kitchen",
        startingBid: 5000,
        bidIncrement: 500,
        endAt: hrs(6),
        imageUrls: JSON.stringify([
          "https://picsum.photos/seed/mixer1/800/800",
          "https://picsum.photos/seed/mixer2/800/800",
          "https://picsum.photos/seed/mixer3/800/800"
        ])
      },
      {
        title: "Adjustable Office Chair",
        description: "Mesh office chair with lumbar support.",
        category: "Furniture",
        startingBid: 2500,
        bidIncrement: 300,
        endAt: hrs(7),
        imageUrls: JSON.stringify([
          "https://picsum.photos/seed/chair1/800/800",
          "https://picsum.photos/seed/chair2/800/800",
          "https://picsum.photos/seed/chair3/800/800"
        ])
      },
      {
        title: "Outdoor Propane Fire Table",
        description: "Outdoor fire table with protective cover.",
        category: "Outdoor",
        startingBid: 8000,
        bidIncrement: 700,
        endAt: hrs(8),
        imageUrls: JSON.stringify([
          "https://picsum.photos/seed/fire1/800/800",
          "https://picsum.photos/seed/fire2/800/800",
          "https://picsum.photos/seed/fire3/800/800"
        ])
      }
    ]
  });

  const createdItems = await prisma.auctionItem.findMany({ orderBy: { createdAt: "asc" } });

  await prisma.bid.createMany({
    data: [
      { auctionItemId: createdItems[0].id, userId: jane.id, amount: 14000 },
      { auctionItemId: createdItems[0].id, userId: john.id, amount: 15000 },
      { auctionItemId: createdItems[1].id, userId: jane.id, amount: 3500 }
    ]
  });

  console.log(`Seeded ${items.count} items and users (admin: ${admin.email}).`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
