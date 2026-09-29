import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
    <html lang="en" className="dark">
      <body>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#00f0ff",
              colorBackground: "#0b1120",
              colorInputBackground: "#050914",
              colorInputText: "#f1f5f9",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}