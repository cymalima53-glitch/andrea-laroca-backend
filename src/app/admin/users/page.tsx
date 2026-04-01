'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

interface PendingUser {
    id: string;
    username: string;
    email: string;
    company_name: string;
    created_at: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { accessToken, user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken) return;
        fetchPendingUsers();
    }, [accessToken]);

    const fetchPendingUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users/pending', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch pending users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this user? They will be notified via email.')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/approve/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (res.ok) {
                showSuccess('User approved successfully');
                setUsers(users.filter(u => u.id !== id));
            } else {
                showError('Failed to approve user');
            }
        } catch (error) {
            showError('Error processing request');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to REJECT this user? This cannot be undone.')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/reject/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (res.ok) {
                showSuccess('User rejected');
                setUsers(users.filter(u => u.id !== id));
            } else {
                showError('Failed to reject user');
            }
        } catch (error) {
            showError('Error processing request');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading pending approvals...</div>;

    if (user?.role !== 'admin') {
        return <div className="p-8 text-white">Access Denied</div>;
    }

    return (
        <div className="p-8 bg-neutral-900 min-h-screen text-white">
            <h1 className="text-3xl font-serif text-gold-500 mb-8">Pending Wholesale Applications</h1>

            {users.length === 0 ? (
                <p className="text-gray-400">No pending applications at this time.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-neutral-800 rounded-lg overflow-hidden">
                        <thead className="bg-neutral-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact Not</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-neutral-750">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{u.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{u.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                        <button
                                            onClick={() => handleApprove(u.id)}
                                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(u.id)}
                                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
