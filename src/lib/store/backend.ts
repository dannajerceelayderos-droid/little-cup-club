import type { CafeSnapshot, Profile, Report, Review, Submission, Visit, WishlistItem } from "../types";

export interface MyData {
  wishlist: WishlistItem[];
  visits: Visit[];
  myReviews: Review[];
  submissions: Submission[];
  reports: Report[];
}

export interface NewReview {
  cafe: CafeSnapshot;
  rating: Review["rating"];
  body: string;
  photo?: Blob;
}

export interface Backend {
  mode: "demo" | "supabase";
  getProfile(): Promise<Profile | null>;
  onAuthChange(cb: () => void): () => void;
  signIn(email: string): Promise<void>;
  signOut(): Promise<void>;
  loadMine(): Promise<MyData>;
  setWishlist(cafe: CafeSnapshot, on: boolean): Promise<void>;
  addVisit(cafe: CafeSnapshot, visitedOn: string, note?: string): Promise<Visit>;
  addReview(r: NewReview): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  listReviews(opts: { cafeId?: string; limit?: number }): Promise<Review[]>;
  /** Average rating per café from real (non-sample) reviews only. */
  listRatings(): Promise<Record<string, { avg: number; count: number }>>;
  report(r: Omit<Report, "id" | "createdAt">): Promise<void>;
  submitCafe(s: Omit<Submission, "id" | "createdAt" | "status">): Promise<Submission>;
  updateProfile(p: Omit<Profile, "id">): Promise<Profile>;
}

export class DuplicateVisitError extends Error {
  constructor() {
    super("You've already recorded a visit to this café today.");
  }
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Please sign in first.");
  }
}

/** Re-encode an image in the browser: strips EXIF/GPS metadata and caps dimensions. */
export async function compressImage(file: Blob, maxSide = 1200, quality = 0.82): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("That image couldn't be read."));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("Couldn't process image."))), "image/jpeg", quality),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
