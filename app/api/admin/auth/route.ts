import { generateAdminToken } from "@/lib/admin-auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return Response.json({ error: "관리자 설정이 올바르지 않습니다." }, { status: 500 });
    }

    if (password !== adminPassword) {
      return Response.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const token = generateAdminToken(password);
    return Response.json({ token });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
