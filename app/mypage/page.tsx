"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabase } from "@/lib/supabase-browser";
import { BookOpen, LogOut, Play, FileText, Lock, ChevronDown, ChevronUp } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: "video" | "ebook" | "other";
  url: string;
  description: string | null;
  order_index: number;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  content_items: ContentItem[];
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  has_access: boolean;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const patterns = [
      /youtu\.be\/([^?&\s]+)/,
      /youtube\.com\/watch\?v=([^&\s]+)/,
      /youtube\.com\/embed\/([^?&\s]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

function VideoItem({ item }: { item: ContentItem }) {
  const [open, setOpen] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(item.url);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <Play size={16} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{item.title}</p>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-black">
          {embedUrl ? (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">
              영상을 불러올 수 없습니다.{" "}
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-red-500 underline">
                직접 보기
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EbookItem({ item }: { item: ContentItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 hover:bg-gray-50 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
        <FileText size={16} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
        )}
      </div>
      <span className="text-xs text-red-500 shrink-0">다운로드 →</span>
    </a>
  );
}

export default function MyPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/mypage");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setProducts(data.products ?? []);
      setHasAccess(data.has_access ?? false);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <span className="text-sm font-black text-white">F</span>
            </div>
            <span className="font-bold text-gray-900">프리덤클래스</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:block">
              {profile?.full_name ?? profile?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* 환영 메시지 */}
        <div className="mb-6 rounded-2xl bg-red-600 p-5 text-white">
          <p className="text-sm font-medium opacity-80">안녕하세요 👋</p>
          <h1 className="mt-1 text-xl font-black">
            {profile?.full_name ?? "회원"}님의 강의실
          </h1>
          <p className="mt-1 text-sm opacity-70">
            {profile?.provider === "kakao" ? "카카오" : "구글"}로 로그인됨 · {profile?.email}
          </p>
        </div>

        {/* 접근 권한이 없는 경우 */}
        {!hasAccess && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Lock size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">결제 확인 중</h2>
            <p className="mt-2 text-sm text-gray-500">
              강의 접근 권한을 확인하고 있습니다.
              <br />
              래피드에서 결제가 완료되면 관리자가 수동으로 확인 후 활성화해드립니다.
              <br />
              <span className="font-medium text-gray-700">보통 1~2시간 내 활성화됩니다.</span>
            </p>
            <p className="mt-4 text-xs text-gray-400">
              문의: 카카오톡 채널 또는 이메일로 연락해주세요
            </p>
          </div>
        )}

        {/* 콘텐츠 목록 */}
        {hasAccess && products.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">아직 등록된 강의가 없습니다.</p>
          </div>
        )}

        {hasAccess && products.map((product) => (
          <div key={product.id} className="mb-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-900">{product.title}</h2>
              {product.description && (
                <p className="mt-0.5 text-sm text-gray-500">{product.description}</p>
              )}
            </div>

            {product.content_items.length === 0 && (
              <p className="text-sm text-gray-400 italic">콘텐츠가 아직 없습니다.</p>
            )}

            <div className="space-y-2">
              {product.content_items.map((item) => (
                item.type === "video" ? (
                  <VideoItem key={item.id} item={item} />
                ) : item.type === "ebook" ? (
                  <EbookItem key={item.id} item={item} />
                ) : (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{item.title}</span>
                    <span className="ml-auto text-xs text-red-500">열기 →</span>
                  </a>
                )
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
