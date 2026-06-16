"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Trophy, BookOpen, TrendingUp, Users, Play } from "lucide-react";
import MotivationalBanner from "@/components/common/MotivationalBanner";
import RegistrationForm from "@/components/participant/RegistrationForm";
import { CLIENT_ID_KEY } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkExistingUser() {
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      if (!clientId) { setChecking(false); return; }
      try {
        const res = await fetch("/api/participants/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        });
        const data = await res.json();
        if (data?.id) { router.push("/my"); return; }
      } catch {}
      setChecking(false);
    }
    checkExistingUser();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MotivationalBanner />

      {/* 네비게이션 */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <span className="text-sm font-black text-white">F</span>
            </div>
            <span className="text-lg font-black text-gray-900">프리덤클래스</span>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            <a href="/" className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">HOME</a>
            <a href="/resources" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">무료 특강</a>
            <a href="/leaderboard" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">유뿌챌</a>
          </nav>
          <a
            href="/login"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            로그인 / 내 강의
          </a>
        </div>
      </header>

      {/* 히어로 배너 */}
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <TrendingUp size={12} />
            4주 업로드 챌린지 1기 모집 중
          </div>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            유튜브 뿌시기 챌린지,<br />
            <span className="text-yellow-300">지금 바로 시작하세요.</span>
          </h1>
          <p className="mt-3 text-base text-red-100">
            매주 꾸준히 업로드하면서 크리에이터 습관을 만들어보세요.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium">
              <Users size={14} /> 누적 참가자 <span className="font-bold text-yellow-300">100+명</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium">
              <Play size={14} /> 업로드 영상 <span className="font-bold text-yellow-300">500+개</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* 왼쪽: 소개 */}
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              챌린지 참가 혜택
            </h2>
            <p className="mt-2 text-sm text-gray-500">참가자에게만 제공되는 특별 혜택</p>

            <div className="mt-6 space-y-3">
              {[
                { icon: "📈", title: "진행률 추적", desc: "주차별 달성 현황을 한눈에 확인" },
                { icon: "🏆", title: "익명 랭킹", desc: "다른 참가자 진행률로 동기부여" },
                { icon: "📚", title: "무료 자료실", desc: "편집 노하우, AI 프롬프트 등 무료 제공" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 달성 조건 */}
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="mb-2 text-sm font-bold text-red-800">📋 주차별 달성 조건</p>
              <div className="space-y-1 text-sm text-red-700">
                <p>✅ 쇼츠 3개 이상 업로드</p>
                <p className="pl-4 text-xs text-red-400">또는</p>
                <p>✅ 롱폼 영상 1개 이상 업로드</p>
              </div>
            </div>

            {/* 바로가기 카드들 */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <a href="/leaderboard" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 hover:border-red-200 hover:bg-red-50 transition-colors">
                <Trophy size={18} className="text-red-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">리더보드</p>
                  <p className="text-xs text-gray-500">순위 확인</p>
                </div>
              </a>
              <a href="/resources" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 hover:border-red-200 hover:bg-red-50 transition-colors">
                <BookOpen size={18} className="text-red-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">자료실</p>
                  <p className="text-xs text-gray-500">무료 자료</p>
                </div>
              </a>
            </div>
          </div>

          {/* 오른쪽: 참가 신청 폼 */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                NEW · 1기
              </div>
              <h2 className="mt-2 text-xl font-black text-gray-900">챌린지 참가 신청</h2>
              <p className="mb-5 mt-1 text-sm text-gray-500">로그인 없이 바로 시작할 수 있어요</p>
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
