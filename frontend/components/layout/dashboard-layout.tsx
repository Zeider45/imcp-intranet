"use client";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
