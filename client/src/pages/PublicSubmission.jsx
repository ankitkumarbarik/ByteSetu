import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog"
import { UploadCloud, FileText, User, Mail, CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';

const PublicSubmission = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
            } else {
                setMessage("Only PDF files are allowed.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please upload a PDF manuscript.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('abstract', abstract);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('file', file);

        setLoading(true);
        setMessage('');

        try {
            await axiosInstance.post('/api/papers/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowSuccessDialog(true);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        if (user) {
            user.role === 'admin' ? navigate('/admin') :
                user.role === 'reviewer' ? navigate('/reviewer') : navigate('/author');
        } else {
            navigate('/login');
        }
    };

    return (

        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative">
            <div className="w-full max-w-3xl z-10">
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-2">Submit Your Research</h1>
                    <p className="text-slate-600 max-w-lg mx-auto">Join our community of scholars. Please fill out the details below to submit your manuscript for review.</p>
                </div>

                {/* Submission Form */}
                <Card className="shadow-lg border-slate-200 bg-white">
                    <CardHeader className="space-y-1 pb-8 border-b border-slate-100">
                        <CardTitle className="text-xl font-bold text-slate-900">Manuscript Details</CardTitle>
                        <CardDescription>All fields are required unless otherwise noted.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={!!user}
                                        placeholder="Dr. Jane Smith"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={!!user}
                                        placeholder="jane.smith@uni.edu"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-700 font-medium">Paper Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Enter the full title of your research paper"
                                    className="h-11 bg-slate-50 border-slate-200 font-medium focus:bg-white transition-all rounded-[5px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="abstract" className="text-slate-700 font-medium">Abstract</Label>
                                <textarea
                                    id="abstract"
                                    className="flex min-h-[120px] w-full rounded-[5px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus-visible:outline-none focus:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all resize-y"
                                    value={abstract}
                                    onChange={(e) => setAbstract(e.target.value)}
                                    required
                                    placeholder="Provide a concise summary of your research objectives, methods, and key findings..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file" className="text-slate-700 font-medium">Upload Manuscript (PDF)</Label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer relative ${dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <Input
                                        id="file"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                                        {file ? (
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4 w-full max-w-sm mx-auto">
                                                <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[5px]" onClick={(e) => { e.preventDefault(); setFile(null); }}>
                                                    <AlertCircle size={18} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                                                    <UploadCloud className="h-7 w-7 text-primary/80" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-slate-700">Click to upload or drag and drop</p>
                                                    <p className="text-sm text-slate-500 mt-1">PDF documents only (Max 10MB)</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 text-sm animate-in fade-in slide-in-from-top-1 border border-red-100">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p className="font-medium">{message}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all bg-slate-900 hover:bg-primary text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Processing Submission...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send size={18} /> Submit Research Paper
                                        </span>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    By submitting, you agree to our <Link to="#" className="underline hover:text-primary">Terms of Service</Link> and <Link to="#" className="underline hover:text-primary">Privacy Policy</Link>.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showSuccessDialog} onOpenChange={(open) => {
                if (!open) handleSuccessClose();
                setShowSuccessDialog(open);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4 animate-in zoom-in duration-300">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-center text-xl text-emerald-800">Submission Received!</DialogTitle>
                        <DialogDescription className="text-center pt-2 space-y-3">
                            <p className="text-slate-600">Your paper has been securely submitted. Our editorial team will begin the review process shortly.</p>

                            {!user && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left mt-4 text-slate-700 text-sm shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 font-semibold text-slate-900">
                                        <User size={16} /> Account Created
                                    </div>
                                    <p className="mb-1">We've created an account for you to track your submission:</p>
                                    <div className="bg-white px-3 py-2 rounded border border-slate-200 font-mono text-slate-800 mb-2">
                                        {email}
                                    </div>
                                    <p className="text-xs text-slate-500">Please check your email for your temporary password.</p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700" onClick={handleSuccessClose}>
                            {user ? 'Return to Dashboard' : 'Login to Dashboard'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PublicSubmission;
