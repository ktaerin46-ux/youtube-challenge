import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminToken,
  getAdminTokenFromRequest,
} from "@/lib/admin-auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { participant_id, note } = await request.json();

    if (!participant_id || !note?.trim()) {
      return Response.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_notes")
      .insert({ participant_id, note: note.trim() })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return Response.json({ error: "메모 생성 실패" }, { status: 500 });
  }
}
