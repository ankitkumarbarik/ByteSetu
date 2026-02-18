import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Calendar, AlertCircle, CheckCircle, Clock, XCircle, ChevronRight, Download, Eye, Plus, ArrowUpRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthorDashboard = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const res = await axiosInstance.get('/api/papers/my-papers');
                setPapers(res.data);
            } catch (error) {
                console.error("Error fetching papers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500/10', icon: CheckCircle, label: 'Published' };
            case 'REJECTED':
                return { color: 'text-red-600 bg-red-50 border-red-100 ring-red-500/10', icon: XCircle, label: 'Rejected' };
            case 'UNDER_REVIEW':
                return { color: 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-500/10', icon: Clock, label: 'Under Review' };
            default:
                return { color: 'text-slate-600 bg-slate-50 border-slate-100 ring-slate-500/10', icon: FileText, label: 'Submitted' };
        }
    };

    const handleViewPdf = (paperId) => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/papers/stream/${paperId}`, '_blank');
    };

    const stats = [
        { label: 'Total Submissions', value: papers.length, icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        { label: 'Published', value: papers.filter(p => p.status === 'PUBLISHED').length, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { label: 'Under Review', value: papers.filter(p => p.status === 'UNDER_REVIEW').length, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        { label: 'Attention Needed', value: papers.filter(p => p.status === 'REJECTED').length, icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    ];

    return (
        <DashboardLayout role="author">
            <div className="space-y-6 animate-in fade-in duration-500 font-sans">
                {/* Header with Institutional Feel */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Author Workspace</h1>
                        <p className="text-slate-500 text-sm mt-1">Welcome back. Manage your manuscripts and track peer review status.</p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-sm" size="sm">
                        <Link to="/submit-paper" className="flex items-center gap-2">
                            <Plus size={16} strokeWidth={2.5} /> Submit New Manuscript
                        </Link>
                    </Button>
                </div>

                {/* Compact Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`w-10 h-10 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} strokeWidth={2} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content - Manuscript Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <FileText size={16} className="text-slate-400" /> My Manuscripts
                                </h2>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">View All Archives</Button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            ) : papers.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-slate-900 font-medium">No Manuscripts Found</h3>
                                    <p className="text-slate-500 text-sm mt-1 mb-4">You haven't submitted any papers yet.</p>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/submit-paper">Start Submission</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 w-1/2">Manuscript</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {papers.map((paper) => {
                                                const status = getStatusInfo(paper.status);
                                                return (
                                                    <tr key={paper._id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                                                {paper.title}
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-mono mt-1">ID: {paper._id.slice(-8).toUpperCase()}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${status.color}`}>
                                                                <status.icon size={12} /> {status.label}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {new Date(paper.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {paper.status === 'PUBLISHED' && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                                        title="Download Certificate"
                                                                        onClick={() => handleViewPdf(paper._id)}
                                                                    >
                                                                        <Download size={16} />
                                                                    </Button>
                                                                )}
                                                                <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                                                                    <Link to={`/paper/${paper._id}`}>View</Link>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-6">
                        {/* Author Resources */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                <BookOpen size={16} className="text-primary" /> Author Resources
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li>
                                    <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors group">
                                        <ChevronRight size={14} className="text-slate-400 group-hover:text-primary" /> Submission Guidelines
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors group">
                                        <ChevronRight size={14} className="text-slate-400 group-hover:text-primary" /> Formatting Templates
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors group">
                                        <ChevronRight size={14} className="text-slate-400 group-hover:text-primary" /> Revision Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors group">
                                        <ChevronRight size={14} className="text-slate-400 group-hover:text-primary" /> Copyright Agreement
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Submission Checklist */}
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-900 mb-3 text-sm">Submission Checklist</h3>
                            <div className="space-y-2">
                                {['Manuscript PDF (No Author Details)', 'Title Page (Separate)', 'Abstract (Max 250 words)', 'Keywords (3-5)'].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                        <div className="mt-0.5 min-w-[12px] h-3 w-3 rounded border border-slate-300 bg-white"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuthorDashboard;
