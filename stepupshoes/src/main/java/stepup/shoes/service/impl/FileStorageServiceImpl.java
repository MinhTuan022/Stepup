package stepup.shoes.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import stepup.shoes.service.FileStorageService;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            log.error("Could not create upload directory", e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = Instant.now().toEpochMilli() + "_" + original.replaceAll("\\s+", "_");
        try {
            if (original.contains("..")) {
                throw new RuntimeException("Invalid path sequence in file name: " + original);
            }
            try {
                Path existing = Files.list(this.uploadPath)
                        .filter(p -> {
                            String n = p.getFileName().toString();
                            return n.equals(original) || n.endsWith("_" + original) || n.equals(filename);
                        })
                        .findFirst()
                        .orElse(null);
                if (existing != null) {
                    return "/uploads/" + existing.getFileName().toString();
                }
            } catch (IOException e) {
                log.warn("Could not scan upload directory to check existing files", e);
            }

            Path target = this.uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            log.error("Could not store file: {}", original, e);
            throw new RuntimeException("Could not store file: " + original, e);
        }
    }
}
