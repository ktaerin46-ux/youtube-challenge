"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Video, FileText, ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";

interface ContentItem {
  id: string;
  title: string;
  type: "video" | "ebook" | "other";
  url: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  is_active: boolean;
  content_items: ContentItem[];
}

type NewContentItem = {
  title: string;
  type: "video" | "ebook" | "other";
  url: string;
  description: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: "", description: "", price: "" });
  const [newItem, setNewItem] = useState<{ productId: string; data: NewContentItem } | null>(null);
  const [saving, setSaving] = useState(false);

  function getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  async function fetchProducts() {
    const res = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  async function createProduct() {
    if (!newProduct.title) return;
    setSaving(true);
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        title: newProduct.title,
        description: newProduct.description || null,
        price: parseInt(newProduct.price) || 0,
      }),
    });
    setNewProduct({ title: "", description: "", price: "" });
    setShowNewProduct(false);
    setSaving(false);
    fetchProducts();
  }

  async function toggleProductActive(product: Product) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
    });
    fetchProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("상품을 삭제하면 모든 콘텐츠도 삭제됩니다. 계속하시겠습니까?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  }

  async function addContentItem() {
    if (!newItem) return;
    if (!newItem.data.title || !newItem.data.url) return;
    setSaving(true);
    const nextIndex = products.find(p => p.id === newItem.productId)?.content_items.length ?? 0;
    await fetch("/api/admin/content-items", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        product_id: newItem.productId,
        title: newItem.data.title,
        type: newItem.data.type,
        url: newItem.data.url,
        description: newItem.data.description || null,
        order_index: nextIndex,
      }),
    });
    setNewItem(null);
    setSaving(false);
    fetchProducts();
  }

  async function deleteContentItem(id: string) {
    await fetch("/api/admin/content-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">상품/콘텐츠 관리</h1>
          <p className="text-sm text-gray-500 mt-1">마이페이지에 보여줄 강의와 전자책을 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowNewProduct(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> 상품 추가
        </button>
      </div>

      {/* 새 상품 폼 */}
      {showNewProduct && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">새 상품 만들기</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="상품명 *"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="설명 (선택)"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="가격 (원, 선택)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowNewProduct(false)}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={createProduct}
              disabled={saving || !newProduct.title}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}

      {/* 상품 목록 */}
      {products.length === 0 && !showNewProduct && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          아직 상품이 없습니다. "상품 추가" 버튼을 눌러 만들어보세요.
        </div>
      )}

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* 상품 헤더 */}
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{product.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {product.is_active ? "활성" : "비활성"}
                  </span>
                </div>
                {product.description && <p className="text-sm text-gray-500 mt-0.5">{product.description}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {product.price > 0 ? `${product.price.toLocaleString()}원` : "무료"} · 콘텐츠 {product.content_items.length}개
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleProductActive(product)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${product.is_active ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}
                >
                  {product.is_active ? "숨기기" : "보이기"}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  {expandedId === product.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* 콘텐츠 목록 (펼치면 보임) */}
            {expandedId === product.id && (
              <div className="border-t border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">콘텐츠 목록</p>
                  <button
                    onClick={() => setNewItem({
                      productId: product.id,
                      data: { title: "", type: "video", url: "", description: "" }
                    })}
                    className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <Plus size={12} /> 콘텐츠 추가
                  </button>
                </div>

                {/* 새 콘텐츠 폼 */}
                {newItem?.productId === product.id && (
                  <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="제목 *"
                        value={newItem.data.title}
                        onChange={(e) => setNewItem({ ...newItem, data: { ...newItem.data, title: e.target.value } })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                      />
                      <select
                        value={newItem.data.type}
                        onChange={(e) => setNewItem({ ...newItem, data: { ...newItem.data, type: e.target.value as "video" | "ebook" | "other" } })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                      >
                        <option value="video">동영상 (유튜브 링크)</option>
                        <option value="ebook">전자책 (PDF URL)</option>
                        <option value="other">기타 링크</option>
                      </select>
                      <input
                        type="text"
                        placeholder={newItem.data.type === "video" ? "유튜브 URL (비공개/일부공개 링크) *" : "파일 URL *"}
                        value={newItem.data.url}
                        onChange={(e) => setNewItem({ ...newItem, data: { ...newItem.data, url: e.target.value } })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                      />
                      <input
                        type="text"
                        placeholder="설명 (선택)"
                        value={newItem.data.description}
                        onChange={(e) => setNewItem({ ...newItem, data: { ...newItem.data, description: e.target.value } })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => setNewItem(null)} className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-white">취소</button>
                      <button
                        onClick={addContentItem}
                        disabled={saving || !newItem.data.title || !newItem.data.url}
                        className="flex-1 rounded-lg bg-gray-900 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {saving ? "저장 중..." : "추가"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 콘텐츠 항목들 */}
                {product.content_items.length === 0 && !newItem && (
                  <p className="text-sm text-gray-400 italic">콘텐츠가 없습니다. 위의 "콘텐츠 추가"를 눌러 동영상이나 전자책을 추가하세요.</p>
                )}

                <div className="space-y-2">
                  {product.content_items
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
                        {item.type === "video" ? (
                          <Video size={14} className="shrink-0 text-blue-500" />
                        ) : (
                          <FileText size={14} className="shrink-0 text-emerald-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate">{item.url}</p>
                        </div>
                        <button
                          onClick={() => deleteContentItem(item.id)}
                          className="shrink-0 rounded p-1 text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
