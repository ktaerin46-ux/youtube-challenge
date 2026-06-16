"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CLIENT_ID_KEY } from "@/lib/constants";

interface FindByPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FindByPhoneModal({ isOpen, onClose }: FindByPhoneModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("전화번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/participants/find-by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "조회에 실패했습니다.");
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
    <Modal isOpen={isOpen} onClose={onClose} title="전화번호로 내 정보 찾기" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          가입할 때 입력한 전화번호를 입력하면 이 기기에서도 똑같이 내 진행 상황을 볼 수 있어요.
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-9 text-gray-400">
            <Phone size={16} />
          </div>
          <Input
            label="전화번호"
            placeholder="010-1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error}
            className="pl-9"
            type="tel"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          내 정보 불러오기
        </Button>
      </form>
    </Modal>
  );
}
