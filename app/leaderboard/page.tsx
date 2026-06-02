"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import MotivationalBanner from "@/components/common/MotivationalBanner";
import TopThreeCards from "@/components/leaderboard/TopThreeCards";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import { PublicParticipantData } from "@/types";
import { CLIENT_ID_KEY } from "@/lib/constants";

export default function LeaderboardPage() {
  const [participants, setParticipants] = useState<PublicParticipantData[]>([]);
  const [myNickname, setMyNickname] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/participants");
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());

      // Get my nickname
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      if (clientId) {
        const meRes = await fetch("/api/participants/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        });
        const me = await meRes.json();
        if (me?.random_nickname) setMyNickname(me.random_nickname);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const top3 = participants.slice(0, 3);
  const rest = participants.slice(3);
  const myRank = myNickname
    ? participants.findIndex((p) => p.random_nickname === myNickname) + 1
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <MotivationalBanner />
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              🏆 리더보드
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {participants.length}명 참가 중
              </span>
              {lastUpdated && (
                <span>
                  {lastUpdated.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  업데이트
                </span>
              )}
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>

        {/* My rank callout */}
        {myRank > 0 && (
          <div className="mb-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4">
            <p className="text-sm font-medium text-indigo-700">
              내 현재 순위:{" "}
              <span className="text-lg font-black">{myRank}위</span>
              <span className="ml-2 text-indigo-500">
                ({participants[myRank - 1]?.progress_percentage}% 달성)
              </span>
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-gray-500">순위 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            {top3.length > 0 && (
              <TopThreeCards top3={top3} />
            )}

            {/* Notice */}
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-700">
                🔒 <strong>개인정보 보호:</strong> 실제 이름과 채널 정보는 공개되지 않습니다.
                닉네임과 진행률만 표시됩니다.
              </p>
            </div>

            {/* Full list (from rank 4) */}
            {rest.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  전체 순위
                </h2>
                <LeaderboardList
                  participants={rest}
                  startRank={4}
                  myNickname={myNickname}
                />
              </div>
            )}

            {participants.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
                <Users size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-500">아직 참가자가 없습니다</p>
                <p className="mt-1 text-sm text-gray-400">
                  챌린지에 참가하여 첫 번째 참가자가 되어보세요!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
