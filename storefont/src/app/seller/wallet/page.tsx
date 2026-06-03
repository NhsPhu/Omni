"use client";

import { useState, useEffect } from "react";
import { CreditCard, ArrowDownCircle, ArrowUpCircle, Wallet, Clock, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Modal, Form, Input, InputNumber } from "antd";

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchWallet = async () => {
    try {
      const res = await api.get("/vendor/wallet");
      setWallet(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải thông tin ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdrawSubmit = async (values: any) => {
    try {
      if (values.amount > (wallet?.availableBalance || 0)) {
        toast.error("Số tiền rút không được vượt quá số dư khả dụng");
        return;
      }
      if (values.amount < 50000) {
        toast.error("Số tiền rút tối thiểu là 50.000đ");
        return;
      }

      await api.post("/vendor/wallet/withdraw", {
        amount: values.amount,
        bankName: values.bankName,
        bankAccountNumber: values.bankAccountNumber,
        bankAccountName: values.bankAccountName
      });
      
      toast.success("Đã gửi yêu cầu rút tiền thành công!");
      setWithdrawModalOpen(false);
      form.resetFields();
      fetchWallet();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi yêu cầu rút tiền");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải thông tin ví...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ví nhà bán hàng (Tài chính)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-blue-100 font-medium">Số dư khả dụng</span>
            </div>
            <div className="text-4xl font-bold mb-6">
              {formatPrice(wallet?.availableBalance || 0)}
            </div>
            <div className="flex justify-between items-center mt-4 border-t border-white/20 pt-4">
              <div>
                <div className="text-xs text-blue-200">Đang chờ xử lý</div>
                <div className="font-semibold">{formatPrice(wallet?.pendingBalance || 0)}</div>
              </div>
              <div>
                <div className="text-xs text-blue-200">Tổng doanh thu</div>
                <div className="font-semibold">{formatPrice(wallet?.totalEarned || 0)}</div>
              </div>
            </div>
            <Button 
              variant="glass" 
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0 mt-6"
              onClick={() => setWithdrawModalOpen(true)}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" /> Rút tiền
            </Button>
          </div>
          <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-10" />
        </div>

        {/* Transactions List */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Lịch sử giao dịch</h2>
          
          <div className="space-y-4">
            {(!wallet?.transactions?.content || wallet.transactions.content.length === 0) ? (
              <div className="text-center py-8 text-gray-500">Chưa có giao dịch nào</div>
            ) : (
              wallet.transactions.content.map((tx: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type.startsWith('CREDIT') ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {tx.type.startsWith('CREDIT') ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tx.note || (tx.type.startsWith('CREDIT') ? 'Nhận tiền từ Đơn hàng' : 'Rút tiền/Phí')}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                        <span>•</span>
                        <span className="font-mono bg-gray-200 px-1.5 rounded">{tx.id.substring(0,8)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type.startsWith('CREDIT') ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type.startsWith('CREDIT') ? '+' : '-'}{formatPrice(tx.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Yêu cầu rút tiền"
        open={withdrawModalOpen}
        onCancel={() => setWithdrawModalOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo lệnh rút tiền"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700 border-none" }}
      >
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
          Số dư khả dụng: <strong className="text-lg ml-1">{formatPrice(wallet?.availableBalance || 0)}</strong>
        </div>
        <Form form={form} layout="vertical" onFinish={handleWithdrawSubmit}>
          <Form.Item name="amount" label="Số tiền rút (VND)" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber 
              className="w-full" 
              size="large" 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              min={50000} 
              max={wallet?.availableBalance || 0} 
            />
          </Form.Item>
          
          {/* Mock Bank Info Fields for demo */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="bankName" label="Tên Ngân Hàng" rules={[{ required: true, message: 'Nhập tên ngân hàng' }]}>
              <Input placeholder="VD: Vietcombank" />
            </Form.Item>
            <Form.Item name="bankAccountNumber" label="Số tài khoản" rules={[{ required: true, message: 'Nhập số tài khoản' }]}>
              <Input placeholder="VD: 0123456789" />
            </Form.Item>
          </div>
          <Form.Item name="bankAccountName" label="Tên chủ tài khoản" rules={[{ required: true, message: 'Nhập tên chủ tài khoản' }]}>
            <Input placeholder="VD: NGUYEN VAN A" />
          </Form.Item>

          <p className="text-xs text-gray-500 italic mt-2">
            * Thời gian xử lý rút tiền: Từ 1-3 ngày làm việc sau khi Admin duyệt.
          </p>
        </Form>
      </Modal>

    </div>
  );
}
