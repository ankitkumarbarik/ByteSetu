import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BookOpen, ArrowRight, Mail, Lock, CheckCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/auth/login', {
                email,
                password
            });

            login(res.data.user, res.data.token);

            // Redirect based on role
            if (res.data.user.role === 'admin') navigate('/admin');
            else if (res.data.user.role === 'reviewer') navigate('/reviewer');
            else navigate('/author');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative">
            <div className="w-full max-w-md z-10">
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-medium">
                        <ArrowRight size={16} className="rotate-180" /> Back to Home
                    </Link>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-primary">
                        <BookOpen size={24} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-600">Enter your credentials to access your dashboard.</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@university.edu"
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                                {error}
                            </div>
                        )}

                        <Button className="w-full h-12 text-base shadow-md hover:shadow-lg transition-all bg-slate-900 hover:bg-primary text-white" type="submit" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Logging in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In <ArrowRight size={18} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="text-center mb-4">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New to ByteSetu?</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/register" className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all duration-200 group text-center block">
                                <span className="block font-semibold text-slate-700 group-hover:text-primary transition-colors text-sm">Reviewer</span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">Join the panel</span>
                            </Link>
                            <Link to="/submit-paper" className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all duration-200 group text-center block">
                                <span className="block font-semibold text-slate-700 group-hover:text-primary transition-colors text-sm">Author</span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">Submit paper</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for visual placeholder
const UserAvatar = () => (
    <svg className="w-full h-full p-2 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export default Login;
