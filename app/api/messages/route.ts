import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminToken,
  getAdminTokenFromRequest,
} from "@/lib/admin-auth";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("motivational_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return Response.json(data || []);
  } catch (error) {
    console.error("Get messages error:", error);
    return Response.json({ error: "메시지 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  try {
    const { message, is_active = true } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: "메시지를 입력해주세요." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("motivational_messages")
      .insert({ message: message.trim(), is_active })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create message error:", error);
    return Response.json({ error: "메시지 생성 실패" }, { status: 500 });
  }
}
