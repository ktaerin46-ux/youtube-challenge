import { createAdminClient } from "@/lib/supabase";
import { calculateProgress } from "@/lib/utils";
import { NextRequest } from "next/server";

// Look up participant by client_id (stored in localStorage)
export async function POST(request: NextRequest) {
  try {
    const { client_id } = await request.json();
    if (!client_id) {
      return Response.json({ error: "client_id가 필요합니다." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("client_id", client_id)
      .maybeSingle();

    if (error) throw error;
    if (!participant) {
      return Response.json(null);
    }

    const { data: uploads } = await supabase
      .from("uploads")
      .select("*")
      .eq("participant_id", participant.id)
      .order("upload_date", { ascending: false });

    const progress = calculateProgress(
      participant.challenge_start_date,
      uploads || []
    );

    return Response.json({ ...participant, uploads: uploads || [], progress });
  } catch (error) {
    console.error("Lookup error:", error);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}
