import type { Metadata } from "next";

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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}