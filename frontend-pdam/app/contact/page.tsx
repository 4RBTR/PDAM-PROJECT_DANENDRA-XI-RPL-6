"use client"
import Link from 'next/link'
import { useState } from 'react'
import toast from "react-hot-toast";

export default function ContactPage() {
    // State untuk menangampung inputan user
    const [form, setForm] = useState({ nama: "", email: "", pesan: "" })
    const [loading, setLoading] = useState(false)

    // Fungsi saat tombol "Kirim Pesan" ditekan
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault() // Mencegah reload halaman
        setLoading(true)

        try {
            const res = await fetch("http://localhost:8000/pengaduan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (data.status) {
                toast.success("Pesan berhasil dikirim! 🚀");
                setForm({ nama: "", email: "", pesan: "" }) // Kosongkan form lagi
            } else {
                toast.error("Gagal mengirim pesan. Coba lagi nanti.");
            }
        } catch (error) {
            console.error(error)
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#0A192F] text-white font-sans selection:bg-sky-500 selection:text-white pb-20">

            <nav className="border-b border-white/5 bg-[#0A192F]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <span className="bg-sky-500 w-8 h-8 rounded flex items-center justify-center">P</span> PDAM Pintar
                    </Link>
                    <Link href="/" className="text-sm text-slate-400 hover:text-white">Kembali ke Beranda</Link>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-16 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-12 items-start">

                    {/* Informasi Kontak */}
                    <div>
                        <h1 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-indigo-400">
                            Hubungi Kami
                        </h1>
                        <p className="text-slate-400 text-lg mb-8">
                            Punya pertanyaan seputar tagihan atau layanan teknis? Tim kami siap membantu Anda 24/7.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-lg text-2xl">📍</div>
                                <div>
                                    <h4 className="font-bold text-white">Kantor Pusat</h4>
                                    <p className="text-slate-400 text-sm">Jl. Danau Ranau, Sawojajar<br />Malang, Jawa Timur 65139</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-lg text-2xl">📞</div>
                                <div>
                                    <h4 className="font-bold text-white">Telepon / WhatsApp</h4>
                                    <p className="text-slate-400 text-sm">+62 812-3456-7890</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORM KONTAK YANG SUDAH BERFUNGSI */}
                    <div className="bg-white p-8 rounded-3xl text-slate-800 shadow-xl">
                        <h3 className="text-2xl font-bold mb-6 text-slate-900">Kirim Pesan</h3>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Nama Lengkap</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.nama}
                                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    placeholder="budi@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Pesan / Keluhan</label>
                                <textarea
                                    required
                                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 h-32"
                                    placeholder="Tulis pesan Anda di sini..."
                                    value={form.pesan}
                                    onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-bold py-3 rounded-lg transition shadow-lg shadow-sky-500/30 text-white
                            ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}
                        `}
                            >
                                {loading ? "Mengirim..." : "Kirim Pesan"}
                            </button>
                        </form>

                    </div>
                </div>
            </main>
        </div>
    )
}