"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { MotivationalMessage } from "@/types";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

export default function MessagesPage() {
  const [messages, setMessages] = useState<MotivationalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMsg, setEditingMsg] = useState<MotivationalMessage | null>(null);
  const [formText, setFormText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_KEY)
      : "";

  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function handleCreate() {
    if (!formText.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: formText.trim() }),
      });
      setFormText("");
      setIsCreateOpen(false);
      fetchMessages();
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editingMsg || !formText.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/messages/${editingMsg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: formText.trim() }),
      });
      setEditingMsg(null);
      setFormText("");
      fetchMessages();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(msg: MotivationalMessage) {
    try {
      await fetch(`/api/messages/${msg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !msg.is_active }),
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteId(null);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">동기부여 메시지</h1>
          <p className="mt-1 text-sm text-gray-500">
            메인 배너에 매일 순환 표시되는 메시지를 관리합니다
          </p>
        </div>
        <Button size="sm" onClick={() => { setFormText(""); setIsCreateOpen(true); }}>
          <Plus size={14} /> 메시지 추가
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">메시지가 없습니다</p>
          <p className="mt-1 text-sm text-gray-400">
            첫 번째 메시지를 추가해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 rounded-xl border p-4 ${
                msg.is_active
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex-1">
                <p
                  className={`font-medium leading-relaxed ${
                    msg.is_active ? "text-green-900" : "text-gray-500"
                  }`}
                >
                  {msg.message}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={msg.is_active ? "success" : "neutral"}>
                    {msg.is_active ? "활성" : "비활성"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatDate(msg.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(msg)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    msg.is_active
                      ? "text-green-600 hover:bg-green-100"
                      : "text-gray-400 hover:bg-gray-200"
                  }`}
                  title={msg.is_active ? "비활성화" : "활성화"}
                >
                  {msg.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => {
                    setEditingMsg(msg);
                    setFormText(msg.message);
                  }}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(msg.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="메시지 추가"
        size="md"
      >
        <div className="space-y-4">
          <textarea
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder="예: 완벽한 영상보다 업로드된 영상이 낫습니다."
            rows={3}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCreateOpen(false)}
            >
              취소
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleCreate}>
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingMsg}
        onClose={() => setEditingMsg(null)}
        title="메시지 수정"
        size="md"
      >
        <div className="space-y-4">
          <textarea
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditingMsg(null)}
            >
              취소
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleUpdate}>
              수정
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="메시지 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">이 메시지를 삭제하시겠습니까?</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
