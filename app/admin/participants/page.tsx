"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  FileSpreadsheet,
  Trash2,
  ChevronDown,
  ChevronUp,
  StickyNote,
  ExternalLink,
  Youtube,
} from "lucide-react";
import { AdminParticipantData } from "@/types";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";
import { formatDate, downloadCSV } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";

type SortField = "name" | "progress" | "subscribers" | "created_at";
type SortDir = "asc" | "desc";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<AdminParticipantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("progress");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : "";

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/participants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const cohorts = Array.from(new Set(participants.map((p) => p.cohort))).sort();

  const filtered = participants
    .filter((p) => cohortFilter === "all" || p.cohort === cohortFilter)
    .filter((p) => {
      if (!search) return true;
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.random_nickname.toLowerCase().includes(search.toLowerCase()) ||
        p.youtube_channel_link.toLowerCase().includes(search.toLowerCase()) ||
        p.phone_number.includes(search)
      );
    })
    .sort((a, b) => {
      let valA: number | string, valB: number | string;
      switch (sortField) {
        case "progress":
          valA = a.progress.progressPercentage;
          valB = b.progress.progressPercentage;
          break;
        case "subscribers":
          valA = a.start_subscriber_count;
          valB = b.start_subscriber_count;
          break;
        case "created_at":
          valA = a.created_at;
          valB = b.created_at;
          break;
        default:
          valA = a.name;
          valB = b.name;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDir === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await fetch(`/api/participants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveNote() {
    if (!noteModal || !noteText.trim()) return;
    setSavingNote(true);
    try {
      await fetch("/api/admin/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participant_id: noteModal.id,
          note: noteText.trim(),
        }),
      });
      setNoteText("");
      setNoteModal(null);
      fetchData();
    } finally {
      setSavingNote(false);
    }
  }

  function handleExportCSV() {
    const rows = filtered.map((p) => ({
      코호트: p.cohort,
      이름: p.name,
      전화번호: p.phone_number,
      닉네임: p.random_nickname,
      채널링크: p.youtube_channel_link,
      시작구독자수: p.start_subscriber_count,
      챌린지시작일: p.challenge_start_date,
      달성률: `${Math.round(p.progress.progressPercentage)}%`,
      완료주차: p.progress.completedWeeks,
      총업로드수: p.progress.totalUploads,
      가입일: formatDate(p.created_at),
    }));
    downloadCSV(rows, "participants.csv");
  }

  function handleExportFeedbackExcel() {
    const rows = filtered.flatMap((p) =>
      p.notes.length === 0
        ? [
            {
              코호트: p.cohort,
              이름: p.name,
              닉네임: p.random_nickname,
              피드백내용: "",
              작성일: "",
            },
          ]
        : p.notes.map((n) => ({
            코호트: p.cohort,
            이름: p.name,
            닉네임: p.random_nickname,
            피드백내용: n.note,
            작성일: formatDate(n.created_at),
          }))
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 60 },
      { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "피드백");
    XLSX.writeFile(workbook, "참가자_피드백.xlsx");
  }

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 uppercase tracking-wide"
    >
      {label}
      {sortField === field ? (
        sortDir === "desc" ? (
          <ChevronDown size={12} />
        ) : (
          <ChevronUp size={12} />
        )
      ) : null}
    </button>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">참가자 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {participants.length}명 참가 중
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={14} /> CSV 다운로드
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportFeedbackExcel}>
            <FileSpreadsheet size={14} /> 피드백 엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* Search & cohort filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="이름, 닉네임, 채널 링크, 전화번호로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={cohortFilter}
          onChange={(e) => setCohortFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-40"
        >
          <option value="all">전체 기수</option>
          {cohorts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden grid-cols-[1fr_1fr_120px_120px_80px_80px] gap-4 rounded-lg bg-gray-50 px-4 py-2.5 sm:grid">
            <SortButton field="name" label="이름" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              닉네임
            </span>
            <SortButton field="progress" label="달성률" />
            <SortButton field="subscribers" label="시작 구독자" />
            <SortButton field="created_at" label="가입일" />
            <span />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">참가자가 없습니다</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                {/* Main row */}
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_1fr_120px_120px_80px_80px] sm:items-center sm:gap-4">
                  {/* Name & Channel */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <Badge variant="neutral" size="sm">{p.cohort}</Badge>
                    </div>
                    {p.phone_number && (
                      <p className="text-xs text-gray-500 mt-0.5">{p.phone_number}</p>
                    )}
                    <a
                      href={p.youtube_channel_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-0.5"
                    >
                      <Youtube size={10} /> 채널 보기
                    </a>
                  </div>

                  {/* Nickname */}
                  <p className="text-sm text-gray-600 font-medium">
                    {p.random_nickname}
                  </p>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">
                        {Math.round(p.progress.progressPercentage)}%
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.progress.completedWeeks}주
                      </span>
                    </div>
                    <ProgressBar
                      value={p.progress.progressPercentage}
                      size="sm"
                      color={
                        p.progress.progressPercentage === 100
                          ? "green"
                          : "gradient"
                      }
                    />
                  </div>

                  {/* Subscribers */}
                  <p className="text-sm text-gray-700">
                    {p.start_subscriber_count.toLocaleString()}명
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-500">
                    {formatDate(p.created_at).replace("년 ", ".").replace("월 ", ".").replace("일", "")}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === p.id ? null : p.id)
                      }
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="상세 보기"
                    >
                      {expandedId === p.id ? (
                        <ChevronUp size={15} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => setNoteModal({ id: p.id, name: p.name })}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                      title="메모 추가"
                    >
                      <StickyNote size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === p.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Uploads */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          업로드 기록 ({p.uploads.length}개)
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {p.uploads.length === 0 ? (
                            <p className="text-xs text-gray-400">업로드 없음</p>
                          ) : (
                            p.uploads.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2"
                              >
                                <Badge
                                  variant={u.type === "shorts" ? "purple" : "info"}
                                  size="sm"
                                >
                                  {u.type === "shorts" ? "쇼츠" : "롱폼"}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {u.upload_date}
                                </span>
                                <a
                                  href={u.video_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto text-indigo-500 hover:text-indigo-700"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          관리자 메모 ({p.notes.length}개)
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {p.notes.length === 0 ? (
                            <p className="text-xs text-gray-400">메모 없음</p>
                          ) : (
                            p.notes.map((n) => (
                              <div
                                key={n.id}
                                className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2"
                              >
                                <p className="text-xs text-amber-800">{n.note}</p>
                                <p className="mt-0.5 text-xs text-amber-500">
                                  {formatDate(n.created_at)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Week summary */}
                    <div className="mt-4">
                      <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        주차별 현황
                      </h4>
                      <div className="flex gap-2">
                        {p.progress.weeks.map((w) => (
                          <div
                            key={w.week}
                            className={`flex-1 rounded-lg border p-2 text-center ${
                              w.status === "achieved"
                                ? "border-green-200 bg-green-50"
                                : w.status === "not_achieved"
                                ? "border-red-200 bg-red-50"
                                : w.status === "in_progress"
                                ? "border-indigo-200 bg-indigo-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <p className="text-xs font-bold text-gray-600">
                              {w.week}주
                            </p>
                            <p className="text-base">
                              {w.status === "achieved"
                                ? "✅"
                                : w.status === "not_achieved"
                                ? "❌"
                                : w.status === "in_progress"
                                ? "⚠️"
                                : "🔒"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={!!noteModal}
        onClose={() => setNoteModal(null)}
        title={`${noteModal?.name}에게 메모 추가`}
        size="sm"
      >
        <div className="space-y-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="메모 내용을 입력하세요..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setNoteModal(null)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              loading={savingNote}
              onClick={handleSaveNote}
            >
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="참가자 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            이 참가자를 삭제하면 모든 데이터(업로드 기록, 메모 등)가
            영구 삭제됩니다. 정말 삭제하시겠습니까?
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleting}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
