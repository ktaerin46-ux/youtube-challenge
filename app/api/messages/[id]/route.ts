import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminToken,
  getAdminTokenFromRequest,
} from "@/lib/admin-auth";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("motivational_messages")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error("Update message error:", error);
    return Response.json({ error: "메시지 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("motivational_messages")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return Response.json({ error: "메시지 삭제 실패" }, { status: 500 });
  }
}
