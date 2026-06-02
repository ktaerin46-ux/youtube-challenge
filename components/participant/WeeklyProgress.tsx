"use client";

import { WeekData } from "@/types";
import { formatDateShort, getWeekStatusEmoji } from "@/lib/utils";
import { SHORTS_WEEKLY_GOAL, LONGFORM_WEEKLY_GOAL } from "@/lib/constants";
import ProgressBar from "@/components/ui/ProgressBar";

interface WeeklyProgressProps {
  weeks: WeekData[];
}

export default function WeeklyProgress({ weeks }: WeeklyProgressProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {weeks.map((week) => (
        <WeekCard key={week.week} week={week} />
      ))}
    </div>
  );
}

function WeekCard({ week }: { week: WeekData }) {
  const isUpcoming = week.status === "upcoming";
  const isAchieved = week.status === "achieved";
  const isInProgress = week.status === "in_progress";
  const isNotAchieved = week.status === "not_achieved";

  const shortsProgress = Math.min(
    100,
    (week.shorts_count / SHORTS_WEEKLY_GOAL) * 100
  );
  const longformProgress = Math.min(
    100,
    (week.longform_count / LONGFORM_WEEKLY_GOAL) * 100
  );

  const bgClass = isAchieved
    ? "bg-green-50 border-green-200"
    : isInProgress
    ? "bg-indigo-50 border-indigo-200"
    : isNotAchieved
    ? "bg-red-50 border-red-200"
    : "bg-gray-50 border-gray-200";

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all duration-200
        ${bgClass}
        ${isInProgress ? "ring-2 ring-indigo-300 ring-offset-1" : ""}
      `}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Week {week.week}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateShort(week.startDate)} ~ {formatDateShort(week.endDate)}
          </p>
        </div>
        <span className="text-xl">{getWeekStatusEmoji(week.status)}</span>
      </div>

      {/* Status */}
      {isAchieved && (
        <div className="mb-2 text-center">
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            달성!
          </span>
        </div>
      )}
      {isInProgress && (
        <div className="mb-2 text-center">
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
            진행 중
          </span>
        </div>
      )}
      {isNotAchieved && (
        <div className="mb-2 text-center">
          <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            미달성
          </span>
        </div>
      )}
      {isUpcoming && (
        <div className="mb-2 text-center">
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            예정
          </span>
        </div>
      )}

      {/* Upload counts */}
      {!isUpcoming && (
        <div className="space-y-2 mt-3">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>쇼츠</span>
              <span className="font-medium">
                {week.shorts_count}/{SHORTS_WEEKLY_GOAL}
              </span>
            </div>
            <ProgressBar
              value={shortsProgress}
              size="sm"
              color={week.shorts_count >= SHORTS_WEEKLY_GOAL ? "green" : "indigo"}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>롱폼</span>
              <span className="font-medium">
                {week.longform_count}/{LONGFORM_WEEKLY_GOAL}
              </span>
            </div>
            <ProgressBar
              value={longformProgress}
              size="sm"
              color={week.longform_count >= LONGFORM_WEEKLY_GOAL ? "green" : "indigo"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
