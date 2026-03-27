// ============================================================
// Applications.tsx — Participant Applications List
// ============================================================

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";

interface Application {
    id: string;
    status: "APPLIED" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    study: {
        id: string;
        title: string;
        description: string;
        compensation: number;
        researcher: {
            user: {
                name: string;
                email: string;
            }
        }
    }
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Applications() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        api.get<Application[]>("/participant/applications")
            .then(res => setApplications(res.data))
            .catch(err => {
                console.error(err);
                setErrorMsg("Failed to load your applications. Please try again.");
            })
            .finally(() => setLoading(false));
    }, []);

    const withdrawApplication = async (appId: string) => {
        if (!confirm("Are you sure you want to withdraw this application?")) return;
        try {
            await api.delete(`/applications/${appId}`);
            setApplications(prev => prev.filter(app => app.id !== appId));
        } catch (err) {
            console.error(err);
            alert("Failed to withdraw application.");
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "ACCEPTED": return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <CheckCircle size={14} /> };
            case "REJECTED": return { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: <XCircle size={14} /> };
            default: return { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <Clock size={14} /> };
        }
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 md:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-primary transition-colors mb-4 text-sm font-medium gap-2">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                        My Applications
                    </h1>
                    <p className="text-zinc-500 mt-2">Track the status of the studies you've applied to.</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-6 font-medium text-sm">
                        {errorMsg}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-3xl border border-zinc-800/50 bg-zinc-900/30 p-6 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-zinc-700 p-12 text-center bg-zinc-900/20 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">📝</div>
                        <p className="text-zinc-300 font-medium text-lg">No Applications Yet</p>
                        <p className="text-sm text-zinc-500 mt-2">
                            You haven't applied to any studies. <Link to="/studies" className="text-primary hover:text-emerald-400 underline underline-offset-4">Browse studies</Link> to get started.
                        </p>
                    </div>
                ) : (
                    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                        {applications.map(app => {
                            const config = getStatusConfig(app.status);
                            return (
                                <motion.div key={app.id} variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-700 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                                                {config.icon} {app.status}
                                            </span>
                                            <span className="text-xs text-zinc-500 font-medium">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <Link to={`/studies/${app.study.id}`} className="block text-xl font-bold text-zinc-100 hover:text-primary transition-colors">
                                            {app.study.title}
                                        </Link>
                                        <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                                            {app.study.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1.5 object-contain">
                                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">
                                                    {app.study.researcher.user.name?.charAt(0) || "R"}
                                                </div>
                                                {app.study.researcher.user.name}
                                            </span>
                                            <span className="text-emerald-400 font-medium">
                                                {app.study.compensation === 0 ? "Unpaid" : `$${(app.study.compensation / 100).toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800/60 pt-4 md:pt-0 md:pl-6">
                                        <Link to={`/studies/${app.study.id}`} className="px-5 py-2.5 bg-zinc-800 text-zinc-100 text-sm font-semibold rounded-xl hover:bg-zinc-700 transition-colors w-full md:w-auto text-center">
                                            View Study
                                        </Link>
                                        {app.status === "APPLIED" && (
                                            <button onClick={() => withdrawApplication(app.id)} className="px-5 py-2.5 bg-red-500/10 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-colors w-full md:w-auto text-center">
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </main>
    )
}
