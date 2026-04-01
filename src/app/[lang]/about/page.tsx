import { Locale } from "../../../i18n-config";
import { getDictionary } from "../../../lib/get-dictionary";
import styles from "./about.module.css";
import Hero from "../../../components/home/Hero";

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main className={styles.main}>
            <Hero
                lang={lang}
                imageSrc="/building.png"
                eyebrow={dict.common.legacyPage.eyebrow}
                title={dict.common.legacyPage.title}
                subtitle={dict.common.legacyPage.description1}
            />

            <section className={styles.content}>
                <div className="container">
                    <div className={styles.grid}>
                        <div className={styles.textColumn} style={{ width: '100%' }}>
                            <div className={styles.valuesExample}>
                                <h3 className={styles.valuesTitle}>{dict.common.legacyPage.valuesTitle}</h3>
                                <ul className={styles.valuesList}>
                                    {dict.common.legacyPage.values.map((value, index) => (
                                        <li key={index} className={styles.valueItem}>{value}</li>
                                    ))}
                                </ul>
                            </div>

                            <p className={styles.params}>{dict.common.legacyPage.description2}</p>
                        </div>

                        <div className={styles.textColumn} style={{ width: '100%' }}>
                            <h3 className={styles.valuesTitle}>Our Promise to You</h3>
                            <ul className={styles.promiseList}>
                                <li className={styles.promiseItem}>◆ Beyond Premium Products</li>
                                <li className={styles.promiseItem}>◆ Personal Touch</li>
                                <li className={styles.promiseItem}>◆ Growth Together</li>
                                <li className={styles.promiseItem}>◆ Authenticity Guaranteed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
