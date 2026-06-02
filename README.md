# 📺 4주 유튜브 업로드 챌린지

수강생들이 4주 동안 꾸준히 유튜브를 업로드하며 크리에이터 습관을 만드는 챌린지 플랫폼

---

## 🚀 빠른 시작

### 1단계: 프로젝트 의존성 설치

```bash
npm install
```

### 2단계: 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 아래 값들을 입력하세요:

| 변수명 | 설명 | 어디서 확인? |
|--------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | 위와 동일 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 비밀 키 | 위와 동일 (절대 외부 유출 금지!) |
| `ADMIN_PASSWORD` | 관리자 페이지 비밀번호 | 직접 설정 (최소 8자) |
| `ADMIN_SECRET` | 토큰 서명용 비밀키 | 직접 설정 (최소 32자 랜덤 문자열) |

### 3단계: Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com) 에서 새 프로젝트 생성
2. Supabase 대시보드 → SQL Editor 열기
3. `supabase-schema.sql` 파일 전체 내용 복사 → 실행
4. Storage 버킷 `resources` 가 생성되었는지 확인

### 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 📁 페이지 구조

| URL | 설명 | 접근 권한 |
|-----|------|-----------|
| `/` | 메인 (챌린지 등록) | 모든 사용자 |
| `/my` | 내 챌린지 페이지 | 등록 사용자 (localStorage) |
| `/leaderboard` | 익명 랭킹 리더보드 | 모든 사용자 |
| `/resources` | 자료실 | 모든 사용자 |
| `/admin` | 관리자 대시보드 | 관리자 (비밀번호) |
| `/admin/participants` | 참가자 관리 | 관리자 |
| `/admin/messages` | 동기부여 메시지 관리 | 관리자 |
| `/admin/resources` | 자료실 관리 | 관리자 |

---

## 🔒 보안 모델

- **참가자 인증**: UUID `clientId`를 localStorage에 저장, 모든 요청에 `x-client-id` 헤더로 전송
- **관리자 인증**: 환경변수 `ADMIN_PASSWORD`와 비교 후 HMAC 토큰 발급
- **데이터 격리**: 모든 데이터 수정은 API 라우트를 통해서만 가능
- **개인정보 보호**: 리더보드에서 실제 이름/채널 정보 미노출, 랜덤 닉네임만 표시

---

## 🗄️ 데이터베이스 테이블

| 테이블 | 설명 |
|--------|------|
| `participants` | 참가자 정보 (이름, 채널, 시작일, 구독자수) |
| `uploads` | 업로드 기록 (영상링크, 날짜, 타입) |
| `motivational_messages` | 동기부여 메시지 |
| `resources` | 자료실 파일 |
| `admin_notes` | 관리자 메모 |

---

## 🏆 챌린지 규칙

**매주 아래 조건 중 하나를 만족하면 달성!**
- 쇼츠 3개 이상 업로드
- 롱폼 영상 1개 이상 업로드

4주 모두 달성 시 완주 배지 획득!

---

## 🌐 Vercel 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경 변수 설정 (Vercel 대시보드 → Settings → Environment Variables)
# .env.local의 변수들을 그대로 입력
```

또는 GitHub에 푸시 후 Vercel에서 자동 배포 설정

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel
