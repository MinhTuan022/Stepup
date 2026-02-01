package stepup.shoes.annotation;

import java.lang.annotation.*;

/**
 * Annotation for marking admin operations
 * Used for audit logging and access control
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AdminOperation {
    
    /**
     * Operation type: CREATE, READ, UPDATE, DELETE
     */
    String value() default "OPERATION";
    
    /**
     * Description of the operation
     */
    String description() default "";
    
    /**
     * Whether this operation requires additional confirmation
     */
    boolean requiresConfirmation() default false;
    
    /**
     * The resource being operated on
     */
    String resource() default "";
}
