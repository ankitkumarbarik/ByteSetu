import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, BarChart3, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalPapers: 0,
        publishedPapers: 0,
        pendingPapers: 0,
        totalReviewers: 0,
        pendingReviewers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [papersRes, reviewersRes, pendingRevRes] = await Promise.all([
                    axiosInstance.get('/api/papers/all'),
                    axiosInstance.get('/api/users/reviewers'),
                    axiosInstance.get('/api/users/pending-reviewers')
                ]);

                const papers = papersRes.data;

                setStats({
                    totalPapers: papers.length,
                    publishedPapers: papers.filter(p => p.status === 'PUBLISHED').length,
                    pendingPapers: papers.filter(p => p.status === 'UNDER_REVIEW' || p.status === 'SUBMITTED').length,
                    totalReviewers: reviewersRes.data.length,
                    pendingReviewers: pendingRevRes.data.length
                });

            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: 'Total Submissions',
            value: stats.totalPapers,
            icon: FileText,
            trend: '+12%',
            desc: 'from last month',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100 ring-blue-500/10'
        },
        {
            title: 'Published Papers',
            value: stats.publishedPapers,
            icon: CheckCircle,
            trend: '+5%',
            desc: 'from last month',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100 ring-emerald-500/10'
        },
        {
            title: 'Active Reviewers',
            value: stats.totalReviewers,
            icon: Users,
            trend: '+2',
            desc: 'new this week',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100 ring-indigo-500/10'
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingReviewers,
            icon: AlertCircle,
            trend: 'Action',
            desc: 'Requires attention',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100 ring-amber-500/10'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 mt-1">Monitor journal performance and manage pending actions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-slate-600">System Operational</span>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex shadow-sm hover:bg-slate-50">
                        <BarChart3 size={16} className="mr-2 text-slate-500" /> Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => (
                    <Card key={idx} className={`border ${card.border} shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <card.icon className={`h-24 w-24 ${card.color}`} />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{loading ? '-' : card.value}</div>
                            <div className="flex items-center text-xs font-medium">
                                <span className={`flex items-center ${card.trend === 'Action' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'}`}>
                                    {card.trend !== 'Action' && <TrendingUp size={12} className="mr-1" />}
                                    {card.trend}
                                </span>
                                <span className="text-slate-400 ml-2">{card.desc}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <ShieldCheck className="text-primary" size={20} />
                            </div>
                            Administrative Actions
                        </CardTitle>
                        <CardDescription>Common tasks and management shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <Link to="/admin/pending-reviewers" className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-start justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
                            <div className="space-y-1 relative z-10">
                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Approve Reviewers</h3>
                                <p className="text-sm text-slate-500">Review and approve new reviewer applications.</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors relative z-10">
                                <ArrowUpRight size={18} />
                            </div>
                        </Link>

                        <Link to="/admin/papers" className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-start justify-between relative overflow-hidden">
                             <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
                            <div className="space-y-1 relative z-10">
                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Manage Submissions</h3>
                                <p className="text-sm text-slate-500">View all papers and oversee review processes.</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors relative z-10">
                                <ArrowUpRight size={18} />
                            </div>
                        </Link>

                        <Link to="/admin/reviewers" className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-start justify-between relative overflow-hidden">
                             <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
                            <div className="space-y-1 relative z-10">
                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Reviewer Database</h3>
                                <p className="text-sm text-slate-500">Manage existing reviewer accounts and roles.</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors relative z-10">
                                <ArrowUpRight size={18} />
                            </div>
                        </Link>

                        <div className="group p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all duration-300 flex items-start justify-between cursor-not-allowed opacity-60 relative overflow-hidden">
                            <div className="space-y-1 relative z-10">
                                <h3 className="font-bold text-slate-700">System Settings</h3>
                                <p className="text-sm text-slate-500">Configure journal parameters (Coming Soon).</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health / Notices */}
                <Card className="shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Activity size={120} />
                    </div>
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Activity size={20} className="text-emerald-400" /> System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                         <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <h4 className="font-semibold text-sm text-blue-200 mb-2 flex items-center gap-2">
                                <Clock size={14} /> Scheduled Maintenance
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                System maintenance scheduled for <span className="text-white font-semibold">Sunday, 2:00 AM UTC</span>.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-400">Server Load</span>
                                    <span className="text-emerald-400">12%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[12%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-400">Storage Usage</span>
                                    <span className="text-blue-400">45%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminOverview;
