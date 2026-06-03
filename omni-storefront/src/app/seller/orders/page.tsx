"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Search, Inbox, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/vendor/orders");
      setOrders(res.data);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        router.push("/seller/register");
      } else {
        setError("Không thể tải danh sách đơn hàng.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  const updateStatus = async (id: string, currentStatus: string, newStatus: string) => {
    // Basic state machine validation for UI
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["PROCESSING", "CANCELLED"],
      "PROCESSING": ["SHIPPED", "CANCELLED"],
      "SHIPPED": ["DELIVERED", "RETURNED"],
      "DELIVERED": ["COMPLETED", "RETURNED"],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      toast.error(`Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}`);
      return;
    }

    try {
      if (newStatus === "SHIPPED") {
        const res = await api.post(`/vendor/orders/${id}/ship`);
        setOrders(orders.map(o => o.id === id ? { ...o, status: "SHIPPED", trackingCode: res.data.trackingCode } : o));
        toast.success("Giao hàng cho GHN thành công! Mã vận đơn: " + res.data.trackingCode);
      } else {
        await api.patch(`/vendor/orders/${id}/status?status=${newStatus}`);
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      RETURNED: "bg-orange-100 text-orange-800",
    };
    return `px-2.5 py-1 text-xs rounded-full font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`;
  };

  const getNextStatuses = (status: string) => {
    switch (status) {
      case "PENDING": return [{ val: "PROCESSING", label: "Chuẩn bị hàng" }, { val: "CANCELLED", label: "Hủy đơn" }];
      case "PROCESSING": return [{ val: "SHIPPED", label: "Giao cho ĐVVC" }, { val: "CANCELLED", label: "Hủy đơn" }];
      case "SHIPPED": return [{ val: "DELIVERED", label: "Đã giao hàng" }, { val: "RETURNED", label: "Chuyển hoàn" }];
      case "DELIVERED": return [{ val: "COMPLETED", label: "Hoàn tất" }];
      default: return [];
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <p className="text-gray-500">Xử lý và theo dõi trạng thái đơn hàng của bạn</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm mã đơn hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <Inbox className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">Chưa có đơn hàng nào</p>
            <p className="text-gray-500">Đơn hàng mới của bạn sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  <th className="p-4 font-medium">Mã đơn hàng</th>
                  <th className="p-4 font-medium">Ngày đặt</th>
                  <th className="p-4 font-medium">Tổng tiền</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const nextStatuses = getNextStatuses(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 font-mono text-sm">{order.id.split('-')[0].toUpperCase()}...</div>
                        <div className="text-xs text-gray-500">{order.items?.length || 0} sản phẩm</div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-4 font-medium text-blue-600">
                        {order.totalAmount?.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                        {order.trackingCode && (
                          <div className="mt-2 text-xs font-mono text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">
                            📦 {order.trackingCode}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {nextStatuses.length > 0 ? (
                          <div className="relative inline-block text-left group">
                            <button className="inline-flex items-center justify-center gap-1 w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                              Cập nhật
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-10">
                              <div className="py-1">
                                {nextStatuses.map(ns => (
                                  <button
                                    key={ns.val}
                                    onClick={() => updateStatus(order.id, order.status, ns.val)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Chuyển sang: {ns.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Không thể thay đổi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
