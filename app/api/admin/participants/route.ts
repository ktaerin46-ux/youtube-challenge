import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminToken,
  getAdminTokenFromRequest,
} from "@/lib/admin-auth";
import { calculateProgress } from "@/lib/utils";
import { NextRequest } from "next/server";
import { Upload } from "@/types";

export async function GET(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: participants, error: pError } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false });

    if (pError) throw pError;

    const { data: uploads, error: uError } = await supabase
      .from("uploads")
      .select("*");

    if (uError) throw uError;

    const { data: notes, error: nError } = await supabase
      .from("admin_notes")
      .select("*");

    if (nError) throw nError;

    const enriched = (participants || []).map((p) => {
      const participantUploads = (uploads || []).filter(
        (u: Upload) => u.participant_id === p.id
      );
      const participantNotes = (notes || []).filter(
        (n: { participant_id: string }) => n.participant_id === p.id
      );
      const progress = calculateProgress(
        p.challenge_start_date,
        participantUploads
      );

      return {
        ...p,
        uploads: participantUploads,
        notes: participantNotes,
        progress,
      };
    });

    return Response.json(enriched);
  } catch (error) {
    console.error("Admin participants error:", error);
    return Response.json({ error: "참가자 조회 실패" }, { status: 500 });
  }
}
