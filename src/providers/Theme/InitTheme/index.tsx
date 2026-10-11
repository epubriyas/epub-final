import {
  defaultTheme,
  themeLocalStorageKey,
  themeCookieKey,
  themePreferenceCookieKey,
} from '../shared'

export function InitTheme() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
    (function () {
      function cookie(key) { var entry = document.cookie.split('; ').find(function (item) { return item.indexOf(key + '=') === 0 }); return entry ? entry.slice(key.length + 1) : null; }
      var preference = null;
      try { preference = localStorage.getItem('${themeLocalStorageKey}'); } catch (_) {}
      if (preference === null) preference = cookie('${themePreferenceCookieKey}') || cookie('${themeCookieKey}');
      if (['light', 'dark'].indexOf(preference) < 0) preference = '${defaultTheme}';
      var theme = preference;
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-theme-preference', preference);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1b19' : '#f4f2eb');
    })();
  `,
      }}
    />
  )
}
