"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If not on login page and not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // If on login page, render without dashboard layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If not authenticated, show nothing (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated, show with dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
}
