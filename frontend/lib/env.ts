import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .string()
    .trim()
    .min(1)
    .refine((url) => {
      try {
        const parsedUrl = new URL(url);
        return (
          (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
          parsedUrl.hostname !== "localhost" // Reject "localhost"
        );
      } catch {
        return false; // Invalid URL format
      }
    }, "EXPO_PUBLIC_API_URL must be a valid HTTP(S) URL and cannot be localhost"),
  EXPO_PUBLIC_ACCESS_TOKEN_KEY: z.string().trim().min(4),
  EXPO_PUBLIC_REFRESH_TOKEN_KEY: z.string().trim().min(4),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
