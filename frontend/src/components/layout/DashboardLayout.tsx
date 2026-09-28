"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 min-w-0 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
