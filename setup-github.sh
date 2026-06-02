#!/bin/bash

# ============================================================
# 4주 유튜브 챌린지 — GitHub 자동화 설정 스크립트
# ============================================================
# 실행 방법: chmod +x setup-github.sh && ./setup-github.sh
# ============================================================

set -e  # 오류 발생 시 즉시 중단

REPO_NAME="youtube-challenge"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "🚀 4주 유튜브 챌린지 — GitHub 자동화 시작"
echo "============================================"
echo ""

# ============================================================
# 1단계: Homebrew 설치 확인 및 설치
# ============================================================
echo "📦 1단계: Homebrew 확인 중..."

if ! command -v brew &>/dev/null; then
  echo "  → Homebrew가 없습니다. 설치합니다..."
  echo "  → (설치 중 비밀번호를 물어볼 수 있습니다)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Apple Silicon Mac이면 brew 경로 추가
  if [[ -f "/opt/homebrew/bin/brew" ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  fi
  echo "  ✅ Homebrew 설치 완료"
else
  echo "  ✅ Homebrew 이미 설치됨"
fi

# brew 경로 확인
if [[ -f "/opt/homebrew/bin/brew" ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# ============================================================
# 2단계: Git 설치 확인
# ============================================================
echo ""
echo "🔧 2단계: Git 확인 중..."

if ! command -v git &>/dev/null; then
  echo "  → Git 설치 중..."
  brew install git
  echo "  ✅ Git 설치 완료"
else
  echo "  ✅ Git 이미 설치됨 ($(git --version))"
fi

# ============================================================
# 3단계: GitHub CLI (gh) 설치 확인
# ============================================================
echo ""
echo "🐙 3단계: GitHub CLI 확인 중..."

if ! command -v gh &>/dev/null; then
  echo "  → GitHub CLI 설치 중..."
  brew install gh
  echo "  ✅ GitHub CLI 설치 완료"
else
  echo "  ✅ GitHub CLI 이미 설치됨 ($(gh --version | head -1))"
fi

# ============================================================
# 4단계: Node.js 설치 확인
# ============================================================
echo ""
echo "📗 4단계: Node.js 확인 중..."

if ! command -v node &>/dev/null; then
  echo "  → Node.js 설치 중..."
  brew install node
  echo "  ✅ Node.js 설치 완료 ($(node --version))"
else
  echo "  ✅ Node.js 이미 설치됨 ($(node --version))"
fi

# ============================================================
# 5단계: GitHub 로그인
# ============================================================
echo ""
echo "🔑 5단계: GitHub 로그인 확인 중..."

if ! gh auth status &>/dev/null; then
  echo "  → GitHub 로그인이 필요합니다."
  echo "  → 브라우저가 열립니다. GitHub 계정으로 로그인해주세요."
  gh auth login --web
  echo "  ✅ GitHub 로그인 완료"
else
  GH_USER=$(gh api user --jq '.login' 2>/dev/null || echo "알 수 없음")
  echo "  ✅ GitHub 로그인 됨 (@${GH_USER})"
fi

# ============================================================
# 6단계: Git 기본 설정 (이메일/이름이 없을 경우)
# ============================================================
echo ""
echo "⚙️  6단계: Git 사용자 정보 확인 중..."

GIT_NAME=$(git config --global user.name 2>/dev/null || echo "")
GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")

if [[ -z "$GIT_NAME" ]]; then
  GH_NAME=$(gh api user --jq '.name // .login' 2>/dev/null || echo "")
  if [[ -n "$GH_NAME" ]]; then
    git config --global user.name "$GH_NAME"
    echo "  ✅ Git 이름 설정: $GH_NAME"
  else
    read -p "  Git 이름을 입력하세요: " GIT_NAME_INPUT
    git config --global user.name "$GIT_NAME_INPUT"
  fi
fi

if [[ -z "$GIT_EMAIL" ]]; then
  GH_EMAIL=$(gh api user/emails --jq '.[0].email' 2>/dev/null || echo "")
  if [[ -n "$GH_EMAIL" ]]; then
    git config --global user.email "$GH_EMAIL"
    echo "  ✅ Git 이메일 설정: $GH_EMAIL"
  else
    read -p "  Git 이메일을 입력하세요: " GIT_EMAIL_INPUT
    git config --global user.email "$GIT_EMAIL_INPUT"
  fi
fi

# ============================================================
# 7단계: 프로젝트 폴더로 이동
# ============================================================
echo ""
echo "📁 7단계: 프로젝트 폴더 확인 중..."

cd "$SCRIPT_DIR"
echo "  ✅ 현재 위치: $SCRIPT_DIR"

# ============================================================
# 8단계: Git 저장소 초기화
# ============================================================
echo ""
echo "🗂️  8단계: Git 저장소 초기화 중..."

if [[ ! -d ".git" ]]; then
  git init
  git branch -M main
  echo "  ✅ Git 초기화 완료"
else
  echo "  ✅ Git 저장소 이미 초기화됨"
fi

# ============================================================
# 9단계: 파일 스테이징 및 첫 커밋
# ============================================================
echo ""
echo "💾 9단계: 첫 번째 커밋 생성 중..."

git add .

# 커밋할 내용이 있을 때만 커밋
if git diff --cached --quiet; then
  echo "  → 커밋할 변경사항이 없습니다"
else
  git commit -m "feat: 4주 유튜브 업로드 챌린지 플랫폼 초기 구축

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase 데이터베이스 및 스토리지 연동
- 수강생 등록 (localStorage 기반, 로그인 불필요)
- 주차별 달성 현황 추적 및 진행률 계산
- 익명 닉네임 리더보드
- 관리자 페이지 (참가자 관리, CSV 내보내기, 메모)
- 동기부여 메시지 시스템
- 자료실 (파일 업로드/다운로드)"

  echo "  ✅ 첫 커밋 완료"
fi

# ============================================================
# 10단계: GitHub 원격 저장소 생성
# ============================================================
echo ""
echo "🐙 10단계: GitHub 원격 저장소 생성 중..."

GH_USER=$(gh api user --jq '.login')

# 이미 원격 저장소가 있는지 확인
if git remote get-url origin &>/dev/null; then
  EXISTING_REMOTE=$(git remote get-url origin)
  echo "  → 원격 저장소 이미 설정됨: $EXISTING_REMOTE"
else
  # 같은 이름의 repo가 이미 있는지 확인
  if gh repo view "$GH_USER/$REPO_NAME" &>/dev/null; then
    echo "  → '$REPO_NAME' 저장소가 이미 GitHub에 존재합니다."
    echo "  → 기존 저장소에 연결합니다..."
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
  else
    echo "  → GitHub에 새 저장소 '$REPO_NAME' 생성 중..."
    gh repo create "$REPO_NAME" \
      --public \
      --description "4주 유튜브 업로드 챌린지 플랫폼 | Next.js + Supabase" \
      --homepage "" \
      --source=. \
      --remote=origin \
      --push

    echo "  ✅ GitHub 저장소 생성 및 푸시 완료!"
    echo ""
    echo "  🔗 저장소 URL: https://github.com/$GH_USER/$REPO_NAME"
    gh repo view --web "$GH_USER/$REPO_NAME" 2>/dev/null || true
    exit_early=true
  fi
fi

# ============================================================
# 11단계: GitHub에 푸시 (원격 저장소가 이미 있었던 경우)
# ============================================================
if [[ -z "$exit_early" ]]; then
  echo ""
  echo "⬆️  11단계: GitHub에 코드 푸시 중..."
  git push -u origin main
  echo "  ✅ 푸시 완료!"
fi

# ============================================================
# 12단계: Vercel 자동 배포 연결 (선택)
# ============================================================
echo ""
echo "============================================"
echo "✅ GitHub 설정 완료!"
echo "============================================"
echo ""
echo "🔗 GitHub 저장소: https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "📋 다음 단계:"
echo ""
echo "1️⃣  Supabase 설정"
echo "   → https://supabase.com 에서 새 프로젝트 생성"
echo "   → SQL Editor에서 supabase-schema.sql 실행"
echo ""
echo "2️⃣  환경 변수 설정 (.env.local)"
echo "   cp .env.local.example .env.local"
echo "   # 파일을 열어서 Supabase URL, 키, 관리자 비밀번호 입력"
echo ""
echo "3️⃣  로컬 실행"
echo "   npm install"
echo "   npm run dev"
echo "   → http://localhost:3000 접속"
echo ""
echo "4️⃣  Vercel 무료 배포 (선택)"
echo "   → https://vercel.com 에서 GitHub 연동"
echo "   → youtube-challenge 저장소 선택"
echo "   → Environment Variables에 .env.local 내용 입력"
echo "   → Deploy 클릭!"
echo ""
echo "🎉 모든 준비 완료! 챌린지 플랫폼을 시작할 준비가 되었습니다."
echo ""
