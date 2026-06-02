"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getDailyMessage } from "@/lib/utils";
import { DEFAULT_MOTIVATIONAL_MESSAGES } from "@/lib/constants";

export default function MotivationalBanner() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMessage() {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        const active = Array.isArray(data)
          ? data.filter((m: { is_active: boolean; message: string }) => m.is_active)
              .map((m: { message: string }) => m.message)
          : [];

        const messages =
          active.length > 0 ? active : DEFAULT_MOTIVATIONAL_MESSAGES;
        setMessage(getDailyMessage(messages));
      } catch {
        setMessage(getDailyMessage(DEFAULT_MOTIVATIONAL_MESSAGES));
      }
    }
    fetchMessage();
  }, []);

  if (!message) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <p className="flex items-center justify-center gap-2 text-center text-sm font-medium">
          <Sparkles size={16} className="shrink-0 opacity-80" />
          <span>{message}</span>
          <Sparkles size={16} className="shrink-0 opacity-80" />
        </p>
      </div>
    </div>
  );
}
