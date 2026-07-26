import { useRef, useState } from 'react';
import { Sparkles, Loader2, Camera, Video, Mic, Radio, Square } from 'lucide-react';
import { Card, Button } from '../components/UI.jsx';
import SharedImage from '../components/SharedImage.jsx';
import ResultView from '../components/ResultView.jsx';
import { analyze } from '../services/ai.js';
import { profileText } from '../services/profile.js';
import { langInstr } from '../services/i18n.js';
import { useApp } from '../store/AppContext.jsx';

const MODES = [
  { id: 'image', label: 'صورة', en: 'Image', icon: Camera },
  { id: 'video', label: 'فيديو', en: 'Video', icon: Video },
  { id: 'audio', label: 'صوت', en: 'Audio', icon: Mic },
  { id: 'live', label: 'بث مباشر', en: 'Live', icon: Radio },
];
const FMT = ' نسّق ردّك بعناوين "## " ونقاط "- " و**تشديد**.';
const DEPTH = ' اجعل التحليل واسعاً ومفصّلاً بأقسام: الانطباع العام، المزاج والحالة الانفعالية، مستويات الطاقة، لغة الجسد، المؤشرات الصحية العامة، السمات الشخصية، ملاحظات ختامية.';
const METRICS = ' في نهاية ردّك أضف سطراً: [[METRICS المزاج=.. | الطاقة=.. | الاسترخاء=.. | الثقة=.. | التركيز=..]] بأرقام 0-100.';
const SYS_IMG = 'أنت محلل خبير في قراءة الحالة الانفعالية والصحية العامة والشخصية من الصور. غير تشخيصي وبالعربية. اختم بإخلاء مسؤولية أنه للاستكشاف لا للتشخيص.' + DEPTH + FMT + METRICS;

