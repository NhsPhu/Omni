package com.omni.backend.shared.adapter.web;

import com.omni.backend.shared.application.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }

            String fileUrl = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (Exception ex) {
            log.error("Could not upload file", ex);
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not upload file"));
        }
    }
}
