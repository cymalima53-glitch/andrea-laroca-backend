import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderActions from './HeaderActions';
import type { Locale } from '../../i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import styles from './Header.module.css';

// Header is a Server Component
export default async function Header({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerInner}`}>
                <Link href={`/${lang}`} className={styles.logo}>
                    <div className={styles.logoImageWrapper}>
                        <Image
                            src="/images/logo.png"
                            alt="La Rocca Logo"
                            width={56}
                            height={75}
                            className={styles.logoImage}
                            priority
                            unoptimized
                        />
                    </div>
                    <div className={styles.logoTextWrapper}>
                        <span className={styles.logoText}>LA ROCCA</span>
                        <span className={styles.tagline}>fine foods</span>
                    </div>
                </Link>

                <nav className={styles.navMenu}>
                    <Link href={`/${lang}`} className={styles.navLink}>{dict.common.nav.home}</Link>
                    <Link href={`/${lang}/about`} className={styles.navLink}>{dict.common.nav.about}</Link>
                    <Link href={`/${lang}/coffee`} className={styles.navLink}>{dict.common.nav.coffee}</Link>
                    <Link href={`/${lang}/catalogue`} className={styles.navLink}>{dict.common.nav.catalogue}</Link>
                    <Link href={`/${lang}/products`} className={styles.navLink}>{dict.common.nav.products}</Link>
                </nav>

                <div className={styles.headerActions}>
                    <HeaderActions />
                </div>
            </div>
        </header>
    );
}
