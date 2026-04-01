import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "../globals.css";
import { i18n } from "../../i18n-config";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "LA ROCCA | Premium Coffee & Espresso Machines",
    description: "Authentic Italian Coffee for the Connoisseur",
};

export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }));
}

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import Providers from "../../components/Providers";

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}>) {
    const { lang } = await params;
    const validLang = lang as any;

    return (
        <html lang={validLang} className={`${playfair.variable} ${lato.variable}`}>
            <body>
                <Providers>
                    <Header lang={validLang} />
                    {children}
                    <Footer lang={validLang} />
                </Providers>
            </body>
        </html>
    );
}
