import { Award, Globe, Leaf } from 'lucide-react'; // Example icons
import styles from './WhyUs.module.css';
import type { Locale } from '../../i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

export default async function WhyUs({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);
    const { title, features } = dict.common.whyUs;

    const icons = [<Award key={0} />, <Globe key={1} />, <Leaf key={2} />];

    return (
        <section className={styles.section} id="about">
            <div className="container">
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                {icons[index]}
                            </div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.description}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
