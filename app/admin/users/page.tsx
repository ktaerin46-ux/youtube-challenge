"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  has_access: boolean;
  access_note: string | null;
  access_granted_at: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; note: string } | null>(null);

  async function fetchUsers() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function toggleAccess(user: UserProfile) {
    setUpdating(user.id);
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: user.id, has_access: !user.has_access }),
    });
    await fetchUsers();
    setUpdating(null);
  }

  async function saveNote() {
    if (!noteModal) return;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: noteModal.id, access_note: noteModal.note, has_access: users.find(u => u.id === noteModal.id)?.has_access }),
    });
    setNoteModal(null);
    fetchUsers();
  }

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accessCount = users.filter((u) => u.has_access).length;
  const pendingCount = users.filter((u) => !u.has_access).length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">회원 관리</h1>
        <p className="text-sm text-gray-500 mt-1">카카오/구글로 로그인한 회원 목록입니다. 결제 확인 후 접근 권한을 활성화해주세요.</p>
      </div>

      {/* 통계 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "전체 회원", value: users.length, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "강의 접근 가능", value: accessCount, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "결제 확인 대기", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 p-4">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
              <Icon size={16} />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* 검색 */}
      <div className="mb-4 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="이메일 또는 이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* 회원 목록 */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            {searchQuery ? "검색 결과가 없습니다." : "아직 가입한 회원이 없습니다."}
          </div>
        )}

        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
          >
            {/* 아바타 */}
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
            )}

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">
                  {user.full_name ?? "(이름 없음)"}
                </p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${user.provider === "kakao" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                  {user.provider === "kakao" ? "카카오" : "구글"}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.access_note && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">메모: {user.access_note}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                가입: {new Date(user.created_at).toLocaleDateString("ko-KR")}
                {user.access_granted_at && ` · 활성화: ${new Date(user.access_granted_at).toLocaleDateString("ko-KR")}`}
              </p>
            </div>

            {/* 상태 + 버튼 */}
            <div className="flex shrink-0 items-center gap-2">
              {user.has_access ? (
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  <CheckCircle size={12} /> 활성
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                  <XCircle size={12} /> 대기
                </span>
              )}
              <button
                onClick={() => setNoteModal({ id: user.id, note: user.access_note ?? "" })}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                메모
              </button>
              <button
                onClick={() => toggleAccess(user)}
                disabled={updating === user.id}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  user.has_access
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {updating === user.id ? "..." : user.has_access ? "비활성화" : "강의 열기"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 메모 모달 */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-gray-900">메모 수정</h3>
            <p className="text-xs text-gray-500 mt-1">래피드 결제번호, 연락처 등 기록해두세요</p>
            <textarea
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              rows={3}
              className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
              placeholder="예: 래피드 결제번호 #12345, 2024-01-15 결제 확인"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={saveNote}
                className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
