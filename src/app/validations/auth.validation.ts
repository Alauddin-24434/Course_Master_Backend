import z from "zod";

export const signupValidation = z.object({
    name: z.string().min(1,"Name is required"),
    email:z.string().email("Invalid email address"),
    password:z.string().min(6,"Password must be at least 6 characters"),
    role: z.enum(["student", "instructor"]).default("student"),

})

export const loginValidation = z.object({
    
    email:z.string().email("Invalid email address"),
    password:z.string().min(6,"Password must be at least 6 characters")

})