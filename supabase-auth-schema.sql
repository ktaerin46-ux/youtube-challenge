-- ============================================
-- 프리덤클래스 — 인증/결제/콘텐츠 스키마
-- ============================================
-- Supabase SQL Editor에서 이 파일 내용을 실행하세요
-- ============================================

-- 회원 프로필 테이블 (Supabase auth.users 확장)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,                          -- 'kakao', 'google'
  has_access BOOLEAN DEFAULT false,       -- 관리자가 결제 확인 후 true로 변경
  access_note TEXT,                       -- 메모 (래피드 결제번호 등)
  access_granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 상품 테이블 (강의, 전자책 묶음 등)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 콘텐츠 항목 테이블 (상품 안의 동영상/전자책)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'ebook', 'other')),
  url TEXT NOT NULL,                      -- 유튜브 링크 또는 파일 URL
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문/결제 기록 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'rapyd',    -- 래피드(rapyd) 또는 manual
  payment_ref TEXT,                       -- 래피드 결제 참조번호
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_has_access ON user_profiles(has_access);
CREATE INDEX IF NOT EXISTS idx_content_items_product_id ON content_items(product_id);
CREATE INDEX IF NOT EXISTS idx_content_items_order ON content_items(product_id, order_index);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);

-- ============================================
-- updated_at 자동 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 비활성화 (service role key로 관리)
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 기본 상품 데이터 (선택사항)
-- ============================================
-- INSERT INTO products (title, description, price) VALUES
--   ('유튜브 뿌시기 챌린지 올인원', '4주 유튜브 챌린지 동영상 강의 + 전자책 패키지', 99000);
