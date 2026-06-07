"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useCheckout } from "../CheckoutContext";

export default function CheckoutAddressStep() {
  const {
    step, setStep,
    addresses, setAddresses,
    selectedAddr, setSelectedAddr,
    showNewAddr, setShowNewAddr,
    newAddr, setNewAddr,
    provinces, districts, wards
  } = useCheckout();

  if (step !== 1) return null;

  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Chọn địa chỉ giao hàng</h2>
      {addresses.map(a => (
        <div key={a.id} onClick={() => setSelectedAddr(a.id)}
          className="p-5 rounded-2xl cursor-pointer transition-all duration-200 relative"
          style={{ background: "var(--bg-card)", border: selectedAddr === a.id ? "2px solid var(--gold)" : "1px solid var(--border)" }}>
          {a.isDefault && <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>Mặc định</span>}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
              style={{ border: selectedAddr === a.id ? "none" : "1.5px solid var(--border)", background: selectedAddr === a.id ? "var(--gold)" : "transparent" }}>
              {selectedAddr === a.id && <span className="text-[9px] text-black font-bold">✓</span>}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{a.receiverName} — {a.receiverPhone}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.detail}, {a.ward}, {a.district}, {a.province}</p>
            </div>
          </div>
        </div>
      ))}
      
      <button onClick={() => setShowNewAddr(!showNewAddr)} className="w-full py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2"
        style={{ border: "1.5px dashed var(--border)", color: "var(--text-muted)" }}>
        {showNewAddr ? "- Hủy thêm địa chỉ" : "+ Thêm địa chỉ mới"}
      </button>

      <AnimatePresence>
        {showNewAddr && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Họ và tên" value={newAddr.receiverName} onChange={e => setNewAddr({...newAddr, receiverName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input placeholder="Số điện thoại" value={newAddr.receiverPhone} onChange={e => setNewAddr({...newAddr, receiverPhone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <input placeholder="Số nhà, Tên đường" value={newAddr.detail} onChange={e => setNewAddr({...newAddr, detail: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={newAddr.ghnProvinceId || ""} onChange={e => {
                  const val = parseInt(e.target.value);
                  const item = provinces.find(p => p.ProvinceID === val);
                  setNewAddr({...newAddr, ghnProvinceId: val, province: item?.ProvinceName || "", ghnDistrictId: 0, district: "", ghnWardCode: "", ward: ""});
                }} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="" style={{color: "black"}}>Chọn Tỉnh/Thành phố</option>
                {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID} style={{color: "black"}}>{p.ProvinceName}</option>)}
              </select>
              
              <select value={newAddr.ghnDistrictId || ""} onChange={e => {
                  const val = parseInt(e.target.value);
                  const item = districts.find(d => d.DistrictID === val);
                  setNewAddr({...newAddr, ghnDistrictId: val, district: item?.DistrictName || "", ghnWardCode: "", ward: ""});
                }} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} disabled={!newAddr.ghnProvinceId}>
                <option value="" style={{color: "black"}}>Chọn Quận/Huyện</option>
                {districts.map(d => <option key={d.DistrictID} value={d.DistrictID} style={{color: "black"}}>{d.DistrictName}</option>)}
              </select>

              <select value={newAddr.ghnWardCode || ""} onChange={e => {
                  const val = e.target.value;
                  const item = wards.find(w => w.WardCode === val);
                  setNewAddr({...newAddr, ghnWardCode: val, ward: item?.WardName || ""});
                }} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} disabled={!newAddr.ghnDistrictId}>
                <option value="" style={{color: "black"}}>Chọn Phường/Xã</option>
                {wards.map(w => <option key={w.WardCode} value={w.WardCode} style={{color: "black"}}>{w.WardName}</option>)}
              </select>
            </div>
            <Button variant="gold" className="w-full" onClick={async () => {
              if (!newAddr.receiverName || !newAddr.receiverPhone || !newAddr.detail) return toast.error("Vui lòng điền đủ thông tin bắt buộc");
              try {
                const res = await api.post("/me/addresses", newAddr);
                setAddresses([res.data, ...addresses]);
                setSelectedAddr(res.data.id);
                setShowNewAddr(false);
                setNewAddr({ receiverName: "", receiverPhone: "", detail: "", ward: "", district: "", province: "", ghnProvinceId: 0, ghnDistrictId: 0, ghnWardCode: "" });
                toast.success("Đã thêm địa chỉ");
              } catch(e) {
                toast.error("Lỗi khi thêm địa chỉ");
              }
            }}>Lưu địa chỉ mới</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="gold" className="w-full" onClick={() => {
        if (!selectedAddr) return toast.error("Vui lòng chọn địa chỉ giao hàng");
        setStep(2);
      }}>
        Tiếp theo: Vận chuyển <ChevronRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
