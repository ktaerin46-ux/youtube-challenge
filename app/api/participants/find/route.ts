import { createAdminClient } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/utils";
import { CURRENT_COHORT, IS_LEGACY_COHORT } from "@/lib/constants";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, youtube_channel_link, phone_number } = await request.json();

    const supabase = createAdminClient();
    let query = supabase
      .from("participants")
      .select("client_id")
      .eq("cohort", CURRENT_COHORT)
      .ilike("name", (name || "").trim());

    if (IS_LEGACY_COHORT) {
      if (!name || !youtube_channel_link) {
        return Response.json({ error: "이름과 채널 링크를 입력해주세요." }, { status: 400 });
      }
      query = query.ilike("youtube_channel_link", youtube_channel_link.trim());
    } else {
      if (!name || !phone_number) {
        return Response.json({ error: "이름과 전화번호를 입력해주세요." }, { status: 400 });
      }
      query = query.eq("phone_number", normalizePhoneNumber(phone_number));
    }

    const { data: participant, error } = await query.maybeSingle();

    if (error) throw error;
    if (!participant) {
      return Response.json({ error: "일치하는 참가자를 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json({ client_id: participant.client_id });
  } catch (error) {
    console.error("Find error:", error);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}
