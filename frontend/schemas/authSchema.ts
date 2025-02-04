import { z } from "zod";
import libphonenumber from "google-libphonenumber";

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

export const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(4, "Username is required to be min 4 characters")
      .max(10, "Username shall be max 10 characters'"),
    email: z.string().trim().email({ message: "Email is invalid." }),
    password: z.string().trim().min(4, "Password must have min 4 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
    phone: z
      .string()
      .trim()
      .nonempty({ message: "Phone number is required" })
      .refine(
        (number) => {
          try {
            const phoneNumber = phoneUtil.parse(number);
            return phoneUtil.isValidNumber(phoneNumber);
          } catch (err) {
            return err;
          }
        },
        { message: "Invalid phone number" }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password does not match",
  });

export type signUpType = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email({ message: "Email is invalid." }),
  password: z.string().trim().min(4, "Password must have min 4 characters"),
});

export type signInType = z.infer<typeof signInSchema>;
