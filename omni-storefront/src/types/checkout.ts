export interface Address {
  id: string;
  userId: string;
  receiverName: string;
  receiverPhone: string;
  detail: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export interface NewAddress {
  receiverName: string;
  receiverPhone: string;
  detail: string;
  ward: string;
  district: string;
  province: string;
  ghnProvinceId: number;
  ghnDistrictId: number;
  ghnWardCode: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  category: 'SHOP' | 'PLATFORM' | 'SHIPPING';
  shopId?: string;
}

export interface MyVoucher {
  voucherId: string;
  isUsed: boolean;
}

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
}

export interface GHNDistrict {
  DistrictID: number;
  DistrictName: string;
}

export interface GHNWard {
  WardCode: string;
  WardName: string;
}

export interface LoyaltyInfo {
  id: string;
  points: number;
  tier: string;
}
