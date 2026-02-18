import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { CheckCircle, Mail, Search, ShieldCheck, User, Filter, MoreHorizontal } from 'lucide-react';
import { Input } from '../../../components/ui/input';

const AdminReviewers = () => {
    const [reviewers, setReviewers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReviewers = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get('/api/users/reviewers');
                setReviewers(res.data);
            } catch (error) {
                console.error("Error fetching reviewers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviewers();
    }, []);

    const filteredReviewers = reviewers.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Reviewer Database</h1>
                    <p className="text-slate-500 mt-1">Manage the panel of experts and monitor their activity.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search reviewers..."
                            className="pl-9 bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 bg-white border-slate-200 text-slate-500 hover:text-primary rounded-xl">
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Active Reviewers</CardTitle>
                            <CardDescription className="text-slate-500">List of approved reviewers currently active in the system.</CardDescription>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 ring-2 ring-emerald-50/50">
                            <ShieldCheck size={14} /> {reviewers.length} Verified Experts
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-slate-500 font-medium">Loading directory...</p>
                        </div>
                    ) : filteredReviewers.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50/30">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                <Search className="text-slate-300" size={24} />
                            </div>
                            <h3 className="text-slate-900 font-bold mb-1">No reviewers found</h3>
                            <p className="text-slate-500 text-sm">No reviewers match your search criteria.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredReviewers.map((r) => (
                                <div key={r._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 group-hover:scale-110 transition-transform duration-300 shadow-sm relative overflow-hidden">
                                           {r.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900 leading-none text-base group-hover:text-primary transition-colors">{r.name}</p>
                                            <div className="flex items-center text-sm text-slate-500 font-medium">
                                                <Mail size={13} className="mr-1.5 text-slate-400" /> {r.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Role</p>
                                            <p className="text-sm font-semibold text-slate-700 capitalize bg-slate-100 px-2 py-0.5 rounded-md inline-block">{r.role.toLowerCase()}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                            <CheckCircle size={14} /> Active
                                        </div>

                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={20} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReviewers;
