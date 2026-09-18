import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class PhotoUploadError extends Error {}

/**
 * Uploads a candidate photo to Vercel Blob storage and returns its
 * public URL. Throws PhotoUploadError on invalid file type/size.
 */
export async function uploadCandidatePhoto(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new PhotoUploadError("Only JPG, PNG, WEBP or GIF images are allowed.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new PhotoUploadError("Image must be smaller than 5MB.");
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const filename = `candidates/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

/** Best-effort delete; ignores errors (e.g. already deleted, or not a blob URL). */
export async function deleteCandidatePhoto(url: string | null | undefined) {
  if (!url || !url.includes(".public.blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch {
    // non-fatal
  }
}
