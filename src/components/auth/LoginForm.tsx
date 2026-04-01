'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
        } catch (err: any) {
            setError(err.message || 'Login failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // But keeping the VISUALS exactly as requested.

    return (
        <form onSubmit={handleSubmit} style={{ padding: '30px', background: 'white', borderRadius: '8px' }}>
            <h2 style={{ color: '#2c1810', marginBottom: '20px', fontSize: '20px' }}>
                Sign In to Your Account
            </h2>

            {error && (
                <div style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '14px',
                }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: '15px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '14px',
                }}>
                    Email Address *
                </label>
                <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '14px',
                }}>
                    Password *
                </label>
                <input
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            <button
                type='submit'
                disabled={loading}
                style={{
                    width: '100%',
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                }}
            >
                {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#666' }}>
                Forgot password? <a href='/forgot-password' style={{ color: '#d4af37' }}>Reset here</a>
            </p>
        </form>
    );
}
