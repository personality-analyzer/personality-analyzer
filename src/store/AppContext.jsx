import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { makeT } from '../services/i18n.js';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

const EMPTY_PROFILE = { name: '', age: '', gender: '', height: '', weight: '', health: '', notes: '' };

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => load('theme', 'light'));
  const [lang, setLang] = useState(() => load('lang', 'ar'));
  const [tab, setTab] = useState('home');
  const [records, setRecords] = useState(() => load('records', []));
  const [profile, setProfile] = useState(() => load('profile', EMPTY_PROFILE));
  const [includeProfile, setIncludeProfile] = useState(() => load('includeProfile', true));
  const [sharedImage, setSharedImage] = useState(null); // في الذاكرة فقط — يُحذف عند تحديث الصفحة

  const subject = profile.name;
  const L = (ar, en) => (lang === 'en' ? en : ar); // مساعد ترجمة سريع // الاسم هو معرّف الملف الموحّد

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark'); root.classList.add(theme);
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', JSON.stringify(lang));
  }, [lang]);
  useEffect(() => { localStorage.setItem('records', JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem('profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('includeProfile', JSON.stringify(includeProfile)); }, [includeProfile]);

  const updateProfile = (patch) => setProfile((p) => ({ ...p, ...patch }));
  const clearProfile = () => setProfile(EMPTY_PROFILE);
  const setSubject = (name) => updateProfile({ name });

  const addRecord = (rec) =>
    setRecords((r) => [{ id: Date.now(), date: new Date().toISOString(), subject: subject || 'عام', ...rec }, ...r]);
  const deleteRecord = (id) => setRecords((r) => r.filter((x) => x.id !== id));
  const deleteRecords = (ids) => setRecords((r) => r.filter((x) => !ids.includes(x.id)));
  const clearRecords = () => setRecords([]);

  const value = useMemo(
    () => ({
      theme, setTheme, lang, setLang, t: makeT(lang), tab, setTab, records, addRecord, deleteRecord, deleteRecords, clearRecords,
      profile, setProfile, updateProfile, clearProfile, includeProfile, setIncludeProfile,
      subject, setSubject, sharedImage, setSharedImage, L,
    }),
    [theme, lang, tab, records, profile, includeProfile, sharedImage]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
