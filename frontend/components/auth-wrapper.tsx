"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if on login page or if still loading
    if (pathname === "/login" || isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show nothing while checking authentication
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

  // If on login page, show children without dashboard layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated, show children
  return <>{children}</>;
}
