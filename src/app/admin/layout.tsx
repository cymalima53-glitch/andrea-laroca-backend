import '../globals.css';
import Providers from '@/components/Providers';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
    title: 'La Rocca Admin',
    description: 'Admin Dashboard',
};

export default function RootAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <AdminLayout>
                        {children}
                    </AdminLayout>
                </Providers>
            </body>
        </html>
    );
}
