import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboLab Chain | Autonomous Robotics Lab & MST Blockchain Verification",
  description: "Next-generation robotics developer environment, 2D simulation kinematics engine, and verifiable on-chain achievement ledger on MST Testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-background text-slate-200 antialiased selection:bg-cyan-500 selection:text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
