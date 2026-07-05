import { NextRequest } from "next/server";

// TEMPORARY diagnostic route — reveals current Supabase connection env vars
// so they can be copied into the 2gi Vercel project. Protected by a one-off
// secret header. Delete this file immediately after use.
export async function GET(request: NextRequest) {
  const key = request.headers.get("x-debug-key");
  if (key !== "f89d61aa1448725b76ba05a4f11f5f5dea38139097b03716") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  return Response.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    service: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  });
}
