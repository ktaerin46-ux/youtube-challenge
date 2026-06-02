"use client";

import { useState } from "react";
import { Upload } from "@/types";
import { formatDate } from "@/lib/utils";
import { ExternalLink, Trash2, Film, Zap } from "lucide-react";
import { CLIENT_ID_KEY } from "@/lib/constants";

interface UploadListProps {
  uploads: Upload[];
  onDelete: () => void;
}

export default function UploadList({ uploads, onDelete }: UploadListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("이 업로드 기록을 삭제할까요?")) return;

    setDeletingId(id);
    try {
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      const res = await fetch(`/api/uploads/${id}`, {
        method: "DELETE",
        headers: { "x-client-id": clientId || "" },
      });

      if (res.ok) onDelete();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  if (uploads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <Film size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">아직 업로드 기록이 없어요</p>
        <p className="mt-1 text-xs text-gray-400">첫 영상을 올리고 기록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors group"
        >
          {/* Type icon */}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
              upload.type === "shorts"
                ? "bg-purple-100 text-purple-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {upload.type === "shorts" ? (
              <Zap size={15} />
            ) : (
              <Film size={15} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  upload.type === "shorts"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {upload.type === "shorts" ? "쇼츠" : "롱폼"}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(upload.upload_date)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-600">
              {upload.video_link}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <a
              href={upload.video_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={() => handleDelete(upload.id)}
              disabled={deletingId === upload.id}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
