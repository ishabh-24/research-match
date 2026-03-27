// ============================================================
// client/src/pages/Studies.tsx — Public Study Browser
// ============================================================
// Fetches published studies from GET /api/studies with filters:
//   category, format, min compensation, search query
// ============================================================

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, Loader2, FlaskConical, ArrowLeft } from "lucide-react";
import { StudyWithRelations } from "@/types";
import { StudyCard } from "@/components/StudyCard";
import api from "@/lib/api";
import { decodeToken, getToken } from "@/lib/auth";
import { motion, AnimatePresence, Variants } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────
interface Filters {
    category: string;
    format: string;
    minComp: string;
}

const CATEGORIES = [
    "Psychology",
    "Medical",
    "UX",
    "Education",
    "Social",
    "Economics",
    "Neuroscience",
    "Other",
];

const FORMATS = [
    { value: "REMOTE", label: "Remote" },
    { value: "IN_PERSON", label: "In Person" },
    { value: "HYBRID", label: "Hybrid" },
];

const COMP_OPTIONS = [
    { value: "", label: "Any compensation" },
    { value: "100", label: "$1+" },
    { value: "1000", label: "$10+" },
    { value: "2500", label: "$25+" },
    { value: "5000", label: "$50+" },
    { value: "10000", label: "$100+" },
];

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

// ─── Fetch helper ─────────────────────────────────────────────
async function fetchStudies(filters: Filters): Promise<StudyWithRelations[]> {
    const params: Record<string, string> = {};
    if (filters.category) params.category = filters.category.toLowerCase();
    if (filters.format) params.format = filters.format;
    if (filters.minComp) params.minComp = filters.minComp;
    const { data } = await api.get("/studies", { params });
    return data;
}

// ─── Component ────────────────────────────────────────────────
export default function Studies() {
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<Filters>({ category: "", format: "", minComp: "" });
    const [showFilters, setShowFilters] = useState(false);

    const { data: studies = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["studies", filters],
        queryFn: () => fetchStudies(filters),
        staleTime: 30_000,
    });

    // Client-side search on top of server-filtered results
    const filtered = useMemo(() => {
        if (!search.trim()) return studies;
        const q = search.toLowerCase();
        return studies.filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q) ||
                (s.researcher.user.name?.toLowerCase().includes(q) ?? false)
        );
    }, [studies, search]);

    const hasActiveFilters = filters.category || filters.format || filters.minComp;
    const token = getToken();
    const decoded = token ? decodeToken(token) : null;
    const dashboardPath =
        decoded?.role === "RESEARCHER"
            ? "/researcher/dashboard"
            : decoded?.role === "PARTICIPANT"
                ? "/dashboard"
                : null;

    const clearFilters = () => {
        setFilters({ category: "", format: "", minComp: "" });
        setSearch("");
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* ── Hero / Search Header ────────────────────────── */}
            <div className="border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14"
                >
                    {dashboardPath && (
                        <Link
                            to={dashboardPath}
                            className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-5 text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <FlaskConical className="text-emerald-400" size={24} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight">
                            Browse Studies
                        </h1>
                    </div>
                    <p className="text-zinc-400 mb-8 text-base sm:text-lg max-w-2xl">
                        Find research opportunities that match your interests and availability. Filter by format, category, and compensation.
                    </p>

                    {/* Search + Filter Toggle */}
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <Search
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 z-10"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, category, or researcher…"
                                className="relative w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all font-medium"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors z-10"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all shadow-sm ${showFilters || hasActiveFilters
                                    ? "border-primary/50 bg-primary/10 text-emerald-400"
                                    : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-100"
                                }`}
                        >
                            <SlidersHorizontal size={16} />
                            <span className="hidden sm:inline">Filters</span>
                            {hasActiveFilters && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400 text-zinc-950 text-[10px] font-bold">
                                    {[filters.category, filters.format, filters.minComp].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-sm shadow-inner">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Category</label>
                                        <select
                                            value={filters.category}
                                            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                        >
                                            <option value="">All categories</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c.toLowerCase()}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Format */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Format</label>
                                        <select
                                            value={filters.format}
                                            onChange={(e) => setFilters((f) => ({ ...f, format: e.target.value }))}
                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                        >
                                            <option value="">All formats</option>
                                            {FORMATS.map((fm) => (
                                                <option key={fm.value} value={fm.value}>{fm.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Min Compensation */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Compensation</label>
                                        <select
                                            value={filters.minComp}
                                            onChange={(e) => setFilters((f) => ({ ...f, minComp: e.target.value }))}
                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                        >
                                            {COMP_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* ── Results ──────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                {/* Result count + clear */}
                {!isLoading && !isError && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <p className="text-sm font-medium text-zinc-400">
                            {filtered.length === 0
                                ? "No studies found"
                                : `${filtered.length} stud${filtered.length === 1 ? "y" : "ies"} found`}
                        </p>
                        {(hasActiveFilters || search) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 text-sm text-primary hover:text-emerald-300 transition-colors font-medium bg-primary/10 px-3 py-1.5 rounded-lg"
                            >
                                <X size={14} />
                                Clear all
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
                        <Loader2 size={40} className="animate-spin text-primary" />
                        <p className="text-sm font-medium animate-pulse">Scanning database for studies…</p>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                            <X size={32} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-zinc-100 mb-2">Failed to load studies</p>
                            <p className="text-sm text-zinc-400">Our servers hit a snag. Please give it another try.</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="px-6 py-2.5 rounded-xl bg-primary text-zinc-950 text-sm font-bold hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all"
                        >
                            Retry Loading
                        </button>
                    </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filtered.length === 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center shadow-inner">
                            <FlaskConical size={32} className="text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-zinc-100 mb-2">No matches found</p>
                            <p className="text-sm text-zinc-400 max-w-sm mx-auto">We couldn't find any studies matching your exact criteria. Try broadening your filters.</p>
                        </div>
                        {(hasActiveFilters || search) && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-800 transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Study Grid */}
                {!isLoading && !isError && filtered.length > 0 && (
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filtered.map((study) => (
                            <motion.div variants={fadeInUp} key={study.id}>
                                <StudyCard study={study} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
