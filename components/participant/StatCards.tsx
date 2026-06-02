import { ProgressData } from "@/types";
import { Flame, Trophy, Video, Clock } from "lucide-react";

interface StatCardsProps {
  progress: ProgressData;
}

export default function StatCards({ progress }: StatCardsProps) {
  const stats = [
    {
      icon: Trophy,
      label: "달성률",
      value: `${Math.round(progress.progressPercentage)}%`,
      sub: `${progress.completedWeeks}/4주 완료`,
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: Flame,
      label: "연속 달성",
      value: `${progress.streak}주`,
      sub: progress.streak > 0 ? "🔥 불타오르는 중!" : "첫 주를 달성해보세요",
      color: "text-orange-600 bg-orange-50",
    },
    {
      icon: Video,
      label: "총 업로드",
      value: `${progress.totalUploads}개`,
      sub: "누적 영상 수",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: Clock,
      label: "남은 기간",
      value: progress.daysRemaining > 0 ? `${progress.daysRemaining}일` : "완료",
      sub:
        progress.isCompleted
          ? "챌린지 완주! 🎉"
          : `${progress.currentWeek}주차 진행 중`,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, sub, color }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className={`mb-2 inline-flex rounded-lg p-2 ${color}`}>
            <Icon size={18} />
          </div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
        </div>
      ))}
    </div>
  );
}
