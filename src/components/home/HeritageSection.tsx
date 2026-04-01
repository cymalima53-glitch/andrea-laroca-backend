import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '../../i18n-config';
import styles from './HeritageSection.module.css';

export default async function HeritageSection({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.content}>
                    <span className={styles.eyebrow}>{dict.common.heritage.eyebrow}</span>
                    <h2 className={styles.title}>{dict.common.heritage.title}</h2>
                    <h4 className={styles.subheading}>{dict.common.heritage.subheading}</h4>
                    <p className={styles.description} style={{ whiteSpace: 'pre-line' }}>{dict.common.heritage.description}</p>
                </div>
            </div>
        </section>
    );
}
