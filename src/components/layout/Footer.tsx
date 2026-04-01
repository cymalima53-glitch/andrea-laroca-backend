import Link from 'next/link';
import type { Locale } from '../../i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import styles from './Footer.module.css';

export default async function Footer({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerInner} `}>
                <div className={styles.column}>
                    <h3 className={styles.brand}>LA ROCCA</h3>
                    <p className={styles.description}>{dict.common.description}</p>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Explore</h4>
                    <ul className={styles.list}>
                        <li><Link href={`/${lang}/products`}>{dict.common.nav.products}</Link></li>
                        <li><Link href={`/${lang}/about`}>{dict.common.nav.about}</Link></li>
                        <li><Link href={`/${lang}/contact`}>{dict.common.nav.contact}</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Connect</h4>
                    <ul className={styles.list}>
                        <li>Instagram</li>
                        <li>LinkedIn</li>
                        <li>Facebook</li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Newsletter</h4>
                    <p>{dict.common.footer.newsletter}</p>
                    <div className={styles.newsletterParams}>
                        <input type="email" placeholder="Email" className={styles.input} />
                        <button className={styles.button}>Subscribe</button>
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                &copy; {new Date().getFullYear()} Premium Coffee Wholesale. {dict.common.footer.rights}
            </div>
            <div className={styles.signature}>
                Made by Kamal
            </div>
        </footer>
    );
}
