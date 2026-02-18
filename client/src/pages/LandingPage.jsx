import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Button } from '../components/ui/button';
import {
    BookOpen, CheckCircle, Globe, Award, Zap, Search, Shield, Mail, ArrowRight,
    Star, LogOut, LayoutDashboard, FileText, Calendar, User, AlignLeft,
    BarChart3, Users, Book, Clock, MapPin, Quote, ExternalLink, Activity, ChevronRight
} from 'lucide-react';

const LandingPage = () => {
    const { user, logout } = useAuth();
    const [latestPapers, setLatestPapers] = useState([]);

    useEffect(() => {
        const fetchLatestPapers = async () => {
            try {
                const res = await axiosInstance.get('/api/papers/published');
                // Sort by date descending and take top 3
                const sorted = res.data.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)).slice(0, 3);
                setLatestPapers(sorted);
            } catch (err) {
                console.error("Error fetching latest papers", err);
            }
        };
        fetchLatestPapers();
    }, []);

    return (
        <div className="font-serif text-slate-800 bg-slate-50/50 min-h-screen flex flex-col">
            {/* 1. Header & Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-slate-900 text-white p-2 rounded-lg group-hover:bg-primary transition-colors duration-300">
                            <BookOpen size={22} />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight font-heading group-hover:text-primary transition-colors">ByteSetu</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link to="/published-papers" className="hover:text-primary transition-colors relative group py-2">
                            Journal
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/published-papers" className="hover:text-primary transition-colors relative group py-2">
                            Publications
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/submit-paper" className="hover:text-primary transition-colors relative group py-2">
                            For Authors
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <a href="#about" className="hover:text-primary transition-colors relative group py-2">
                            About Us
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Button variant="ghost" className="hidden sm:flex text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium" onClick={logout}>
                                    <LogOut size={18} className="mr-2" /> Logout
                                </Button>
                                <Button asChild className="px-6 bg-slate-900 hover:bg-white hover:text-black text-white shadow-md transition-all duration-300">
                                    <Link to={`/${user.role}`}>
                                        <LayoutDashboard size={18} className="mr-2" /> Dashboard
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="hidden sm:flex text-slate-600 hover:text-primary hover:bg-blue-50 font-medium transition-colors">
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button asChild className="px-6 bg-slate-900 hover:bg-white hover:text-black text-white shadow-md transition-all duration-300">
                                    <Link to="/register">Submit Manuscript</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* 2. Hero Section */}
                <section className="relative pt-32 pb-40 bg-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-8">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Accepting Submissions for Vol. 12
                        </div>

                        <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 leading-[1.15] tracking-tight mb-8">
                            Accelerating Scientific <span className="text-primary/90">Discovery</span>
                        </h1>

                        <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto font-light">
                            ByteSetu is a premier open-access journal dedicated to the rigorous peer-review and rapid publication of fundamental and applied research.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <Button asChild size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-white hover:text-black text-white shadow-lg transition-all duration-300">
                                <Link to="/submit-paper">Submit Manuscript <ArrowRight className="ml-2 h-5 w-5" /></Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-300 bg-white hover:bg-black hover:text-white text-slate-700 transition-all duration-300">
                                <Link to="/published-papers">Read Journal</Link>
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-8 border-t border-slate-100 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-slate-400 font-medium text-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <span className="flex items-center gap-2"><Globe size={18} /> Indexed in Google Scholar</span>
                            <span className="flex items-center gap-2"><Shield size={18} /> COPE Compliant</span>
                            <span className="flex items-center gap-2"><FileText size={18} /> DOI Assigned</span>
                            <span className="flex items-center gap-2"><CheckCircle size={18} /> Open Access</span>
                        </div>
                    </div>
                </section>

                {/* 3. Why Choose ByteSetu */}
                <section className="py-32 bg-slate-50 border-y border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">Why Choose ByteSetu?</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                We prioritize integrity, speed, and visibility to ensure your research makes the maximum impact.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: Shield, title: "Transparent Review", desc: "Rigorous double-blind peer review process ensures unbiased evaluation and high quality." },
                                { icon: Globe, title: "Global Reach", desc: "Your research is immediately available to a global audience with open-access licensing." },
                                { icon: Zap, title: "Rapid Decision", desc: "Efficient editorial workflow delivers a first decision in an average of 21 days." },
                                { icon: Award, title: "High Impact", desc: "Indexed in major databases to maximize citations and academic recognition." }
                            ].map((feature, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6">
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. How It Works (Process) */}
                <section className="py-32 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">Publication Process</h2>
                            <p className="text-slate-600">A streamlined workflow designed for authors.</p>
                        </div>

                        <div className="relative">
                            {/* Connector Line */}
                            <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

                            <div className="grid md:grid-cols-4 gap-8">
                                {[
                                    { step: "01", title: "Submission", desc: "Submit your manuscript via our secure online portal." },
                                    { step: "02", title: "Editorial Check", desc: "Initial screening for scope, plagiarism, and formatting." },
                                    { step: "03", title: "Peer Review", desc: "Evaluation by expert reviewers in your specific field." },
                                    { step: "04", title: "Publication", desc: "Accepted papers are copy-edited and published immediately." }
                                ].map((step, i) => (
                                    <div key={i} className="relative bg-white pt-4">
                                        <div className="w-16 h-16 bg-white border-4 border-slate-50 text-slate-900 font-bold text-xl rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                                            {step.step}
                                        </div>
                                        <div className="text-center px-4">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                            <p className="text-sm text-slate-500">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Latest Publications */}
                {latestPapers.length > 0 && (
                    <section className="py-32 bg-slate-50 border-y border-slate-100">
                        <div className="container mx-auto px-6">
                            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                                <div>
                                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Latest Publications</h2>
                                    <p className="text-slate-600">Recent breakthrough research available now.</p>
                                </div>
                                <Button asChild variant="outline" className="">
                                    <Link to="/published-papers">View All Papers <ArrowRight size={16} className="ml-2" /></Link>
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {latestPapers.map((paper) => (
                                    <div key={paper._id} className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
                                        <div className="mb-4">
                                            <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                Research Article
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors">
                                                <Link to={`/paper/${paper._id}`}>
                                                    {paper.title}
                                                </Link>
                                            </h3>
                                        </div>

                                        <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow font-serif">
                                            {paper.abstract}
                                        </p>

                                        <div className="pt-4 border-t border-slate-100 mt-auto">
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} />
                                                    <span className="font-medium truncate max-w-[120px]">{paper.authorId?.name || 'Author'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    <span>{paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString() : 'Just now'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 6. Journal Metrics */}
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Trusted by the Global <br />Research Community</h2>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                    Our metrics reflect our commitment to excellence, speed, and impact. We are proud to support researchers from over 120 countries.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: "Impact Factor", value: "7.85", icon: Activity },
                                        { label: "Acceptance Rate", value: "35%", icon: CheckCircle },
                                        { label: "Avg. Review Time", value: "21 Days", icon: Clock },
                                        { label: "Total Citations", value: "50k+", icon: Quote }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl">
                                            <div className="flex items-center gap-3 mb-2 text-primary-foreground">
                                                <stat.icon size={20} />
                                                <span className="font-bold text-2xl">{stat.value}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Globe size={20} /> Global Reach</h3>
                                {/* Simple CSS Map Representation */}
                                <div className="h-64 w-full bg-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-30">
                                        {/* Abstract dots representing map */}
                                        <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                                    </div>
                                    <div className="text-center z-10">
                                        <p className="text-4xl font-bold mb-2">120+</p>
                                        <p className="text-slate-300 text-sm">Countries Represented</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between text-sm text-slate-300">
                                    <span>United States</span>
                                    <span>United Kingdom</span>
                                    <span>India</span>
                                    <span>Germany</span>
                                    <span>Japan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Testimonials */}
                <section className="py-32 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">What Researchers Say</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { text: "The review process was incredibly rigorous yet fast. The editorial team was supportive throughout.", author: "Dr. Elena Gilbert", role: "Prof. of Computer Science, MIT" },
                                { text: "ByteSetu provides excellent visibility. My paper received citations within weeks of publication.", author: "James Chen", role: "AI Researcher, Stanford" },
                                { text: "A truly transparent and efficient platform for modern publishing. Highly recommended.", author: "Dr. Sarah Al-Fayed", role: "Data Scientist, Oxford" }
                            ].map((t, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Quote size={32} className="text-primary/20 mb-4" />
                                    <p className="text-slate-700 italic mb-6 leading-relaxed">"{t.text}"</p>
                                    <div>
                                        <p className="font-bold text-slate-900">{t.author}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* 8. Footer */}
            <footer id="about" className="bg-slate-900 text-slate-400 py-16 border-t-4 border-primary">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 text-white mb-6">
                                <BookOpen size={24} />
                                <span className="text-xl font-bold tracking-tight font-heading">ByteSetu</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                Advancing human knowledge through open science. We ensure that high-quality research is accessible to everyone, everywhere.
                            </p>
                            <div className="flex gap-4">
                                {/* Socials */}
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                                        <Globe size={14} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Journal</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">About the Journal</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Editorial Board</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Peer Review Policy</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Indexing & Metrics</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">For Authors</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><Link to="/submit-paper" className="hover:text-white transition-colors">Submit Manuscript</Link></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Author Guidelines</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Track Submission</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Article Processing Charges</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-secondary" /><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                        <p>&copy; {new Date().getFullYear()} ByteSetu Publishers. All rights reserved.</p>
                        <p>ISSN: 2049-3630 (Online) | DOI Prefix: 10.1080</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
