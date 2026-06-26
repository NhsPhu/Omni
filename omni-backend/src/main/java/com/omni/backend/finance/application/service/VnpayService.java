package com.omni.backend.finance.application.service;

import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.finance.domain.event.OrderPaidEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.omni.backend.shared.config.RabbitMQConfig;

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
import java.time.ZonedDateTime;
import java.util.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayService {

    private final ParentOrderRepository parentOrderRepository;
    private final ChildOrderRepository childOrderRepository;
    private final WalletService walletService; 
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String VNP_PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    @org.springframework.beans.factory.annotation.Value("${vnpay.return-url:http://localhost:3000/payment/callback}")
    private String vnpReturnUrl;

    @org.springframework.beans.factory.annotation.Value("${vnpay.tmn-code:DEMO_TMN}")
    private String vnpTmnCode;

    @org.springframework.beans.factory.annotation.Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    public String createPaymentUrl(UUID orderId, BigDecimal amount, String ipAddress) {
        long amountInVnd = amount.longValue() * 100;
        
        // Prevent \r or spaces from .env files
        String secret = vnpHashSecret != null ? vnpHashSecret.trim() : "";
        String tmn = vnpTmnCode != null ? vnpTmnCode.trim() : "";
        
        // VNPAY prefers IPv4. IPv6 localhost can cause signature/format issues
        if (ipAddress == null || ipAddress.contains(":")) {
            ipAddress = "127.0.0.1";
        }
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmn);
        vnp_Params.put("vnp_Amount", String.valueOf(amountInVnd));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderId.toString());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpReturnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
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
                hashData.append(fieldName);
                hashData.append('=');
                
                try {
                    // VNPay Java demo uses US_ASCII URL encoding for both
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());
                    hashData.append(encodedValue);
                    
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(encodedValue);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String rawHashData = hashData.toString();
        String vnp_SecureHash = hmacSHA512(secret, rawHashData);
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        
        String finalUrl = VNP_PAY_URL + "?" + query.toString();
        log.info("VNPAY HashSecret length: {}", secret.length());
        log.info("VNPAY HashData: {}", rawHashData);
        return finalUrl;
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

        // Security Check: Validate amount
        if (amountInVnd != order.getFinalAmount().longValue()) {
            log.warn("VNPAY IPN: Invalid amount for order {}. Expected: {}, Received: {}", orderId, order.getFinalAmount().longValue(), amountInVnd);
            return "04";
        }

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

        // Publish OrderPaidEvent
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_ORDER_PAID, new OrderPaidEvent(orderId, order.getUserId()));

        log.info("VNPAY IPN: Successfully processed payment for order {}. Amount: {} VND, Bank: {}", 
                orderId, amountInVnd, vnpBankCode);
        return "00";
    }

    public boolean validateSignature(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null) return false;
        
        String secret = vnpHashSecret != null ? vnpHashSecret.trim() : "";

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
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    e.printStackTrace();
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String computedHash = hmacSHA512(secret, hashData.toString());
        return computedHash.equalsIgnoreCase(vnpSecureHash);
    }

    public boolean processRefund(UUID orderId, BigDecimal amount, String transDate) {
        try {
            long amountInVnd = amount.longValue() * 100;
            String vnp_RequestId = UUID.randomUUID().toString().replace("-", "");
            String vnp_Command = "refund";
            String vnp_TransactionType = "02"; // 02: Refund entirely, 03: Refund partially
            String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            String vnp_IpAddr = "127.0.0.1";
            String vnp_CreateBy = "Admin";
            String vnp_OrderInfo = "Hoan tien don hang " + orderId;

            String hashData = vnp_RequestId + "|" + "2.1.0" + "|" + vnp_Command + "|" + vnpTmnCode + "|" 
                    + vnp_TransactionType + "|" + orderId.toString() + "|" + amountInVnd + "|" 
                    + "" + "|" + transDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

            String vnp_SecureHash = hmacSHA512(vnpHashSecret, hashData);

            Map<String, Object> requestParams = new HashMap<>();
            requestParams.put("vnp_RequestId", vnp_RequestId);
            requestParams.put("vnp_Version", "2.1.0");
            requestParams.put("vnp_Command", vnp_Command);
            requestParams.put("vnp_TmnCode", vnpTmnCode);
            requestParams.put("vnp_TransactionType", vnp_TransactionType);
            requestParams.put("vnp_TxnRef", orderId.toString());
            requestParams.put("vnp_Amount", amountInVnd);
            requestParams.put("vnp_TransactionNo", "");
            requestParams.put("vnp_TransactionDate", transDate);
            requestParams.put("vnp_CreateBy", vnp_CreateBy);
            requestParams.put("vnp_CreateDate", vnp_CreateDate);
            requestParams.put("vnp_IpAddr", vnp_IpAddr);
            requestParams.put("vnp_OrderInfo", vnp_OrderInfo);
            requestParams.put("vnp_SecureHash", vnp_SecureHash);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestParams, headers);

            String vnpApiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
            String response = restTemplate.postForObject(vnpApiUrl, entity, String.class);
            
            log.info("VNPAY Refund Response for order {}: {}", orderId, response);
            
            if (response != null && response.contains("\"vnp_ResponseCode\":\"00\"")) {
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("Error processing VNPay refund for order {}", orderId, e);
            return false;
        }
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
