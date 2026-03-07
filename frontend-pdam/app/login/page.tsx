/* eslint-disable @next/next/no-img-element */
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
            const baseUrl = process.env.NEXT_PUBLIC_API_URL

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
        <div className="flex min-h-screen bg-white font-sans overflow-hidden">


            <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">

                <img
                    src="https://images.unsplash.com/photo-1629375701431-01e6d1415dc9?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="PDAM Digital Cover"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
                />

                <div className="absolute inset-0 bg-linear-to-tr from-blue-900/90 via-transparent to-transparent"></div>

                {/* Teks Promosi */}
                <div className="absolute bottom-16 left-16 right-16 text-white">
                    <div className="w-16 h-1 bg-blue-500 mb-6 rounded-full"></div>
                    <h2 className="text-4xl font-black mb-4 leading-snug tracking-tight">
                        Kemudahan layanan air bersih dalam genggaman Anda.
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
                        Pantau tagihan, ajukan laporan, dan nikmati pelayanan PDAM yang lebih cepat, transparan, dan modern.
                    </p>
                </div>
            </div>

            {/* Bagian Kanan - Form Login */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 relative overflow-y-auto">

                {/* Tombol Kembali ke Home */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors self-start mb-8 lg:mb-4 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Beranda
                </Link>

                <div className="w-full max-w-md mx-auto my-auto">

                    {/* Logo & Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 font-black text-2xl text-slate-800 tracking-tight mb-6">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                            </div>
                            PDAM<span className="text-blue-600">Pintar</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Selamat Datang! 👋</h1>
                        <p className="text-slate-500 font-medium">
                            Silakan masuk ke akun Anda atau {' '}
                            <Link href="/register" className="text-blue-600 font-bold hover:underline">daftar baru</Link>.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Input Email */}
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Alamat Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Contoh: email@anda.com"
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                            />
                        </div>

                        {/* Input Password */}
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Kata Sandi</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi..."
                                    className="w-full pl-5 pr-12 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Lupa Sandi & Ingat Perangkat */}
                        <div className="flex items-center justify-between pt-1 pb-2 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" />
                                <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">Ingat saya</span>
                            </label>
                            <a href="#" className="text-blue-600 font-bold hover:underline">Lupa kata sandi?</a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-white font-black tracking-widest uppercase transition-all duration-300 shadow-lg shadow-blue-200
                                ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"}`}
                        >
                            {loading ? "Memproses..." : "Masuk Sekarang"}
                        </button>
                    </form>

                    {/* Footer Terms */}
                    <div className="mt-12 text-center">
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-wider">
                            Dilindungi oleh enkripsi aman. <br />
                            <a href="#" className="hover:text-slate-600 hover:underline">Syarat & Ketentuan</a> • <a href="#" className="hover:text-slate-600 hover:underline">Privasi</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}