export type SiteLanguage = {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  group: 'Indian' | 'Global'
}
export const languages: SiteLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', group: 'Global' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', group: 'Indian' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', group: 'Indian' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', group: 'Indian' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', group: 'Indian' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', group: 'Indian' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', group: 'Indian' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', group: 'Indian' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', group: 'Indian' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', group: 'Indian' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', direction: 'ltr', group: 'Indian' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', direction: 'ltr', group: 'Indian' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', group: 'Indian' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', group: 'Global' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', group: 'Global' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', group: 'Global' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', group: 'Global' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', group: 'Global' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', group: 'Global' },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    direction: 'ltr',
    group: 'Global',
  },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', group: 'Global' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', group: 'Global' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', group: 'Global' },
]
export type LanguageCode = string
export const getLanguage = (code: string) => languages.find((language) => language.code === code)
export function stripLanguage(path: string) {
  const prefix = path.match(/^\/([^/?#]+)(?=\/|[?#]|$)/)?.[1]
  if (!prefix || !getLanguage(prefix)) return path
  const remaining = path.slice(prefix.length + 1)
  return remaining.startsWith('/') ? remaining : `/${remaining}`
}
export function languagePath(path: string, code: string): string {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /^\/(api|admin|next|_next)(\/|$)/.test(path)
  )
    return path
  const split = path.search(/[?#]/)
  const pathname = split < 0 ? path : path.slice(0, split)
  const suffix = split < 0 ? '' : path.slice(split)
  const clean = stripLanguage(pathname)
  if (/^\/(api|admin|next|_next)(\/|$)/.test(clean)) return clean + suffix
  if (!getLanguage(code) || code === 'en') return clean + suffix
  return `/${code}${clean === '/' ? '' : clean}${suffix}`
}
