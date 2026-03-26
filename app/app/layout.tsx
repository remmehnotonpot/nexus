import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/index.css";
import "../src/App.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Swish Portal",
  description: "Global logistics, shipment tracking, and customer portal.",
  icons: {
    icon: "/plane.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background">
          <Header transparent />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
