import React, { useState, useEffect, useCallback } from 'react';

import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

import { FileText, CheckCircle, Clock, AlertCircle, Edit, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, Lock, Download } from 'lucide-react';

const ReviewerDashboard = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Dialog State
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [remark, setRemark] = useState('');
    const [recommendation, setRecommendation] = useState('ACCEPTED');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const { user: currentUser } = useAuth();

    const fetchAssignedPapers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/papers/assigned');
            setPapers(res.data);
        } catch (error) {
            console.error("Error fetching papers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignedPapers();
    }, [fetchAssignedPapers]);

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
        }
    };

    const handleViewPdf = (paperId) => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/papers/stream/${paperId}`, '_blank');
    };

    const submitReview = async () => {
        if (!selectedPaper) return;

        try {
            await axiosInstance.post('/api/papers/review', {
                paperId: selectedPaper._id,
                remark,
                recommendation
            });
            setDialogOpen(false);
            setSuccessDialogOpen(true);
            fetchAssignedPapers();
        } catch (error) {
            console.error("Review failed", error);
            // Ideally show a toast error here
        }
    };

    const openReviewDialog = (paper) => {
        if (paper.status === 'PUBLISHED') return;
        setSelectedPaper(paper);
        const myReview = paper.reviewers?.find(r => {
            const rId = r.reviewerId?._id || r.reviewerId;
            const uId = currentUser?._id || currentUser?.id;
            return String(rId) === String(uId);
        });

        if (myReview && myReview.status === 'REVIEWED') {
            setRemark(myReview.remark || '');
            setRecommendation(myReview.recommendation || 'ACCEPTED');
        } else {
            setRemark('');
            setRecommendation('ACCEPTED');
        }
        setDialogOpen(true);
    };

    // Filter Logic
    const getMyReview = (paper) => {
        return paper.reviewers?.find(r => {
            const rId = r.reviewerId?._id || r.reviewerId;
            const uId = currentUser?._id || currentUser?.id;
            return String(rId) === String(uId);
        });
    };

    const pendingPapers = papers.filter(p => {
        const myReview = getMyReview(p);
        return myReview && myReview.status === 'ASSIGNED';
    });

    const completedPapers = papers.filter(p => {
        const myReview = getMyReview(p);
        return myReview && myReview.status === 'REVIEWED';
    });

    const PaperCard = ({ paper, isCompleted }) => (
        <div key={paper._id} className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row gap-5">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                            {paper.category || 'Research Article'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            • Assigned {new Date(paper.submittedAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors font-heading leading-snug">
                        {paper.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-serif">
                        {paper.abstract}
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                        <Button variant="link" className="p-0 h-auto text-primary text-xs font-semibold hover:no-underline flex items-center gap-1" onClick={() => handleViewPdf(paper._id)}>
                            <ExternalLink size={12} /> View Manuscript PDF
                        </Button>
                        <Button variant="link" className="p-0 h-auto text-slate-500 text-xs font-semibold hover:no-underline hover:text-slate-800 flex items-center gap-1 transition-colors" onClick={() => handleDownloadPdf(paper)}>
                            <Download size={12} /> Download PDF
                        </Button>
                    </div>
                </div>

                <div className="sm:border-l sm:border-slate-100 sm:pl-5 flex flex-col justify-center min-w-[180px] gap-3">
                    {isCompleted ? (
                        <div className="space-y-3">
                            <div className={`px-3 py-2 rounded-md text-xs font-bold border flex items-center justify-center gap-2 ${getMyReview(paper)?.recommendation === 'ACCEPTED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : getMyReview(paper)?.recommendation === 'REJECTED'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {getMyReview(paper)?.recommendation === 'ACCEPTED' ? <ThumbsUp size={14} /> :
                                    getMyReview(paper)?.recommendation === 'REJECTED' ? <ThumbsDown size={14} /> : <AlertCircle size={14} />}
                                {getMyReview(paper)?.recommendation?.replace('_', ' ')}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReviewDialog(paper)}
                                className={`w-full text-xs h-8 ${paper.status === 'PUBLISHED' ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                                disabled={paper.status === 'PUBLISHED'}
                            >
                                {paper.status === 'PUBLISHED' ? (
                                    <>
                                        <Lock size={12} className="mr-1.5" /> Review Locked
                                    </>
                                ) : (
                                    <>
                                        <Edit size={12} className="mr-1.5" /> Edit Evaluation
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100 flex items-center justify-center gap-1.5">
                                <Clock size={12} /> Action Required
                            </div>
                            <Button
                                size="sm"
                                onClick={() => openReviewDialog(paper)}
                                className="w-full bg-slate-900 hover:bg-primary text-white shadow-sm transition-all h-9 text-xs"
                            >
                                <CheckCircle size={14} className="mr-1.5" /> Assess Manuscript
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout role="reviewer">
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 font-sans">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Reviewer Workspace</h1>
                            <p className="text-slate-500 text-sm mt-1">Manage assigned reviews and uphold scientific integrity.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm text-xs font-medium text-slate-600">
                                Pending: <span className="text-slate-900 font-bold">{pendingPapers.length}</span>
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm text-xs font-medium text-slate-600">
                                Completed: <span className="text-slate-900 font-bold">{completedPapers.length}</span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-sm font-medium transition-all">Pending Reviews</TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-sm font-medium transition-all">Review History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="space-y-4 focus-visible:outline-none">
                            {loading ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                            ) : pendingPapers.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-200">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <h3 className="text-slate-900 font-medium">All Caught Up</h3>
                                    <p className="text-slate-500 text-sm mt-1">You have no pending papers to review.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {pendingPapers.map(paper => <PaperCard key={paper._id} paper={paper} isCompleted={false} />)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4 focus-visible:outline-none">
                            {loading ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                            ) : completedPapers.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-200">
                                    <p className="text-slate-500 text-sm">No review history available.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {completedPapers.map(paper => <PaperCard key={paper._id} paper={paper} isCompleted={true} />)}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Resources */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                            Reviewer Guidelines
                        </h3>
                        <div className="prose prose-sm text-slate-600">
                            <p className="text-xs mb-3">Please ensure your review covers:</p>
                            <ul className="text-xs space-y-2 list-disc pl-4 marker:text-slate-300">
                                <li><strong>Originality:</strong> Is the work novel?</li>
                                <li><strong>Methodology:</strong> Are methods sound?</li>
                                <li><strong>Clarity:</strong> Is the writing clear?</li>
                                <li><strong>Significance:</strong> Does it impact the field?</li>
                            </ul>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <Button variant="outline" size="sm" className="w-full text-xs">Download Review Rubric</Button>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-lg p-5 shadow-md">
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><AlertCircle size={14} /> Ethical Standards</h3>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            Reviewers must declare any conflict of interest and treat all manuscripts as confidential documents.
                        </p>
                        <a href="#" className="text-xs font-bold text-white hover:underline">Read COPE Guidelines →</a>
                    </div>
                </div>

                {/* Submit Review Dialog (Preserved functionality, updated style) */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl rounded-lg">
                        <DialogHeader className="px-6 pt-6 pb-4 bg-slate-50 border-b border-slate-100">
                            <DialogTitle className="text-lg font-heading font-bold text-slate-900">Manuscript Evaluation</DialogTitle>
                            <CardDescription className="text-slate-500 text-xs">Target: <span className="font-medium text-slate-700">{selectedPaper?.title}</span></CardDescription>
                        </DialogHeader>
                        <div className="space-y-6 p-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MessageSquare size={16} /> Technical Review & Remarks
                                </Label>
                                <textarea
                                    className="flex min-h-[160px] w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 resize-none font-sans"
                                    placeholder="Provide detailed feedback for the authors..."
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <CheckCircle size={16} /> Final Recommendation
                                </Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['ACCEPTED', 'CHANGES_REQUIRED', 'REJECTED'].map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => setRecommendation(option)}
                                            className={`cursor-pointer rounded-md border p-3 text-center transition-all duration-200 relative overflow-hidden group ${recommendation === option
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            {recommendation === option && (
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary"></div>
                                            )}
                                            <div className="font-bold text-[10px] uppercase tracking-wider">{option.replace('_', ' ')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="px-6 pb-6 pt-2 gap-3 sm:gap-0 bg-white">
                            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-slate-100 text-slate-600 h-9 text-xs">Cancel</Button>
                            <Button onClick={submitReview} className="bg-slate-900 hover:bg-primary text-white shadow-sm transition-all h-9 text-xs">Submit Evaluation</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Success Dialog */}
                <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                    <DialogContent className="sm:max-w-[400px] border-0 shadow-2xl rounded-lg">
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
                                <CheckCircle size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-slate-900">Evaluation Submitted</h2>
                            <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">Thank you for your contribution to the peer review process.</p>
                            <Button className="w-full mt-4 py-5 text-sm" onClick={() => setSuccessDialogOpen(false)}>Return to Dashboard</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default ReviewerDashboard;
