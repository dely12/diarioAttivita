import "./globals.css"; 
import { AppHeader } from "@/app/ui/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
         <AppHeader />

        <main className="gf-container">{children}</main>
      </body>
    </html>
  );
}
