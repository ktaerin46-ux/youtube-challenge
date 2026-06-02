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
      .from("resources")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error("Update resource error:", error);
    return Response.json({ error: "자료 수정 실패" }, { status: 500 });
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

    // Get file info to delete from storage
    const { data: resource } = await supabase
      .from("resources")
      .select("file_url")
      .eq("id", params.id)
      .single();

    // Delete from storage if exists
    if (resource?.file_url) {
      const path = resource.file_url.split("/").slice(-1)[0];
      await supabase.storage.from("resources").remove([path]);
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete resource error:", error);
    return Response.json({ error: "자료 삭제 실패" }, { status: 500 });
  }
}
