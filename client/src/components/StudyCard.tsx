import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, DollarSign, MapPin, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { StudyWithRelations } from "@/types";
import { ApplicationModal } from "./ApplicationModal";
import { isAuthenticated } from "@/lib/auth";

interface StudyCardProps {
    study: StudyWithRelations;
    showScore?: boolean;
    score?: number;
    isApplied?: boolean;
    onApplySuccess?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    psychology: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    medical: "bg-red-500/10 text-red-400 border-red-500/20",
    ux: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    education: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    social: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    economics: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    neuroscience: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const FORMAT_COLORS: Record<string, string> = {
    REMOTE: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    IN_PERSON: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    HYBRID: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

function formatCompensation(cents: number, type: string): string {
    if (cents === 0) return "Unpaid";
    const dollars = (cents / 100).toFixed(0);
    if (type === "gift_card") return `$${dollars} gift card`;
    if (type === "course_credit") return `$${dollars} course credit`;
    return `$${dollars}`;
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatLocation(study: StudyWithRelations): string {
    if (study.format === "REMOTE") return "Remote";
    const parts = [study.city, study.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : study.country ?? "Location TBD";
}

export function StudyCard({ study, showScore, score, isApplied = false, onApplySuccess }: StudyCardProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [applied, setApplied] = useState(isApplied);
    const navigate = useNavigate();

    const handleApplyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }
        setModalOpen(true);
    };

    const handleApplySuccess = () => {
        setApplied(true);
        onApplySuccess?.();
    };

    const categoryClass =
        CATEGORY_COLORS[study.category.toLowerCase()] ?? "bg-zinc-800 text-zinc-300 border-zinc-700";
    const formatClass = FORMAT_COLORS[study.format] ?? "bg-zinc-800 text-zinc-300 border-zinc-700";
    const formatLabel = study.format === "IN_PERSON" ? "In Person" : study.format.charAt(0) + study.format.slice(1).toLowerCase();

    return (
        <>
            <Link
                to={`/studies/${study.id}`}
                aria-label={`View study: ${study.title}`}
                className="group relative flex flex-col h-full bg-zinc-900/60 border border-zinc-800/60 rounded-3xl p-6 hover:bg-zinc-800/50 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(74,222,128,0.08)] backdrop-blur-md"
            >
                {/* Hover Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Match Score Badge */}
                {showScore && score !== undefined && (
                    <div className="absolute top-5 right-5 flex items-center gap-1 bg-primary/90 text-zinc-950 text-xs font-black px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10">
                        {Math.round(score * 100)}% Match
                    </div>
                )}

                {/* Applied Badge */}
                {applied && (
                    <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-zinc-800 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full z-10">
                        <CheckCircle2 size={14} />
                        Applied
                    </div>
                )}

                {/* Category + Format Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-4 relative z-10 pr-20">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${categoryClass}`}>
                        {study.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${formatClass}`}>
                        {formatLabel}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-zinc-100 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors relative z-10">
                    {study.title}
                </h3>

                {/* Researcher */}
                <p className="text-sm font-medium text-zinc-500 mb-4 relative z-10">
                    {study.researcher.user.name ?? "Anonymous Researcher"}
                    {study.researcher.institution && (
                        <span className="text-zinc-600"> &middot; {study.researcher.institution}</span>
                    )}
                </p>

                {/* Description */}
                <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed flex-grow relative z-10">
                    {study.description}
                </p>

                <div className="mt-auto relative z-10">
                    {/* Divider */}
                    <div className="h-px bg-zinc-800/60 mb-5" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-zinc-400 mb-6 font-medium">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-zinc-500 shrink-0" />
                            <span>{formatDuration(study.durationMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-zinc-500 shrink-0" />
                            <span className={study.compensation === 0 ? "text-zinc-500" : "text-emerald-400"}>
                                {formatCompensation(study.compensation, study.compensationType)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-zinc-500 shrink-0" />
                            <span className="truncate">{formatLocation(study)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-zinc-500 shrink-0" />
                            <span>{study.targetParticipants} spots</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleApplyClick}
                            disabled={applied}
                            className={`flex-[3] py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                                applied
                                    ? "bg-zinc-800/80 text-zinc-400 border border-zinc-700 cursor-default"
                                    : "bg-primary text-zinc-950 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] active:scale-95"
                            }`}
                        >
                            {applied ? (
                                <><span>Applied</span><CheckCircle2 size={16} /></>
                            ) : (
                                "Apply Now"
                            )}
                        </button>
                        <div className="flex-[1] flex items-center justify-center h-[42px] rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 group-hover:border-primary/50 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>

            <ApplicationModal
                studyId={study.id}
                studyTitle={study.title}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={handleApplySuccess}
            />
        </>
    );
}
