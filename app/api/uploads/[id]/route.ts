import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminToken,
  getAdminTokenFromRequest,
} from "@/lib/admin-auth";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = request.headers.get("x-client-id");
    const adminToken = getAdminTokenFromRequest(request);
    const isAdmin = verifyAdminToken(adminToken);

    const supabase = createAdminClient();

    // Get the upload with its participant
    const { data: upload } = await supabase
      .from("uploads")
      .select("id, participant_id, participants(client_id)")
      .eq("id", params.id)
      .single();

    if (!upload) {
      return Response.json({ error: "업로드를 찾을 수 없습니다." }, { status: 404 });
    }

    const participant = upload.participants as { client_id: string } | null;
    if (!isAdmin && participant?.client_id !== clientId) {
      return Response.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    const { error } = await supabase
      .from("uploads")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete upload error:", error);
    return Response.json({ error: "삭제 실패" }, { status: 500 });
  }
}
