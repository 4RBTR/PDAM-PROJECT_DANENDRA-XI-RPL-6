"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { setAuthData } from "@/utils/cookies"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Ambil URL dari file .env.local
            const baseUrl = process.env.NEXT_PUBLIC_API_URL

            // Cek apakah URL sudah disetting
            if (!baseUrl) {
                toast.error("URL Backend belum disetting di .env.local")
                setLoading(false)
                return
            }

            const res = await fetch(`${baseUrl}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (data.status === false || data.success === false) {
                toast.error(data.message || "Login gagal")
                setLoading(false)
                return
            }

            const token = data.token || data.data?.token;
            const role = data.role || data.data?.role;
            const userId = data.id || data.data?.id || data.data?.userId || data.data?.user?.id;
            const userName = data.name || data.data?.name || data.data?.user?.name;

            if (token && role) {
                setAuthData(token, role, String(userId), String(userName));
                toast.success(`Selamat Datang, ${userName || 'User'}!`)

                if (role === "MANAGER") router.push("/manager/dashboard")
                else if (role === "ADMIN") router.push("/admin/dashboard")
                else if (role === "KASIR") router.push("/kasir/dashboard")
                else router.push("/user/dashboard")
            } else {
                toast.error("Gagal membaca data akun.")
            }

        } catch (error) {
            console.error("Login Error:", error)
            toast.error("Gagal terhubung ke server. Cek IP di .env.local")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-sky-50 via-white to-blue-100 p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-600 mb-4 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">PDAM <span className="text-sky-600">DIGITAL</span></h1>
                    <p className="text-slate-500 text-sm mt-2">Masuk untuk mengelola tagihan air Anda</p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Input Email */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300 placeholder:text-slate-400 font-medium"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Input Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300 placeholder:text-slate-400 font-medium"
                            placeholder="Password Anda"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-5.385.75.75 0 0 0 0-.638 9.995 9.995 0 0 0-5.385-3.301L3.28 2.22Zm-1.286 6.41a8.502 8.502 0 0 0 1.848 3.535l1.635-1.636a4 4 0 0 1-1.397-3.085A8.465 8.465 0 0 0 1.994 8.63Zm8.006 8.005a8.46 8.46 0 0 0 4.164-1.22l-1.636-1.636a4.004 4.004 0 0 1-2.528.356v2.5ZM10 4.5a5.5 5.5 0 0 0-3.3.992l1.636 1.636A4 4 0 0 1 10 6.5V4.5Z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold tracking-wide transition-all duration-300 transform shadow-lg shadow-sky-200
                            ${loading ? "bg-slate-400 cursor-not-allowed scale-100" : "bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl"}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </span>
                        ) : "MASUK SEKARANG"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all">
                            Daftar Disini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}