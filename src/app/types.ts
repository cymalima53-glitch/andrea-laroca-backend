export interface Product {
    id: string;
    name: string;
    price: string;
    description: string;
    image: string;
    category: string;
}

export interface Dictionary {
    common: {
        title: string;
        description: string;
        nav: {
            home: string;
            about: string;
            coffee: string;
            catalogue: string;
            products: string;
            contact: string;
        };
        hero: {
            eyebrow: string;
            title: string;
            subtitle: string;
            cta: string;
            ctaSecondary: string;
        };
        heritage: {
            eyebrow: string;
            title: string;
            subheading?: string;
            description: string;
        };
        coffeePage: {
            eyebrow: string;
            title: string;
            subtitle: string;
        };
        productsPage: {
            eyebrow: string;
            title: string;
            subtitle: string;
            contactPrompt?: string;
        };
        legacyPage: {
            eyebrow: string;
            title: string;
            description1: string;
            valuesTitle: string;
            values: string[];
            description2: string;
        };
        whyUs: {
            title: string;
            features: Array<{ title: string; description: string }>;
        };
        testimonials: {
            title: string;
            items: Array<{ quote: string; author: string }>;
        };
        faq: {
            title: string;
            items: Array<{ q: string; a: string }>;
        };
        footer: {
            contact: string;
            rights: string;
            newsletter: string;
        };
        products: Product[];
        categories: Record<string, string>;
        inquire: {
            title: string;
            form: {
                fullName: string;
                companyName: string;
                email: string;
                phone: string;
                type: string;
                types: {
                    wholesale: string;
                    product: string;
                    general: string;
                };
                message: string;
                submit: string;
            };
            info: {
                wholesaleTitle: string;
                wholesaleText: string;
                email: string;
                phone: string;
            };
        };
    };
}
