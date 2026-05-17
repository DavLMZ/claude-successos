import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude SuccessOS",
  description:
    "A Customer Success command centre for enterprise Claude adoption. Built as part of a Customer Success Manager, Strategics application.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--border)] bg-[var(--bg-elev)]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-[var(--accent)] font-mono text-lg">◆</span>
                <span className="font-semibold tracking-tight">Claude SuccessOS</span>
                <span className="text-xs text-[var(--text-dim)] hidden sm:inline">
                  · Customer Success command centre
                </span>
              </Link>
              <nav className="flex items-center gap-5 text-sm">
                <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  Cockpit
                </Link>
                <Link
                  href="/pricing-translator"
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Pricing Translator
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
                Built for the Customer Success Manager, Strategics application · Anthropic
              </span>
              <span>
                All customer data is synthetic. Every screen uses Claude.
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
