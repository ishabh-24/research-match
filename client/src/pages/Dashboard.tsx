// ============================================================
// Dashboard.tsx — Participant Dashboard
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { decodeToken, getToken } from "../lib/auth";
import { motion, Variants } from "framer-motion";

// types

interface Study {
    id: string;
    title: string;
    category: string;
    format: "IN_PERSON" | "REMOTE" | "HYBRID";
    durationMinutes: number;
    sessions: number;
    compensation: number;
    compensationType: string;
    city?: string;
    state?: string;
    description: string;
    tags: string[];
}

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

interface ParticipantProfile {
    interests: string[];
    desiredCompMin: number;
    maxTimeCommitment: number;
    remoteOk: boolean;
}

// helpers

function formatComp(cents: number, type: string) {
    if (cents === 0) return "Unpaid";
    const dollars = (cents / 100).toFixed(2);
    return `$${dollars} ${type !== "cash" ? `(${type})` : ""}`.trim();
}

function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

const FORMAT_BADGE: Record<string, string> = {
    REMOTE: "🖥 Remote",
    IN_PERSON: "📍 In-Person",
    HYBRID: "🔀 Hybrid",
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

// components

function StudyCard({ study }: { study: Study }) {
    return (
        <motion.div variants={fadeInUp}>
            <Link
                to={`/studies/${study.id}`}
                className="block rounded-2xl border border-zinc-800/60 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-primary/30 backdrop-blur-md shadow-sm hover:shadow-[0_4px_20px_rgba(74,222,128,0.05)] transition-all p-5 space-y-3 relative overflow-hidden group"
            >
                {/* Hover Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex justify-between items-start gap-2 relative z-10">
                    <h3 className="font-semibold text-base leading-tight text-zinc-100 group-hover:text-primary transition-colors">{study.title}</h3>
                    <span className="text-xs font-medium bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-zinc-700">
                        {FORMAT_BADGE[study.format] ?? study.format}
                    </span>
                </div>

                <p className="text-sm text-zinc-400 line-clamp-2 relative z-10">{study.description}</p>

                <div className="flex flex-wrap gap-1.5 relative z-10">
                    {study.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-emerald-400 px-2 py-0.5 rounded-full border border-primary/20">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-500 pt-2 relative z-10">
                    <span className="flex items-center gap-1">⏱ {formatDuration(study.durationMinutes)}</span>
                    {study.sessions > 1 && <span className="flex items-center gap-1">📅 {study.sessions} sessions</span>}
                    <span className="flex items-center gap-1 text-emerald-400">💰 {formatComp(study.compensation, study.compensationType)}</span>
                    {study.city && <span className="flex items-center gap-1">📍 {study.city}, {study.state}</span>}
                </div>
            </Link>
        </motion.div>
    );
}

function NotificationItem({ notif }: { notif: Notification }) {
    return (
        <motion.div variants={fadeInUp} className={`p-4 rounded-xl text-sm border transition-all ${notif.read ? "bg-zinc-900/40 border-zinc-800/50" : "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(74,222,128,0.05)]"}`}>
            <div className="flex items-start gap-3">
                {!notif.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
                <div>
                    <p className={`font-medium ${notif.read ? "text-zinc-300" : "text-emerald-400"}`}>{notif.title}</p>
                    <p className="text-zinc-500 mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-2 font-medium uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </motion.div>
    );
}

// main dashboard

export default function Dashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>("");
    const [studies, setStudies] = useState<Study[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [studiesLoading, setStudiesLoading] = useState(true);
    const [notifsLoading, setNotifsLoading] = useState(true);
    const [studiesError, setStudiesError] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [profileForm, setProfileForm] = useState<ParticipantProfile>({
        interests: [],
        desiredCompMin: 0,
        maxTimeCommitment: 60,
        remoteOk: true,
    });
    const [interestsInput, setInterestsInput] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (decoded?.email) setUserName(decoded.email.split("@")[0]);

        const fetchMatchedStudies = async () => {
            setStudiesLoading(true);
            setStudiesError(null);
            try {
                const r = await api.get<Study[]>("/studies/matches");
                setStudies(r.data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setStudiesError("Complete your profile to see matched studies.");
                } else {
                    setStudiesError("Failed to load studies. Please try again.");
                }
            } finally {
                setStudiesLoading(false);
            }
        };

        const fetchProfile = async () => {
            setProfileLoading(true);
            setProfileError(null);
            try {
                const r = await api.get<ParticipantProfile>("/participant/profile");
                const nextProfile: ParticipantProfile = {
                    interests: r.data.interests ?? [],
                    desiredCompMin: r.data.desiredCompMin ?? 0,
                    maxTimeCommitment: r.data.maxTimeCommitment ?? 60,
                    remoteOk: r.data.remoteOk ?? true,
                };
                setProfileForm(nextProfile);
                setInterestsInput(nextProfile.interests.join(", "));
            } catch {
                setProfileError("Could not load your profile preferences.");
            } finally {
                setProfileLoading(false);
            }
        };

        fetchMatchedStudies();
        fetchProfile();

        // fetch notifications
        api.get<Notification[]>("/notifications")
            .then(r => setNotifications(r.data.slice(0, 5)))
            .catch(() => {/* notifications are non-critical */ })
            .finally(() => setNotifsLoading(false));
    }, [navigate]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError(null);
        setProfileSuccess(null);
        try {
            const interests = interestsInput
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean);

            const payload: ParticipantProfile = {
                interests,
                desiredCompMin: Math.max(0, Number(profileForm.desiredCompMin) || 0),
                maxTimeCommitment: Math.max(1, Number(profileForm.maxTimeCommitment) || 1),
                remoteOk: profileForm.remoteOk,
            };

            await api.put("/participant/profile", payload);
            setProfileForm(payload);
            setProfileSuccess("Preferences updated. Refreshing matches...");

            const matchRes = await api.get<Study[]>("/studies/matches");
            setStudies(matchRes.data);
            setStudiesError(null);
            setShowProfileEditor(false);
            setProfileSuccess("Preferences saved and matches updated.");
        } catch {
            setProfileError("Failed to update profile preferences.");
        } finally {
            setProfileSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-[20%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-[10%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md p-6 rounded-3xl"
                >
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                            Welcome back{userName ? `, ${userName}` : ""}!
                        </h1>
                        <p className="text-zinc-400 mt-1">Here are studies perfectly matched to your profile.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowProfileEditor((v) => !v)}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary h-11 px-6 shadow-sm"
                        >
                            {showProfileEditor ? "Close Preferences" : "Edit Preferences"}
                        </button>
                        <Link
                            to="/participant/applications"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100 h-11 px-6 shadow-sm"
                        >
                            My Applications →
                        </Link>
                    </div>
                </motion.div>

                {showProfileEditor && (
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md p-6 rounded-3xl"
                    >
                        <h2 className="text-xl font-bold text-zinc-100 mb-4">Your Preferences</h2>
                        {profileLoading ? (
                            <p className="text-zinc-500 text-sm">Loading profile...</p>
                        ) : (
                            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm text-zinc-400 block mb-2">Interests (comma separated)</label>
                                    <input
                                        value={interestsInput}
                                        onChange={(e) => setInterestsInput(e.target.value)}
                                        className="w-full h-11 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        placeholder="psychology, ux, medical"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-400 block mb-2">Minimum Compensation ($)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={Math.floor((profileForm.desiredCompMin ?? 0) / 100)}
                                        onChange={(e) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                desiredCompMin: Number(e.target.value || 0) * 100,
                                            }))
                                        }
                                        className="w-full h-11 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-400 block mb-2">Maximum Time (minutes)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={profileForm.maxTimeCommitment ?? 60}
                                        onChange={(e) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                maxTimeCommitment: Number(e.target.value || 1),
                                            }))
                                        }
                                        className="w-full h-11 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="remoteOk"
                                        checked={profileForm.remoteOk}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, remoteOk: e.target.checked }))}
                                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
                                    />
                                    <label htmlFor="remoteOk" className="text-sm text-zinc-300">
                                        Open to remote studies
                                    </label>
                                </div>
                                {profileError && <p className="md:col-span-2 text-sm text-red-400">{profileError}</p>}
                                {profileSuccess && <p className="md:col-span-2 text-sm text-emerald-400">{profileSuccess}</p>}
                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={profileSaving}
                                        className="h-11 px-5 rounded-xl bg-primary text-zinc-950 font-bold hover:bg-emerald-400 transition-all disabled:opacity-60"
                                    >
                                        {profileSaving ? "Saving..." : "Save Preferences"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Studies Column */}
                    <section className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <span className="w-2 h-6 rounded-full bg-primary"></span>
                                Matched Studies
                            </h2>
                            <Link to="/studies" className="text-sm text-primary hover:text-emerald-400 transition-colors font-medium">View all</Link>
                        </div>

                        {studiesLoading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5 h-36 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!studiesLoading && studiesError && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-zinc-700 p-10 text-center space-y-4 bg-zinc-900/20 backdrop-blur-sm">
                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">📋</div>
                                <p className="text-zinc-400">{studiesError}</p>
                                {studiesError.includes("profile") && (
                                    <Link
                                        to="/profile/setup"
                                        className="inline-flex items-center justify-center rounded-xl text-sm font-bold bg-primary text-zinc-950 h-11 px-6 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all"
                                    >
                                        Complete Profile
                                    </Link>
                                )}
                            </motion.div>
                        )}

                        {!studiesLoading && !studiesError && studies.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-zinc-700 p-10 text-center bg-zinc-900/20 backdrop-blur-sm">
                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">🔍</div>
                                <p className="text-zinc-300 font-medium text-lg">No perfect matches right now.</p>
                                <p className="text-sm text-zinc-500 mt-2">Check back soon or <Link to="/studies" className="text-primary hover:text-emerald-400 underline underline-offset-4">browse all available studies</Link>.</p>
                            </motion.div>
                        )}

                        {!studiesLoading && studies.length > 0 && (
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                {studies.map(study => (
                                    <StudyCard key={study.id} study={study} />
                                ))}
                            </motion.div>
                        )}
                    </section>

                    {/* Notifications Sidebar */}
                    <section className="space-y-5">
                        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                            <span className="w-2 h-6 rounded-full bg-blue-500"></span>
                            Notifications
                        </h2>

                        {notifsLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 rounded-xl bg-zinc-900/40 border border-zinc-800/50 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!notifsLoading && notifications.length === 0 && (
                            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-8 text-center">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-xl mb-3 opacity-50">🔔</div>
                                <p className="text-sm text-zinc-500">You're all caught up!</p>
                            </div>
                        )}

                        {!notifsLoading && notifications.length > 0 && (
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="space-y-3"
                            >
                                {notifications.map(notif => (
                                    <NotificationItem key={notif.id} notif={notif} />
                                ))}
                            </motion.div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
