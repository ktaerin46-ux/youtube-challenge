export interface Participant {
  id: string;
  name: string;
  youtube_channel_link: string;
  phone_number: string;
  cohort: string;
  start_subscriber_count: number;
  challenge_start_date: string;
  random_nickname: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  participant_id: string;
  video_link: string;
  upload_date: string;
  type: "shorts" | "longform";
  created_at: string;
}

export interface WeekData {
  week: number;
  startDate: string;
  endDate: string;
  shorts_count: number;
  longform_count: number;
  status: "achieved" | "in_progress" | "not_achieved" | "upcoming";
  uploads: Upload[];
}

export interface ProgressData {
  weeks: WeekData[];
  completedWeeks: number;
  progressPercentage: number;
  currentWeek: number;
  daysRemaining: number;
  streak: number;
  totalUploads: number;
  isCompleted: boolean;
}

export interface MotivationalMessage {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  category: string;
  created_at: string;
}

export interface AdminNote {
  id: string;
  participant_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface PublicParticipantData {
  id: string;
  random_nickname: string;
  start_subscriber_count: number;
  progress_percentage: number;
  completed_weeks: number;
  total_uploads: number;
  challenge_start_date: string;
}

export interface AdminParticipantData extends Participant {
  uploads: Upload[];
  notes: AdminNote[];
  progress: ProgressData;
}

export interface AdminStats {
  total_participants: number;
  average_achievement: number;
  this_week_achievement: number;
  total_uploads: number;
  projected_completions: number;
}

export type ResourceCategory =
  | "video_editing"
  | "ai_prompts"
  | "templates"
  | "guides"
  | "other";

export const RESOURCE_CATEGORIES: Record<ResourceCategory, string> = {
  video_editing: "영상 편집",
  ai_prompts: "AI 프롬프트",
  templates: "템플릿",
  guides: "가이드",
  other: "기타",
};
