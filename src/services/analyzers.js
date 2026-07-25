import { analyze } from './ai.js';
import { profileText } from './profile.js';
import { langInstr } from './i18n.js';

const FMT = ' نسّق ردّك بعناوين "## " ونقاط "- " و**تشديد**.';
const OCEAN = ' في نهاية ردّك أضف سطراً منفصلاً بهذه الصيغة بالضبط بأرقام من 0 إلى 100: [[OCEAN O=.. C=.. E=.. A=.. N=..]] حيث O الانفتاح، C الضمير الحي، E الانبساط، A المقبولية، N الاتزان الانفعالي.';
const M_ANALYZE = ' في نهاية ردّك أضف سطراً بالصيغة: [[METRICS المزاج=.. | الطاقة=.. | الاسترخاء=.. | الثقة=.. | التركيز=..]] بأرقام 0-100.';
const M_FIRASA = ' في نهاية ردّك أضف سطراً بالصيغة: [[METRICS الحزم=.. | الانفتاح=.. | الهدوء=.. | العزيمة=.. | التعاون=..]] بأرقام 0-100 كتقدير استكشافي.';
const IMGDEPTH = ' اجعل التحليل واسعاً ومفصّلاً بأقسام: الانطباع العام، المزاج والحالة الانفعالية، مستويات الطاقة، لغة الجسد، المؤشرات الصحية العامة، السمات الشخصية، ملاحظات ختامية.';

const img = (si) => ({ type: 'image', source: { type: 'base64', media_type: si.type, data: si.b64 } });

export const ANALYZERS = [
  {
    key: 'analyze', type: 'تحليل صورة',
    run: (si, info, lang) => analyze({
      system: 'أنت محلل خبير في قراءة الحالة الانفعالية والصحية العامة والشخصية من الصور. غير تشخيصي وبالعربية. اختم بإخلاء مسؤولية أنه للاستكشاف لا للتشخيص.' + IMGDEPTH + FMT + M_ANALYZE + langInstr(lang),
      content: [img(si), { type: 'text', text: (info ? info + '\n\n' : '') + 'حلّل هذه الصورة تحليلاً شاملاً مفصّلاً.' }], maxTokens: 3000,
    }),
  },
  {
    key: 'firasa-ar', type: 'الفراسة العربية',
    run: (si, info, lang) => analyze({
      system: 'أنت عالم في الفراسة العربية التراثية. قراءة مفصّلة بالعربية. اختم بأن الفراسة علم زائف للاستكشاف فقط.' + FMT + M_FIRASA + langInstr(lang),
      content: [img(si), { type: 'text', text: (info ? info + '\n\n' : '') + 'اقرأ فراسة ملامح هذا الوجه.' }], maxTokens: 2000,
    }),
  },
  {
    key: 'firasa-we', type: 'الفراسة الغربية',
    run: (si, info, lang) => analyze({
      system: 'أنت خبير الفراسة الغربية (لافاتر، إيكمان، نافارو، شيلدون). قراءة مفصّلة بالعربية مع ذكر المدرسة. اختم بأنها علم زائف للاستكشاف فقط.' + FMT + M_FIRASA + langInstr(lang),
      content: [img(si), { type: 'text', text: (info ? info + '\n\n' : '') + 'اقرأ الفراسة الغربية لهذا الوجه.' }], maxTokens: 2000,
    }),
  },
  {
    key: 'personality', type: 'تقرير الشخصية',
    run: (si, info, lang) => analyze({
      system: 'أنت خبير نفسي تستنتج سمات الشخصية وفق نموذج OCEAN من الصورة، استكشافي غير قطعي.' + FMT + OCEAN + langInstr(lang),
      content: [img(si), { type: 'text', text: (info ? info + '\n\n' : '') + 'استنتج سمات الشخصية من هذه الصورة تحليلاً مفصّلاً.' }], maxTokens: 2200,
    }),
  },
];

// تشغيل كل الأقسام بالتوازي مع حفظ تلقائي وتحديث تقدّم
export async function runAll(sharedImage, { onProgress, addRecord, subject, profile, lang } = {}) {
  const info = profileText(profile);
  const results = {};
  await Promise.all(
    ANALYZERS.map(async (a) => {
      try {
        onProgress?.(a.key, 'running');
        const full = await a.run(sharedImage, info, lang);
        results[a.key] = { type: a.type, full };
        addRecord?.({ type: a.type, summary: full.slice(0, 140), full });
        onProgress?.(a.key, 'done');
      } catch (e) {
        results[a.key] = { type: a.type, full: '', error: e.message };
        onProgress?.(a.key, 'error');
      }
    })
  );
  return results;
}
