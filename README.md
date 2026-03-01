# LocalBid MVP

LocalBid is a minimal auction marketplace demo built with Next.js, Prisma + SQLite, Tailwind, and NextAuth credentials auth.

## Tech stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth (Credentials)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env vars:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client and run migration:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```
4. Seed database:
   ```bash
   npm run prisma:seed
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

## Test accounts
- Admin: `admin@localbid.test` / `admin1234`
- Sample user: `jane@example.test` / `password123`
- Sample user: `john@example.test` / `password123`

You can also sign up your own account from `/signup`.

## Routes
- `/` Home grid with sorting and live countdowns
- `/item/[id]` Item details + bid form + bid history
- `/login` Sign in
- `/signup` Sign up
- `/me` My bids + won auctions
- `/admin` Admin create/list page (ADMIN only)

## Auction finalization
Auctions finalize server-side via `finalizeExpiredAuctions()`:
- Runs on Home and Item page loads.
- Finds auctions with `status=OPEN` and `endAt <= now`.
- Marks them as `CLOSED` in an idempotent update.
- Closed auctions disable bidding and show final price/winner.

## Validation and safety
- Bid validation is server-side in a transaction.
- Bids must be at least current highest + increment (or starting bid if first).
- Closed/expired auctions reject bids.
- If bid collisions happen, one fails with a clear error.
