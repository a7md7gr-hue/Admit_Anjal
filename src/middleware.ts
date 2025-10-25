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
  OWNER: ["/super-admin", "/admin", "/manager", "/teacher", "/student", "/profile"],
  SUPER_ADMIN: ["/super-admin", "/admin", "/manager", "/teacher", "/profile"],
  MANAGER: ["/manager", "/admin", "/profile"],
  TEACHER: ["/teacher", "/profile"],
  STUDENT: ["/student"], // Students don't have access to /profile - they use PIN only
  SUPERVISOR: ["/supervisor", "/profile"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🛡️ Middleware triggered for: ${pathname}`);

  // Allow public paths
  if (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    console.log(`✅ Public path allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    console.log(`✅ Static/API path allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Protected routes
  const protectedPaths = [
    "/super-admin",
    "/manager",
    "/teacher",
    "/student",
    "/admin",
    "/profile",
    "/supervisor",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    console.log(`⚠️ Not a protected path: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`🔒 Protected path detected: ${pathname}`);

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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
