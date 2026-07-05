"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, User, Hash, Calendar, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { generateClientId, isValidPhoneNumber } from "@/lib/utils";
import { CLIENT_ID_KEY, IS_LEGACY_COHORT } from "@/lib/constants";

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    youtube_channel_link: "",
    phone_number: "",
    start_subscriber_count: "",
    challenge_start_date: new Date().toISOString().split("T")[0],
  });

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!form.youtube_channel_link.trim())
      newErrors.youtube_channel_link = "유튜브 채널 링크를 입력해주세요.";
    if (!IS_LEGACY_COHORT) {
      if (!form.phone_number.trim())
        newErrors.phone_number = "전화번호를 입력해주세요.";
      else if (!isValidPhoneNumber(form.phone_number))
        newErrors.phone_number = "올바른 휴대폰 번호 형식이 아니에요. (예: 010-1234-5678)";
    }
    if (!form.challenge_start_date)
      newErrors.challenge_start_date = "시작일을 선택해주세요.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const clientId = generateClientId();

      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          start_subscriber_count:
            Number(form.start_subscriber_count) || 0,
          client_id: clientId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrors({ general: err.error || "등록에 실패했습니다." });
        return;
      }

      localStorage.setItem(CLIENT_ID_KEY, clientId);
      router.push("/my");
    } catch {
      setErrors({ general: "네트워크 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {errors.general}
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
          <User size={16} />
        </div>
        <Input
          label="이름"
          placeholder="홍길동"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          className="pl-9"
        />
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
          <Youtube size={16} />
        </div>
        <Input
          label="유튜브 채널 링크"
          placeholder="https://youtube.com/@yourchannel"
          value={form.youtube_channel_link}
          onChange={(e) =>
            setForm({ ...form, youtube_channel_link: e.target.value })
          }
          error={errors.youtube_channel_link}
          className="pl-9"
          type="url"
        />
      </div>

      {!IS_LEGACY_COHORT && (
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
            <Phone size={16} />
          </div>
          <Input
            label="전화번호"
            placeholder="010-1234-5678"
            value={form.phone_number}
            onChange={(e) =>
              setForm({ ...form, phone_number: e.target.value })
            }
            error={errors.phone_number}
            className="pl-9"
            type="tel"
            hint="다른 기기에서 접속할 때 이름과 함께 사용돼요"
          />
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
          <Hash size={16} />
        </div>
        <Input
          label="시작 구독자 수"
          placeholder="0"
          value={form.start_subscriber_count}
          onChange={(e) =>
            setForm({ ...form, start_subscriber_count: e.target.value })
          }
          className="pl-9"
          type="number"
          min="0"
          hint="챌린지 시작 시점의 구독자 수를 입력하세요"
        />
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
          <Calendar size={16} />
        </div>
        <Input
          label="챌린지 시작일"
          value={form.challenge_start_date}
          onChange={(e) =>
            setForm({ ...form, challenge_start_date: e.target.value })
          }
          error={errors.challenge_start_date}
          className="pl-9"
          type="date"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        챌린지 시작하기 🚀
      </Button>

      <p className="text-center text-xs text-gray-500">
        등록하면 이 기기에서 언제든 진행 상황을 확인할 수 있습니다.
      </p>
    </form>
  );
}
