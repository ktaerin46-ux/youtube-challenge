import { createAdminClient } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-client-id");
    if (!clientId) {
      return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { participant_id, video_link, upload_date, type } = await request.json();

    if (!participant_id || !video_link?.trim() || !upload_date || !type) {
      return Response.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }

    if (!["shorts", "longform"].includes(type)) {
      return Response.json({ error: "유효하지 않은 영상 타입입니다." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify the participant owns this client_id
    const { data: participant } = await supabase
      .from("participants")
      .select("id, client_id")
      .eq("id", participant_id)
      .single();

    if (!participant || participant.client_id !== clientId) {
      return Response.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("uploads")
      .insert({
        participant_id,
        video_link: video_link.trim(),
        upload_date,
        type,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create upload error:", error);
    return Response.json({ error: "업로드 기록 실패" }, { status: 500 });
  }
}
