// ============================================================
// Landing.tsx — Public Marketing Page
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, ClipboardCheck, Microscope, BookOpen, Star } from "lucide-react";
import { motion, Variants } from "framer-motion";
import api from "../lib/api";

type Study = {
    id: string;
    title: string;
    description: string;
    category: string;
    compensation: number;
    durationMinutes: number;
    format: string;
    researcher: {
        user: { name: string }
    };
};

// animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

export default function Landing() {
    const [featuredStudies, setFeaturedStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                const res = await api.get("/studies");
                const studies = Array.isArray(res.data) ? res.data : res.data?.studies ?? [];
                setFeaturedStudies(studies.slice(0, 3));
            } catch (error) {
                console.error("Failed to load featured studies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudies();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden border-b border-white/5">
                {/* Subtle Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="text-center max-w-4xl mx-auto"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20 shadow-[0_0_15px_inherit]">
                            <Star className="w-4 h-4" />
                            <span>The Future of Discovery</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-zinc-100">
                            Research That <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300 drop-shadow-[0_0_25px_rgba(74,222,128,0.3)]">Fits You</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Connect with university researchers, participate in cutting-edge studies, and get compensated for accelerating human knowledge.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            <Link
                                to="/signup?role=PARTICIPANT"
                                className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-zinc-950 bg-primary rounded-full hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] transition-all duration-300 w-full sm:w-auto"
                            >
                                Join as Participant
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/signup?role=RESEARCHER"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-zinc-900 border border-zinc-800 rounded-full hover:border-primary/50 hover:bg-zinc-800 transition-all duration-300 w-full sm:w-auto shadow-sm"
                            >
                                Post a Study
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-b border-white/5 bg-zinc-950/50 relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 gap-8 text-center"
                    >
                        <motion.div variants={fadeInUp} className="pt-8 md:pt-0">
                            <div className="text-5xl font-black mb-2 text-primary drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]">24/7</div>
                            <div className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Study Discovery</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">How It Works</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Three simple steps to start contributing to science and earning rewards.</p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { icon: Search, title: "1. Find Matches", desc: "Create a profile and let our AI algorithm match you with studies that fit your background." },
                            { icon: ClipboardCheck, title: "2. Apply & Participate", desc: "Review study details, apply with one click, and participate online or in-person." },
                            { icon: Star, title: "3. Get Rewarded", desc: "Help researchers achieve breakthroughs and receive compensation for your valuable time." }
                        ].map((step, i) => (
                            <motion.div key={i} variants={fadeInUp} className="relative group p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-primary/50 transition-colors">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                                <div className="w-16 h-16 bg-zinc-950 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(74,222,128,0.1)] border border-white/5">
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-100 mb-3">{step.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Featured Studies */}
            <section className="py-24 bg-zinc-950 border-t border-white/5 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }} variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">Featured Opportunities</h2>
                            <p className="text-lg text-zinc-400">Explore some of our latest research studies.</p>
                        </div>
                        <Link to="/studies" className="hidden sm:inline-flex text-primary hover:text-emerald-300 font-semibold items-center transition-colors">
                            View All Studies <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-zinc-900 rounded-3xl h-64 border border-zinc-800"></div>
                            ))}
                        </div>
                    ) : featuredStudies.length > 0 ? (
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredStudies.map(study => (
                                <motion.div key={study.id} variants={fadeInUp} className="group bg-zinc-900/80 rounded-3xl border border-zinc-800 hover:border-primary/40 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(74,222,128,0.15)]">
                                    <div className="flex justify-between items-start mb-5">
                                        <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {study.category}
                                        </span>
                                        <span className="font-bold text-primary flex items-center bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                            {study.compensation > 0 ? `$${(study.compensation / 100).toFixed(2)}` : 'Unpaid'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-100 mb-3 line-clamp-2 group-hover:text-primary transition-colors">{study.title}</h3>
                                    <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{study.description}</p>

                                    <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center text-zinc-500 text-sm font-medium">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            {study.format}
                                        </div>
                                        <Link to={`/studies/${study.id}`} className="text-sm font-semibold text-primary hover:text-emerald-300 inline-flex items-center transition-colors">
                                            Details <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-16 bg-zinc-900 rounded-3xl border border-dashed border-zinc-800">
                            <p className="text-zinc-500 text-lg">No active studies available at the moment.</p>
                        </div>
                    )}

                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/studies" className="inline-flex text-primary hover:text-emerald-300 font-semibold items-center p-3">
                            View All Studies <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-950 border-t border-zinc-900 py-12 mt-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 text-zinc-100 font-bold text-xl">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                                <Microscope className="w-5 h-5" />
                            </div>
                            ResearchMatch
                        </div>
                        <div className="flex gap-8 text-sm text-zinc-500">
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors">Contact</a>
                        </div>
                        <p className="text-sm text-zinc-600">© {new Date().getFullYear()} ResearchMatch.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
