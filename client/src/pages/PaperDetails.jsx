import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    FileText,
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    ArrowLeft,
    MessageSquare,
    Eye
} from 'lucide-react';

const PaperDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaperDetails = async () => {
            try {
                // Determine the correct API endpoint based on role or use a generic one if available
                // For now, assuming we can fetch by ID directly or need to use a specific role-based endpoint
                // Let's try to fetch from a generic 'get paper by id' endpoint if it exists, 
                // or fall back to finding it in the user's papers if they are an author.
                // However, the most robust way is likely a dedicated endpoint. 
                // Given the codebase, let's assume valid access if the user can hit this route.

                // Inspecting previous code, there might not be a single 'get paper' endpoint for all roles.
                // But let's try a standard GET /api/papers/:id 
                const res = await axiosInstance.get(`/api/papers/${id}`);
                setPaper(res.data);
            } catch (err) {
                console.error("Error fetching paper details", err);
                setError("Failed to load paper details. You may not have permission to view this paper.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPaperDetails();
        }
    }, [id]);

    const handleViewPdf = () => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/papers/stream/${id}`, '_blank');
    };

    const handleDownload = async () => {
        try {
            const response = await axiosInstance.get(`/api/papers/stream/${id}`, {
                responseType: 'blob',
            });

            // Create a blob from the response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`; // Sanitize filename
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            setError("Failed to download manuscript. Please try again.");
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle, label: 'Published' };
            case 'REJECTED':
                return { color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle, label: 'Rejected' };
            case 'UNDER_REVIEW':
                return { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Under Review' };
            default:
                return { color: 'text-slate-600 bg-slate-50 border-slate-100', icon: FileText, label: 'Submitted' };
        }
    };

    if (loading) {
        return (
            <DashboardLayout role={user?.role || 'author'}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading paper details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !paper) {
        return (
            <DashboardLayout role={user?.role || 'author'}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Unable to Load Paper</h2>
                    <p className="text-slate-600">{error || "Paper not found"}</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
                        <ArrowLeft size={16} className="mr-2" /> Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const status = getStatusInfo(paper.status);

    return (
        <DashboardLayout role={user?.role || 'author'}>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header / Nav */}
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft size={18} className="mr-1" /> Back
                    </Button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600 font-medium truncate max-w-[200px]">{paper.title}</span>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column: Paper Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${status.color}`}>
                                        <status.icon size={12} strokeWidth={2.5} />
                                        {status.label}
                                    </div>
                                    <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                        <Calendar size={12} />
                                        {new Date(paper.submittedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900 leading-tight mt-3">
                                    {paper.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                    <User size={14} />
                                    <span className="font-medium">Author:</span> {paper.authorId?.name || user?.name || 'Unknown'}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FileText size={14} className="text-primary" /> Abstract
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {paper.abstract}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews Section (Visible to Author if Published/Rejected, or if Editor provided remarks) */}
                        {(paper.reviewRemark || (paper.reviewers && paper.reviewers.length > 0)) && (
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <MessageSquare size={18} className="text-primary" /> Review Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {paper.reviewRemark && (
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                                                <AlertCircle size={14} /> Editor's Remarks
                                            </h4>
                                            <p className="text-blue-800 text-sm leading-relaxed">
                                                {paper.reviewRemark}
                                            </p>
                                        </div>
                                    )}

                                    {/* Only show detailed reviews if allowed (e.g., status is determined) */}
                                    {['PUBLISHED', 'REJECTED', 'UNDER_REVIEW'].includes(paper.status) && paper.reviewers?.map((review, idx) => (
                                        (review.status === 'REVIEWED' || user.role === 'admin') && (
                                            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Reviewer {idx + 1}</span>
                                                    {review.recommendation && (
                                                        <Badge variant={review.recommendation === 'ACCEPTED' ? 'success' : 'destructive'} className="text-[10px]">
                                                            {review.recommendation}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 text-sm italic">
                                                    "{review.comments || 'No comments provided.'}"
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Actions & Meta */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full flex items-center gap-2 bg-slate-900 hover:bg-slate-800" onClick={handleViewPdf}>
                                    <Eye size={16} /> View PDF
                                </Button>
                                <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleDownload}>
                                    <Download size={16} /> Download Manuscript
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 ml-1">
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-white"></div>
                                        <p className="text-xs text-slate-400 font-medium">{new Date(paper.submittedAt).toLocaleDateString()}</p>
                                        <p className="text-sm font-medium text-slate-900">Submission Received</p>
                                    </div>
                                    {paper.status !== 'SUBMITTED' && (
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-0.5 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white"></div>
                                            <p className="text-xs text-slate-400 font-medium">Processing</p>
                                            <p className="text-sm font-medium text-slate-900">Under Review</p>
                                        </div>
                                    )}
                                    {(paper.status === 'PUBLISHED' || paper.status === 'REJECTED') && (
                                        <div className="relative">
                                            <div className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full ${paper.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-red-500'} ring-4 ring-white`}></div>
                                            <p className="text-xs text-slate-400 font-medium">Final Decision</p>
                                            <p className="text-sm font-medium text-slate-900 capitalize">{paper.status.toLowerCase()}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaperDetails;
