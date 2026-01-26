"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

// ==========================================
// 👇 KONFIGURASI API (MENGGUNAKAN ENV)
// ==========================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        address: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 🛡️ VALIDASI MANUAL (PENJAGAAN KETAT)
        if (!form.name || !form.email || !form.password || !form.address) {
            toast.error("Mohon lengkapi semua data!")
            return
        }

        if (form.password.length < 3) {
            toast.error("Password minimal 3 karakter")
            return
        }

        setLoading(true)

        try {
            // 👇 UPDATE: Gunakan API_BASE_URL
            const res = await fetch(`${API_BASE_URL}/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, role: "PELANGGAN" })
            })

            const data = await res.json()

            if (data.status || data.success) {
                toast.success("Akun berhasil dibuat! Mengarahkan...")
                setTimeout(() => router.push('/login'), 1500)
            } else {
                toast.error(data.message || "Gagal mendaftar")
            }
        } catch (error) {
            console.error(error)
            toast.error("Terjadi kesalahan koneksi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-tl from-blue-100 via-white to-sky-50 p-4 py-8">
            <div className="w-full max-w-lg bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">BUAT AKUN BARU</h1>
                    <p className="text-slate-500 text-sm mt-2">Daftar untuk menikmati layanan PDAM Digital</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nama */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                            </svg>
                        </div>
                        <input required name="name" type="text" placeholder="Nama Lengkap" onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                            </svg>
                        </div>
                        <input required name="email" type="email" placeholder="Alamat Email" onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input required name="password" type={showPassword ? "text" : "password"} placeholder="Buat Password" onChange={handleChange}
                            className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400 font-medium" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition">
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-5.385.75.75 0 0 0 0-.638 9.995 9.995 0 0 0-5.385-3.301L3.28 2.22Zm-1.286 6.41a8.502 8.502 0 0 0 1.848 3.535l1.635-1.636a4 4 0 0 1-1.397-3.085A8.465 8.465 0 0 0 1.994 8.63Zm8.006 8.005a8.46 8.46 0 0 0 4.164-1.22l-1.636-1.636a4.004 4.004 0 0 1-2.528.356v2.5ZM10 4.5a5.5 5.5 0 0 0-3.3.992l1.636 1.636A4 4 0 0 1 10 6.5V4.5Z" clipRule="evenodd" /></svg>
                            )}
                        </button>
                    </div>

                    {/* Address */}
                    <div className="relative group">
                        <div className="absolute top-3.5 left-0 pl-3 flex items-start pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <textarea required name="address" placeholder="Alamat Lengkap Pemasangan" onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400 font-medium h-28 resize-none" />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold tracking-wide transition-all duration-300 transform shadow-lg shadow-sky-200 mt-2
                        ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl"}`}>
                        {loading ? "Mendaftarkan..." : "DAFTAR SEKARANG"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-slate-500 text-sm">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all">
                            Login Disini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}