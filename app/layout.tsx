import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurora CheckOps Console",
  description: "Natural language-first HR background check control center"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
