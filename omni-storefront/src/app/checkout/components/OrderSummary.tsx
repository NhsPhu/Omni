"use client";
import { Store, ShoppingCart, Ticket } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCheckout } from "../CheckoutContext";
import { toast } from "sonner";

export default function OrderSummary() {
  const {
    cartItems, itemsByShop, shopVouchersData, selectedShopVouchers, setSelectedShopVouchers,
    getItemPrice, usage, activeEvent,
    subtotal, totalShopDiscount, activeVoucher, activeShippingVoucher, actualShipFee, total
  } = useCheckout();

  return (
    <div className="lg:w-72 flex-shrink-0">
      <div className="sticky top-24 p-5 rounded-2xl space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Đơn hàng ({cartItems.length})</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto scroll-hide pr-1">
          {Object.keys(itemsByShop).map(shopId => {
            const shopGroup = itemsByShop[shopId];
            const shopVouchers = shopVouchersData[shopId] || [];
            const shopSubtotal = shopGroup.items.reduce((s, it) => s + getItemPrice(it) * it.quantity, 0);
            return (
              <div key={shopId} className="space-y-3 pb-3" style={{ borderBottom: "1px dashed var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" style={{ color: "var(--gold)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{shopGroup.name}</span>
                </div>
                {shopGroup.items.map(it => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      {it.imageUrl ? (
                        <img src={it.imageUrl.startsWith('http') ? it.imageUrl : `http://localhost:8080${it.imageUrl}`} className="w-full h-full object-cover" alt={it.name} />
                      ) : (
                        <ShoppingCart className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>{it.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>x{it.quantity}</p>
                      {(() => {
                        const fItem = activeEvent?.items?.find((f: any) => f.productId === it.productId && f.flashStock > f.soldCount);
                        if (fItem && fItem.maxQuantityPerUser > 0) {
                          const bought = usage[it.id] || 0;
                          if (bought + it.quantity > fItem.maxQuantityPerUser) {
                            return <p className="text-[10px] text-orange-500 mt-1 leading-tight">Vượt hạn mức. Giá gốc.</p>;
                          }
                        }
                        return null;
                      })()}
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--text-primary)" }}>{formatPrice(getItemPrice(it) * it.quantity)}</span>
                  </div>
                ))}
                
                {/* Shop Vouchers Input */}
                <div className="mt-4 pt-3" style={{ borderTop: "1px dashed var(--border)" }}>
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Ticket className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                    Voucher của Shop
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="Nhập mã giảm giá của Shop..." 
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const code = e.currentTarget.value.toUpperCase();
                          const v = shopVouchers.find(sv => sv.code.toUpperCase() === code);
                          if (v) {
                            if (shopSubtotal < v.minOrderValue) {
                              toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)} để áp dụng mã này`);
                            } else {
                              setSelectedShopVouchers({ ...selectedShopVouchers, [shopId]: v });
                              toast.success(`Đã áp dụng mã ${v.code}`);
                              e.currentTarget.value = '';
                            }
                          } else {
                            toast.error("Mã giảm giá không hợp lệ hoặc không áp dụng cho shop này");
                          }
                        }
                      }}
                    />
                  </div>
                  
                  {/* Applied Shop Voucher Display */}
                  {selectedShopVouchers[shopId] && (
                    <div className="flex items-center justify-between p-2 rounded-lg mb-3" style={{ background: "var(--gold-dim)", border: "1px solid var(--gold)" }}>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>{selectedShopVouchers[shopId]!.code}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          Giảm {selectedShopVouchers[shopId]!.discountType === 'PERCENTAGE' 
                            ? `${selectedShopVouchers[shopId]!.discountValue}%` 
                            : formatPrice(selectedShopVouchers[shopId]!.discountValue)}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          const newVouchers = { ...selectedShopVouchers };
                          delete newVouchers[shopId];
                          setSelectedShopVouchers(newVouchers);
                        }}
                        className="text-xs font-bold hover:underline"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}

                  {/* Available Shop Vouchers List */}
                  {shopVouchers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Voucher có sẵn từ shop:</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 scroll-hide">
                        {shopVouchers.map(v => {
                          const isEligible = shopSubtotal >= v.minOrderValue;
                          const isSelected = selectedShopVouchers[shopId]?.id === v.id;
                          return (
                            <div key={v.id} 
                              onClick={() => {
                                if (!isEligible) {
                                  toast.error(`Đơn hàng từ shop này cần tối thiểu ${formatPrice(v.minOrderValue)}`);
                                  return;
                                }
                                if (isSelected) {
                                  const newVouchers = { ...selectedShopVouchers };
                                  delete newVouchers[shopId];
                                  setSelectedShopVouchers(newVouchers);
                                } else {
                                  setSelectedShopVouchers({ ...selectedShopVouchers, [shopId]: v });
                                }
                              }}
                              className={`flex-shrink-0 p-2 rounded-lg border cursor-pointer min-w-[120px] transition-all
                                ${isSelected ? 'border-gold bg-gold/10' : isEligible ? 'border-gray-200 hover:border-gold/50' : 'border-gray-100 opacity-50 cursor-not-allowed'}`}
                            >
                              <p className="text-[10px] font-bold" style={{ color: isSelected ? "var(--gold)" : "var(--text-primary)" }}>{v.code}</p>
                              <p className="text-[10px] text-green-500 font-semibold mt-0.5">
                                -{v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                              </p>
                              <p className="text-[8px] mt-1" style={{ color: "var(--text-muted)" }}>Đơn tối thiểu {formatPrice(v.minOrderValue)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Tạm tính</span>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Phí vận chuyển</span>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{actualShipFee > 0 ? formatPrice(actualShipFee) : "Miễn phí"}</span>
          </div>
          {totalShopDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Voucher Shop</span>
              <span className="font-semibold">-{formatPrice(totalShopDiscount)}</span>
            </div>
          )}
          {activeVoucher && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Omni Voucher</span>
              <span className="font-semibold">
                -{activeVoucher.discountType === "PERCENTAGE" 
                  ? formatPrice(Math.min((subtotal * activeVoucher.discountValue) / 100, activeVoucher.maxDiscountAmount || 999999999))
                  : formatPrice(Math.min(activeVoucher.discountValue, subtotal))}
              </span>
            </div>
          )}
          {activeShippingVoucher && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Mã Miễn phí VC</span>
              <span className="font-semibold">
                -{activeShippingVoucher.discountType === "PERCENTAGE" 
                  ? formatPrice(Math.min((actualShipFee * activeShippingVoucher.discountValue) / 100, activeShippingVoucher.maxDiscountAmount || 999999999))
                  : formatPrice(Math.min(activeShippingVoucher.discountValue, actualShipFee))}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold pt-2 border-t mt-2" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--text-primary)" }}>Tổng cộng</span>
            <span style={{ color: "var(--gold)" }}>
              {formatPrice(Math.max(0, total - totalShopDiscount 
                - (activeVoucher ? (activeVoucher.discountType === "PERCENTAGE" ? Math.min((subtotal * activeVoucher.discountValue) / 100, activeVoucher.maxDiscountAmount || 999999999) : Math.min(activeVoucher.discountValue, subtotal)) : 0)
                - (activeShippingVoucher ? (activeShippingVoucher.discountType === "PERCENTAGE" ? Math.min((actualShipFee * activeShippingVoucher.discountValue) / 100, activeShippingVoucher.maxDiscountAmount || 999999999) : Math.min(activeShippingVoucher.discountValue, actualShipFee)) : 0)
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
