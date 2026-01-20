"use client"
import Link from 'next/link'

export default function ServicesPage() {
    const services = [
        { icon: "💧", title: "Penyaluran Air Bersih", desc: "Jaminan kualitas air bersih sesuai standar kesehatan yang mengalir 24 jam ke rumah Anda." },
        { icon: "💳", title: "Pembayaran Online", desc: "Bayar tagihan air kapan saja dan di mana saja melalui dashboard pelanggan yang terintegrasi." },
        { icon: "🔧", title: "Pemasangan Baru", desc: "Proses pengajuan sambungan baru yang lebih cepat dengan pelacakan status secara real-time." },
        { icon: "📊", title: "Monitoring Meteran", desc: "Catat dan pantau penggunaan air bulanan Anda secara akurat dan transparan." },
        { icon: "🚑", title: "Layanan Darurat", desc: "Tim reaksi cepat untuk penanganan kebocoran pipa atau gangguan distribusi air." },
        { icon: "📱", title: "Aplikasi Mobile", desc: "Akses semua layanan dalam genggaman (Web & Mobile Responsive)." },
    ]

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

            <main className="container mx-auto px-6 py-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-indigo-400">
                        Layanan Unggulan
                    </h1>
                    <p className="text-slate-400 text-lg">Kami hadir memberikan solusi air bersih dengan dukungan teknologi modern untuk kenyamanan Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {services.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition duration-300 group">
                            <div className="text-4xl mb-4 bg-sky-500/10 w-16 h-16 flex items-center justify-center rounded-xl group-hover:bg-sky-500/20 transition">{item.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}