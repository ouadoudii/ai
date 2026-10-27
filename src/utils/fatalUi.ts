export const ARABIC_FATAL_TITLE = "تعذّر تشغيل ريثم";
export const ARABIC_FATAL_MESSAGE =
  "حدث خطأ غير متوقع. أعد تحميل الصفحة وحاول مرة أخرى.";

export function buildFatalErrorMarkup(): string {
  return `<main lang="ar" dir="rtl" role="alert" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f7f2ea;font-family:system-ui,-apple-system,sans-serif;color:#292524"><section style="max-width:560px;width:100%;background:white;border:1px solid #e7e5e4;border-radius:24px;padding:28px"><h1 style="font-size:22px;margin:0 0 10px">${ARABIC_FATAL_TITLE}</h1><p style="margin:0;line-height:1.8">${ARABIC_FATAL_MESSAGE}</p></section></main>`;
}
