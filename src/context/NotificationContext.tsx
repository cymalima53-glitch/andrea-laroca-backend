'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    isRemoving?: boolean;
}

interface NotificationContextProps {
    notifications: Notification[];
    showNotification: (message: string, type?: NotificationType, duration?: number) => void;
    removeNotification: (id: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRemoving: true } : n))
        );

        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 300); // Match CSS animation duration
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'success', duration: number = 3000) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto remove
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }, [removeNotification]);

    const showSuccess = useCallback((message: string, duration?: number) => showNotification(message, 'success', duration), [showNotification]);
    const showError = useCallback((message: string, duration?: number) => showNotification(message, 'error', duration), [showNotification]);
    const showWarning = useCallback((message: string, duration?: number) => showNotification(message, 'warning', duration), [showNotification]);
    const showInfo = useCallback((message: string, duration?: number) => showNotification(message, 'info', duration), [showNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, removeNotification, showSuccess, showError, showWarning, showInfo }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
