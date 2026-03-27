// ============================================================
// ResearcherDashboard.tsx — Researcher Dashboard
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { motion, Variants } from "framer-motion";

type Study = {
    id: string;
    title: string;
    description: string;
    status: string;
};

type Application = {
    id: string;
    status: string;
    user: {
        name: string;
        email: string;
    };
    study: {
        title: string;
    };
    createdAt: string;
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ResearcherDashboard() {
    const [studies, setStudies] = useState<Study[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [showStudiesPanel, setShowStudiesPanel] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const [studiesRes, appsRes] = await Promise.all([
                api.get("/researcher/studies"),
                api.get("/researcher/applications")
            ]);
            setStudies(studiesRes.data);
            setApplications(appsRes.data);
        } catch (error: any) {
            console.error("Dashboard fetch error:", error);
            setErrorMsg("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApplicationAction = async (id: string, action: "ACCEPTED" | "REJECTED") => {
        try {
            await api.patch(`/researcher/applications/${id}`, { status: action });
            // refresh applications after update
            await fetchData();
        } catch (error) {
            console.error(`Failed to ${action} application:`, error);
            alert(`Failed to update application status.`);
        }
    };

    // calculate Stats
    const totalStudies = studies.length;
    const totalApplicants = applications.length;
    const acceptedApplicants = applications.filter((app) => app.status === "ACCEPTED").length;
    const acceptanceRate = totalApplicants > 0
        ? Math.round((acceptedApplicants / totalApplicants) * 100)
        : 0;

    if (loading) {
        return <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">Loading dashboard...</main>;
    }

    if (errorMsg) {
        return <main className="min-h-screen bg-zinc-950 text-red-400 flex items-center justify-center p-8">{errorMsg}</main>;
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 right-[20%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md p-6 rounded-3xl">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Researcher Dashboard</h1>
                    <Link to="/researcher/studies/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-primary text-zinc-950 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] h-11 px-6">
                        + New Study
                    </Link>
                </header>

                {/* Stats Section */}
                <motion.section 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <motion.button
                        type="button"
                        onClick={() => setShowStudiesPanel((prev) => !prev)}
                        variants={fadeInUp}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden group transition-colors hover:border-primary/40"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <h3 className="text-zinc-500 font-medium text-sm mb-2 uppercase tracking-wide">Total Studies</h3>
                        <p className="text-4xl font-bold text-zinc-100">{totalStudies}</p>
                        <p className="text-xs text-zinc-500 mt-2">Click to {showStudiesPanel ? "hide" : "view"} studies</p>
                    </motion.button>
                    <motion.div variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <h3 className="text-zinc-500 font-medium text-sm mb-2 uppercase tracking-wide">Total Applicants</h3>
                        <p className="text-4xl font-bold text-zinc-100">{totalApplicants}</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <h3 className="text-zinc-500 font-medium text-sm mb-2 uppercase tracking-wide">Acceptance Rate</h3>
                        <p className="text-4xl font-bold text-emerald-400">{acceptanceRate}%</p>
                    </motion.div>
                </motion.section>

                {showStudiesPanel && (
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <span className="w-2 h-6 rounded-full bg-primary"></span>
                                Your Studies
                            </h2>
                            <Link
                                to="/researcher/studies/new"
                                className="text-sm font-medium text-primary hover:text-emerald-400 transition-colors"
                            >
                                + Add new study
                            </Link>
                        </div>

                        {studies.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No studies created yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {studies.map((study) => (
                                    <div key={study.id} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-zinc-100">{study.title}</h3>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border border-zinc-700 text-zinc-400 bg-zinc-800/70">
                                                {study.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-2 line-clamp-3">
                                            {study.description || "No description provided."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                )}

                {/* Applications Table */}
                <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl overflow-hidden backdrop-blur-md">
                    <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                            <span className="w-2 h-6 rounded-full bg-primary"></span>
                            Recent Applications
                        </h2>
                    </div>

                    {applications.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            No applications received yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-b border-zinc-800/60">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Applicant</th>
                                        <th className="px-6 py-4 font-medium">Study</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={app.id} 
                                            className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-zinc-200">{app.user.name || "Unknown"}</div>
                                                <div className="text-zinc-500 mt-0.5">{app.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300 font-medium">{app.study.title}</td>
                                            <td className="px-6 py-4 text-zinc-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    app.status === "ACCEPTED" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : 
                                                    app.status === "REJECTED" ? "bg-red-400/10 text-red-400 border-red-400/20" : 
                                                    "bg-zinc-800 text-zinc-300 border-zinc-700"
                                                }`}>
                                                    {app.status === "PENDING" ? "● Pending" : app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {app.status === "PENDING" && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleApplicationAction(app.id, "ACCEPTED")}
                                                            className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-zinc-950 border border-emerald-400/20 font-medium rounded-lg transition-colors text-xs"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleApplicationAction(app.id, "REJECTED")}
                                                            className="px-3 py-1.5 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white border border-red-400/20 font-medium rounded-lg transition-colors text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
