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
      .select("*");

    if (pError) throw pError;

    const { data: uploads, error: uError } = await supabase
      .from("uploads")
      .select("*");

    if (uError) throw uError;

    const total_participants = participants?.length || 0;
    const total_uploads = uploads?.length || 0;

    let totalProgress = 0;
    let thisWeekAchieved = 0;
    let projectedCompletions = 0;

    for (const p of participants || []) {
      const participantUploads = (uploads || []).filter(
        (u: Upload) => u.participant_id === p.id
      );
      const progress = calculateProgress(
        p.challenge_start_date,
        participantUploads
      );
      totalProgress += progress.progressPercentage;

      const currentWeekData = progress.weeks.find(
        (w) => w.status === "in_progress" || w.status === "achieved"
      );
      if (currentWeekData?.status === "achieved") thisWeekAchieved++;

      if (progress.streak === progress.completedWeeks && progress.completedWeeks > 0) {
        projectedCompletions++;
      }
    }

    const average_achievement =
      total_participants > 0 ? totalProgress / total_participants : 0;
    const this_week_achievement =
      total_participants > 0
        ? (thisWeekAchieved / total_participants) * 100
        : 0;

    return Response.json({
      total_participants,
      average_achievement: Math.round(average_achievement),
      this_week_achievement: Math.round(this_week_achievement),
      total_uploads,
      projected_completions: projectedCompletions,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json({ error: "통계 조회 실패" }, { status: 500 });
  }
}
