import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UserCheck, UserX, Clock, Mail, BookOpen, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const AdminPendingReviewers = () => {
    const [pendingReviewers, setPendingReviewers] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/users/pending-reviewers');
            setPendingReviewers(res.data);
        } catch (error) {
            console.error("Error fetching pending reviewers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (userId, status) => {
        try {
            setProcessingId(userId);
            await axiosInstance.post('/api/users/reviewer-status', { userId, status });
            // Remove from list locally
            setPendingReviewers(prev => prev.filter(r => r._id !== userId));
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Pending Approvals</h1>
                <p className="text-slate-500 mt-1">Review applicant qualifications and approve new reviewers.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingReviewers.map(r => (
                    <Card key={r._id} className="overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group flex flex-col">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                            {r.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-900 leading-tight">{r.name}</CardTitle>
                                            <div className="flex items-center text-xs text-slate-500 font-medium mt-0.5">
                                                <Mail size={12} className="mr-1.5" /> {r.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ring-4 ring-amber-50/50 flex items-center gap-1.5">
                                    <Clock size={12} /> Pending
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 text-sm space-y-4 flex-1">
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <BookOpen size={14} className="text-primary" /> Qualifications
                                </div>
                                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed italic relative">
                                    <span className="absolute top-2 left-2 text-3xl text-slate-200 font-serif z-0">“</span>
                                    <span className="relative z-10">{r.qualifications}</span>
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/30 p-4 flex gap-3 border-t border-slate-100">
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 border-transparent"
                                size="sm"
                                onClick={() => handleStatus(r._id, 'APPROVED')}
                                disabled={processingId === r._id}
                            >
                                {processingId === r._id ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                ) : (
                                    <CheckCircle size={16} className="mr-2" />
                                )}
                                Approve
                            </Button>
                            <Button
                                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600"
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatus(r._id, 'REJECTED')}
                                disabled={processingId === r._id}
                            >
                                {processingId === r._id ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></span>
                                ) : (
                                    <XCircle size={16} className="mr-2" />
                                )}
                                Reject
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {pendingReviewers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                        <CheckCircle className="text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Pending Requests</h3>
                    <p className="max-w-xs text-center text-slate-500 text-sm">There are no new reviewer applications pending approval at this time.</p>
                </div>
            )}
        </div>
    );
};

export default AdminPendingReviewers;
