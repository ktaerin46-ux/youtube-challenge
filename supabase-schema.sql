-- ============================================
-- 유튜브 4주 챌린지 - Supabase 데이터베이스 스키마
-- ============================================
-- 1. Supabase 프로젝트에서 SQL Editor를 열어주세요
-- 2. 이 파일의 내용을 전부 복사해서 실행하세요
-- ============================================

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  youtube_channel_link TEXT NOT NULL,
  start_subscriber_count INTEGER NOT NULL DEFAULT 0,
  challenge_start_date DATE NOT NULL,
  random_nickname TEXT NOT NULL,
  client_id TEXT NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 DB에 이미 participants 테이블이 있다면 아래 한 줄만 SQL Editor에서 실행하세요
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE;

-- 업로드 기록 테이블
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  video_link TEXT NOT NULL,
  upload_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shorts', 'longform')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 동기부여 메시지 테이블
CREATE TABLE IF NOT EXISTS motivational_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 자료실 테이블
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 메모 테이블
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스 설정 (성능 최적화)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_uploads_participant_id ON uploads(participant_id);
CREATE INDEX IF NOT EXISTS idx_uploads_upload_date ON uploads(upload_date);
CREATE INDEX IF NOT EXISTS idx_participants_client_id ON participants(client_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_participant_id ON admin_notes(participant_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_active ON motivational_messages(is_active);

-- ============================================
-- updated_at 자동 업데이트 함수
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- participants 테이블 트리거
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- motivational_messages 테이블 트리거
DROP TRIGGER IF EXISTS update_messages_updated_at ON motivational_messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON motivational_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- admin_notes 테이블 트리거
DROP TRIGGER IF EXISTS update_notes_updated_at ON admin_notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON admin_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) 비활성화
-- API 라우트에서 service role key로 접근하므로 RLS 불필요
-- ============================================

ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE motivational_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Supabase Storage 버킷 설정
-- (아래 SQL을 실행하거나 Supabase 대시보드에서 직접 생성하세요)
-- ============================================

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 공개 접근 정책
CREATE POLICY IF NOT EXISTS "Public read resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY IF NOT EXISTS "Service role can manage resources" ON storage.objects
  FOR ALL USING (bucket_id = 'resources');

-- ============================================
-- 초기 동기부여 메시지 데이터 (선택사항)
-- ============================================

INSERT INTO motivational_messages (message, is_active) VALUES
  ('조회수보다 중요한 것은 오늘도 업로드한 당신입니다.', true),
  ('성공한 유튜버와 포기한 유튜버의 차이는 한 번 더 올렸느냐입니다.', true),
  ('완벽한 영상보다 업로드된 영상이 낫습니다.', true),
  ('오늘의 1개 영상이 미래의 100만 조회수를 만듭니다.', true),
  ('꾸준함은 결국 알고리즘을 이깁니다.', true),
  ('업로드는 재능이 아니라 습관입니다.', true),
  ('지금 이 순간도 누군가는 당신의 영상을 기다리고 있습니다.', true),
  ('첫 100명의 구독자가 첫 100만 구독자의 시작입니다.', true),
  ('오늘 올린 영상이 6개월 후의 당신을 만듭니다.', true),
  ('완벽주의는 업로드의 적입니다. 일단 올리세요.', true),
  ('모든 유명 유튜버도 처음엔 구독자 0명이었습니다.', true),
  ('포기하지 않는 사람이 결국 이깁니다.', true)
ON CONFLICT DO NOTHING;
