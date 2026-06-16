import { NextRequest } from "next/server";
import { verifyAdminToken, getAdminTokenFromRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const { product_id, title, type, url, description, order_index } = await request.json();
    if (!product_id || !title || !type || !url) {
      return Response.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("content_items")
      .insert({ product_id, title, type, url, description, order_index: order_index ?? 0 })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "생성 실패" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const { id, title, type, url, description, order_index, is_active } = await request.json();
    if (!id) return Response.json({ error: "id 필요" }, { status: 400 });

    const supabase = createAdminClient();
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (url !== undefined) updateData.url = url;
    if (description !== undefined) updateData.description = description;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from("content_items")
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

export async function DELETE(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: "id 필요" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "삭제 실패" }, { status: 500 });
  }
}
