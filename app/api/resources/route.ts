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
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json(data || []);
  } catch (error) {
    console.error("Get resources error:", error);
    return Response.json({ error: "자료 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File | null;

    if (!title?.trim() || !category) {
      return Response.json({ error: "제목과 카테고리는 필수입니다." }, { status: 400 });
    }

    const supabase = createAdminClient();
    let file_url = "";
    let file_name = "";

    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resources")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("resources")
        .getPublicUrl(uploadData.path);

      file_url = urlData.publicUrl;
      file_name = file.name;
    }

    const { data, error } = await supabase
      .from("resources")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        category,
        file_url,
        file_name,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create resource error:", error);
    return Response.json({ error: "자료 등록 실패" }, { status: 500 });
  }
}
