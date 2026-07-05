export const RANDOM_NICKNAMES = [
  "귀여운 유튜버",
  "최고의 유튜버",
  "오늘은 100억",
  "꾸준함의 신",
  "알고리즘 정복자",
  "조회수 사냥꾼",
  "성장하는 크리에이터",
  "업로드 마스터",
  "갑자기 성공",
  "구독자 폭발",
  "영상 장인",
  "콘텐츠 폭탄",
  "새벽 크리에이터",
  "주말 영상왕",
  "편집 마법사",
  "섬네일 천재",
  "조회수 폭발",
  "수익화 도전자",
  "유튜브 정복",
  "촬영 달인",
  "연속 업로드",
  "성장 가속기",
  "채널 키우기",
  "트렌드 선도자",
  "밤새 편집러",
  "아이디어 뱅크",
  "댓글 친화력",
  "구독자 부자",
  "영상 공장장",
  "콘텐츠 제왕",
  "클릭율 마스터",
  "시청 시간 왕",
  "알림 설정 천재",
  "라이브 도전러",
  "쇼츠 킹",
  "롱폼 장인",
  "기획 전문가",
  "업로드 불도저",
  "꾸준한 승리자",
  "성실한 크리에이터",
];

export const DEFAULT_MOTIVATIONAL_MESSAGES = [
  "조회수보다 중요한 것은 오늘도 업로드한 당신입니다.",
  "성공한 유튜버와 포기한 유튜버의 차이는 한 번 더 올렸느냐입니다.",
  "완벽한 영상보다 업로드된 영상이 낫습니다.",
  "오늘의 1개 영상이 미래의 100만 조회수를 만듭니다.",
  "꾸준함은 결국 알고리즘을 이깁니다.",
  "업로드는 재능이 아니라 습관입니다.",
  "지금 이 순간도 누군가는 당신의 영상을 기다리고 있습니다.",
  "첫 100명의 구독자가 첫 100만 구독자의 시작입니다.",
  "오늘 올린 영상이 6개월 후의 당신을 만듭니다.",
  "완벽주의는 업로드의 적입니다. 일단 올리세요.",
  "모든 유명 유튜버도 처음엔 구독자 0명이었습니다.",
  "포기하지 않는 사람이 결국 이깁니다.",
];

// 배포마다(1기/2기) 다른 값을 쓸 수 있도록 환경변수로 오버라이드 가능
export const CURRENT_COHORT = process.env.NEXT_PUBLIC_COHORT || "1기";
// "1기"는 기존 방식(이름+유튜브 링크 인증) 유지, 그 외 코호트는 이름+전화번호 인증 사용
export const IS_LEGACY_COHORT = CURRENT_COHORT === "1기";
export const CHALLENGE_START_DATE =
  process.env.NEXT_PUBLIC_CHALLENGE_START_DATE || "2026-06-04";
export const CHALLENGE_WEEKS = 4;
// 마지막 주가 온전한 7일이 아닐 수 있어서(예: 2기 26일), 전체 일수를 따로 오버라이드 가능
export const CHALLENGE_TOTAL_DAYS = process.env.NEXT_PUBLIC_CHALLENGE_TOTAL_DAYS
  ? Number(process.env.NEXT_PUBLIC_CHALLENGE_TOTAL_DAYS)
  : CHALLENGE_WEEKS * 7;
export const SHORTS_WEEKLY_GOAL = 3;
export const LONGFORM_WEEKLY_GOAL = 1;

export const ADMIN_TOKEN_KEY = "yt-challenge-admin-token";
export const CLIENT_ID_KEY = "yt-challenge-client-id";
