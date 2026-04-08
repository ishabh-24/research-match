// ============================================================
// Login.tsx — Login Page
//
// FORM: email + password → POST /api/auth/login
// On success: call setToken(token), navigate to /dashboard
// ============================================================

import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { setToken, decodeToken } from "../lib/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["PARTICIPANT", "RESEARCHER"])
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleFromUrl = searchParams.get("role");
    const defaultRole =
        roleFromUrl === "RESEARCHER" || roleFromUrl === "PARTICIPANT" ? roleFromUrl : "PARTICIPANT";

    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            role: defaultRole
        }
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await api.post("/auth/login", data);
            setToken(response.data.token);
            
            // Navigate based on role encoded in the token
            const user = decodeToken(response.data.token);
            if (user?.role === "RESEARCHER") {
                navigate("/researcher/dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (error: any) {
            console.error(error);
            let msg = error.response?.data?.message ?? "Invalid credentials";
            if (error.code === "ERR_NETWORK") {
                msg =
                    "Cannot reach the API. Check VITE_API_URL on Vercel and that the Render API is running.";
            }
            alert(msg);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-zinc-950 text-zinc-100">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_15px_rgba(74,222,128,0.05)]"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Welcome Back</h1>
                    <p className="text-zinc-500 mt-2 text-sm">Please enter your details to sign in.</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="you@example.com"
                            {...register("email")} 
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:text-emerald-400 transition-colors">Forgot password?</Link>
                        </div>
                        <input 
                            type="password" 
                            id="password" 
                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="••••••••"
                            {...register("password")} 
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Account Type</label>
                        <div className="flex bg-zinc-950/50 border border-zinc-800 rounded-xl p-1">
                            <label className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${watch("role") === "PARTICIPANT" ? "bg-primary text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}>
                                <input type="radio" value="PARTICIPANT" {...register("role")} className="hidden" />
                                Participant
                            </label>
                            <label className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${watch("role") === "RESEARCHER" ? "bg-primary text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}>
                                <input type="radio" value="RESEARCHER" {...register("role")} className="hidden" />
                                Researcher
                            </label>
                        </div>
                        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-12 mt-4 bg-primary text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300 active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                    
                    <div className="pt-6 border-t border-zinc-800/50 text-center text-sm text-zinc-500">
                        <p className="mb-4">Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:text-emerald-400 transition-colors">Register</Link></p>
                        <div className="flex justify-center gap-4 text-xs">
                            <Link to="/login?role=PARTICIPANT" className="hover:text-zinc-300 transition-colors">Participant</Link>
                            <span>|</span>
                            <Link to="/login?role=RESEARCHER" className="hover:text-zinc-300 transition-colors">Researcher</Link>
                        </div>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}

