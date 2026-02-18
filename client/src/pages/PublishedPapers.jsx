import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Search, FileText, Calendar, User, ArrowRight, ExternalLink,
    Filter, BookOpen, ChevronRight, Download, Quote, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PublishedPapers = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const res = await axiosInstance.get('/api/papers/published');
                setPapers(res.data);
            } catch (err) {
                console.error("Error fetching published papers", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, []);

    const filteredPapers = papers.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authorId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-lg font-bold text-slate-900 tracking-tight font-heading">ByteSetu Journal</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link to="/submit-paper" className="hover:text-primary transition-colors">For Authors</Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-8">
                        {/* Search Widget */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Journal Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <Input
                                    placeholder="Keywords, Title, Author..."
                                    className="pl-9 h-9 bg-slate-50 border-slate-200 focus:border-primary rounded-md text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Browse Widget */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-slate-900 text-sm">Browse Journal</h3>
                            </div>
                            <div className="p-2">
                                <ul className="space-y-1">
                                    {['Current Issue', 'By Issue', 'By Subject', 'Author Index'].map((item) => (
                                        <li key={item}>
                                            <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-md transition-colors flex items-center justify-between group">
                                                {item}
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Call for Papers Widget */}
                        <div className="bg-slate-900 text-white p-5 rounded-lg shadow-md">
                            <h3 className="font-bold text-lg mb-2">Call for Papers</h3>
                            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
                                We are accepting submissions for Volume 12, Issue 3. Special focus on AI Ethics and Quantum Computing.
                            </p>
                            <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-white border-none">
                                <Link to="/submit-paper">Submit Manuscript</Link>
                            </Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-heading font-bold text-slate-900 pb-1">Published Research</h1>
                                <p className="text-sm text-slate-500">Showing {filteredPapers.length} results</p>
                            </div>
                            {/* Sort Mockup */}
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                                <span className="font-medium">Sort by:</span>
                                <select className="bg-transparent border-none font-medium focus:ring-0 cursor-pointer">
                                    <option>Newest First</option>
                                    <option>Oldest First</option>
                                    <option>Most Cited</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
                                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                                    <p className="mt-2 text-sm text-slate-500">Loading articles...</p>
                                </div>
                            ) : filteredPapers.length > 0 ? (
                                filteredPapers.map((paper) => (
                                    <div key={paper._id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                                            Research Article
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Open Access
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors font-heading leading-tight">
                                                        <Link to={`/paper/${paper._id}`}>
                                                            {paper.title}
                                                        </Link>
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="text-sm text-slate-500 font-medium">
                                                <span className="text-slate-900">{paper.authorId?.name || 'Unknown Author'}</span>
                                            </div>

                                            <div className="text-xs text-slate-500 font-mono border-l-2 border-primary/20 pl-3 py-0.5">
                                                ByteSetu J. Sci. Tech. • Vol. 12 • Pending Issue • {new Date(paper.publishedAt || Date.now()).getFullYear()}
                                            </div>

                                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 font-serif text-justify">
                                                {paper.abstract}
                                            </p>

                                            <div className="pt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 mt-2">
                                                <Button asChild variant="default" size="sm" className="h-8 bg-slate-900 hover:bg-white hover:text-black text-xs">
                                                    <Link to={`/paper/${paper._id}`}>View Full Text</Link>
                                                </Button>
                                                {paper.cloudinaryUrl && (
                                                    <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-black hover:text-white">
                                                        <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                                                            <Download size={12} className="mr-1.5" /> PDF
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-primary">
                                                    <Quote size={12} className="mr-1.5" /> Cite
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-primary ml-auto">
                                                    Abstract <ArrowRight size={12} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
                                    <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                                    <h3 className="text-base font-medium text-slate-900">No matching articles found</h3>
                                    <p className="text-sm text-slate-500">Try adjusting your search criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublishedPapers;
