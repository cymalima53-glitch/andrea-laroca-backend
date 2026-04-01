import styles from './Testimonials.module.css';
import type { Locale } from '../../i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import { Quote } from 'lucide-react';

export default async function Testimonials({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);
    const { title, items } = dict.common.testimonials;

    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}><Quote size={32} /></div>
                            <p className={styles.quote}>"{item.quote}"</p>
                            <p className={styles.author}>— {item.author}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
