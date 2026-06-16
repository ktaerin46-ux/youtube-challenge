"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<"google" | "kakao" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "auth_failed") {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push("/mypage");
    });
  }, []);

  async function signInWithGoogle() {
    setLoading("google");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(null); }
  }

  async function signInWithKakao() {
    setLoading("kakao");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(null); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 네비 */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <span className="text-sm font-black text-white">F</span>
            </div>
            <span className="text-lg font-black text-gray-900">프리덤클래스</span>
          </a>
          <nav className="hidden gap-6 text-sm font-medium text-gray-500 sm:flex">
            <a href="/" className="hover:text-gray-900 transition-colors">HOME</a>
            <a href="/resources" className="hover:text-gray-900 transition-colors">무료 특강</a>
            <a href="/leaderboard" className="hover:text-gray-900 transition-colors">유뿌챌</a>
          </nav>
        </div>
      </header>

      {/* 로그인 카드 */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              회원 전용 강의실
            </div>
            <h1 className="mt-3 text-3xl font-black text-gray-900">로그인</h1>
            <p className="mt-2 text-sm text-gray-500">
              로그인하고 구매한 강의를 확인하세요
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            {/* 카카오 */}
            <button
              onClick={signInWithKakao}
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-3.5 font-semibold text-[#191919] hover:bg-[#F0D900] disabled:opacity-60 transition-colors"
            >
              {loading === "kakao" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#191919] border-t-transparent" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.93 1.87 5.51 4.71 6.98l-1.2 4.47 5.21-3.27c.41.06.83.09 1.28.09 5.52 0 10-3.69 10-8.25S17.52 3 12 3z" fill="#191919" />
                </svg>
              )}
              카카오로 로그인
            </button>

            {/* 구글 */}
            <button
              onClick={signInWithGoogle}
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {loading === "google" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              구글로 로그인
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-gray-400">
            로그인하면 이용약관 및 개인정보처리방침에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
