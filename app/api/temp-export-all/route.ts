import { createAdminClient } from "@/lib/supabase";
import { NextRequest } from "next/server";

// TEMPORARY one-off data export route for migrating to a new Supabase project.
// Delete this file immediately after use.
export async function GET(request: NextRequest) {
  const key = request.headers.get("x-debug-key");
  if (key !== "f89d61aa1448725b76ba05a4f11f5f5dea38139097b03716") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const [participants, uploads, messages, resources, notes] = await Promise.all([
    supabase.from("participants").select("*"),
    supabase.from("uploads").select("*"),
    supabase.from("motivational_messages").select("*"),
    supabase.from("resources").select("*"),
    supabase.from("admin_notes").select("*"),
  ]);

  return Response.json({
    participants: participants.data,
    uploads: uploads.data,
    motivational_messages: messages.data,
    resources: resources.data,
    admin_notes: notes.data,
    errors: {
      participants: participants.error,
      uploads: uploads.error,
      motivational_messages: messages.error,
      resources: resources.error,
      admin_notes: notes.error,
    },
  });
}
