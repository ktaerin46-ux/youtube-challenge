import {
  Upload,
  WeekData,
  ProgressData,
} from "@/types";
import {
  CHALLENGE_START_DATE,
  CHALLENGE_WEEKS,
  SHORTS_WEEKLY_GOAL,
  LONGFORM_WEEKLY_GOAL,
  RANDOM_NICKNAMES,
} from "./constants";

// 챌린지 주차는 누가 보든 항상 CHALLENGE_START_DATE(6/4)부터 7일 단위로 고정된다.
export function calculateProgress(
  _startDate: string,
  uploads: Upload[]
): ProgressData {
  const start = new Date(CHALLENGE_START_DATE);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const weeks: WeekData[] = [];
  let completedWeeks = 0;
  let streak = 0;
  let currentWeek = 0;

  const challengeEnd = new Date(start);
  challengeEnd.setDate(start.getDate() + CHALLENGE_WEEKS * 7 - 1);

  const daysElapsed = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (challengeEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  for (let weekIdx = 0; weekIdx < CHALLENGE_WEEKS; weekIdx++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + weekIdx * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekUploads = uploads.filter((u) => {
      const uploadDate = new Date(u.upload_date);
      return uploadDate >= weekStart && uploadDate <= weekEnd;
    });

    const shortsCount = weekUploads.filter((u) => u.type === "shorts").length;
    const longformCount = weekUploads.filter(
      (u) => u.type === "longform"
    ).length;
    const achieved =
      shortsCount >= SHORTS_WEEKLY_GOAL || longformCount >= LONGFORM_WEEKLY_GOAL;

    let status: WeekData["status"];
    if (achieved) {
      status = "achieved";
      completedWeeks++;
    } else if (now >= weekStart && now <= weekEnd) {
      status = "in_progress";
      currentWeek = weekIdx + 1;
    } else if (now > weekEnd) {
      status = "not_achieved";
    } else {
      status = "upcoming";
    }

    if (now >= weekStart && now <= weekEnd) {
      currentWeek = weekIdx + 1;
    }

    weeks.push({
      week: weekIdx + 1,
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
      shorts_count: shortsCount,
      longform_count: longformCount,
      status,
      uploads: weekUploads,
    });
  }

  // Calculate streak (consecutive achieved weeks from the beginning)
  for (const week of weeks) {
    if (week.status === "achieved") {
      streak++;
    } else if (week.status === "not_achieved") {
      streak = 0;
    } else {
      break;
    }
  }

  const progressPercentage = (completedWeeks / CHALLENGE_WEEKS) * 100;
  const isCompleted =
    completedWeeks === CHALLENGE_WEEKS || now > challengeEnd;

  return {
    weeks,
    completedWeeks,
    progressPercentage,
    currentWeek: currentWeek || (daysElapsed < 0 ? 0 : Math.min(CHALLENGE_WEEKS, Math.ceil((daysElapsed + 1) / 7))),
    daysRemaining,
    streak,
    totalUploads: uploads.length,
    isCompleted,
  };
}

export function getRandomNickname(existingNicknames: string[] = []): string {
  const available = RANDOM_NICKNAMES.filter(
    (n) => !existingNicknames.includes(n)
  );

  if (available.length === 0) {
    // All nicknames taken, add a number suffix
    const base =
      RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    let i = 2;
    while (existingNicknames.includes(`${base} ${i}`)) i++;
    return `${base} ${i}`;
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function generateClientId(): string {
  return crypto.randomUUID();
}

export function isValidPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, "");
  return /^01[0-9]{8,9}$/.test(digits);
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export function getDailyMessage(messages: string[]): string {
  if (messages.length === 0) return "오늘도 화이팅!";
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return messages[dayOfYear % messages.length];
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}위`;
}

export function getWeekStatusEmoji(status: WeekData["status"]): string {
  switch (status) {
    case "achieved":
      return "✅";
    case "in_progress":
      return "⚠️";
    case "not_achieved":
      return "❌";
    case "upcoming":
      return "🔒";
  }
}

export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["﻿" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
