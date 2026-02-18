import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await axiosInstance.post('/api/auth/forgotpassword', { email });
            setMessage(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Hero/Visual Side */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-[120px] opacity-20 -translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 group cursor-pointer w-fit">
                        <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                            <BookOpen size={24} className="text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold font-heading tracking-tight group-hover:text-primary-foreground/90 transition-colors">ByteSetu</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-heading font-bold mb-6 leading-tight">
                        Account <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">Recovery</span>
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                        Don't worry, it happens to the best of us. We'll help you get back to your research in no time.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-zinc-500">
                    &copy; {new Date().getFullYear()} ByteSetu. All rights reserved.
                </div>
            </div>

            {/* Right: Form Side */}
            <div className="flex items-center justify-center p-6 bg-slate-50 relative">
                <div className="absolute top-6 right-6 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-primary text-white p-2 rounded-lg shadow-lg shadow-primary/20">
                            <BookOpen size={20} />
                        </div>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] space-y-8 animate-enter">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-heading font-bold text-slate-900">Forgot Password</h2>
                        <p className="text-slate-500">Enter your email to receive reset instructions.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                                    required
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-4 rounded-xl bg-green-50 text-green-600 text-sm border border-green-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle size={18} className="shrink-0" />
                                {message}
                            </div>
                        )}

                        <Button className="w-full text-base py-6 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5" type="submit" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Sending Link...
                                </span>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>

                    <div className="text-center pt-4">
                        <Link to="/login" className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-primary transition-colors hover:underline">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
