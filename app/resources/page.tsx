"use client";

import { useEffect, useState } from "react";
import { Search, Download, FileText, Filter } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import MotivationalBanner from "@/components/common/MotivationalBanner";
import { Resource, RESOURCE_CATEGORIES, ResourceCategory } from "@/types";
import { formatDate } from "@/lib/utils";

const ALL_CATEGORIES = "all";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("/api/resources");
        const data = await res.json();
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === ALL_CATEGORIES || r.category === category;
    return matchSearch && matchCat;
  });

  const categories = [
    { value: ALL_CATEGORIES, label: "전체" },
    ...Object.entries(RESOURCE_CATEGORIES).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <MotivationalBanner />
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">📚 자료실</h1>
          <p className="mt-1 text-sm text-gray-500">
            유튜브 성장에 필요한 자료들을 무료로 다운로드하세요
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="자료 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={14} className="shrink-0 text-gray-400" />
            {categories.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`
                  shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors
                  ${category === value
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-gray-500">자료 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500">
              {search || category !== ALL_CATEGORIES
                ? "검색 결과가 없습니다"
                : "자료가 없습니다"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              조만간 유용한 자료가 추가될 예정입니다
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const categoryLabel =
    RESOURCE_CATEGORIES[resource.category as ResourceCategory] ||
    resource.category;

  const categoryColors: Record<string, string> = {
    video_editing: "bg-purple-100 text-purple-700",
    ai_prompts: "bg-blue-100 text-blue-700",
    templates: "bg-green-100 text-green-700",
    guides: "bg-orange-100 text-orange-700",
    other: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      {/* Category badge */}
      <div className="mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            categoryColors[resource.category] || "bg-gray-100 text-gray-600"
          }`}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mb-1 flex items-start gap-2">
          <FileText size={18} className="mt-0.5 shrink-0 text-gray-400" />
          <h3 className="font-semibold text-gray-800 leading-snug">
            {resource.title}
          </h3>
        </div>
        {resource.description && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-3">
            {resource.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {formatDate(resource.created_at)}
        </p>
        {resource.file_url && (
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download={resource.file_name}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Download size={12} />
            다운로드
          </a>
        )}
      </div>
    </div>
  );
}
