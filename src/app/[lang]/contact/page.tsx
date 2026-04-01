import { getDictionary } from '../../../lib/get-dictionary';
import { Locale } from "../../../i18n-config";
import InquireForm from "../../../components/contact/InquireForm";

export default async function InquirePage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main>
            <InquireForm dict={dict} />
        </main>
    );
}
