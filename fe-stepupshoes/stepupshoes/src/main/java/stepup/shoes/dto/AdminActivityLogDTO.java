package stepup.shoes.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityLogDTO {
    
    private Integer id;
    private String adminUsername;
    private String adminName;
    private String action;
    private String resource;
    private String resourceId;
    private String details;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
    private String status;
}
