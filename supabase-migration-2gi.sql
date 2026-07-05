-- ============================================
-- 2기 준비: 이름+전화번호 인증 + 코호트 구분 마이그레이션
-- ============================================
-- 이미 운영 중인(1기 데이터가 들어있는) Supabase 프로젝트의
-- SQL Editor에서 이 파일 내용을 그대로 실행하세요.
-- 전부 IF NOT EXISTS / 안전한 기본값이라 여러 번 실행해도 문제 없습니다.
-- ============================================

-- 전화번호 컬럼 (2기부터 사용, 1기 기존 데이터는 빈 문자열로 채워짐)
ALTER TABLE participants ADD COLUMN IF NOT EXISTS phone_number TEXT NOT NULL DEFAULT '';

-- 기수 구분 컬럼 (기존 데이터는 전부 '1기'로 채워짐)
ALTER TABLE participants ADD COLUMN IF NOT EXISTS cohort TEXT NOT NULL DEFAULT '1기';

CREATE INDEX IF NOT EXISTS idx_participants_cohort ON participants(cohort);
CREATE INDEX IF NOT EXISTS idx_participants_phone ON participants(phone_number);
