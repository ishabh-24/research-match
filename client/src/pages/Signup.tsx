// ============================================================
// Signup.tsx — Signup Page
// ============================================================

import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../lib/api"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { setToken } from "../lib/auth"
import { motion } from "framer-motion"

const signUpSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["PARTICIPANT", "RESEARCHER"])
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function Signup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultRole = (searchParams.get("role") as "PARTICIPANT" | "RESEARCHER") || "PARTICIPANT";

    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: defaultRole
        }
    })

    const onSubmit = async (data: SignUpFormValues) => {
        try {
            const response = await api.post("/auth/register", data)
            setToken(response.data.token)
            navigate("/profile/setup")
        } catch (error) {
            console.log(error)
            alert("Something went wrong")
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
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Join ResearchMatch</h1>
                    <p className="text-zinc-500 mt-2 text-sm">Create an account to get started.</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Full Name</label>
                        <input 
                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="John Doe"
                            {...register("name")} 
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="you@example.com"
                            {...register("email")} 
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Password</label>
                        <input 
                            type="password" 
                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="••••••••"
                            {...register("password")} 
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">I am joining as a</label>
                        <select 
                            className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                            {...register("role")} 
                        >
                            <option value="PARTICIPANT">Participant</option>
                            <option value="RESEARCHER">Researcher</option>
                        </select>
                        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-12 mt-6 bg-primary text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300 active:scale-[0.98]"
                    >
                        Create Account
                    </button>
                    
                    <div className="pt-6 mt-4 border-t border-zinc-800/50 text-center text-sm text-zinc-500">
                        <p>Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-emerald-400 transition-colors">Sign in</Link></p>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}
