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
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromRequest(request);
  if (!verifyAdminToken(token)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const {
      user_email,
      user_name,
      product_id,
      product_title,
      amount,
      payment_method,
      payment_ref,
      notes,
    } = await request.json();

    if (!user_email) return Response.json({ error: "이메일 필요" }, { status: 400 });

    const supabase = createAdminClient();

    // 이메일로 user_id 조회 (있으면 연결)
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", user_email)
      .maybeSingle();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userProfile?.id ?? null,
        user_email,
        user_name,
        product_id: product_id ?? null,
        product_title,
        amount: amount ?? 0,
        payment_method: payment_method ?? "rapyd",
        payment_ref,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "생성 실패" }, { status: 500 });
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
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "삭제 실패" }, { status: 500 });
  }
}
