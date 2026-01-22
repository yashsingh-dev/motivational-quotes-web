import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, ArrowRight, Quote, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Client-side Validation
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);

        try {
            // 2. API Call
            const response = await api.post('/api/auth/login', {
                email: formData.email,
                password: formData.password,
                role: 'admin'
            });
            console.log("Login Response:", response);

            if (response.data.success) {
                const accessToken = response.headers['x-access-token'];
                const refreshToken = response.headers['x-refresh-token'];
                const user = response.data.payload;

                if (accessToken) localStorage.setItem('accessToken', accessToken.split('Bearer ')[1]);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken.split('Bearer ')[1]);

                localStorage.setItem('user', JSON.stringify(user));

                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login Error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Unable to connect to the server. Please check your internet connection or try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/50 rounded-full blur-[100px]" />

            {/* Left Panel - Hero/Brand */}
            <div className="hidden lg:flex w-1/2 relative z-10 flex-col items-center justify-center p-12 lg:p-20">
                <div className="max-w-xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/10 rotate-3 transition-transform hover:rotate-6 duration-500">
                            <Quote className="w-12 h-12 text-purple-600" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                        Inspire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">World</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Manage your quotes, users, and content from one beautiful centralized dashboard. Your daily dose of motivation starts here.
                    </p>
                </div>

                {/* Floating Cards Effect */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-20">
                <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-8 lg:p-10 rounded-3xl shadow-2xl shadow-slate-200 border border-white/50">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
                        <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-600 text-sm animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="email"

                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 placeholder:text-slate-300 text-slate-900"
                                    placeholder="admin@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}

                                    className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 placeholder:text-slate-300 text-slate-900"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
