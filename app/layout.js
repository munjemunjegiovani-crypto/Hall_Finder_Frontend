import '@fontsource-variable/inter';
import '@fontsource-variable/hanken-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: { default: 'HallFinder: find your hall, on time', template: '%s | HallFinder' },
  description: 'Indoor campus navigation, live hall availability and timetable reminders for students, teachers and school staff.',
  applicationName: 'HallFinder',
};
export const viewport = {
  width: 'device-width', initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#132C75' }, { media: '(prefers-color-scheme: dark)', color: '#090E1C' }],
};

// Runs before paint so there is no flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('hf_theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');if(localStorage.getItem('hf_large')==='1')document.documentElement.classList.add('large-text');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
