import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "LocalBid",
  description: "MVP local auction demo"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <Link href="/" className="text-xl font-bold text-slate-900">LocalBid</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/me">My Bids</Link>
              {session?.user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
              {session?.user ? (
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="rounded bg-slate-900 px-3 py-1 text-white" aria-label="Sign out">Sign out</button>
                </form>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/signup" className="rounded bg-slate-900 px-3 py-1 text-white">Sign up</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
