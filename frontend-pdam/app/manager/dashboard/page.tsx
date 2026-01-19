"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ManagerDashboard() {
    const [stats, setStats] = useState({
        total_pendapatan: 0,
        total_pelanggan: 0,
        transaksi_lunas: 0,
        transaksi_tunggakan: 0
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [transaksi, setTransaksi] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/manager/dashboard')
                const data = await res.json()
                if(data.status) {
                    setStats(data.stats)
                    setTransaksi(data.data)
                }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                console.error("Gagal ambil data manager")
            } finally {
                setLoading(false)
            }
        }

        // Cek Login (Simple check)
        const role = localStorage.getItem("role")
        if (role !== "MANAGER") {
            // Opsional: Redirect kalau bukan manager
            // router.push('/login') 
        }
        
        fetchData()
    }, [])

    if(loading) return <div className="p-10 text-center">Sedang memuat data laporan...</div>

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            {/* --- TOPBAR --- */}
            <header className="bg-slate-900 text-white p-5 print:hidden">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-wider">EXECUTIVE DASHBOARD</h1>
                        <p className="text-xs text-slate-400">PDAM DIGITAL INDONESIA</p>
                    </div>
                    <div className="flex gap-4">
                         <button 
                            onClick={() => window.print()}
                            className="bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded text-sm font-bold transition"
                        >
                            🖨️ Cetak Laporan
                        </button>
                        <button 
                            onClick={() => { localStorage.clear(); router.push('/login') }}
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-sm font-bold transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6 md:p-10">
                
                {/* --- BAGIAN 1: KARTU STATISTIK (KPI) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 print:mb-6">
                    {/* Kartu Pendapatan */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                        <p className="text-xs font-bold text-gray-400 uppercase">Total Pendapatan</p>
                        <h3 className="text-2xl font-black text-green-600 mt-1">
                            Rp {stats.total_pendapatan.toLocaleString('id-ID')}
                        </h3>
                    </div>

                    {/* Kartu Pelanggan */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                        <p className="text-xs font-bold text-gray-400 uppercase">Total Pelanggan</p>
                        <h3 className="text-2xl font-black text-blue-600 mt-1">
                            {stats.total_pelanggan} <span className="text-sm text-gray-400 font-normal">Orang</span>
                        </h3>
                    </div>

                     {/* Kartu Lunas */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-sky-400">
                        <p className="text-xs font-bold text-gray-400 uppercase">Tagihan Lunas</p>
                        <h3 className="text-2xl font-black text-sky-600 mt-1">
                            {stats.transaksi_lunas} <span className="text-sm text-gray-400 font-normal">Transaksi</span>
                        </h3>
                    </div>

                    {/* Kartu Tunggakan */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                        <p className="text-xs font-bold text-gray-400 uppercase">Belum Bayar</p>
                        <h3 className="text-2xl font-black text-red-600 mt-1">
                            {stats.transaksi_tunggakan} <span className="text-sm text-gray-400 font-normal">Transaksi</span>
                        </h3>
                    </div>
                </div>

                {/* --- BAGIAN 2: TABEL LAPORAN --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-700">📄 Laporan Transaksi Bulanan</h2>
                        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 print:hidden">
                            Data Realtime
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Pelanggan</th>
                                    <th className="p-4">Bulan/Thn</th>
                                    <th className="p-4">Meteran</th>
                                    <th className="p-4 text-right">Total (Rp)</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transaksi.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">
                                            {item.user?.name}
                                            <div className="text-xs font-normal text-gray-400">{item.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                {item.bulan} {item.tahun}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {item.meter_awal} - {item.meter_akhir} m³
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold">
                                            {item.total_bayar.toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-4 text-center">
                                            {item.status_bayar === 'LUNAS' ? (
                                                <span className="text-green-600 font-bold text-xs border border-green-200 bg-green-50 px-2 py-1 rounded-full">
                                                    LUNAS
                                                </span>
                                            ) : item.status_bayar === 'MENUNGGU_VERIFIKASI' ? (
                                                <span className="text-yellow-600 font-bold text-xs border border-yellow-200 bg-yellow-50 px-2 py-1 rounded-full">
                                                    VERIFIKASI
                                                </span>
                                            ) : (
                                                <span className="text-red-500 font-bold text-xs border border-red-200 bg-red-50 px-2 py-1 rounded-full">
                                                    BELUM
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Cetak */}
                <div className="hidden print:block mt-10 text-center text-xs text-gray-400">
                    <p>Dicetak otomatis oleh Sistem PDAM Digital</p>
                    <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
            </div>
        </div>
    )
}