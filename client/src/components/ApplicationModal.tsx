import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface ApplicationModalProps {
    studyId: string;
    studyTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ApplicationModal({
    studyId,
    studyTitle,
    open,
    onOpenChange,
    onSuccess,
}: ApplicationModalProps) {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const MAX_CHARS = 500;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");
        try {
            await api.post(`/applications/${studyId}`, { message: message.trim() || undefined });
            setStatus("success");
            onSuccess?.();
            setTimeout(() => {
                onOpenChange(false);
                setStatus("idle");
                setMessage("");
            }, 1800);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setStatus("error");
            setErrorMsg(error.response?.data?.message ?? "Something went wrong. Please try again.");
        }
    };

    const handleClose = () => {
        if (status === "loading") return;
        onOpenChange(false);
        setTimeout(() => {
            setStatus("idle");
            setMessage("");
            setErrorMsg("");
        }, 300);
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-zinc-950/90 border border-zinc-800/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 focus:outline-none overflow-hidden isolate">
                    
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div>
                            <Dialog.Title className="text-xl font-bold text-zinc-100 leading-snug">
                                Apply to Study
                            </Dialog.Title>
                            <Dialog.Description className="text-sm font-medium text-primary mt-1 line-clamp-2">
                                {studyTitle}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ml-4 shrink-0"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Success State */}
                    {status === "success" && (
                        <div className="flex flex-col items-center text-center py-10 gap-4 relative z-10 data-[state=open]:animate-in data-[state=open]:zoom-in-95 font-medium">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="text-emerald-400" size={40} />
                            </div>
                            <p className="text-xl font-bold text-zinc-100">Application Submitted!</p>
                            <p className="text-sm text-zinc-400 max-w-[250px]">The researcher will review your profile and be in touch with you soon.</p>
                        </div>
                    )}

                    {/* Form State */}
                    {status !== "success" && (
                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-sm font-bold text-zinc-300 mb-2">
                                    Why do you want to participate?{" "}
                                    <span className="text-zinc-600 font-normal ml-1">(Optional)</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                                    rows={4}
                                    placeholder="Share anything that might help the researcher understand your background..."
                                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition font-medium"
                                />
                                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-600 mt-2 text-right">
                                    {message.length} / {MAX_CHARS}
                                </p>
                            </div>

                            {/* Error Banner */}
                            {status === "error" && (
                                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium animate-in slide-in-from-top-2">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Dialog.Close asChild>
                                    <button
                                        type="button"
                                        disabled={status === "loading"}
                                        className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition shadow-sm disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </Dialog.Close>
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="flex-[1.5] rounded-xl bg-primary py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(74,222,128,0.2)]"
                                >
                                    {status === "loading" ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
