// ============================================================
// ProfileSetup.tsx — Onboarding Profile Setup
// ============================================================ 

import { useEffect, useState } from "react";
import { getToken, decodeToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileSetup() {
    const [role, setRole] = useState<string | null>(null);
    const [step, setStep] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // participant state
    const [interests, setInterests] = useState("");
    const [desiredCompMin, setDesiredCompMin] = useState(0);
    const [maxTimeCommitment, setMaxTimeCommitment] = useState(60);
    const [remoteOk, setRemoteOk] = useState(true);

    // researcher state
    const [institution, setInstitution] = useState("");
    const [department, setDepartment] = useState("");
    const [title, setTitle] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        const decoded = decodeToken(token);
        if (decoded && decoded.role) {
            setRole(decoded.role);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleParticipantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put("/participant/profile", {
                interests: interests.split(",").map(i => i.trim()),
                desiredCompMin,
                maxTimeCommitment,
                remoteOk
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to save profile", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResearcherSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put("/researcher/profile", {
                institution,
                department,
                title,
                bio
            });
            navigate("/researcher/dashboard");
        } catch (error) {
            console.error("Failed to save profile", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!role) {
        return <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">Loading...</main>;
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const nextStep = () => setStep(2);
    const prevStep = () => setStep(1);

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-zinc-950 text-zinc-100">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_15px_rgba(74,222,128,0.05)]"
            >
                <div className="text-center mb-8 border-b border-zinc-800/50 pb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Complete Your Profile</h1>
                    <p className="text-zinc-500 mt-2 text-sm">Step {step} of 2</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-6 overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary" 
                            initial={{ width: step === 1 ? '50%' : '100%' }}
                            animate={{ width: step === 1 ? '50%' : '100%' }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {role === "PARTICIPANT" ? (
                    <form onSubmit={handleParticipantSubmit} className="relative min-h-[300px]">
                        <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
                            {step === 1 && (
                                <motion.div 
                                    key="step1" custom={-1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                                    className="space-y-6 absolute inset-0"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-zinc-100 mb-1">Preferences</h2>
                                        <p className="text-zinc-500 text-sm">Tell us what kind of studies you are interested in.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Interests (comma separated)</label>
                                        <input
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="e.g. Psychology, UX Research, Health"
                                            value={interests}
                                            onChange={(e) => setInterests(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Minimum Desired Compensation ($)</label>
                                        <input
                                            type="number"
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            value={desiredCompMin}
                                            onChange={(e) => setDesiredCompMin(Number(e.target.value))}
                                            min="0"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full h-12 mt-4 bg-primary text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300"
                                    >
                                        Continue →
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    key="step2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                                    className="space-y-6 absolute inset-0"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-zinc-100 mb-1">Logistics</h2>
                                        <p className="text-zinc-500 text-sm">Help us match you with the right opportunities.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Maximum Time Commitment (minutes)</label>
                                        <input
                                            type="number"
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            value={maxTimeCommitment}
                                            onChange={(e) => setMaxTimeCommitment(Number(e.target.value))}
                                            min="5"
                                            step="5"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/30">
                                        <input
                                            type="checkbox"
                                            id="remoteOk"
                                            className="h-5 w-5 rounded border-zinc-700 text-primary focus:ring-primary/50 bg-zinc-900"
                                            checked={remoteOk}
                                            onChange={(e) => setRemoteOk(e.target.checked)}
                                        />
                                        <label htmlFor="remoteOk" className="text-sm font-medium text-zinc-300 cursor-pointer">
                                            I am open to remote/online studies
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-4 mt-auto">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex-1 h-12 bg-zinc-800 text-zinc-100 font-bold rounded-xl hover:bg-zinc-700 transition-all duration-300"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 h-12 bg-primary text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300 disabled:opacity-50"
                                        >
                                            {loading ? "Saving..." : "Save Profile"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                ) : (
                    <form onSubmit={handleResearcherSubmit} className="relative min-h-[360px]">
                        <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
                            {step === 1 && (
                                <motion.div 
                                    key="step1" custom={-1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                                    className="space-y-6 absolute inset-0"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-zinc-100 mb-1">Academic Affiliation</h2>
                                        <p className="text-zinc-500 text-sm">Tell us about your institution.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Institution / University</label>
                                        <input
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="e.g. Stanford University"
                                            value={institution}
                                            onChange={(e) => setInstitution(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Department</label>
                                        <input
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="e.g. Psychology"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full h-12 mt-4 bg-primary text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300"
                                    >
                                        Continue →
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    key="step2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
                                    className="space-y-6 absolute inset-0"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-zinc-100 mb-1">Personal Info</h2>
                                        <p className="text-zinc-500 text-sm">Tell participants about yourself.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Professional Title</label>
                                        <input
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="e.g. PhD Candidate"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Short Bio</label>
                                        <textarea
                                            className="w-full min-h-[100px] bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                            placeholder="Briefly describe your research focus..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4 mt-auto">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex-1 h-12 bg-zinc-800 text-zinc-100 font-bold rounded-xl hover:bg-zinc-700 transition-all duration-300"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 h-12 bg-primary text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300 disabled:opacity-50"
                                        >
                                            {loading ? "Saving..." : "Save Profile"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                )}
            </motion.div>
        </main>
    );
}
