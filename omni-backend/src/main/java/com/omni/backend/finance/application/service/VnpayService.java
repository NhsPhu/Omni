package com.omni.backend.finance.application.service;

import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.ZonedDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayService {

    private final ParentOrderRepository parentOrderRepository;
    private final ChildOrderRepository childOrderRepository;
    private final WalletService walletService; 

    private static final String VNP_PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private static final String VNP_RETURN_URL = "http://localhost:3000/payment/callback";
    private static final String VNP_TMN_CODE = "DEMO_TMN"; // Should be in config
    private static final String VNP_HASH_SECRET = "DEMO_SECRET_KEY_FOR_VNPAY_SANDBOX_TESTING_ONLY"; // Should be in config

    public String createPaymentUrl(UUID orderId, BigDecimal amount, String ipAddress) {
        long amountInVnd = amount.longValue() * 100;
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", VNP_TMN_CODE);
        vnp_Params.put("vnp_Amount", String.valueOf(amountInVnd));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderId.toString());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNP_RETURN_URL);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String vnp_SecureHash = hmacSHA512(VNP_HASH_SECRET, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        
        return VNP_PAY_URL + "?" + query.toString();
    }

    @Transactional(rollbackFor = Exception.class)
    public String processIpnCallback(Map<String, String> params) {
        // 1. Validate signature
        if (!validateSignature(params)) {
            log.warn("VNPAY IPN: Invalid signature");
            return "97";
        }

        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpAmountStr = params.get("vnp_Amount");
        String vnpBankCode = params.get("vnp_BankCode");

        if (!"00".equals(vnpResponseCode)) {
            log.info("VNPAY IPN: Transaction failed for {} with code {}", vnpTxnRef, vnpResponseCode);
            return "00";
        }

        UUID orderId;
        try {
            orderId = UUID.fromString(vnpTxnRef);
        } catch (IllegalArgumentException e) {
            log.warn("VNPAY IPN: Invalid order ID format: {}", vnpTxnRef);
            return "01";
        }

        ParentOrderJpaEntity order = parentOrderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("VNPAY IPN: Order not found: {}", orderId);
            return "01";
        }

        // Prevent duplicate processing: if already PAID, skip
        if ("PAID".equals(order.getStatus())) {
            log.info("VNPAY IPN: Order {} already paid, skipping", orderId);
            return "00";
        }

        long amountInVnd = Long.parseLong(vnpAmountStr) / 100;

        // Update parent order status to PAID
        order.setStatus("PAID");
        parentOrderRepository.save(order);

        // Update all child orders to PROCESSING (seller can start fulfilling)
        List<ChildOrderJpaEntity> children = childOrderRepository.findByParentOrderId(orderId);
        children.forEach(child -> {
            child.setStatus("PROCESSING");
            childOrderRepository.save(child);
        });

        // Credit admin wallet with pending amount
        walletService.creditAdminPending(orderId, amountInVnd);

        log.info("VNPAY IPN: Successfully processed payment for order {}. Amount: {} VND, Bank: {}", 
                orderId, amountInVnd, vnpBankCode);
        return "00";
    }

    public boolean validateSignature(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null) return false;

        // Remove hash params before re-computing
        Map<String, String> fields = new HashMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String computedHash = hmacSHA512(VNP_HASH_SECRET, hashData.toString());
        return computedHash.equalsIgnoreCase(vnpSecureHash);
    }

    /**
     * HMAC-SHA512 implementation for VNPay signature
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            log.error("Error computing HMAC-SHA512", e);
            return "";
        }
    }
}
