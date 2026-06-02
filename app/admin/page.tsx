"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Upload, Target, Award } from "lucide-react";
import { AdminStats } from "@/types";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: "전체 참가자",
      value: stats?.total_participants ?? 0,
      unit: "명",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: TrendingUp,
      label: "평균 달성률",
      value: stats?.average_achievement ?? 0,
      unit: "%",
      color: "text-green-600 bg-green-50",
    },
    {
      icon: Target,
      label: "이번 주 달성률",
      value: stats?.this_week_achievement ?? 0,
      unit: "%",
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: Upload,
      label: "총 업로드 수",
      value: stats?.total_uploads ?? 0,
      unit: "개",
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: Award,
      label: "완주 예상 인원",
      value: stats?.projected_completions ?? 0,
      unit: "명",
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          챌린지 전체 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map(({ icon: Icon, label, value, unit, color }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-0.5 text-2xl font-black text-gray-900">
              {value}
              <span className="text-sm font-normal text-gray-500 ml-0.5">
                {unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/admin/participants",
            title: "참가자 관리",
            desc: "참가자 조회, 수정, 삭제, CSV 다운로드",
            icon: Users,
            color: "indigo",
          },
          {
            href: "/admin/messages",
            title: "동기부여 메시지",
            desc: "메인 배너에 표시되는 메시지 관리",
            icon: TrendingUp,
            color: "green",
          },
          {
            href: "/admin/resources",
            title: "자료실 관리",
            desc: "자료 업로드, 수정, 삭제",
            icon: Upload,
            color: "purple",
          },
        ].map(({ href, title, desc, icon: Icon, color }) => (
          <a
            key={href}
            href={href}
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div
              className={`mb-3 inline-flex rounded-lg p-2.5 bg-${color}-50 text-${color}-600`}
            >
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
