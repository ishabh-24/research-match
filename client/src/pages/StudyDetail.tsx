// ============================================================
// StudyDetail.tsx — Single Study Page
// ============================================================

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, MapPin, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { decodeToken, getToken } from "../lib/auth";

type StudyDetailData = {
    id: string;
    title: string;
    description: string;
    category: string;
    format: "IN_PERSON" | "REMOTE" | "HYBRID";
    durationMinutes: number;
    sessions: number;
    compensation: number;
    compensationType: string;
    targetParticipants: number;
    minAge: number | null;
    maxAge: number | null;
    genderRequirement: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    tags: string[];
    instructions: string | null;
    researcher: {
        user: {
            name: string | null;
        };
    };
};

function formatCompensation(cents: number, type: string): string {
    if (cents === 0) return "Unpaid";
    const dollars = (cents / 100).toFixed(2);
    if (type === "gift_card") return `$${dollars} gift card`;
    if (type === "course_credit") return `$${dollars} course credit`;
    return `$${dollars}`;
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatLocation(study: StudyDetailData): string {
    if (study.format === "REMOTE") return "Remote";
    const parts = [study.city, study.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : study.country ?? "Location TBD";
}

export default function StudyDetail() {
    const { id } = useParams();
    const [study, setStudy] = useState<StudyDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = getToken();
    const decoded = token ? decodeToken(token) : null;
    const dashboardPath =
        decoded?.role === "RESEARCHER"
            ? "/researcher/dashboard"
            : decoded?.role === "PARTICIPANT"
                ? "/dashboard"
                : "/studies";

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const fetchStudy = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get<StudyDetailData>(`/studies/${id}`);
                if (!cancelled) {
                    if (!data) {
                        setError("Study not found.");
                    } else {
                        setStudy(data);
                    }
                }
            } catch {
                if (!cancelled) {
                    setError("Could not load this study.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchStudy();
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-zinc-900/40 border border-zinc-800/60 p-6 md:p-8 rounded-3xl max-w-3xl w-full backdrop-blur-md relative overflow-hidden text-left"
            >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-primary/0" />

                {loading ? (
                    <div className="py-16 text-center text-zinc-400">Loading study details...</div>
                ) : error || !study ? (
                    <div className="py-10 text-center">
                        <h1 className="text-2xl font-bold text-zinc-100 mb-3">{error ?? "Study not found"}</h1>
                        <Link
                            to="/studies"
                            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-zinc-100 text-zinc-950 hover:bg-primary transition-colors h-11 px-6 shadow-sm group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Studies
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300">
                                        {study.category}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-primary/30 bg-primary/10 text-primary">
                                        {study.format === "IN_PERSON" ? "In Person" : study.format}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">{study.title}</h1>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {study.researcher?.user?.name ?? "Anonymous Researcher"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest">Compensation</p>
                                <p className="text-xl font-bold text-emerald-400">
                                    {formatCompensation(study.compensation, study.compensationType)}
                                </p>
                            </div>
                        </div>

                        <p className="text-zinc-300 leading-relaxed mb-6">{study.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300 flex items-center gap-2">
                                <Clock size={16} className="text-zinc-500" /> {formatDuration(study.durationMinutes)}
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300 flex items-center gap-2">
                                <Calendar size={16} className="text-zinc-500" /> {study.sessions} session{study.sessions > 1 ? "s" : ""}
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300 flex items-center gap-2">
                                <MapPin size={16} className="text-zinc-500" /> {formatLocation(study)}
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300 flex items-center gap-2">
                                <Users size={16} className="text-zinc-500" /> {study.targetParticipants} target participants
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300 flex items-center gap-2 sm:col-span-2">
                                <DollarSign size={16} className="text-zinc-500" />
                                {formatCompensation(study.compensation, study.compensationType)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 mb-4">
                            <h2 className="text-sm font-semibold text-zinc-200 mb-2">Eligibility</h2>
                            <p className="text-sm text-zinc-400">
                                Age: {study.minAge ?? "Any"} - {study.maxAge ?? "Any"}
                                {" | "}
                                Gender: {study.genderRequirement ?? "Any"}
                            </p>
                        </div>

                        {study.tags?.length > 0 && (
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-zinc-200 mb-2">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {study.tags.map((tag) => (
                                        <span key={tag} className="text-xs font-medium uppercase tracking-wider bg-primary/10 text-emerald-400 px-2 py-1 rounded-full border border-primary/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {study.instructions && (
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6">
                                <h2 className="text-sm font-semibold text-zinc-200 mb-2">Instructions</h2>
                                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{study.instructions}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <Link
                                to={dashboardPath}
                                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold border border-primary/30 text-primary hover:bg-primary/10 transition-colors h-11 px-5 group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to Dashboard
                            </Link>
                            <Link
                                to="/studies"
                                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors h-11 px-5 group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Close
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </main>
    );
}
