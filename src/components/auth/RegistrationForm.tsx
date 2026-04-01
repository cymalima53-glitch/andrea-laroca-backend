'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegistrationForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '', // This will be mapped to "Name" in the UI
        email: '',
        password: '',
        company_name: '',
        phone: '',
        address: '',
        business_type: '',
        website: '',
        inquiry_type: '',
        contacted_salesperson: '',
        message: ''
    });
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { login } = useAuth(); // login handles redirection to /catalogue or /admin based on role

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    const fieldErrors: any = {};
                    data.errors.forEach((err: any) => {
                        fieldErrors[err.path[0]] = err.message;
                    });
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: data.msg || 'Registration failed' });
                }
                return;
            }

            setSuccess(true);
        } catch (err) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full bg-white text-neutral-900 p-8 rounded-lg shadow-lg text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="text-2xl font-serif text-[#2c1810] mb-4">Application Received</h2>
                <div className="bg-[#fffbea] border border-[#ffc107] text-[#856404] p-4 rounded mb-6 text-sm">
                    <p className="mb-2">
                        Thank you for registering. Your wholesale account application is currently <strong>pending approval</strong>.
                    </p>
                    <p>
                        You will receive an email once your account has been reviewed by our administrators.
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-[#d4af37] hover:underline font-bold"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '0',
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #2c1810 0%, #1a0f08 100%)',
                padding: '40px 30px',
                borderRadius: '12px 12px 0 0',
                textAlign: 'center',
            }}>
                <h2 style={{
                    color: '#d4af37',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    margin: '0 0 10px 0',
                }}>
                    Wholesale Application
                </h2>
                <p style={{
                    color: '#fff',
                    fontSize: '14px',
                    opacity: 0.9,
                    margin: 0,
                }}>
                    Join LA ROCCA Premium Distributor Network
                </p>
            </div>

            {/* Form Content */}
            <div style={{
                background: 'white',
                padding: '40px 30px',
                borderRadius: '0 0 12px 12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}>
                {errors.general && (
                    <div style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '15px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: '1px solid #f5c6cb',
                    }}>
                        ⚠️ {errors.general}
                    </div>
                )}

                {/* PERSONAL INFORMATION */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 30px 0' }}>
                    <legend style={{
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#2c1810',
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: '3px solid #d4af37',
                    }}>
                        👤 PERSONAL INFORMATION
                    </legend>

                    {/* Name */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Full Name *
                        </label>
                        <input
                            type='text'
                            name='username'
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.3s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
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
                            autoComplete="email"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '0' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
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
                            autoComplete="new-password"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                </fieldset>

                {/* ACCOUNT INFORMATION */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 30px 0' }}>
                    <legend style={{
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#2c1810',
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: '3px solid #d4af37',
                    }}>
                        🏢 ACCOUNT INFORMATION
                    </legend>

                    {/* Company Name */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Company Name *
                        </label>
                        <input
                            type='text'
                            name='company_name'
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            autoComplete="organization"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                    </div>

                    {/* Business Type */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Business Type *
                        </label>
                        <select
                            name='business_type'
                            value={formData.business_type}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                background: 'white',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232c1810' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '20px',
                                paddingRight: '40px',
                            }}
                        >
                            <option value=''>Select Business Type</option>
                            <option value='Caterer'>🍽️ Caterer</option>
                            <option value='Distributor'>🚚 Distributor</option>
                            <option value='Export'>✈️ Export</option>
                            <option value='Hotel/Resort'>🏨 Hotel/Resort</option>
                            <option value='Market/Retailer'>🛒 Market/Retailer</option>
                            <option value='Restaurant'>🍽️ Restaurant</option>
                            <option value='Other'>📌 Other</option>
                        </select>
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Phone Number *
                        </label>
                        <input
                            type='tel'
                            name='phone'
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            autoComplete="tel"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Website */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Website Address
                        </label>
                        <input
                            type='text'
                            name='website'
                            value={formData.website}
                            onChange={handleChange}
                            placeholder='www.yourwebsite.com'
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>

                    {/* Address */}
                    <div style={{ marginBottom: '0' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Business Address *
                        </label>
                        <input
                            type='text'
                            name='address'
                            value={formData.address}
                            onChange={handleChange}
                            required
                            autoComplete="street-address"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                </fieldset>

                {/* INQUIRY TYPE */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 30px 0' }}>
                    <legend style={{
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#2c1810',
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: '3px solid #d4af37',
                    }}>
                        ❓ INQUIRY TYPE
                    </legend>

                    {/* Inquiry Type */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Are you an existing customer? *
                        </label>
                        <select
                            name='inquiry_type'
                            value={formData.inquiry_type}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                background: 'white',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232c1810' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '20px',
                                paddingRight: '40px',
                            }}
                        >
                            <option value=''>Select Option</option>
                            <option value='Existing Customer'>✓ Existing Customer</option>
                            <option value='New Customer'>+ New Customer</option>
                            <option value='Product Inquiry'>? Product Inquiry</option>
                        </select>
                        {errors.inquiry_type && <p className="text-red-500 text-xs mt-1">{errors.inquiry_type}</p>}
                    </div>

                    {/* Contacted Salesperson */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Have you contacted a salesperson? *
                        </label>
                        <select
                            name='contacted_salesperson'
                            value={formData.contacted_salesperson}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                background: 'white',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232c1810' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '20px',
                                paddingRight: '40px',
                            }}
                        >
                            <option value=''>Select</option>
                            <option value='yes'>Yes</option>
                            <option value='no'>No</option>
                        </select>
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: '0' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#2c1810',
                            fontSize: '14px',
                        }}>
                            Additional Message
                        </label>
                        <textarea
                            name='message'
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            placeholder='Tell us about your business...'
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                fontFamily: 'Arial, sans-serif',
                                resize: 'vertical',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>
                </fieldset>

                {/* Submit Button */}
                <button
                    type='submit'
                    disabled={loading}
                    style={{
                        width: '100%',
                        background: loading
                            ? '#ccc'
                            : 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                        color: 'white',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginBottom: '20px',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {loading ? '⏳ Submitting...' : '✓ Submit Application'}
                </button>

                {/* Info Box */}
                <div style={{
                    background: '#fffbea',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '20px',
                    fontSize: '13px',
                    color: '#856404',
                    lineHeight: '1.7',
                }}>
                    <p style={{ margin: '0 0 10px 0' }}>
                        <strong>📌 Important Information:</strong>
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        ✓ Our catalogue is exclusively for approved distributors
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        ✓ We will review your application within 24-48 hours
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        ✓ Check your email for approval status
                    </p>
                    <p style={{ margin: '10px 0 0 0' }}>
                        📞 Questions? Call us: <strong>561-391-1653</strong>
                    </p>
                </div>
            </div>
        </form>
    );
}
