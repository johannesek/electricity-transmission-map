import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electricity transmission map",
  description: "Map of electricity transmission between Nordpool bidding zones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
