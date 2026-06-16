"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, CreditCard } from "lucide-react";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";

interface Order {
  id: string;
  user_email: string;
  user_name: string | null;
  product_title: string | null;
  amount: number;
  payment_method: string;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    user_email: "",
    user_name: "",
    product_title: "",
    amount: "",
    payment_method: "rapyd",
    payment_ref: "",
    notes: "",
  });

  function getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  async function fetchOrders() {
    const res = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => { fetchOrders(); }, []);

  async function createOrder() {
    if (!form.user_email) return;
    setSaving(true);
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        user_email: form.user_email,
        user_name: form.user_name || null,
        product_title: form.product_title || null,
        amount: parseInt(form.amount) || 0,
        payment_method: form.payment_method,
        payment_ref: form.payment_ref || null,
        notes: form.notes || null,
      }),
    });
    setForm({ user_email: "", user_name: "", product_title: "", amount: "", payment_method: "rapyd", payment_ref: "", notes: "" });
    setShowForm(false);
    setSaving(false);
    fetchOrders();
  }

  async function deleteOrder(id: string) {
    if (!confirm("이 결제 기록을 삭제하시겠습니까?")) return;
    await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id }),
    });
    fetchOrders();
  }

  const filtered = orders.filter(
    (o) =>
      o.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.payment_ref?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = orders.reduce((sum, o) => sum + (o.amount ?? 0), 0);

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
          <h1 className="text-xl font-bold text-gray-900">결제 내역</h1>
          <p className="text-sm text-gray-500 mt-1">래피드 결제 확인 후 수동으로 기록합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> 결제 기록
        </button>
      </div>

      {/* 합계 */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <CreditCard size={16} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{orders.length}</p>
          <p className="text-xs text-gray-500">총 결제 건수</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <span className="text-sm font-bold text-green-600">₩</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500">총 결제 금액</p>
        </div>
      </div>

      {/* 결제 기록 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">결제 기록 추가</h3>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="고객 이메일 *"
              value={form.user_email}
              onChange={(e) => setForm({ ...form, user_email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
            <input
              type="text"
              placeholder="고객 이름"
              value={form.user_name}
              onChange={(e) => setForm({ ...form, user_name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
            <input
              type="text"
              placeholder="상품명"
              value={form.product_title}
              onChange={(e) => setForm({ ...form, product_title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
            <input
              type="number"
              placeholder="결제 금액 (원)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="rapyd">래피드 (Rapyd)</option>
              <option value="manual">수동 확인</option>
              <option value="bank_transfer">계좌이체</option>
            </select>
            <input
              type="text"
              placeholder="결제 참조번호 (래피드 번호 등)"
              value={form.payment_ref}
              onChange={(e) => setForm({ ...form, payment_ref: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
            <input
              type="text"
              placeholder="메모"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-white"
            >
              취소
            </button>
            <button
              onClick={createOrder}
              disabled={saving || !form.user_email}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}

      {/* 검색 */}
      <div className="mb-4 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="이메일, 이름, 결제번호로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* 결제 목록 */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            {searchQuery ? "검색 결과가 없습니다." : "아직 결제 기록이 없습니다."}
          </div>
        )}

        {filtered.map((order) => (
          <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <CreditCard size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.user_name ?? order.user_email}
                    </p>
                    <p className="text-sm text-gray-500">{order.user_email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{order.amount.toLocaleString()}원</p>
                    <p className="text-xs text-gray-400">{order.payment_method}</p>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                  {order.product_title && <span>상품: {order.product_title}</span>}
                  {order.payment_ref && <span>참조번호: {order.payment_ref}</span>}
                  {order.notes && <span>메모: {order.notes}</span>}
                  <span>{new Date(order.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              </div>
              <button
                onClick={() => deleteOrder(order.id)}
                className="shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
