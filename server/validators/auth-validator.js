const z = require("zod");

const signupSchema = z.object({
  username: z.string({ required_error: "Name is required" }).trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  phone: z
    .string({ required_error: "phone number is requires" })
    .min(10, { message: "atleast 10 digit " })
    .trim(),
  password: z
    .string({ required_error: "password is required" })
    .min(8, { message: "atlest 8 characte" }),
  role: z.string({ required_error: "must be selet" }),
});

module.exports = signupSchema;
