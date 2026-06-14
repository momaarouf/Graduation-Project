package com.travelmarket.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        cloudinary = new Cloudinary(config);
    }

    /**
     * Generates a secure signature for direct-to-cloud uploads from the frontend.
     */
    public Map<String, Object> generateUploadSignature(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;
        
        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        if (folder != null && !folder.isBlank()) {
            paramsToSign.put("folder", folder);
        }

        String signature = cloudinary.apiSignRequest(paramsToSign, apiSecret);

        Map<String, Object> result = new HashMap<>();
        result.put("timestamp", timestamp);
        result.put("signature", signature);
        result.put("apiKey", apiKey);
        result.put("cloudName", cloudName);
        if (folder != null && !folder.isBlank()) {
            result.put("folder", folder);
        }
        
        return result;
    }
}
