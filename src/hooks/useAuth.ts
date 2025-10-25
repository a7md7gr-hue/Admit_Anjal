import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
  requiredRoles: string[];
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        
        if (!res.ok) {
          console.log("❌ Not authenticated, redirecting");
          router.push(options.redirectTo || "/auth/staff");
          return;
        }

        const data = await res.json();
        const userRole = (data.role?.toUpperCase() || data.user?.role?.toUpperCase());
        
        if (!userRole || !options.requiredRoles.includes(userRole)) {
          console.log("❌ Insufficient permissions:", userRole);
          router.push(options.redirectTo || "/auth/staff");
          return;
        }

        console.log("✅ Authenticated as:", userRole);
        setUser(data);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push(options.redirectTo || "/auth/staff");
      }
    }

    checkAuth();
  }, [router, options.requiredRoles, options.redirectTo]);

  return { isAuthenticated, isLoading, user };
}

