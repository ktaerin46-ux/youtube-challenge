import { PublicParticipantData } from "@/types";

interface TopThreeCardsProps {
  top3: PublicParticipantData[];
}

const medals = [
  { emoji: "👑", label: "1위", bg: "from-amber-400 to-yellow-500", textColor: "text-amber-900" },
  { emoji: "🥈", label: "2위", bg: "from-slate-300 to-slate-400", textColor: "text-slate-800" },
  { emoji: "🥉", label: "3위", bg: "from-amber-600 to-amber-700", textColor: "text-amber-100" },
];

export default function TopThreeCards({ top3 }: TopThreeCardsProps) {
  if (top3.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-center text-lg font-bold text-gray-800">
        🏆 TOP 3
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top3.map((p, i) => {
          const medal = medals[i];
          return (
            <div
              key={p.id}
              className={`
                relative overflow-hidden rounded-2xl bg-gradient-to-br ${medal.bg}
                p-5 shadow-lg
                ${i === 0 ? "sm:order-2" : i === 1 ? "sm:order-1" : "sm:order-3"}
              `}
            >
              {/* Medal badge */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-3xl">{medal.emoji}</span>
                <span
                  className={`text-xs font-bold ${medal.textColor} opacity-70`}
                >
                  {medal.label}
                </span>
              </div>

              {/* Nickname */}
              <p
                className={`text-lg font-bold ${medal.textColor} mb-1 truncate`}
              >
                {p.random_nickname}
              </p>

              {/* Progress */}
              <p className={`text-3xl font-black ${medal.textColor} mb-3`}>
                {p.progress_percentage}%
              </p>

              {/* Stats */}
              <div
                className={`flex gap-3 text-xs ${medal.textColor} opacity-80`}
              >
                <span>{p.completed_weeks}주 달성</span>
                <span>•</span>
                <span>{p.total_uploads}개 업로드</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-black/20">
                  <div
                    className="h-2 rounded-full bg-white/60 transition-all duration-700"
                    style={{ width: `${p.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
