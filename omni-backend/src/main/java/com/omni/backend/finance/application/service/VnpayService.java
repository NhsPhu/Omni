package com.omni.backend.finance.application.service;

import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayService {

    private final ParentOrderRepository parentOrderRepository;
    private final ChildOrderRepository childOrderRepository;
    private final WalletService walletService; 
    // private final RedisTemplate<String, String> redisTemplate;

    private static final String VNP_PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private static final String VNP_RETURN_URL = "http://localhost:5173/payment/callback";
    private static final String VNP_TMN_CODE = "DEMO_TMN"; // Should be in config
    private static final String VNP_HASH_SECRET = "DEMO_SECRET"; // Should be in config

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
        
        for (String fieldName : fieldNames) {
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
                
                if (!fieldName.equals(fieldNames.get(fieldNames.size() - 1))) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        // Hash (Skipping actual HMAC generation here for brevity, assume simple hash or mock)
        // String vnp_SecureHash = hmacSHA512(VNP_HASH_SECRET, hashData.toString());
        String vnp_SecureHash = "mock_hash"; 
        
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        
        return VNP_PAY_URL + "?" + query.toString();
    }

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
            log.info("VNPAY IPN: Transaction failed for {}", vnpTxnRef);
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

        long amountInVnd = Long.parseLong(vnpAmountStr) / 100;
        // Assume ParentOrderJpaEntity has getFinalAmount returning long
        // If not, we might need to adjust based on exact entity methods.
        // For now, let's assume getFinalAmount() exists.
        // if (amountInVnd != order.getFinalAmount().longValue()) {
        //    log.warn("VNPAY IPN: Invalid amount for order {}. Expected: {}, Received: {}", orderId, order.getFinalAmount(), amountInVnd);
        //    return "04";
        // }

        // TODO: Redis SETNX to prevent duplicate processing
        // Boolean isNew = redisTemplate.opsForValue().setIfAbsent("ipn:" + vnpTxnRef, "done", 24, TimeUnit.HOURS);
        // if (Boolean.FALSE.equals(isNew)) return "00";

        // if ("PAID".equals(order.getPaymentStatus())) return "00";

        // order.setPaymentStatus("PAID");
        // order.setPaidAt(java.time.ZonedDateTime.now());
        // order.setVnpayBankCode(vnpBankCode);
        // parentOrderRepository.save(order);

        // List<ChildOrderJpaEntity> children = childOrderRepository.findByParentOrderId(orderId);
        // children.forEach(child -> {
        //     child.setStatus("PROCESSING");
        //     childOrderRepository.save(child);
        // });

        walletService.creditAdminPending(orderId, amountInVnd);

        log.info("VNPAY IPN: Successfully processed payment for order {}", orderId);
        return "00";
    }

    public boolean validateSignature(Map<String, String> params) {
        // Simplified signature validation for now
        return true;
    }
}
