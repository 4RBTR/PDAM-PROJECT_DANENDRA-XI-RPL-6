'use client'

import { useState, useEffect } from 'react' // useEffect ditambah untuk scroll navbar
import Link from 'next/link'
import toast from "react-hot-toast"

export default function ContactPage() {
    // 👇 LOGIKA ASLI
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [form, setForm] = useState({ nama: "", email: "", pesan: "" })
    const [loading, setLoading] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false) // State tambahan untuk efek navbar

    // Efek scroll untuk navbar (Visual only)
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()

        if (!form.nama || !form.email || !form.pesan) {
            toast.error("Mohon lengkapi semua data");
            return;
        }

        setLoading(true)

        try {
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

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700 flex flex-col relative overflow-x-hidden">

            {/* --- BACKGROUND DECORATION (Konsisten) --- */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px] opacity-60"></div>
                <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-indigo-100/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-100 h-100 bg-sky-50/60 rounded-full blur-[100px]"></div>
            </div>

            {/* --- NAVBAR OBSIDIAN GLASS (Konsisten) --- */}
            <div className="fixed top-0 left-0 right-0 z-100 flex justify-center p-4 md:p-6 pointer-events-none">
                <nav className={`
                    w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    rounded-[22px] border relative group/nav
                    ${isMobileMenuOpen || scrolled
                        ? 'bg-white border-slate-200 shadow-2xl'
                        : 'bg-white/60 backdrop-blur-md border-white/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:bg-white/80 hover:border-white/60'}
                `}>
                    <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent"></div>

                    <div className="px-5 md:px-8 h-14 md:h-17 flex justify-between items-center relative z-10">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group/logo">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                                <div className="absolute inset-0 bg-slate-900 rounded-xl transition-all duration-500 group-hover/logo:rotate-10 group-hover/logo:bg-indigo-600 group-hover/logo:shadow-[0_0_20px_rgba(79,70,229,0.4)]"></div>
                                <span className="relative z-10 text-white font-black text-lg">P</span>
                            </div>
                            <div className="hidden sm:flex flex-col gap-0">
                                <span className="font-bold text-lg tracking-tight text-slate-900 leading-tight">PDAM<span className="text-indigo-600">.</span></span>
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] -mt-0.5">Pintar AI</span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-2">
                            {['About', 'Services', 'Contact'].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    className={`px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 relative group/item ${item === 'Contact' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                                >
                                    <span className="relative z-10">{item}</span>
                                    <span className="absolute inset-0 bg-slate-900/5 rounded-full scale-50 opacity-0 group-hover/item:scale-100 group-hover/item:opacity-100 transition-all duration-300"></span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 md:gap-5">
                            <Link href="/login" className="hidden md:block text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[13px] font-bold shadow-[0_10px_20px_-5px_rgba(15,23,42,0.3)] hover:shadow-indigo-500/40 hover:bg-indigo-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                            >
                                Get Started
                            </Link>
                            {/* Mobile Toggle */}
                            <button
                                className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-100/50"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <div className={`h-0.5 bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'w-5 rotate-45 translate-y-1' : 'w-5'}`}></div>
                                <div className={`h-0.5 bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'w-5 -rotate-45 -translate-y-1' : 'w-3 self-end mr-2.5'}`}></div>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    <div className={`
                        md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                        ${isMobileMenuOpen ? 'max-h-100 border-t border-slate-100 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}
                    `}>
                        <div className="p-6 space-y-1">
                            {['About', 'Services', 'Contact'].map((item) => (
                                <Link key={item} href={`/${item.toLowerCase()}`} className="flex items-center p-3 text-base font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                    {item}
                                </Link>
                            ))}
                            <div className="pt-4 mt-2 border-t border-slate-50">
                                <Link href="/login" className="block w-full py-4 text-center font-bold text-slate-900 rounded-xl hover:bg-slate-50 transition">Masuk ke Akun</Link>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="grow pt-32 pb-24 md:pt-44 container mx-auto px-6 relative z-10 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Kolom Kiri: Informasi Kontak */}
                    <div className="space-y-10 md:sticky md:top-36">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-[11px] font-bold tracking-widest text-indigo-600 uppercase">Support 24/7</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 tracking-tighter leading-tight">
                                Hubungi <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-sky-500">Tim Kami.</span>
                            </h1>
                            <p className="text-lg text-slate-500 leading-relaxed font-medium">
                                Punya pertanyaan seputar tagihan, ingin melaporkan kebocoran, atau butuh bantuan teknis? Kami siap membantu.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: "📍", title: "Kantor Pusat", desc: "Jl. Danau Ranau, Sawojajar, Malang" },
                                { icon: "📞", title: "Call Center", desc: "+62 812-3456-7890 (Whatsapp)" },
                                { icon: "📧", title: "Email Resmi", desc: "support@pdampintar.id" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 p-5 rounded-[20px] bg-white border border-slate-100 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kolom Kanan: Form Kontak (Logika Tetap Sama) */}
                    <div className="bg-white p-8 md:p-10 rounded-4xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">

                        {/* Dekorasi Form */}
                        <div className="absolute -top-12.5 -right-12.5 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                        <div className="relative z-10 mb-8">
                            <h3 className="text-2xl font-bold text-slate-900">Kirim Pesan</h3>
                            <p className="text-slate-500 text-sm mt-2">Kami akan membalas pesan Anda sesegera mungkin.</p>
                        </div>

                        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Nama Lengkap</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.nama}
                                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="budi@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Pesan / Keluhan</label>
                                <textarea
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-32 placeholder:text-slate-400 resize-none font-medium"
                                    placeholder="Tulis detail masalah atau pertanyaan Anda di sini..."
                                    value={form.pesan}
                                    onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2
                                    ${loading
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-linear-to-r from-slate-900 to-indigo-900 text-white shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-0.5 active:scale-95"
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-slate-500">Mengirim...</span>
                                    </>
                                ) : (
                                    <>Kirim Pesan Sekarang 🚀</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

           {/* --- FOOTER --- */}
            <footer className="bg-slate-950 pt-24 pb-10 text-slate-400 border-t border-slate-900 relative z-20 mt-auto">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                        {/* Brand */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 bg-linear-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-900/50">P</div>
                                <span className="font-bold text-2xl tracking-tight">PDAM Pintar</span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
                                Platform digitalisasi layanan air bersih terdepan di Indonesia. Memudahkan akses air bersih untuk semua.
                            </p>
                            <div className="flex gap-4 pt-2">
                                {[1, 2, 3].map(i => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all duration-300">
                                        <span className="text-[10px] font-bold">SOC</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Menu */}
                        <div>
                            <h4 className="text-white font-bold mb-8 text-lg">Menu Utama</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="/" className="hover:text-indigo-400 transition flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors"></span> Beranda</Link></li>
                                <li><Link href="/about" className="hover:text-indigo-400 transition flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors"></span> Tentang Kami</Link></li>
                                <li><Link href="/services" className="hover:text-indigo-400 transition flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors"></span> Layanan</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-bold mb-8 text-lg">Hubungi Kami</h4>
                            <ul className="space-y-6 text-sm">
                                <li className="flex items-start gap-4">
                                    <span className="mt-1 p-2 bg-slate-900 rounded-lg text-slate-200">📍</span>
                                    <span className="leading-relaxed">Gedung PDAM Tower Lt. 12<br />Jakarta Selatan, Indonesia</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <span className="p-2 bg-slate-900 rounded-lg text-slate-200">📧</span>
                                    <span className="hover:text-white cursor-pointer transition">support@pdampintar.id</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <span className="p-2 bg-slate-900 rounded-lg text-slate-200">📞</span>
                                    <span className="hover:text-white cursor-pointer transition">+62 21 5555 0000</span>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-bold mb-8 text-lg">Legal</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="/privacy" className="hover:text-indigo-400 transition block">Kebijakan Privasi</Link></li>
                                <li><Link href="/terms" className="hover:text-indigo-400 transition block">Syarat & Ketentuan</Link></li>
                                <li><Link href="/faq" className="hover:text-indigo-400 transition block">FAQ</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium text-slate-600">
                        <p>&copy; {new Date().getFullYear()} PDAM Pintar System. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-indigo-400 transition">Privacy</a>
                            <a href="#" className="hover:text-indigo-400 transition">Terms</a>
                            <a href="#" className="hover:text-indigo-400 transition">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}