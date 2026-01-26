'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    // WRAPPER UTAMA: overflow-hidden dan flex-col agar footer selalu di bawah
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-700 overflow-x-hidden flex flex-col relative">

      {/* --- BACKGROUND DECORATION (Fixed Position) --- */}
      {/* Elemen ini diposisikan fixed agar tidak ikut scroll dan tidak menambah tinggi halaman secara gaib */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-size-[32px_32px]"></div>
        {/* Blob Biru Kanan Atas */}
        <div className="absolute top-[-10%] right-[-10%] w-75 md:w-150 h-75 md:h-150 bg-sky-100/60 rounded-full blur-[80px] md:blur-[120px] opacity-70"></div>
        {/* Blob Ungu Kiri Bawah */}
        <div className="absolute bottom-[-10%] left-[-10%] w-75 md:w-150 h-75 md:h-150 bg-indigo-50/60 rounded-full blur-[80px] md:blur-[120px] opacity-70"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 z-50">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-linear-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200 text-white font-bold text-lg">P</div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-slate-800">PDAM <span className="text-sky-600">Pintar</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
            {['About', 'Services', 'Contact'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="hover:text-sky-600 transition-colors py-2">
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
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

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 duration-200">
            {['about', 'services', 'contact'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-lg font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 font-bold text-slate-600 border border-slate-200 rounded-xl">Masuk</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 font-bold text-white bg-sky-600 rounded-xl shadow-lg shadow-sky-200">Daftar Sekarang</Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      {/* Tambahkan overflow-hidden di sini untuk mencegah chart keluar area */}
      <main className="pt-32 pb-16 md:pt-40 md:pb-24 container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Column: Text (Urutan HTML Pertama = Tampil Pertama di HP) */}
        <div className="flex-1 w-full text-center lg:text-left space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm mx-auto lg:mx-0">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span> Solusi Digital 2024
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Bayar Air <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-500 to-blue-700">Lebih Praktis.</span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
            Sistem monitoring dan pembayaran PDAM modern. Cek tagihan, bayar instan, dan laporkan gangguan hanya dalam satu genggaman.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start w-full sm:w-auto">
            <Link href="/register" className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
              Mulai Sekarang
            </Link>
            <Link href="/login" className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center">
              Lihat Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-500 justify-center lg:justify-start">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`}></div>
              ))}
            </div>
            <p className="text-xs md:text-sm">Dipercaya <span className="font-bold text-slate-800">2,000+</span> Pelanggan</p>
          </div>
        </div>

        {/* Right Column: Visual Mockup (Urutan HTML Kedua = Tampil Kedua di HP) */}
        <div className="flex-1 w-full max-w-[320px] md:max-w-xl perspective-1000 mt-8 lg:mt-0">
          <div className="relative group">
            {/* Floating Decorations (Hidden on small mobile to reduce clutter) */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse hidden md:block"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500 rounded-full blur-3xl opacity-20 hidden md:block"></div>

            {/* The Card */}
            <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden transform lg:rotate-2 group-hover:rotate-0 transition-all duration-700">
              {/* Browser Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div className="ml-auto md:ml-4 md:mr-auto flex-1 bg-white border border-slate-200 rounded h-5 w-full max-w-30 md:max-w-50 opacity-50"></div>
              </div>

              {/* Mockup Body */}
              <div className="p-4 md:p-6 bg-slate-50/30">
                {/* Cards Row */}
                <div className="flex gap-3 mb-4 md:mb-6">
                  <div className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-2">💧</div>
                    <div className="h-2 w-full bg-slate-100 rounded mb-1"></div><div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-2">💳</div>
                    <div className="h-2 w-full bg-slate-100 rounded mb-1"></div><div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                </div>
                {/* Chart Placeholder */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-24 flex items-center justify-center text-slate-300 text-xs border-dashed">
                  Grafik Pemakaian Air
                </div>
                {/* List Lines */}
                <div className="mt-4 space-y-2">
                  <div className="h-8 w-full bg-white border border-slate-100 rounded-lg shadow-sm"></div>
                  <div className="h-8 w-full bg-white border border-slate-100 rounded-lg shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- STATS SECTION --- */}
      <section className="bg-slate-900 py-12 -skew-y-2 relative z-10 -mx-5 md:mx-0 overflow-hidden">
        <div className="container mx-auto px-6 skew-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-slate-800/50">
            {[
              { l: "Pelanggan", v: "15K+" },
              { l: "Transaksi", v: "50rb" },
              { l: "Wilayah", v: "12 Kota" },
              { l: "Rating", v: "4.9" }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <h3 className="text-3xl font-black text-white">{s.v}</h3>
                <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-slate-50 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Fitur Lengkap Pelanggan</h2>
            <p className="text-slate-500 text-sm md:text-base">Teknologi terbaik untuk kenyamanan Anda dalam mengakses air bersih.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: "Monitoring", d: "Pantau penggunaan air harian dari HP.", i: "📊", c: "bg-blue-100 text-blue-600" },
              { t: "Bayar Instan", d: "QRIS, VA Bank & E-Wallet otomatis.", i: "💳", c: "bg-green-100 text-green-600" },
              { t: "Pengaduan", d: "Lapor kebocoran dengan tiket prioritas.", i: "🛠️", c: "bg-orange-100 text-orange-600" },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 transition duration-300">
                <div className={`w-12 h-12 rounded-2xl ${f.c} flex items-center justify-center text-xl mb-4`}>{f.i}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-12 md:py-20 bg-white relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-linear-to-r from-blue-600 to-sky-500 rounded-2xl md:rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 relative z-10">Siap Beralih ke Digital?</h2>
            <p className="text-blue-100 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto relative z-10">Bergabunglah dengan ribuan pelanggan lainnya yang sudah merasakan kemudahan pembayaran online.</p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center relative z-10 w-full sm:w-auto">
              <Link href="/register" className="bg-white text-blue-600 px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg w-full sm:w-auto">Daftar Sekarang</Link>
              <Link href="/contact" className="bg-blue-700/50 text-white border border-white/20 px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold hover:bg-blue-700 transition w-full sm:w-auto">Hubungi Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 pt-16 pb-8 text-slate-400 border-t border-slate-800 relative z-20 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center font-bold">P</div>
                <span className="font-bold text-xl">PDAM Pintar</span>
              </div>
              <p className="text-sm leading-relaxed">Platform digitalisasi layanan air bersih terdepan.</p>
            </div>

            {/* Menu */}
            <div>
              <h4 className="text-white font-bold mb-4">Menu Utama</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-sky-400 transition block">Beranda</Link></li>
                <li><Link href="/about" className="hover:text-sky-400 transition block">About us</Link></li>
                <li><Link href="/services" className="hover:text-sky-400 transition block">Services</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3"><span>📍</span> <span>Jakarta, Indonesia</span></li>
                <li className="flex items-center gap-3"><span>📧</span> <span>support@pdampintar.id</span></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-sky-400 transition block">Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-sky-400 transition block">Syarat</Link></li>
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