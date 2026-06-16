import { NextRequest } from "next/server";
import { verifyAdminToken, getAdminTokenFromRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const { id, has_access, access_note } = await request.json();
    if (!id) return Response.json({ error: "id 필요" }, { status: 400 });

    const supabase = createAdminClient();
    const updateData: Record<string, unknown> = { has_access };
    if (access_note !== undefined) updateData.access_note = access_note;
    if (has_access === true) updateData.access_granted_at = new Date().toISOString();
    if (has_access === false) updateData.access_granted_at = null;

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "업데이트 실패" }, { status: 500 });
  }
}
