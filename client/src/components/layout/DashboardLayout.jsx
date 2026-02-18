import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    CheckSquare,
    BookOpen,
    Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const DashboardLayout = ({ children, role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = {
        admin: [
            { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
            { icon: Users, label: 'Reviewers', path: '/admin/reviewers' },
            { icon: FileText, label: 'Pending Approvals', path: '/admin/pending-reviewers' },
            { icon: BookOpen, label: 'All Papers', path: '/admin/papers' },
        ],
        reviewer: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/reviewer' },
            { icon: FileText, label: 'Assigned Papers', path: '/reviewer/assigned' },
            { icon: CheckSquare, label: 'Completed Reviews', path: '/reviewer/completed' },
        ],
        author: [
            { icon: LayoutDashboard, label: 'My Papers', path: '/author' },
            { icon: FileText, label: 'Submit New Paper', path: '/submit-paper' },
        ]
    };

    const currentNav = navItems[role] || [];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-slate-300
                    transform transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-950/30">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <BookOpen className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight font-heading">ByteSetu</span>
                    </Link>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-5rem)]">
                    <div>
                        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-2">
                            Menu
                        </div>
                        <nav className="space-y-1">
                            {currentNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path || (item.path !== role && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                                                : 'hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-slate-800/50">
                        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                            Settings
                        </div>
                        <nav className="space-y-1">
                             <button
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group hover:translate-x-1"
                            >
                                <Settings size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                                Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group hover:translate-x-1 mt-2"
                            >
                                <LogOut size={18} className="group-hover:text-red-300 transition-colors" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between transition-all duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        
                        {/* Search Bar (Optional) */}
                        <div className="hidden md:flex items-center relative w-64 lg:w-96">
                            <Search size={18} className="absolute left-3 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search papers, authors..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-xs text-slate-500 mt-1.5 font-medium capitalize">{user?.role}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 ring-2 ring-white cursor-pointer hover:scale-105 transition-transform duration-200">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
