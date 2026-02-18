import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { FileText, UserPlus, Trash2, Check, X, Search, Filter, ChevronDown, ChevronUp, AlertCircle, Eye, CheckCircle, XCircle, Download } from 'lucide-react';

const AdminPapers = () => {
    const [papers, setPapers] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [filteredPapers, setFilteredPapers] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [selectedReviewers, setSelectedReviewers] = useState({});

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState({ open: false, paperId: null, reviewerId: null });
    const [decisionDialog, setDecisionDialog] = useState({ open: false, paperId: null, decision: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, paperId: null });
    const [messageDialog, setMessageDialog] = useState({ open: false, title: '', message: '', type: 'info' });
    const [expandedPaperId, setExpandedPaperId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let result = papers;
        if (statusFilter !== 'ALL') {
            result = result.filter(p => p.status === statusFilter);
        }
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(lowerTerm) ||
                p.authorId?.name.toLowerCase().includes(lowerTerm)
            );
        }
        setFilteredPapers(result);
    }, [papers, statusFilter, searchTerm]);

    const fetchData = async () => {
        try {
            const [papersRes, reviewersRes] = await Promise.all([
                axiosInstance.get('/api/papers/all'),
                axiosInstance.get('/api/users/reviewers')
            ]);
            setPapers(papersRes.data);
            setReviewers(reviewersRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const showMessage = (title, message, type = 'info') => {
        setMessageDialog({ open: true, title, message, type });
    };

    const handleAssign = async (paperId) => {
        const reviewerId = selectedReviewers[paperId];
        if (!reviewerId) return;

        try {
            setProcessingId(paperId);
            await axiosInstance.post('/api/papers/assign', { paperId, reviewerId });
            fetchData();
            setSelectedReviewers(prev => ({ ...prev, [paperId]: '' }));
            showMessage("Success", "Reviewer assigned successfully", "success");
        } catch {
            showMessage("Error", "Failed to assign reviewer", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveReviewer = async () => {
        const { paperId, reviewerId } = confirmDialog;
        if (!paperId || !reviewerId) return;

        try {
            setProcessingId(paperId);
            await axiosInstance.post('/api/papers/remove-reviewer', { paperId, reviewerId });
            fetchData();
            setConfirmDialog({ open: false, paperId: null, reviewerId: null });
            showMessage("Success", "Reviewer removed successfully", "success");
        } catch {
            showMessage("Error", "Failed to remove reviewer", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecision = (paperId, decision) => {
        setDecisionDialog({ open: true, paperId, decision });
    };

    const executeDecision = async () => {
        const { paperId, decision } = decisionDialog;
        if (!paperId || !decision) return;

        try {
            setProcessingId(paperId);
            await axiosInstance.post('/api/papers/decision', { paperId, decision });
            fetchData();
            setDecisionDialog({ open: false, paperId: null, decision: null });
            showMessage("Success", `Paper ${decision === 'PUBLISH' ? 'Published' : 'Rejected'} successfully`, "success");
        } catch {
            showMessage("Error", "Failed to record decision", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeletePaper = async () => {
        const { paperId } = deleteDialog;
        if (!paperId) return;

        try {
            setProcessingId(paperId);
            await axiosInstance.delete(`/api/papers/${paperId}`);
            fetchData();
            setDeleteDialog({ open: false, paperId: null });
            showMessage("Success", "Paper deleted successfully", "success");
        } catch {
            showMessage("Error", "Failed to delete paper", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDownloadPdf = async (paper) => {
        try {
            const response = await axiosInstance.get(`/api/papers/stream/${paper._id}`, {
                responseType: 'blob',
            });

            // Create a blob URL
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename based on title
            const filename = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            showMessage("Error", "Failed to download paper", "error");
        }
    };

    const handleViewPdf = (paperId) => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/papers/stream/${paperId}`, '_blank');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-500/20';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200 ring-red-500/20';
            case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200 ring-amber-500/20';
            default: return 'bg-blue-100 text-blue-800 border-blue-200 ring-blue-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Manage Submissions</h1>
                    <p className="text-slate-500 mt-1">Oversee the review process and make publication decisions.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search papers or authors..."
                            className="pl-9 bg-white border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <div className="relative">
                            <select
                                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredPapers.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Filter className="text-slate-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No papers found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredPapers.map(paper => (
                        <Card key={paper._id} className={`overflow-hidden transition-all duration-300 border border-slate-200 ${expandedPaperId === paper._id ? 'shadow-lg ring-1 ring-primary/10' : 'shadow-sm hover:shadow-md'}`}>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-start justify-between md:justify-start gap-3">
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ring-2 flex items-center gap-1.5 uppercase tracking-wide w-fit ${getStatusStyle(paper.status)}`}>
                                                {paper.status === 'PUBLISHED' && <Check size={12} />}
                                                {paper.status === 'REJECTED' && <X size={12} />}
                                                {paper.status.replace('_', ' ')}
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium md:hidden">{new Date(paper.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                            {paper.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {paper.authorId?.name?.charAt(0) || 'A'}
                                                </div>
                                                {paper.authorId?.name}
                                            </span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="hidden md:inline font-medium">Submitted on {new Date(paper.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => handleViewPdf(paper._id)} className="rounded-lg hover:bg-slate-50 hover:text-primary hover:border-primary/20 transition-all">
                                            <Eye size={16} className="mr-2" /> View PDF
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleDownloadPdf(paper)} className="rounded-lg hover:bg-slate-200 transition-all">
                                            <Download size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpandedPaperId(expandedPaperId === paper._id ? null : paper._id)}
                                            className="ml-auto rounded-lg hover:bg-slate-100"
                                        >
                                            {expandedPaperId === paper._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </Button>
                                    </div>
                                </div>

                                {expandedPaperId === paper._id && (
                                    <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid md:grid-cols-3 gap-8">
                                            <div className="md:col-span-2 space-y-8">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <FileText size={14} /> Abstract
                                                    </h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-5 rounded-xl border border-slate-100/60">
                                                        {paper.abstract}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                            <UserPlus size={14} /> Reviewers ({paper.reviewers?.length || 0})
                                                        </h4>
                                                    </div>

                                                    {paper.reviewers?.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {paper.reviewers.map((rev, idx) => (
                                                                <div key={idx} className="flex justify-between items-start p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="font-bold text-slate-800 text-sm">{rev.reviewerId?.name}</div>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rev.status === 'REVIEWED'
                                                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                                                }`}>
                                                                                {rev.status}
                                                                            </span>
                                                                        </div>

                                                                        {rev.status === 'REVIEWED' ? (
                                                                            <div className="space-y-2">
                                                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${rev.recommendation === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                                        rev.recommendation === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                                            'bg-orange-50 text-orange-700 border-orange-100'
                                                                                    }`}>
                                                                                    {rev.recommendation === 'ACCEPTED' && <CheckCircle size={12} />}
                                                                                    {rev.recommendation === 'REJECTED' && <XCircle size={12} />}
                                                                                    {rev.recommendation}
                                                                                </span>
                                                                                {rev.remark && (
                                                                                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg italic border-l-2 border-slate-300">
                                                                                        "{rev.remark}"
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-slate-400 italic">Review pending...</p>
                                                                        )}
                                                                    </div>
                                                                    {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                            onClick={() => setConfirmDialog({ open: true, paperId: paper._id, reviewerId: rev.reviewerId?._id || rev.reviewerId })}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                                                            No reviewers assigned yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-blue-600"></div>
                                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Actions</h4>

                                                        <div className="space-y-5">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold text-slate-500">Assign Reviewer</Label>
                                                                <div className="flex gap-2">
                                                                    <select
                                                                        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                                                        value={selectedReviewers[paper._id] || ''}
                                                                        onChange={(e) => setSelectedReviewers(prev => ({ ...prev, [paper._id]: e.target.value }))}
                                                                    >
                                                                        <option value="">Select Reviewer...</option>
                                                                        {reviewers
                                                                            .filter(r => !paper.reviewers?.some(pr => (pr.reviewerId?._id || pr.reviewerId) === (r._id)))
                                                                            .map(r => (
                                                                                <option key={r._id} value={r._id}>{r.name}</option>
                                                                            ))
                                                                        }
                                                                    </select>
                                                                    <Button
                                                                        size="sm"
                                                                        className="rounded-lg shadow-sm hover:shadow"
                                                                        onClick={() => handleAssign(paper._id)}
                                                                        disabled={!selectedReviewers[paper._id] || processingId === paper._id}
                                                                    >
                                                                        <UserPlus size={16} />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                                                                <Button
                                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                                                                    size="sm"
                                                                    onClick={() => handleDecision(paper._id, 'PUBLISH')}
                                                                    disabled={processingId === paper._id}
                                                                >
                                                                    <Check size={16} className="mr-2" /> Publish
                                                                </Button>
                                                                <Button
                                                                    className="w-full shadow-md shadow-red-500/20"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDecision(paper._id, 'REJECT')}
                                                                    disabled={processingId === paper._id}
                                                                >
                                                                    <X size={16} className="mr-2" /> Reject
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                                                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <Trash2 size={14} /> Danger Zone
                                                    </h4>
                                                    <p className="text-xs text-red-700 mb-3">Irreversibly remove this submission from the system.</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                                                        onClick={() => setDeleteDialog({ open: true, paperId: paper._id })}
                                                    >
                                                        Delete Submission
                                                    </Button>
                                                </div>

                                                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <AlertCircle size={14} /> Review Status
                                                    </h4>
                                                    <div className="space-y-3 text-sm text-blue-800">
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600/80">Required:</span>
                                                            <span className="font-bold">2 Reviews</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600/80">Completed:</span>
                                                            <span className="font-bold">{paper.reviewers?.filter(r => r.status === 'REVIEWED').length || 0} Reviews</span>
                                                        </div>
                                                        <div className="w-full bg-blue-200/50 rounded-full h-2 mt-2 overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min(100, ((paper.reviewers?.filter(r => r.status === 'REVIEWED').length || 0) / 2) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Remove Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, paperId: null, reviewerId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Removal</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this reviewer from the paper? They will be notified of the cancellation.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog({ open: false, paperId: null, reviewerId: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRemoveReviewer}>Remove Reviewer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decision Confirmation Dialog */}
            <Dialog open={decisionDialog.open} onOpenChange={(open) => !open && setDecisionDialog({ ...decisionDialog, open: false })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Decision</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className={`p-4 rounded-xl flex items-start gap-4 ${decisionDialog.decision === 'PUBLISH' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-red-50 text-red-900 border border-red-100'}`}>
                            {decisionDialog.decision === 'PUBLISH' ? <CheckCircle size={24} className="text-emerald-600 shrink-0" /> : <AlertCircle size={24} className="text-red-600 shrink-0" />}
                            <div>
                                <h4 className="font-bold text-lg">You are about to {decisionDialog.decision === 'PUBLISH' ? 'PUBLISH' : 'REJECT'} this paper.</h4>
                                <p className="text-sm mt-1 opacity-90 leading-relaxed">This action is final and recorded in the system. The author will be notified immediately.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setDecisionDialog({ ...decisionDialog, open: false })}>Cancel</Button>
                        <Button
                            className={decisionDialog.decision === 'PUBLISH' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'}
                            onClick={executeDecision}
                        >
                            Confirm Decision
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Paper Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, paperId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle size={20} /> Delete Submission?
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the paper record and remove the file from storage.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, paperId: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeletePaper}>Permanently Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generic Message Dialog */}
            <Dialog open={messageDialog.open} onOpenChange={(open) => !open && setMessageDialog({ ...messageDialog, open: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={messageDialog.type === 'error' ? 'text-red-600' : 'text-slate-900'}>
                            {messageDialog.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-slate-600">
                        {messageDialog.message}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setMessageDialog({ ...messageDialog, open: false })}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPapers;
