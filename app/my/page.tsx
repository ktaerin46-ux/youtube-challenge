"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, Youtube, CheckCircle, LogOut } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import MotivationalBanner from "@/components/common/MotivationalBanner";
import StatCards from "@/components/participant/StatCards";
import WeeklyProgress from "@/components/participant/WeeklyProgress";
import UploadForm from "@/components/participant/UploadForm";
import UploadList from "@/components/participant/UploadList";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Participant, Upload, ProgressData } from "@/types";
import { CLIENT_ID_KEY } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface ParticipantData extends Participant {
  uploads: Upload[];
  progress: ProgressData;
}

export default function MyPage() {
  const router = useRouter();
  const [data, setData] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    youtube_channel_link: "",
    start_subscriber_count: "",
    challenge_start_date: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const clientId = localStorage.getItem(CLIENT_ID_KEY);
    if (!clientId) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("/api/participants/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      const participant = await res.json();
      if (!participant?.id) {
        localStorage.removeItem(CLIENT_ID_KEY);
        router.push("/");
        return;
      }

      setData(participant);
      setEditForm({
        name: participant.name,
        youtube_channel_link: participant.youtube_channel_link,
        start_subscriber_count: String(participant.start_subscriber_count),
        challenge_start_date: participant.challenge_start_date,
      });
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleLogout() {
    localStorage.removeItem(CLIENT_ID_KEY);
    router.push("/");
  }

  async function handleSaveEdit() {
    if (!data) return;
    setSaving(true);
    try {
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      const res = await fetch(`/api/participants/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId || "",
        },
        body: JSON.stringify({
          ...editForm,
          start_subscriber_count: Number(editForm.start_subscriber_count) || 0,
        }),
      });

      if (res.ok) {
        setEditOpen(false);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-500">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { progress } = data;
  const isCompleted = progress.isCompleted && progress.completedWeeks === 4;

  return (
    <div className="min-h-screen bg-slate-50">
      <MotivationalBanner />
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Completion Banner */}
        {isCompleted && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg animate-bounce-in">
            <div className="flex items-center gap-3">
              <CheckCircle size={32} />
              <div>
                <p className="text-lg font-black">🎉 챌린지 완주!</p>
                <p className="text-green-100">
                  4주 동안 정말 잘 해내셨습니다! 당신은 이미 유튜버입니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              안녕하세요, {data.name}님! 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              챌린지 시작일: {formatDate(data.challenge_start_date)} •{" "}
              <a
                href={data.youtube_channel_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <Youtube size={12} /> 채널 보기
              </a>
            </p>
            {/* 리더보드 익명 닉네임 */}
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1">
              <span className="text-xs text-indigo-500">리더보드 닉네임</span>
              <span className="text-sm font-bold text-indigo-700">🎭 {data.random_nickname}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Settings size={14} /> 설정
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> 로그아웃
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">전체 달성률</p>
              <p className="text-3xl font-black text-gray-900">
                {Math.round(progress.progressPercentage)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">
                {progress.completedWeeks}주 완료
              </p>
              <p className="text-xs text-gray-400">/ 4주</p>
            </div>
          </div>
          <ProgressBar
            value={progress.progressPercentage}
            size="lg"
            color="gradient"
            showLabel={false}
          />
          {progress.streak > 0 && (
            <p className="mt-2 text-xs text-orange-600 font-medium">
              🔥 {progress.streak}주 연속 달성 중!
            </p>
          )}
        </div>

        {/* Stat Cards */}
        <div className="mb-6">
          <StatCards progress={progress} />
        </div>

        {/* Weekly Progress */}
        <div className="mb-6">
          <h2 className="mb-3 text-base font-bold text-gray-800">
            주차별 진행 현황
          </h2>
          <WeeklyProgress weeks={progress.weeks} />
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">
              업로드 기록
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({data.uploads.length}개)
              </span>
            </h2>
          </div>

          <UploadForm
            participantId={data.id}
            onSuccess={fetchData}
          />

          <UploadList uploads={data.uploads} onDelete={fetchData} />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="내 정보 수정"
      >
        <div className="space-y-4">
          <Input
            label="이름"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="유튜브 채널 링크"
            value={editForm.youtube_channel_link}
            onChange={(e) =>
              setEditForm({ ...editForm, youtube_channel_link: e.target.value })
            }
            type="url"
          />
          <Input
            label="시작 구독자 수"
            value={editForm.start_subscriber_count}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                start_subscriber_count: e.target.value,
              })
            }
            type="number"
            min="0"
          />
          <Input
            label="챌린지 시작일"
            value={editForm.challenge_start_date}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                challenge_start_date: e.target.value,
              })
            }
            type="date"
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              loading={saving}
              onClick={handleSaveEdit}
            >
              저장하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
