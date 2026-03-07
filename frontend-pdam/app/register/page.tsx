/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
        <div className="flex min-h-screen bg-white font-sans overflow-hidden">

            {/* Bagian Kiri - Gambar Cover */}
            <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
                {/* Gambar Tetesan Air / Clean Water dari Unsplash */}
                <img
                    src="https://images.unsplash.com/photo-1590556308338-2f28ba117711?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="PDAM Water Registration"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-linear-to-tr from-blue-900/90 via-transparent to-transparent"></div>

                {/* Teks Promosi */}
                <div className="absolute bottom-16 left-16 right-16 text-white">
                    <div className="w-16 h-1 bg-sky-400 mb-6 rounded-full"></div>
                    <h2 className="text-4xl font-black mb-4 leading-snug tracking-tight">
                        Akses Air Bersih untuk Masa Depan yang Lebih Baik.
                    </h2>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                        Bergabunglah dengan ribuan pelanggan lainnya. Daftar sekarang untuk mengelola pemasangan dan tagihan air dari rumah.
                    </p>
                </div>
            </div>

            {/* Bagian Kanan - Form Register */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 relative overflow-y-auto">

                {/* Tombol Kembali ke Home */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors self-start mb-8 lg:mb-4 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Beranda
                </Link>

                <div className="w-full max-w-md mx-auto my-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Buat Akun Baru 🚀</h1>
                        <p className="text-slate-500 font-medium">
                            Lengkapi data di bawah ini untuk menjadi pelanggan PDAM Pintar. Sudah punya akun?{' '}
                            <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk</Link>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Nama */}
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Nama Lengkap</label>
                            <input required name="name" type="text" placeholder="Sesuai KTP..." onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Alamat Email</label>
                            <input required name="email" type="email" placeholder="email@anda.com" onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Kata Sandi</label>
                            <div className="relative">
                                <input required name="password" type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter" onChange={handleChange}
                                    className="w-full pl-5 pr-12 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Alamat Tinggal / Pemasangan</label>
                            <textarea required name="address" placeholder="Sebutkan jalan, RT/RW, kelurahan..." onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400 h-24 resize-none" />
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-4 mt-4 rounded-xl text-white font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-200
                            ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"}`}>
                            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    )
}