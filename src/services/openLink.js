// فتح رابط خارجي بشكل صحيح في نافذة سطح المكتب (Tauri) وفي المتصفح.
// داخل Tauri تُحجب الروابط الخارجية افتراضياً، فنستخدم إضافة opener.
export async function openExternal(url) {
  if (!url) return;
  const inTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;
  if (inTauri) {
    try {
      const mod = await import(/* @vite-ignore */ '@tauri-apps/plugin-opener');
      await mod.openUrl(url);
      return;
    } catch (e) {
      // إن لم تكن إضافة opener مضبوطة بعد، نحاول البديل بهدوء.
      console.warn('[openExternal] opener غير متاح:', e);
    }
  }
  try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {}
}
