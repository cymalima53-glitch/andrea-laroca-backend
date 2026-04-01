'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';
import { Plus, Minus } from 'lucide-react';

interface FAQProps {
    title: string;
    items: { q: string; a: string }[];
}

export default function FAQ({ title, items }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={styles.section} id="faq">
            <div className="container">
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.list}>
                    {items.map((item, index) => (
                        <div key={index} className={`${styles.item} ${openIndex === index ? styles.open : ''}`}>
                            <button className={styles.question} onClick={() => toggle(index)}>
                                {item.q}
                                {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                            </button>
                            <div className={styles.answerWrapper}>
                                <div className={styles.answer}>
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
