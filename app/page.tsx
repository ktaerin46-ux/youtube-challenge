"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Trophy, BookOpen, TrendingUp } from "lucide-react";
import MotivationalBanner from "@/components/common/MotivationalBanner";
import RegistrationForm from "@/components/participant/RegistrationForm";
import FindForm from "@/components/participant/FindForm";
import { CLIENT_ID_KEY } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"register" | "find">("register");

  useEffect(() => {
    async function checkExistingUser() {
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      if (!clientId) {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/participants/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        });

        const data = await res.json();
        if (data?.id) {
          router.push("/my");
          return;
        }
      } catch {}

      setChecking(false);
    }

    checkExistingUser();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MotivationalBanner />

      {/* Nav links */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Youtube size={16} className="text-white" />
            </div>
            4주 챌린지
          </div>
          <div className="flex gap-2">
            <a
              href="/leaderboard"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <Trophy size={14} /> 리더보드
            </a>
            <a
              href="/resources"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <BookOpen size={14} /> 자료실
            </a>
          </div>
        </div>
      </div>

      {/* Hero + Form */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Hero */}
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              <TrendingUp size={14} />
              4주 업로드 챌린지
            </div>
            <h1 className="mb-4 text-4xl font-black text-gray-900 leading-tight">
              지금 이 순간부터{" "}
              <span className="text-indigo-600">유튜버</span>가 되세요
            </h1>
            <p className="mb-8 text-lg text-gray-600 leading-relaxed">
              매주 쇼츠 3개 또는 롱폼 1개를 업로드하면서
              4주 동안 꾸준한 업로드 습관을 만들어 보세요.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {[
                {
                  emoji: "📈",
                  title: "진행률 추적",
                  desc: "주차별 달성 현황을 한눈에 확인",
                },
                {
                  emoji: "🏆",
                  title: "익명 랭킹",
                  desc: "다른 참가자들의 진행률로 동기부여",
                },
                {
                  emoji: "📚",
                  title: "자료실",
                  desc: "편집 노하우, AI 프롬프트 등 무료 자료 제공",
                },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly goal */}
            <div className="mt-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4">
              <p className="mb-2 text-sm font-semibold text-indigo-800">
                📋 주차별 달성 조건
              </p>
              <div className="space-y-1 text-sm text-indigo-700">
                <p>✅ 쇼츠 3개 이상 업로드</p>
                <p className="text-xs text-indigo-500 pl-4">또는</p>
                <p>✅ 롱폼 영상 1개 이상 업로드</p>
              </div>
            </div>
          </div>

          {/* Registration / Find Form */}
          <div className="animate-slide-up">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Tabs */}
              <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setTab("register")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    tab === "register"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  새로 참가하기
                </button>
                <button
                  onClick={() => setTab("find")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    tab === "find"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  이미 등록했어요
                </button>
              </div>

              {tab === "register" ? (
                <>
                  <h2 className="mb-1 text-xl font-bold text-gray-900">
                    챌린지 참가 신청
                  </h2>
                  <p className="mb-6 text-sm text-gray-500">
                    로그인 없이 바로 시작할 수 있어요
                  </p>
                  <RegistrationForm />
                </>
              ) : (
                <>
                  <h2 className="mb-1 text-xl font-bold text-gray-900">
                    내 기록 찾기
                  </h2>
                  <p className="mb-6 text-sm text-gray-500">
                    다른 기기에서 접속할 때 사용하세요
                  </p>
                  <FindForm />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
