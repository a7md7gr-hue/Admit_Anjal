import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production",
);

export interface JWTPayload {
  userId: string;
  role: string;
  nationalId?: string;
  fullName?: string;
}

/**
 * Sign a JWT token
 */
export async function signJwt(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify token (legacy support)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  return verifyJwt(token);
}

/**
 * Get authenticated user from cookies
 */
export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();

  // Check for staff token first
  let token = cookieStore.get("staff_token")?.value;

  // If no staff token, check for student token
  if (!token) {
    token = cookieStore.get("student_uid")?.value;
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Require authentication (throw if not authenticated)
 */
export async function requireAuth(): Promise<JWTPayload> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Require specific role
 */
export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return user;
}
