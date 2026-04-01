'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface User {
    id: string;
    username: string;
    email: string;
    company_name: string;
}

export default function PendingUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { accessToken } = useAuth();

    useEffect(() => {
        if (accessToken) {
            fetchPendingUsers();
        }
    }, [accessToken]);

    const fetchPendingUsers = async () => {
        try {
            // Corrected path from user snippet to match actual backend route
            const response = await fetch('http://localhost:5000/api/admin/users/pending', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data || []);
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
        } finally {
            setLoading(false);
        }
    };

    const approve = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/api/admin/users/approve/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            fetchPendingUsers(); // Refresh
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const disapprove = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/api/admin/users/reject/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            fetchPendingUsers(); // Refresh
        } catch (error) {
            console.error('Error rejecting user:', error);
        }
    };

    if (loading) return <div className="p-4">Loading pending users...</div>;

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#2c1810', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>⏳ Pending Wholesale Accounts</h2>

            {users.length === 0 ? (
                <p className="text-gray-500">No pending approvals</p>
            ) : (
                <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #d4af37' }}>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Company</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{user.username}</td>
                                    <td style={{ padding: '10px' }}>{user.company_name}</td>
                                    <td style={{ padding: '10px' }}>{user.email}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => approve(user.id)}
                                            style={{
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '5px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => disapprove(user.id)}
                                            style={{
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✗ Reject
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
