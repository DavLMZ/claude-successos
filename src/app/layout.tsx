import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElevenLabs SuccessOS",
  description:
    "Customer Success command centre for ElevenLabs enterprise accounts. Built for the Customer Success — Strategic — Western Europe application.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--border)] bg-[var(--bg-elev)]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                {/* ElevenLabs || logomark — two vertical bars */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
                  <rect x="1" y="2" width="7" height="16" rx="1.5" fill="var(--accent)" />
                  <rect x="12" y="2" width="7" height="16" rx="1.5" fill="var(--accent)" />
                </svg>
                <span className="font-semibold tracking-tight">ElevenLabs SuccessOS</span>
                <span className="text-xs text-[var(--text-dim)] hidden sm:inline">
                  · Customer Success command centre
                </span>
              </Link>
              <nav className="flex items-center gap-5 text-sm">
                <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  Portfolio
                </Link>
                <Link
                  href="/adoption-matrix"
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Adoption Matrix
                </Link>
                <Link
                  href="/revenue-engine"
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Revenue Engine
                </Link>
                <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  About
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] mt-12">
            <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-[var(--text-dim)] flex flex-col sm:flex-row gap-2 justify-between">
              <span>
                Built for the Customer Success — Strategic — Western Europe application · ElevenLabs
              </span>
              <span>All customer data is synthetic. Every AI module uses Claude (Anthropic).</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
