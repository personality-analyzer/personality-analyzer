// خدمة التحديث التلقائي — تعتمد على إضافتَي updater و process في Tauri 2.
// كل الدوال محميّة حتى لا تُعطِّل التطبيق عند تشغيله في متصفح التطوير (حيث لا تتوفّر واجهات Tauri).
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// نعمل فقط داخل تطبيق Tauri الحقيقي، لا في متصفح Vite أثناء التطوير.
function isTauri() {
  return typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;
}

// يُستدعى عند إقلاع التطبيق: يفحص وجود تحديث، وإن وُجد يعرض شريطاً فيه زر "تحديث الآن".
export async function checkForUpdatesOnStartup() {
  if (!isTauri()) return;
  try {
    const update = await check();
    if (!update) return; // لا يوجد تحديث جديد
    showUpdateBanner(update);
  } catch (err) {
    // في التطوير أو عند انقطاع الشبكة أو غياب endpoints نتجاهل الخطأ بهدوء.
    console.warn('[updater] تعذّر فحص التحديث:', err);
  }
}

function showUpdateBanner(update) {
  if (typeof document === 'undefined' || document.getElementById('app-update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'app-update-banner';
  banner.dir = 'rtl';
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
    'display:flex', 'align-items:center', 'gap:12px',
    'padding:10px 16px', 'font-family:inherit', 'font-size:14px',
    'background:#4f46e5', 'color:#fff', 'box-shadow:0 2px 8px rgba(0,0,0,.25)',
  ].join(';');

  const text = document.createElement('span');
  text.style.flex = '1';
  text.textContent = `يتوفّر تحديث جديد (الإصدار ${update.version}). هل تريد التحديث الآن؟`;

  const updateBtn = document.createElement('button');
  updateBtn.textContent = 'تحديث الآن';
  updateBtn.style.cssText =
    'background:#fff;color:#4f46e5;border:0;border-radius:6px;padding:6px 14px;font-weight:700;cursor:pointer';

  const laterBtn = document.createElement('button');
  laterBtn.textContent = 'لاحقاً';
  laterBtn.style.cssText =
    'background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6);border-radius:6px;padding:6px 12px;cursor:pointer';

  banner.append(text, updateBtn, laterBtn);
  document.body.appendChild(banner);

  laterBtn.addEventListener('click', () => banner.remove());

  updateBtn.addEventListener('click', async () => {
    updateBtn.disabled = true;
    laterBtn.disabled = true;
    try {
      let downloaded = 0;
      let total = 0;
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            total = event.data.contentLength || 0;
            text.textContent = 'جارٍ تنزيل التحديث…';
            break;
          case 'Progress':
            downloaded += event.data.chunkLength || 0;
            text.textContent = total
              ? `جارٍ التنزيل… ${Math.round((downloaded / total) * 100)}%`
              : 'جارٍ التنزيل…';
            break;
          case 'Finished':
            text.textContent = 'اكتمل التنزيل، سيُعاد تشغيل التطبيق…';
            break;
          default:
            break;
        }
      });
      // إعادة تشغيل التطبيق لتطبيق التحديث.
      await relaunch();
    } catch (err) {
      console.error('[updater] فشل تثبيت التحديث:', err);
      text.textContent = 'تعذّر تثبيت التحديث. حاول لاحقاً.';
      updateBtn.disabled = false;
      laterBtn.disabled = false;
    }
  });
}
