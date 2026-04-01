'use client';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { NotificationProvider } from '../context/NotificationContext';
import NotificationDisplay from './ui/NotificationDisplay';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                    <NotificationDisplay />
                </CartProvider>
            </AuthProvider>
        </NotificationProvider>
    );
}
