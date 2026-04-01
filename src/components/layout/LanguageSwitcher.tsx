'use client';

import { usePathname, useRouter } from 'next/navigation';
import { i18n } from '../../i18n-config';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();

    const redirectedPathName = (locale: string) => {
        if (!pathname) return '/';
        const segments = pathname.split('/');
        segments[1] = locale;
        return segments.join('/');
    };

    return (
        <div className="language-switcher">
            {i18n.locales.map((locale) => {
                const isActive = pathname?.startsWith(`/${locale}`);
                return (
                    <button
                        key={locale}
                        onClick={() => router.push(redirectedPathName(locale))}
                        className={`lang-btn ${isActive ? 'active' : ''}`}
                        aria-label={`Switch to ${locale}`}
                    >
                        {locale.toUpperCase()}
                    </button>
                );
            })}
            <style jsx>{`
        .language-switcher {
          display: flex;
          gap: 0.5rem;
        }
        .lang-btn {
          background: none;
          border: none;
          color: var(--color-text-main);
          font-family: var(--font-sans);
          font-weight: 500;
          cursor: pointer;
          opacity: 0.5;
          padding: 0.25rem;
          transition: opacity 0.3s;
        }
        .lang-btn:hover,
        .lang-btn.active {
          opacity: 1;
        }
        .lang-btn.active {
          font-weight: 700;
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}
