import { createAdminClient } from "@/lib/supabase";
import { NextRequest } from "next/server";

// Find a participant's client_id by phone number, so a new device can
// restore the same record instead of registering a fresh one.
export async function POST(request: NextRequest) {
  try {
    const { phone_number } = await request.json();
    if (!phone_number?.trim()) {
      return Response.json({ error: "전화번호를 입력해주세요." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .select("client_id")
      .eq("phone_number", phone_number.trim())
      .maybeSingle();

    if (error) throw error;
    if (!participant) {
      return Response.json(
        { error: "등록된 전화번호를 찾을 수 없어요. 번호를 다시 확인해주세요." },
        { status: 404 }
      );
    }

    return Response.json({ client_id: participant.client_id });
  } catch (error) {
    console.error("Find by phone error:", error);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}
