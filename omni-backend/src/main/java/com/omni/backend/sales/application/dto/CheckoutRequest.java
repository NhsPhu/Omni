package com.omni.backend.sales.application.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CheckoutRequest {
    private UUID shippingAddressId;
    
    // Which SKUs from the cart the user wants to buy in this checkout session
    private List<UUID> skuIds; 

    // Optional platform voucher applied
    private UUID platformVoucherId;

    // Optional shop vouchers applied
    private List<UUID> shopVoucherIds;

    // PIN code verification if user has one
    private String pin;
    
    // vnpay or cod
    private String paymentMethod;

    // Use loyalty coins
    private Boolean useCoins;
}
