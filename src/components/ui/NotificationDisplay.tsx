'use client';

import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './NotificationDisplay.css';

export default function NotificationDisplay() {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="notification-container">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification ${notification.type} ${notification.isRemoving ? 'fade-out' : ''}`}
                    role="alert"
                >
                    <span className="notification-icon">
                        {notification.type === 'success' && '✓'}
                        {notification.type === 'error' && '✕'}
                        {notification.type === 'warning' && '⚠'}
                        {notification.type === 'info' && 'ℹ'}
                    </span>
                    <span>{notification.message}</span>
                    <span
                        className="notification-close"
                        onClick={() => removeNotification(notification.id)}
                    >
                        &times;
                    </span>
                </div>
            ))}
        </div>
    );
}
