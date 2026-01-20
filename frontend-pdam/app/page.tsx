import Link from 'next/link'

export default function Home() {
  return (
    // Container utama dengan background gradient dan tekstur halus
    <div className="min-h-screen bg-[#0A192F] text-white font-sans selection:bg-sky-500 selection:text-white relative overflow-hidden">

      {/* Background Radial Glow (Efek Cahaya di Belakang) */}
      <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar Glassmorphism */}
      {/* Navbar Glassmorphism */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A192F]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">P</div>
            <span className="font-bold text-xl tracking-tight">PDAM Pintar</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            {/* LINK SUDAH DIGANTI JADI REAL 👇 */}
            <Link href="/about" className="hover:text-white transition relative group">
              Tentang
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/services" className="hover:text-white transition relative group">
              Layanan
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="hover:text-white transition relative group">
              Kontak
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all group-hover:w-full"></span>
            </Link>
          </div>
          <Link href="/login" className="bg-white/10 hover:bg-white/20 hover:scale-105 px-6 py-2.5 rounded-full text-sm font-bold transition border border-white/10 shadow-sm">
            Masuk Akun
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center text-center min-h-screen relative z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.2)] animate-fade-in-down">
          <span className="animate-pulse">🔹</span> Sistem Digitalisasi Air Bersih
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight animate-fade-in-up">
          Bayar Air Jadi <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-blue-500 to-indigo-400 drop-shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
            Jauh Lebih Mudah.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed animate-fade-in-up delay-100">
          Platform pembayaran dan monitoring tagihan PDAM modern.
          Cek pemakaian air, upload bukti bayar, dan pantau status tagihan dalam satu aplikasi yang terintegrasi.
        </p>

        {/* Tombol CTA */}
        <div className="flex flex-col md:flex-row gap-5 w-full md:w-auto mb-20 animate-fade-in-up delay-200">
          <Link href="/register" className="group bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 flex items-center justify-center gap-3">
            <span>🚀</span> Daftar Sekarang
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link href="/login" className="bg-[#0A192F] hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition border-2 border-slate-700 hover:border-sky-500/50 flex items-center justify-center hover:scale-105">
            Masuk ke Akun
          </Link>
        </div>

        {/* 3 FITUR UTAMA (KARTU INTERAKTIF) - INI YANG DIUPDATE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up delay-300">
          {/* Kartu 1 */}
          <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/20 cursor-default text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/30 transition-all"></div>
            <div className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110 origin-left">🕰️</div>
            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-sky-300 transition">Akses 24/7</h3>
            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition">Layanan nonstop. Bayar dan cek tagihan kapanpun Anda mau.</p>
          </div>

          {/* Kartu 2 */}
          <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-default text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
            <div className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110 origin-left">🛡️</div>
            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-indigo-300 transition">100% Aman</h3>
            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition">Data transparan dan transaksi terenkripsi dengan aman.</p>
          </div>

          {/* Kartu 3 */}
          <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-default text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
            <div className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110 origin-left">⚡</div>
            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-300 transition">Verifikasi Kilat</h3>
            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition">Bukti bayar diproses cepat oleh sistem dan admin kasir.</p>
          </div>
        </div>

      </main>

      <footer className="text-center py-8 text-slate-500 text-sm border-t border-white/5 relative z-10">
        <p>&copy; 2024 PDAM Digital System. Created for a better future.</p>
      </footer>
    </div>
  )
}