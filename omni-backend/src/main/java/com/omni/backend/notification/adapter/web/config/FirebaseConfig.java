package com.omni.backend.notification.adapter.web.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            // Check if Firebase is already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                // In a real environment, you would use:
                // InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("service-account.json");
                // GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                
                // For now, since we don't have the file, we mock the initialization to prevent crash
                // or try to load application default
                try {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase application has been initialized");
                } catch (Exception e) {
                    log.warn("Failed to initialize Firebase with application default credentials. Push notifications will not work. Details: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error initializing Firebase", e);
        }
    }
}
