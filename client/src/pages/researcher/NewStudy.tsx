// ============================================================
// NewStudy.tsx — Create Study Form
// ============================================================

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../lib/api";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const createStudySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    format: z.enum(["IN_PERSON", "REMOTE", "HYBRID"]),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    minAge: z.number().int().positive().optional(),
    maxAge: z.number().int().positive().optional(),
    genderRequirement: z.string().optional(),
    durationMinutes: z.number().int().positive("Duration must be a positive number"),
    sessions: z.number().int().positive(),
    compensation: z.number().int().nonnegative(),
    compensationType: z.string(),
    targetParticipants: z.number().int().positive(),
    instructions: z.string().optional(),
    consentFormUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type CreateStudyInput = z.infer<typeof createStudySchema>;

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

export default function NewStudy() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateStudyInput>({
        resolver: zodResolver(createStudySchema),
        defaultValues: {
            title: "",
            description: "",
            category: "Psychology",
            format: "REMOTE",
            city: "",
            state: "",
            country: "",
            genderRequirement: "Any",
            durationMinutes: 60,
            sessions: 1,
            compensation: 0,
            compensationType: "cash",
            targetParticipants: 10,
            instructions: "",
            consentFormUrl: "",
        },
    });

    const onSubmit = async (data: CreateStudyInput) => {
        setSubmitting(true);
        setErrorMsg("");
        try {
            const payload = {
                ...data,
                consentFormUrl: data.consentFormUrl === "" ? undefined : data.consentFormUrl,
                tags: [] // Default tags
            };

            await api.post("/studies", payload);
            navigate("/researcher/dashboard");
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.response?.data?.message || "Failed to create study.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 md:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/researcher/dashboard" className="inline-flex items-center text-zinc-400 hover:text-primary transition-colors mb-4 text-sm font-medium gap-2">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                        Create New Study
                    </h1>
                    <p className="text-zinc-500 mt-2">Fill out the details below to publish an opportunity for participants.</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-6 font-medium text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {/* Section 1: Basic Info */}
                        <motion.section variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-zinc-200 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 rounded-full bg-primary"></span> Basic Information
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Title *</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="e.g. Cognitive Load During Navigation"
                                        {...register("title")} 
                                    />
                                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                        placeholder="Describe the purpose of the study and what participants will do..."
                                        {...register("description")} 
                                    />
                                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Category *</label>
                                        <select 
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                                            {...register("category")} 
                                        >
                                            <option value="Psychology">Psychology</option>
                                            <option value="Medical">Medical</option>
                                            <option value="UX">UX / HCI</option>
                                            <option value="Education">Education</option>
                                            <option value="Social">Social Science</option>
                                            <option value="Neuroscience">Neuroscience</option>
                                            <option value="Economics">Economics</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Format *</label>
                                        <select 
                                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                                            {...register("format")} 
                                        >
                                            <option value="REMOTE">Remote</option>
                                            <option value="IN_PERSON">In-Person</option>
                                            <option value="HYBRID">Hybrid</option>
                                        </select>
                                        {errors.format && <p className="text-red-400 text-xs mt-1">{errors.format.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Section 2: Logistics & Comp */}
                        <motion.section variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-zinc-200 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 rounded-full bg-blue-500"></span> Logistics & Compensation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Duration (minutes) *</label>
                                    <input type="number" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" {...register("durationMinutes", { valueAsNumber: true })} />
                                    {errors.durationMinutes && <p className="text-red-400 text-xs mt-1">{errors.durationMinutes.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Sessions *</label>
                                    <input type="number" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" {...register("sessions", { valueAsNumber: true })} />
                                    {errors.sessions && <p className="text-red-400 text-xs mt-1">{errors.sessions.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Compensation (in cents) *</label>
                                    <input type="number" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" {...register("compensation", { valueAsNumber: true })} placeholder="1500 = $15.00" />
                                    {errors.compensation && <p className="text-red-400 text-xs mt-1">{errors.compensation.message}</p>}
                                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">e.g. 5000 for $50.00</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Target Participants *</label>
                                    <input type="number" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" {...register("targetParticipants", { valueAsNumber: true })} />
                                    {errors.targetParticipants && <p className="text-red-400 text-xs mt-1">{errors.targetParticipants.message}</p>}
                                </div>
                            </div>
                        </motion.section>

                        {/* Section 3: Requirements & Location */}
                        <motion.section variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-zinc-200 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 rounded-full bg-indigo-500"></span> Requirements & Location
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Min Age</label>
                                    <input type="number" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" {...register("minAge", { setValueAs: v => v === "" ? undefined : parseInt(v, 10) })} placeholder="18" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Max Age</label>
                                    <input type="number" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" {...register("maxAge", { setValueAs: v => v === "" ? undefined : parseInt(v, 10) })} placeholder="65" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Gender</label>
                                    <select className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none" {...register("genderRequirement")}>
                                        <option value="Any">Any</option>
                                        <option value="Male">Male Only</option>
                                        <option value="Female">Female Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">City</label>
                                    <input type="text" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Optional" {...register("city")} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">State</label>
                                    <input type="text" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Optional" {...register("state")} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Country</label>
                                    <input type="text" className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Optional" {...register("country")} />
                                </div>
                            </div>
                        </motion.section>
                        
                        {/* Section 4: Details */}
                        <motion.section variants={fadeInUp} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-zinc-200 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span> Additional Details
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Participant Instructions</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                        placeholder="Any specific instructions for approved applicants..."
                                        {...register("instructions")} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Consent Form URL</label>
                                    <input 
                                        type="url" 
                                        className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="https://..."
                                        {...register("consentFormUrl")} 
                                    />
                                    {errors.consentFormUrl && <p className="text-red-400 text-xs mt-1">{errors.consentFormUrl.message}</p>}
                                </div>
                            </div>
                        </motion.section>

                        <motion.div variants={fadeInUp} className="pt-4 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="h-14 px-8 bg-primary text-zinc-950 font-bold rounded-2xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 min-w-[200px]"
                            >
                                {submitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Publishing...</>
                                ) : (
                                    "Publish Study"
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                </form>
            </div>
        </main>
    );
}
