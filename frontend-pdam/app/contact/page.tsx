'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from "react-hot-toast"

export default function ContactPage() {
    // 👇 Mengambil URL dari .env.local
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [form, setForm] = useState({ nama: "", email: "", pesan: "" })
    const [loading, setLoading] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.nama || !form.email || !form.pesan) {
            toast.error("Mohon lengkapi semua data");
            return;
        }

        setLoading(true)

        try {
            // 👇 Menggunakan API_URL variable
            const res = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (res.ok && data.status) {
                toast.success("Pesan berhasil dikirim! Tim kami akan menghubungi Anda. 🚀");
                setForm({ nama: "", email: "", pesan: "" })
            } else {
                toast.error(data.message || "Gagal mengirim pesan.");
            }
        } catch (error) {
            console.error(error)
            toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
        } finally {
            setLoading(false)
        }
    }

    // ... (Sisa kode UI return JSX tetap sama persis seperti kode cantik Anda sebelumnya)
    return (
        // ... UI CODE ANDA (NAVBAR, HERO, FOOTER) TETAP SAMA ...
        // (Saya tidak paste ulang bagian UI agar tidak terlalu panjang, 
        //  karena yang berubah hanya logika fetch di atas)
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-700 overflow-x-hidden flex flex-col relative">
            {/* Paste UI code Anda di sini */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-size-[32px_32px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-75 md:w-150 h-75 md:h-150 bg-sky-100/60 rounded-full blur-[80px] md:blur-[120px] opacity-70"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-75 md:w-150 h-75 md:h-150 bg-indigo-50/60 rounded-full blur-[80px] md:blur-[120px] opacity-70"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
                <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 z-50">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-linear-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200 text-white font-bold text-lg">P</div>
                        <span className="font-bold text-lg md:text-xl tracking-tight text-slate-800">PDAM <span className="text-sky-600">Pintar</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
                        <Link href="/" className="hover:text-sky-600 transition-colors py-2">Beranda</Link>
                        <Link href="/about" className="hover:text-sky-600 transition-colors py-2">Tentang</Link>
                        <Link href="/services" className="hover:text-sky-600 transition-colors py-2">Layanan</Link>
                        <Link href="/contact" className="text-sky-600 font-bold transition-colors py-2">Kontak</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="text-slate-600 font-medium hover:text-sky-600 transition px-4 py-2 text-sm">Masuk</Link>
                        <Link href="/register" className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5">Daftar Gratis</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden z-50 p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        )}
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 duration-200">
                        <Link href="/" className="text-lg font-medium text-slate-600 py-2 border-b border-slate-50">Beranda</Link>
                        <Link href="/about" className="text-lg font-medium text-slate-600 py-2 border-b border-slate-50">Tentang Kami</Link>
                        <Link href="/services" className="text-lg font-medium text-slate-600 py-2 border-b border-slate-50">Layanan</Link>
                        <Link href="/contact" className="text-lg font-medium text-sky-600 py-2 border-b border-slate-50">Kontak</Link>
                        <div className="flex flex-col gap-3 mt-4">
                            <Link href="/login" className="w-full text-center py-3 font-bold text-slate-600 border border-slate-200 rounded-xl">Masuk</Link>
                            <Link href="/register" className="w-full text-center py-3 font-bold text-white bg-sky-600 rounded-xl shadow-lg shadow-sky-200">Daftar Sekarang</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="pt-32 pb-20 md:pt-40 container mx-auto px-6 relative z-10 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Kolom Kiri: Informasi Kontak */}
                    <div className="space-y-8 md:sticky md:top-32">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold uppercase tracking-wider mb-4">
                                Bantuan 24/7
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 leading-tight">
                                Hubungi <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-500 to-blue-700">Kami</span>
                            </h1>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Punya pertanyaan seputar tagihan, ingin melaporkan kebocoran, atau butuh bantuan teknis? Tim kami siap membantu Anda.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Item 1 */}
                            <div className="flex items-start gap-5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
                                <div className="bg-sky-100 text-sky-600 p-3 rounded-xl text-2xl shrink-0">📍</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Kantor Pusat</h4>
                                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">Jl. Danau Ranau, Sawojajar<br />Malang, Jawa Timur 65139</p>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="flex items-start gap-5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
                                <div className="bg-green-100 text-green-600 p-3 rounded-xl text-2xl shrink-0">📞</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Layanan Pelanggan</h4>
                                    <p className="text-slate-500 text-sm mt-1">+62 812-3456-7890 (WhatsApp)</p>
                                    <p className="text-slate-500 text-sm">(0341) 123456 (Telepon)</p>
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="flex items-start gap-5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
                                <div className="bg-orange-100 text-orange-600 p-3 rounded-xl text-2xl shrink-0">📧</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Email Resmi</h4>
                                    <p className="text-slate-500 text-sm mt-1">support@pdampintar.id</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Form Kontak */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full z-0 pointer-events-none"></div>

                        <h3 className="text-2xl font-bold mb-2 text-slate-900 relative z-10">Kirim Pesan</h3>
                        <p className="text-slate-500 mb-8 text-sm relative z-10">Kami akan membalas pesan Anda melalui email secepatnya.</p>

                        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition placeholder:text-slate-400"
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.nama}
                                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition placeholder:text-slate-400"
                                    placeholder="budi@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Pesan / Keluhan</label>
                                <textarea
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition h-32 placeholder:text-slate-400 resize-none"
                                    placeholder="Tulis detail masalah atau pertanyaan Anda di sini..."
                                    value={form.pesan}
                                    onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 
                                ${loading
                                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                        : "bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-1"}
                                `}
                            >
                                {loading ? (
                                    <>Mengirim...</>
                                ) : (
                                    <>Kirim Pesan 🚀</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-900 pt-16 pb-8 text-slate-400 border-t border-slate-800 relative z-20 mt-auto">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center font-bold">P</div>
                                <span className="font-bold text-xl">PDAM Pintar</span>
                            </div>
                            <p className="text-sm leading-relaxed">Platform digitalisasi layanan air bersih terdepan.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Menu Utama</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/" className="hover:text-sky-400 transition block">Beranda</Link></li>
                                <li><Link href="/about" className="hover:text-sky-400 transition block">Tentang Kami</Link></li>
                                <li><Link href="/contact" className="text-sky-400 transition block">Kontak</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3"><span>📍</span> <span>Malang, Jawa Timur</span></li>
                                <li className="flex items-center gap-3"><span>📧</span> <span>support@pdampintar.id</span></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/privacy" className="hover:text-sky-400 transition block">Privasi</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col items-center gap-4 text-xs text-center">
                        <p>&copy; {new Date().getFullYear()} PDAM Pintar System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}