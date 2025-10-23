import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production",
);

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/auth/student", "/auth/staff", "/change-password"];

// Role-based path access (uppercase codes)
const ROLE_PATHS: Record<string, string[]> = {
  OWNER: ["/super-admin", "/admin", "/manager", "/teacher", "/student"],
  SUPER_ADMIN: ["/super-admin", "/admin", "/manager", "/teacher"],
  MANAGER: ["/manager", "/admin"],
  TEACHER: ["/teacher"],
  STUDENT: ["/student"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedPaths = [
    "/super-admin",
    "/manager",
    "/teacher",
    "/student",
    "/admin",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Check for authentication
  const staffToken = request.cookies.get("staff_token")?.value;
  const studentToken = request.cookies.get("student_uid")?.value;
  const token = staffToken || studentToken;

  console.log("🔐 Middleware check:", {
    pathname,
    hasStaffToken: !!staffToken,
    hasStudentToken: !!studentToken,
    hasAnyToken: !!token,
  });

  if (!token) {
    console.log("❌ No token found, redirecting to login");
    if (pathname.startsWith("/student")) {
      return NextResponse.redirect(new URL("/auth/student", request.url));
    }
    return NextResponse.redirect(new URL("/auth/staff", request.url));
  }

  // Verify token
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = (payload.role as string).toUpperCase(); // Normalize to uppercase

    console.log("✅ Token verified:", { role: userRole, pathname });

    // Check access
    const allowedPaths = ROLE_PATHS[userRole] || [];
    const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

    if (!hasAccess) {
      const defaultPages: Record<string, string> = {
        OWNER: "/super-admin",
        SUPER_ADMIN: "/super-admin",
        MANAGER: "/manager",
        TEACHER: "/teacher/grading",
        STUDENT: "/student/exam",
      };

      const defaultPath = defaultPages[userRole] || "/super-admin";
      console.log("⚠️ No access to", pathname, ", redirecting to:", defaultPath);
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }

    console.log("✅ Access granted to", pathname);
    return NextResponse.next();
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    if (pathname.startsWith("/student")) {
      return NextResponse.redirect(new URL("/auth/student", request.url));
    }
    return NextResponse.redirect(new URL("/auth/staff", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
