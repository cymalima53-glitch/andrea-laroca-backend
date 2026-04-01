'use client';
import styles from './Contact.module.css';

export default function Contact({ lang }: { lang: any }) {
    // Simplified props, usually would pass strict Dict type
    return (
        <section className={styles.section} id="contact">
            <div className="container">
                <h2 className={styles.title}>Contact Us</h2>
                <div className={styles.formWrapper}>
                    <form className={styles.form}>
                        <div className={styles.group}>
                            <label className={styles.label}>Name</label>
                            <input type="text" className={styles.input} />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Email</label>
                            <input type="email" className={styles.input} />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Message</label>
                            <textarea className={styles.textarea} rows={5}></textarea>
                        </div>
                        <button type="button" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    );
}
