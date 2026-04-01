'use client';
import styles from './InquireForm.module.css';
import { Dictionary } from '../../app/types';

export default function InquireForm({ dict, className }: { dict: Dictionary; className?: string }) {
    const t = dict.common.inquire;

    return (
        <section className={`${styles.section} ${className || ''}`}>
            <h1 className={styles.title}>{t.title}</h1>

            <div className={styles.container}>
                {/* Inquiry Form */}
                <div className={styles.formWrapper}>
                    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                        <div className={styles.group}>
                            <label className={styles.label}>{t.form.fullName}</label>
                            <input type="text" className={styles.input} required />
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>{t.form.companyName}</label>
                            <input type="text" className={styles.input} />
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>{t.form.email}</label>
                            <input type="email" className={styles.input} required />
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>{t.form.phone}</label>
                            <input type="tel" className={styles.input} required />
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>{t.form.type}</label>
                            <select className={styles.select} required>
                                <option value="wholesale">{t.form.types.wholesale}</option>
                                <option value="product">{t.form.types.product}</option>
                                <option value="general">{t.form.types.general}</option>
                            </select>
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>{t.form.message}</label>
                            <textarea className={styles.textarea} rows={5} required></textarea>
                        </div>

                        <button type="submit" className={styles.button}>{t.form.submit}</button>
                    </form>
                </div>

                {/* Info Box */}
                <div className={styles.infoBox}>
                    <div>
                        <h2 className={styles.infoTitle}>{t.info.wholesaleTitle}</h2>
                        <p className={styles.infoText}>{t.info.wholesaleText}</p>
                    </div>

                    <div className={styles.contactDetails}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email</span>
                            <span className={styles.detailValue}>{t.info.email}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Phone</span>
                            <span className={styles.detailValue}>{t.info.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
