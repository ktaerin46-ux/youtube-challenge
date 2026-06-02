import { PublicParticipantData } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import { Users } from "lucide-react";

interface LeaderboardListProps {
  participants: PublicParticipantData[];
  startRank?: number;
  myNickname?: string;
}

export default function LeaderboardList({
  participants,
  startRank = 1,
  myNickname,
}: LeaderboardListProps) {
  if (participants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
        <Users size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">아직 참가자가 없습니다</p>
        <p className="mt-1 text-sm text-gray-400">
          첫 번째 참가자가 되어보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map((p, i) => {
        const rank = startRank + i;
        const isMe = myNickname && p.random_nickname === myNickname;

        return (
          <div
            key={p.id}
            className={`
              flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all
              ${isMe
                ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200"
                : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            {/* Rank */}
            <div className="w-8 shrink-0 text-center">
              <span
                className={`text-sm font-bold ${
                  rank <= 3
                    ? "text-amber-600"
                    : "text-gray-400"
                }`}
              >
                {rank}
              </span>
            </div>

            {/* Nickname */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold truncate ${
                    isMe ? "text-indigo-700" : "text-gray-800"
                  }`}
                >
                  {p.random_nickname}
                  {isMe && (
                    <span className="ml-2 text-xs font-normal text-indigo-500">
                      (나)
                    </span>
                  )}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressBar
                  value={p.progress_percentage}
                  size="sm"
                  color={
                    p.progress_percentage === 100
                      ? "green"
                      : isMe
                      ? "indigo"
                      : "gradient"
                  }
                />
                <span className="shrink-0 text-xs font-semibold text-gray-700">
                  {p.progress_percentage}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 shrink-0">
              <div className="text-center">
                <p className="font-semibold text-gray-700">{p.completed_weeks}주</p>
                <p>달성</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">{p.total_uploads}개</p>
                <p>업로드</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
