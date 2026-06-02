"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Upload } from "lucide-react";
import { Resource, RESOURCE_CATEGORIES, ResourceCategory } from "@/types";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "guides" as ResourceCategory,
  });
  const [file, setFile] = useState<File | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_KEY)
      : "";

  async function fetchResources() {
    try {
      const res = await fetch("/api/resources");
      const data = await res.json();
      setResources(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);

  async function handleCreate() {
    if (!form.title.trim()) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      if (file) formData.append("file", file);

      await fetch("/api/resources", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setForm({ title: "", description: "", category: "guides" });
      setFile(null);
      setIsCreateOpen(false);
      fetchResources();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteId(null);
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  }

  const categoryColors: Record<string, "purple" | "info" | "success" | "warning" | "neutral"> = {
    video_editing: "purple",
    ai_prompts: "info",
    templates: "success",
    guides: "warning",
    other: "neutral",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">자료실 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            수강생들이 다운로드할 수 있는 자료를 관리합니다
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus size={14} /> 자료 추가
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500">자료가 없습니다</p>
          <p className="mt-1 text-sm text-gray-400">첫 번째 자료를 추가해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={categoryColors[r.category] || "neutral"}
                    size="sm"
                  >
                    {RESOURCE_CATEGORIES[r.category as ResourceCategory] ||
                      r.category}
                  </Badge>
                  <h3 className="font-semibold text-gray-800">{r.title}</h3>
                </div>
                {r.description && (
                  <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>{r.file_name || "파일 없음"}</span>
                  <span>•</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {r.file_url && (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 transition-colors"
                    title="파일 보기"
                  >
                    <FileText size={15} />
                  </a>
                )}
                <button
                  onClick={() => setDeleteId(r.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="삭제"
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
        title="자료 추가"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              제목 *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="예: AI 영상 아이디어 생성 프롬프트"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="자료에 대한 간단한 설명..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              카테고리 *
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as ResourceCategory })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.entries(RESOURCE_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              파일
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 bg-gray-50">
              <Upload size={16} className="text-gray-400" />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-600"
              />
            </div>
            {file && (
              <p className="mt-1 text-xs text-gray-500">
                선택된 파일: {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCreateOpen(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              loading={uploading}
              onClick={handleCreate}
            >
              {uploading ? "업로드 중..." : "저장"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="자료 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            이 자료를 삭제하면 파일도 함께 삭제됩니다. 계속하시겠습니까?
          </p>
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
