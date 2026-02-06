import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <div className="text-sm font-semibold text-slate-900">Diario Attività</div>
            <div className="text-xs text-slate-400">v0</div>
          </div>
        </header>

        <main className="gf-container">{children}</main>
      </body>
    </html>
  );
}
