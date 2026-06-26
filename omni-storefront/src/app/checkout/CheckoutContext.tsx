"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useFlashSaleStore } from "@/store/flashSaleStore";
import type { CartItem } from "@/app/cart/page";
import type { Address, NewAddress, Voucher, MyVoucher, GHNProvince, GHNDistrict, GHNWard, LoyaltyInfo } from "@/types/checkout";

interface CheckoutContextProps {
  step: number;
  setStep: (s: number) => void;
  selectedAddr: string;
  setSelectedAddr: (s: string) => void;
  addresses: Address[];
  setAddresses: (a: Address[]) => void;
  selectedShipping: string;
  setSelectedShipping: (s: string) => void;
  selectedPayment: string;
  setSelectedPayment: (s: string) => void;
  voucher: string;
  setVoucher: (v: string) => void;
  activeVoucher: Voucher | null;
  setActiveVoucher: (v: Voucher | null) => void;
  shippingVoucherInput: string;
  setShippingVoucherInput: (v: string) => void;
  activeShippingVoucher: Voucher | null;
  setActiveShippingVoucher: (v: Voucher | null) => void;
  myVouchers: MyVoucher[];
  setMyVouchers: (v: MyVoucher[]) => void;
  platformVouchers: Voucher[];
  shopVouchersData: Record<string, Voucher[]>;
  selectedShopVouchers: Record<string, Voucher | null>;
  setSelectedShopVouchers: (val: Record<string, Voucher | null>) => void;
  placed: boolean;
  setPlaced: (b: boolean) => void;
  orderId: string;
  setOrderId: (id: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  showNewAddr: boolean;
  setShowNewAddr: (b: boolean) => void;
  newAddr: NewAddress;
  setNewAddr: (a: NewAddress) => void;
  provinces: GHNProvince[];
  setProvinces: (p: GHNProvince[]) => void;
  districts: GHNDistrict[];
  setDistricts: (d: GHNDistrict[]) => void;
  wards: GHNWard[];
  setWards: (w: GHNWard[]) => void;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (b: boolean) => void;
  pinInput: string;
  setPinInput: (p: string) => void;
  cartItems: CartItem[];
  ghnFee: number | null;
  usage: Record<string, number>;
  activeEvent: any;
  user: any;
  getItemPrice: (item: CartItem) => number;
  subtotal: number;
  itemsByShop: Record<string, { items: CartItem[], name: string }>;
  totalShopDiscount: number;
  displayMethods: any[];
  actualShipFee: number;
  total: number;
  addr: Address | undefined;
  submitOrder: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [selectedAddr, setSelectedAddr] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("vnpay");
  const [voucher, setVoucher] = useState("");
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [shippingVoucherInput, setShippingVoucherInput] = useState("");
  const [activeShippingVoucher, setActiveShippingVoucher] = useState<Voucher | null>(null);
  const [myVouchers, setMyVouchers] = useState<MyVoucher[]>([]);
  const [platformVouchers, setPlatformVouchers] = useState<Voucher[]>([]);
  const [shopVouchersData, setShopVouchersData] = useState<Record<string, Voucher[]>>({});
  const [selectedShopVouchers, setSelectedShopVouchers] = useState<Record<string, Voucher | null>>({});
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState<NewAddress>({ receiverName: "", receiverPhone: "", detail: "", ward: "", district: "", province: "", ghnProvinceId: 0, ghnDistrictId: 0, ghnWardCode: "" });
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  const { user, isAuthenticated } = useAuthStore();
  const activeEvent = useFlashSaleStore(state => state.activeEvent);
  const router = useRouter();
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [ghnFee, setGhnFee] = useState<number | null>(null);

  useEffect(() => {
    if (showNewAddr && provinces.length === 0) {
      api.get('/public/ghn/provinces').then(res => setProvinces(res.data)).catch(console.error);
    }
  }, [showNewAddr]);

  useEffect(() => {
    if (newAddr.ghnProvinceId) {
      api.get(`/public/ghn/districts?provinceId=${newAddr.ghnProvinceId}`).then(res => setDistricts(res.data)).catch(console.error);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [newAddr.ghnProvinceId]);

  useEffect(() => {
    if (newAddr.ghnDistrictId) {
      api.get(`/public/ghn/wards?districtId=${newAddr.ghnDistrictId}`).then(res => setWards(res.data)).catch(console.error);
    } else {
      setWards([]);
    }
  }, [newAddr.ghnDistrictId]);

  useEffect(() => {
    if (step === 2 && selectedAddr) {
      api.get(`/checkout/shipping-fee?addressId=${selectedAddr}`)
        .then(res => setGhnFee(res.data))
        .catch(console.error);
    }
  }, [step, selectedAddr]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
      return;
    }
    
    api.get("/me/flash-sale/usage").then(res => setUsage(res.data)).catch(() => {});
    
    const skusStr = localStorage.getItem("checkout_skus");
    if (!skusStr) return;
    try {
      const selectedSkus = JSON.parse(skusStr);
      api.get("/cart").then(res => {
        const data = res.data;
        if (!data || !data.itemsByShop) return;
        const items: CartItem[] = [];
        Object.keys(data.itemsByShop).forEach((shopId: string) => {
          data.itemsByShop[shopId].forEach((it: any) => {
            if (selectedSkus.includes(it.skuId)) {
              items.push({
                id: it.skuId,
                productId: it.productId,
                shopId: it.shopId,
                shopName: "Shop " + it.shopId.substring(0, 8),
                name: it.productName,
                sku: it.skuCode,
                price: it.price,
                originalPrice: it.originalPrice,
                quantity: it.quantity,
                stock: 999,
                selected: true,
                imageUrl: it.imageUrl,
              });
            }
          });
        });
        setCartItems(items);
        const shopIds = Array.from(new Set(items.map(it => it.shopId)));
        
        shopIds.forEach(sid => {
          api.get(`/public/vouchers/shop/${sid}`).then(r => {
            setShopVouchersData(p => ({...p, [sid]: r.data}));
          }).catch(() => {});
        });

        api.get('/me/vouchers').then(res => setMyVouchers(res.data || [])).catch(() => {});
        api.get('/public/vouchers/platform').then(res => setPlatformVouchers(res.data || [])).catch(() => {});

      }).catch(console.error);

      api.get("/me/addresses").then(res => {
        setAddresses(res.data);
        if (res.data.length > 0) {
          const defaultAddr = res.data.find((a: Address) => a.isDefault);
          setSelectedAddr(defaultAddr ? defaultAddr.id : res.data[0].id);
        }
      }).catch(console.error);

    } catch (e) {
      console.error(e);
    }
  }, []);

  const getItemPrice = (item: CartItem) => {
    const flashItem = activeEvent?.items?.find((f: any) => f.productId === item.productId && f.flashStock > f.soldCount);
    if (!flashItem) return item.price;
    const max = flashItem.maxQuantityPerUser;
    const bought = usage[item.id] || 0; 
    if (max > 0 && (bought >= max || bought + item.quantity > max)) {
        return item.price;
    }
    return flashItem.flashPrice;
  };

  const subtotal = cartItems.reduce((s, it) => s + getItemPrice(it) * it.quantity, 0);
  
  const itemsByShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = { items: [], name: item.shopName };
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { items: CartItem[], name: string }>);

