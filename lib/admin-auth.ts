import { createHmac } from "crypto";

export function generateAdminToken(password: string): string {
  const secret = process.env.ADMIN_SECRET || "default-secret-change-me";
  return createHmac("sha256", secret).update(password).digest("hex");
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const validToken = generateAdminToken(password);
  return token === validToken;
}

export function getAdminTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}
