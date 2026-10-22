import { z } from "zod";

const AMENITIES = ["coffee", "matcha", "wifi", "outlets", "study", "outdoor", "garden", "pets", "pastries", "aircon"] as const;

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Pick a rating").max(5),
  body: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(1000, "Keep it under 1,000 characters."),
});

export const visitSchema = z.object({
  note: z.string().trim().max(280, "Notes can be up to 280 characters.").optional(),
});

export const REPORT_REASONS = {
  closed: "Permanently closed",
  wrong_location: "Wrong location on the map",
  wrong_details: "Wrong hours, contact or details",
  not_a_cafe: "Not a café",
  duplicate: "Duplicate listing",
  inappropriate: "Inappropriate or abusive content",
  spam: "Spam or advertising",
  other: "Something else",
} as const;

export const reportSchema = z.object({
  targetType: z.enum(["cafe", "review"]),
  targetId: z.string().min(1).max(120),
  reason: z.enum(Object.keys(REPORT_REASONS) as [keyof typeof REPORT_REASONS, ...Array<keyof typeof REPORT_REASONS>]),
  details: z.string().trim().max(500, "Up to 500 characters, please.").optional(),
});

const optionalNumber = (min: number, max: number, msg: string) =>
  z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number({ error: msg }).min(min, msg).max(max, msg).optional(),
  );

export const submissionSchema = z.object({
  name: z.string().trim().min(2, "Café name is required.").max(80),
  city: z.string().trim().min(2, "Which town or city?").max(60),
  address: z.string().trim().min(5, "A street or landmark helps others find it.").max(160),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine((v) => !v || /^https:\/\/[^\s]+\.[^\s]+$/.test(v), "Use a full https:// link, or leave it blank."),
  lat: optionalNumber(4, 22, "Latitude should be between 4 and 22 for the Philippines."),
  lng: optionalNumber(116, 127.5, "Longitude should be between 116 and 127.5 for the Philippines."),
  amenities: z.array(z.enum(AMENITIES)).max(10),
  notes: z.string().trim().max(500).optional(),
  confirm: z.literal(true, { error: "Please confirm you've visited or know this café." }),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Choose a display name.").max(40),
  avatar: z.number().int().min(0).max(5),
  bio: z.string().trim().max(280).optional(),
  homeCity: z.string().trim().max(60).optional(),
});

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