  const totalShopDiscount = Object.values(selectedShopVouchers).reduce((sum, v) => {
    if (!v) return sum;
    const shopSubtotal = itemsByShop[v.shopId || ""]?.items.reduce((s, it) => s + getItemPrice(it) * it.quantity, 0) || 0;
    if (shopSubtotal < v.minOrderValue) return sum;
    if (v.discountType === "PERCENTAGE") {
      return sum + Math.min((shopSubtotal * v.discountValue) / 100, v.maxDiscountAmount || 999999999);
    }
    return sum + Math.min(v.discountValue, shopSubtotal);
  }, 0);

  const displayMethods = [
    {
      id: "standard",
      label: "Giao hàng tiêu chuẩn (GHN)",
      price: ghnFee !== null ? ghnFee : 30000,
      desc: "Vận chuyển toàn quốc"
    }
  ];

  const shipFee = ghnFee !== null ? ghnFee : 30000;
  const actualShipFee = step >= 2 ? shipFee : 0;
  const total = subtotal + actualShipFee;
  const addr = addresses.find(a => a.id === selectedAddr);

  const submitOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        shippingAddressId: selectedAddr,
        paymentMethod: selectedPayment,
        skuIds: cartItems.map(i => i.id),
        platformVoucherId: activeVoucher ? activeVoucher.id : null,
        shippingVoucherId: activeShippingVoucher ? activeShippingVoucher.id : null,
        shopVoucherIds: Object.values(selectedShopVouchers)
          .filter((v): v is Voucher => v !== null)
          .map(v => v.id)
      };

      const res = await api.post("/checkout", payload);
      const parentOrderId = res.data.parentOrderId;
      
      if (selectedPayment === "vnpay") {
        // Gọi backend để lấy VNPay payment URL rồi redirect
        try {
          const payRes = await api.post(`/payment/vnpay/create-url?orderId=${parentOrderId}`);
          const paymentUrl = payRes.data;
          if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
            window.location.href = paymentUrl;
            return; // Không setPlaced vì đang redirect
          } else {
            toast.error("Không lấy được link thanh toán VNPay. Vui lòng thử lại.");
          }
        } catch (payErr: any) {
          toast.error(payErr.response?.data?.message || "Lỗi tạo link VNPay");
        }
      } else {
        toast.success("Đặt hàng thành công!");
        setOrderId(parentOrderId || "");
        setPlaced(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đặt hàng");
      console.error(error);
    } finally {
      setLoading(false);
      setIsPinModalOpen(false);
      setPinInput("");
    }
  };

  return (
    <CheckoutContext.Provider value={{
      step, setStep, selectedAddr, setSelectedAddr, addresses, setAddresses,
      selectedShipping, setSelectedShipping, selectedPayment, setSelectedPayment,
      voucher, setVoucher, activeVoucher, setActiveVoucher,
      shippingVoucherInput, setShippingVoucherInput, activeShippingVoucher, setActiveShippingVoucher,
      myVouchers, setMyVouchers, platformVouchers, shopVouchersData,
      selectedShopVouchers, setSelectedShopVouchers, placed, setPlaced,
      orderId, setOrderId, loading, setLoading, showNewAddr, setShowNewAddr,
      newAddr, setNewAddr, provinces, setProvinces, districts, setDistricts,
      wards, setWards, isPinModalOpen, setIsPinModalOpen, pinInput, setPinInput,
      cartItems, ghnFee, usage, activeEvent, user, getItemPrice, subtotal,
      itemsByShop, totalShopDiscount, displayMethods, actualShipFee, total, addr, submitOrder
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
