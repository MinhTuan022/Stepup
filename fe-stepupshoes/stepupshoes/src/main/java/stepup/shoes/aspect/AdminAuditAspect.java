package stepup.shoes.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Aspect
@Component
@Slf4j
public class AdminAuditAspect {

    /**
     * Audit logging for all admin API endpoints
     * Logs before and after execution
     */
    
    @Before("execution(public * stepup.shoes.controller.AdminController.*(..))")
    public void logAdminActionBefore(JoinPoint joinPoint) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes()).getRequest();
            
            String methodName = joinPoint.getSignature().getName();
            String url = request.getRequestURL().toString();
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            
            log.info("=== ADMIN ACTION START ===");
            log.info("Timestamp: {}", LocalDateTime.now());
            log.info("Method: {}", methodName);
            log.info("URL: {}", url);
            log.info("IP Address: {}", ipAddress);
            log.info("User-Agent: {}", userAgent);
            log.info("Arguments: {}", joinPoint.getArgs());
            
        } catch (Exception e) {
            log.error("Error logging admin action before", e);
        }
    }

    @After("execution(public * stepup.shoes.controller.AdminController.*(..))")
    public void logAdminActionAfter(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            log.info("=== ADMIN ACTION END ===");
            log.info("Method: {} completed successfully", methodName);
            log.info("Timestamp: {}", LocalDateTime.now());
            
        } catch (Exception e) {
            log.error("Error logging admin action after", e);
        }
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
