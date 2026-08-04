const z = require("zod");

const signupSchema = z.object({
  username: z.string({ required_error: "Name is required" }).trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" }),
  phone: z
    .union([z.string(), z.number().int()])
    .transform((value) => String(value).trim())
    .refine((value) => value.length >= 10, { message: "Phone number must be at least 10 digits" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.string({ required_error: "Role is required" }).trim(),
});

module.exports = signupSchema;
