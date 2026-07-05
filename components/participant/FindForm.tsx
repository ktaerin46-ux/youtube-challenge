"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Youtube, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CLIENT_ID_KEY, IS_LEGACY_COHORT } from "@/lib/constants";

export default function FindForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    youtube_channel_link: "",
    phone_number: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const identifierValue = IS_LEGACY_COHORT
      ? form.youtube_channel_link
      : form.phone_number;

    if (!form.name.trim() || !identifierValue.trim()) {
      setError(
        IS_LEGACY_COHORT
          ? "이름과 유튜브 채널 링크를 모두 입력해주세요."
          : "이름과 전화번호를 모두 입력해주세요."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/participants/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          IS_LEGACY_COHORT
            ? { name: form.name, youtube_channel_link: form.youtube_channel_link }
            : { name: form.name, phone_number: form.phone_number }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "찾을 수 없습니다.");
        return;
      }

      localStorage.setItem(CLIENT_ID_KEY, data.client_id);
      router.push("/my");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
          <User size={16} />
        </div>
        <Input
          label="이름"
          placeholder="등록 시 입력한 이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="pl-9"
        />
      </div>

      {IS_LEGACY_COHORT ? (
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
            <Youtube size={16} />
          </div>
          <Input
            label="유튜브 채널 링크"
            placeholder="https://youtube.com/@yourchannel"
            value={form.youtube_channel_link}
            onChange={(e) => setForm({ ...form, youtube_channel_link: e.target.value })}
            className="pl-9"
            type="url"
          />
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
            <Phone size={16} />
          </div>
          <Input
            label="전화번호"
            placeholder="010-1234-5678"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            className="pl-9"
            type="tel"
          />
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        내 기록 찾기
      </Button>

      <p className="text-center text-xs text-gray-500">
        {IS_LEGACY_COHORT
          ? "등록 시 입력한 이름과 채널 링크를 정확히 입력해주세요"
          : "등록 시 입력한 이름과 전화번호를 정확히 입력해주세요"}
      </p>
    </form>
  );
}
