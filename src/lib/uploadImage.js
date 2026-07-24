import { supabase } from "./supabase";

/** File → data URL (storage ishlamasa fallback) */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Rasm o'qilmadi"));
    reader.readAsDataURL(file);
  });
}

/**
 * Storage bucket ga yuklash; 400/yo'q bo'lsa base64 saqlaydi (DB img maydoniga).
 * Shunday qilib bucket bo'lmasa ham loyiha/blog qo'shish ishlaydi.
 */
export async function uploadImageFile(file, folder = "uploads") {
  if (!file) throw new Error("Fayl tanlanmagan");
  if (!file.type.startsWith("image/")) {
    throw new Error("Faqat rasm fayl (jpg, png, webp, gif)");
  }
  // ~1.5MB dan katta bo'lsa storage majburiy bo'lishi mumkin
  const maxBytes = 2.5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Rasm 2.5MB dan kichik bo'lsin");
  }

  if (!supabase) {
    return fileToDataUrl(file);
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext || "jpg"}`;

  const { error } = await supabase.storage.from("project-images").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    // Bucket yo'q / RLS — base64 fallback
    console.warn("storage upload fallback:", error.message);
    return fileToDataUrl(file);
  }

  const { data } = supabase.storage.from("project-images").getPublicUrl(path);
  return data.publicUrl;
}
