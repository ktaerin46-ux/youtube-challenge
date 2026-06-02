"use client";

import { useState } from "react";
import { Upload, Plus, LinkIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CLIENT_ID_KEY } from "@/lib/constants";

interface UploadFormProps {
  participantId: string;
  onSuccess: () => void;
}

export default function UploadForm({ participantId, onSuccess }: UploadFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    video_link: "",
    upload_date: new Date().toISOString().split("T")[0],
    type: "shorts" as "shorts" | "longform",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.video_link.trim()) {
      setError("영상 링크를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId || "",
        },
        body: JSON.stringify({ ...form, participant_id: participantId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "업로드 기록 실패");
        return;
      }

      setForm({
        video_link: "",
        upload_date: new Date().toISOString().split("T")[0],
        type: "shorts",
      });
      setIsOpen(false);
      onSuccess();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-4 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 group"
      >
        <Plus
          size={20}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="font-medium">영상 업로드 기록하기</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800">
          <Upload size={16} className="text-indigo-600" />
          업로드 기록
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          닫기
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
            <LinkIcon size={16} />
          </div>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={form.video_link}
            onChange={(e) => setForm({ ...form, video_link: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              업로드 날짜
            </label>
            <input
              type="date"
              value={form.upload_date}
              onChange={(e) =>
                setForm({ ...form, upload_date: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              영상 타입
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "shorts" })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.type === "shorts"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                쇼츠
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "longform" })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.type === "longform"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                롱폼
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          기록 저장하기
        </Button>
      </form>
    </div>
  );
}
