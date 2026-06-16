import { createAdminClient } from "@/lib/supabase";
import { calculateProgress, getRandomNickname } from "@/lib/utils";
import { NextRequest } from "next/server";
import { Upload } from "@/types";

// GET: public anonymized leaderboard data
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: participants, error: pError } = await supabase
      .from("participants")
      .select("id, random_nickname, start_subscriber_count, challenge_start_date, created_at");

    if (pError) throw pError;

    const { data: uploads, error: uError } = await supabase
      .from("uploads")
      .select("id, participant_id, upload_date, type");

    if (uError) throw uError;

    const leaderboard = (participants || [])
      .map((p) => {
        const participantUploads = (uploads || []).filter(
          (u: Partial<Upload>) => u.participant_id === p.id
        );
        const progress = calculateProgress(
          p.challenge_start_date,
          participantUploads as Upload[]
        );

        return {
          id: p.id,
          random_nickname: p.random_nickname,
          start_subscriber_count: p.start_subscriber_count,
          progress_percentage: Math.round(progress.progressPercentage),
          completed_weeks: progress.completedWeeks,
          total_uploads: participantUploads.length,
          challenge_start_date: p.challenge_start_date,
        };
      })
      .sort((a, b) => {
        if (b.progress_percentage !== a.progress_percentage)
          return b.progress_percentage - a.progress_percentage;
        return b.total_uploads - a.total_uploads;
      });

    return Response.json(leaderboard);
  } catch (error) {
    console.error("Get participants error:", error);
    return Response.json({ error: "데이터 조회 실패" }, { status: 500 });
  }
}

// POST: register new participant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, youtube_channel_link, start_subscriber_count, challenge_start_date, client_id } = body;

    if (!name?.trim() || !youtube_channel_link?.trim() || !challenge_start_date || !client_id) {
      return Response.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if client_id already exists
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("client_id", client_id)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: "이미 등록된 참가자입니다." }, { status: 409 });
    }

    // Get existing nicknames to avoid duplicates
    const { data: nicknames } = await supabase
      .from("participants")
      .select("random_nickname");

    const existingNicknames = (nicknames || []).map(
      (n: { random_nickname: string }) => n.random_nickname
    );
    const random_nickname = getRandomNickname(existingNicknames);

    const { data, error } = await supabase
      .from("participants")
      .insert({
        name: name.trim(),
        youtube_channel_link: youtube_channel_link.trim(),
        start_subscriber_count: Number(start_subscriber_count) || 0,
        challenge_start_date,
        client_id,
        random_nickname,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create participant error:", error);
    return Response.json({ error: "참가자 등록 실패" }, { status: 500 });
  }
}
