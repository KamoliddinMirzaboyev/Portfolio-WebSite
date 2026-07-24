import { toast } from "sonner";

/** Muvaffaqiyat */
export function toastSuccess(message, opts) {
  if (!message) return;
  toast.success(String(message), opts);
}

/** Xato */
export function toastError(message, opts) {
  if (!message) return;
  toast.error(String(message), opts);
}

/** Info / ogohlantirish */
export function toastInfo(message, opts) {
  if (!message) return;
  toast.message(String(message), opts);
}

/** Xabar turi bo'yicha avto */
export function toastNotify(message, type = "info") {
  if (!message) return;
  if (type === "success") return toastSuccess(message);
  if (type === "error") return toastError(message);
  return toastInfo(message);
}

/**
 * Xabar matnidan success/error taxmin qiladi
 */
export function toastAuto(message) {
  if (!message) return;
  const m = String(message).toLowerCase();
  if (
    /xato|error|failed|yo'q|yoʻq|noto'g'ri|majburiy|tekshir|ulanmadi|limit/.test(
      m
    )
  ) {
    return toastError(message);
  }
  if (
    /saqlandi|qo'shildi|yangilandi|o'chirildi|tayyor|kirish|muvaffaq|✓|ochildi/.test(
      m
    )
  ) {
    return toastSuccess(message);
  }
  return toastInfo(message);
}

export { toast };