async function analyzeImageB64(b64, type, info, lang) {
  return analyze({
    system: SYS_IMG + langInstr(lang),
    content: [
      { type: 'image', source: { type: 'base64', media_type: type, data: b64 } },
      { type: 'text', text: (info ? info + '\n\n' : '') + 'حلّل هذه اللقطة تحليلاً شاملاً مفصّلاً.' },
    ],
    maxTokens: 3000,
  });
}
function frameToB64(el) {
  let w = el.videoWidth || el.clientWidth, h = el.videoHeight || el.clientHeight;
  const maxDim = 1280;
  if (w > maxDim || h > maxDim) { const s = maxDim / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(el, 0, 0, w, h);
  return c.toDataURL('image/jpeg', 0.82).split(',')[1];
}

export default function AnalyzeTab() {
  const { subject, sharedImage, profile, lang, t, L } = useApp();
  const [mode, setMode] = useState('image');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // فيديو
  const [videoSrc, setVideoSrc] = useState(null);
  const vidRef = useRef(null);
  // بث مباشر
  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  // صوت
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const setBusy = (v) => { setLoading(v); if (v) { setError(''); setResult(''); } };

  const runImage = async () => {
    if (!sharedImage) { setError(L('اختر صورة أولاً','Choose an image first')); return; }
    setBusy(true);
    try { setResult(await analyzeImageB64(sharedImage.b64, sharedImage.type, profileText(profile), lang)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const onVideoPick = (e) => { const f = e.target.files?.[0]; if (f) { setVideoSrc(URL.createObjectURL(f)); setResult(''); } };
  const captureVideo = async () => {
    if (!vidRef.current) return;
    setBusy(true);
    try { setResult(await analyzeImageB64(frameToB64(vidRef.current), 'image/jpeg', profileText(profile), lang)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = s; if (liveRef.current) liveRef.current.srcObject = s; setStreaming(true); setError('');
    } catch (e) { setError(L('تعذّر تشغيل الكاميرا: ','Failed to start camera: ') + e.message); }
  };
  const stopCam = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); setStreaming(false); };
  const captureLive = async () => {
    if (!liveRef.current) return;
    setBusy(true);
    try { setResult(await analyzeImageB64(frameToB64(liveRef.current), 'image/jpeg', profileText(profile), lang)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError(L('التعرّف على الصوت غير مدعوم في هذا المتصفح. اكتب النص يدوياً بالأسفل.','Speech recognition is not supported here. Type the text below manually.')); return; }
    const r = new SR(); r.lang = 'ar-SA'; r.continuous = true; r.interimResults = true;
    let final = '';
    r.onresult = (ev) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += t; else interim += t;
      }
      setTranscript(final + interim);
    };
    r.onerror = (e) => setError(L('خطأ في التعرّف: ','Recognition error: ') + e.error);
    r.onend = () => setListening(false);
    recRef.current = r; r.start(); setListening(true); setError('');
  };
  const stopListen = () => { recRef.current?.stop(); setListening(false); };
  const analyzeAudio = async () => {
    if (!transcript.trim()) { setError(L('لا يوجد نص لتحليله','No text to analyze')); return; }
    setBusy(true);
    try {
      setResult(await analyze({
        system: 'أنت محلل خبير في تحليل الحالة النفسية والانفعالية من الكلام (النبرة والمحتوى). بالعربية وغير تشخيصي.' + FMT + METRICS + langInstr(lang),
        content: [{ type: 'text', text: (profileText(profile) ? profileText(profile) + '\n\n' : '') + 'حلّل الحالة من هذا النص المنطوق:\n' + transcript }],
        maxTokens: 2400,
      }));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <div className="inline-flex w-fit flex-wrap gap-1 rounded-xl border p-1 surface">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => { setMode(m.id); setResult(''); setError(''); }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] transition ${mode === m.id ? 'bg-brand/15 font-bold text-brand' : 'text-slate-500'}`}>
              <Icon size={15} /> {L(m.label, m.en)}
            </button>
          );
        })}
      </div>

      {mode === 'image' && (
        <>
          <SharedImage />
          <p className="text-xs text-slate-500">{L('لتحليل كل الأقسام دفعة واحدة، استخدم تبويب «التقرير الشامل».','To analyze all sections at once, use the Full Report tab.')}</p>
          <Button onClick={runImage} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} {loading ? L('جارٍ التحليل…','Analyzing…') : L('حلّل هذا القسم','Analyze this section')}
          </Button>
        </>
      )}

      {mode === 'video' && (
        <>
          <label className="cursor-pointer">
            <input type="file" accept="video/*" className="hidden" onChange={onVideoPick} />
            <div className="rounded-xl border-2 border-dashed p-5 text-center surface transition hover:border-brand">
              {videoSrc ? <video ref={vidRef} src={videoSrc} controls className="mx-auto max-h-64 rounded-lg" /> :
                <><Video size={30} className="mx-auto text-slate-400" /><p className="mt-2 text-sm font-bold">'اختر مقطع فيديو','Choose a video'</p></>}
            </div>
          </label>
          <p className="text-xs text-slate-500">{L('شغّل الفيديو وأوقفه عند اللحظة المطلوبة، ثم التقط وحلّل الإطار الحالي.','Play/pause the video at the desired moment, then capture and analyze the current frame.')}</p>
          <Button onClick={captureVideo} disabled={!videoSrc || loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />} {L('التقط الإطار وحلّل','Capture frame & analyze')}
          </Button>
        </>
      )}

      {mode === 'live' && (
        <>
          <div className="overflow-hidden rounded-xl border surface">
            <video ref={liveRef} autoPlay playsInline muted className="w-full max-h-72 bg-black object-cover" />
          </div>
          <div className="flex gap-2">
            {!streaming ? (
              <Button onClick={startCam}><Radio size={17} /> {L('تشغيل الكاميرا','Start camera')}</Button>
            ) : (
              <>
                <Button onClick={captureLive} disabled={loading}>{loading ? <Loader2 size={17} className="animate-spin" /> : <Camera size={17} />} {L('التقط وحلّل','Capture & analyze')}</Button>
                <Button variant="secondary" onClick={stopCam}><Square size={16} /> {L('إيقاف','Stop')}</Button>
              </>
            )}
          </div>
        </>
      )}

      {mode === 'audio' && (
        <>
          <div className="flex gap-2">
            {!listening ? (
              <Button onClick={startListen}><Mic size={17} /> {L('ابدأ التسجيل والتفريغ','Start recording & transcription')}</Button>
            ) : (
              <Button variant="secondary" onClick={stopListen}><Square size={16} /> {L('إيقاف التسجيل','Stop recording')}</Button>
            )}
          </div>
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4}
            placeholder={L('النص المُفرَّغ من الصوت (أو اكتبه يدوياً)…','Transcribed text (or type it manually)…')}
            className="w-full rounded-xl border p-3 text-sm surface outline-none focus:border-brand" />
          <Button onClick={analyzeAudio} disabled={loading || !transcript.trim()}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} {L('حلّل الصوت','Analyze audio')}
          </Button>
        </>
      )}

      {error && <Card className="text-sm text-red-500">{error}</Card>}
      <ResultView title={`${L('تحليل','Analysis')} ${L(MODES.find((m) => m.id === mode).label, MODES.find((m) => m.id === mode).en)}${subject ? ' — ' + subject : ''}`} text={result} />
    </div>
  );
}
