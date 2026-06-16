export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "로그인 필요" }, { status: 401 });
    }

    const admin = createAdminClient();

    // 사용자 프로필 및 접근 권한 조회
    const { data: profile, error: profileError } = await admin
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return Response.json({ error: "프로필 조회 실패" }, { status: 500 });
    }

    if (!profile?.has_access) {
      return Response.json({ profile, products: [], has_access: false });
    }

    // 활성화된 상품 + 콘텐츠 조회
    const { data: products } = await admin
      .from("products")
      .select(`*, content_items(*)`)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    // content_items는 order_index 기준으로 정렬
    const sorted = (products ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      content_items: ((p.content_items as Array<Record<string, unknown>>) ?? [])
        .filter((c) => c.is_active)
        .sort((a, b) => (a.order_index as number) - (b.order_index as number)),
    }));

    return Response.json({ profile, products: sorted, has_access: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "서버 오류" }, { status: 500 });
  }
}
