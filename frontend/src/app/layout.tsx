import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboLedger",
  description: "Robotics simulation and blockchain verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}