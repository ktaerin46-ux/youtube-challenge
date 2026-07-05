import { createAdminClient } from "@/lib/supabase";
import {
  verifyAdminToken,
  getAdminTokenFromRequest,
} from "@/lib/admin-auth";
import { calculateProgress } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET participant by ID (requires matching client_id or admin token)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = request.headers.get("x-client-id");
    const adminToken = getAdminTokenFromRequest(request);
    const isAdmin = verifyAdminToken(adminToken);

    const supabase = createAdminClient();

    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !participant) {
      return Response.json({ error: "참가자를 찾을 수 없습니다." }, { status: 404 });
    }

    // Must be the participant themselves or admin
    if (!isAdmin && participant.client_id !== clientId) {
      return Response.json({ error: "접근 권한이 없습니다." }, { status: 403 });
    }

    const { data: uploads } = await supabase
      .from("uploads")
      .select("*")
      .eq("participant_id", params.id)
      .order("upload_date", { ascending: false });

    const progress = calculateProgress(
      participant.challenge_start_date,
      uploads || []
    );

    return Response.json({
      ...participant,
      uploads: uploads || [],
      progress,
    });
  } catch (error) {
    console.error("Get participant error:", error);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}

// GET by client_id (for localStorage-based lookup)
export async function PATCH(
  request: NextRequest,
  { params: _ }: { params: { id: string } }
) {
  // This endpoint finds a participant by client_id
  try {
    const { client_id } = await request.json();
    if (!client_id) {
      return Response.json({ error: "client_id가 필요합니다." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("client_id", client_id)
      .maybeSingle();

    if (error) throw error;
    if (!participant) {
      return Response.json(null);
    }

    const { data: uploads } = await supabase
      .from("uploads")
      .select("*")
      .eq("participant_id", participant.id)
      .order("upload_date", { ascending: false });

    const progress = calculateProgress(
      participant.challenge_start_date,
      uploads || []
    );

    return Response.json({ ...participant, uploads: uploads || [], progress });
  } catch (error) {
    console.error("Find by client_id error:", error);
    return Response.json({ error: "조회 실패" }, { status: 500 });
  }
}

// PUT: update participant (requires matching client_id or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = request.headers.get("x-client-id");
    const adminToken = getAdminTokenFromRequest(request);
    const isAdmin = verifyAdminToken(adminToken);

    const supabase = createAdminClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("participants")
      .select("client_id")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return Response.json({ error: "참가자를 찾을 수 없습니다." }, { status: 404 });
    }

    if (!isAdmin && existing.client_id !== clientId) {
      return Response.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      "name",
      "youtube_channel_link",
      "phone_number",
      "start_subscriber_count",
      "challenge_start_date",
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const { data, error } = await supabase
      .from("participants")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error("Update participant error:", error);
    return Response.json({ error: "수정 실패" }, { status: 500 });
  }
}

// DELETE: admin only
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
      .from("participants")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete participant error:", error);
    return Response.json({ error: "삭제 실패" }, { status: 500 });
  }
}
