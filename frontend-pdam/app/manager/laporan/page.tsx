"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
    Printer, Search, FileText, 
    ChevronLeft, ChevronRight} from "lucide-react"
import { getAuthToken, getUserRole, removeAuthToken } from "@/utils/cookies"
import SidebarManager from "@/components/Manager/SidebarManager"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ITagihan {
    id: number;
    user: { name: string; email: string };
    bulan: string;
    tahun: number;
    total_bayar: number;
    status_bayar: string;
    meter_awal: number;
    meter_akhir: number;
    updatedAt: string;
}

export default function LaporanManager() {
    const [transaksi, setTransaksi] = useState<ITagihan[]>([])
    const [managerName, setManagerName] = useState("")
    const [, setLoading] = useState(true)
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")
    const [filterBulan, setFilterBulan] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const router = useRouter()

    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()
        const name = localStorage.getItem("name")

        if (!token || role !== "MANAGER") {
            router.replace("/login")
            return
        }

        if (name) setManagerName(name)
        fetchLaporanData()
    }, [router])

    const fetchLaporanData = async () => {
        try {
            const token = getAuthToken()
            const res = await fetch(`${API_URL}/manager/dashboard`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.status) {
                setTransaksi(data.data)
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Gagal mengambil data laporan")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        removeAuthToken()
        localStorage.removeItem("name")
        router.push('/')
    }

    // --- LOGIKA FILTER REAL DATA ---
    const filteredData = useMemo(() => {
        return transaksi.filter(item => {
            const matchSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.id.toString().includes(searchTerm)
            const matchStatus = filterStatus === "ALL" || item.status_bayar === filterStatus
            const matchBulan = filterBulan === "ALL" || item.bulan === filterBulan
            return matchSearch && matchStatus && matchBulan
        })
    }, [transaksi, searchTerm, filterStatus, filterBulan])

    // --- KALKULASI RINGKASAN REAL ---
    const ringkasan = useMemo(() => {
        const totalUang = filteredData.reduce((acc, curr) => curr.status_bayar === 'LUNAS' ? acc + curr.total_bayar : acc, 0)
        const totalAir = filteredData.reduce((acc, curr) => acc + (curr.meter_akhir - curr.meter_awal), 0)
        return { totalUang, totalAir, totalTrx: filteredData.length }
    }, [filteredData])

    const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    return (
        <div className="flex min-h-screen bg-[#F4F7FE]">
            <SidebarManager managerName={managerName} onLogout={handleLogout} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
                    
                    {/* Header Laporan */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <FileText className="text-indigo-600" /> Laporan Transaksi Detail
                            </h1>
                            <p className="text-slate-500 text-sm">Data riil penggunaan air dan status keuangan pelanggan.</p>
                        </div>
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Printer size={18} /> Cetak Laporan
                        </button>
                    </div>

                    {/* Ringkasan Real-Time Berdasarkan Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pendapatan (Lunas)</p>
                            <h3 className="text-xl font-black text-emerald-600">{formatRp(ringkasan.totalUang)}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Konsumsi Air</p>
                            <h3 className="text-xl font-black text-indigo-600">{ringkasan.totalAir} m³</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Jumlah Transaksi</p>
                            <h3 className="text-xl font-black text-slate-800">{ringkasan.totalTrx} Baris</h3>
                        </div>
                    </div>

                    {/* Filter Kontrol */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Cari Pelanggan..." 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="LUNAS">Lunas</option>
                                <option value="BELUM_BAYAR">Belum Bayar</option>
                                <option value="MENUNGGU_VERIFIKASI">Verifikasi</option>
                            </select>
                            <select 
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
                                value={filterBulan}
                                onChange={(e) => setFilterBulan(e.target.value)}
                            >
                                <option value="ALL">Semua Bulan</option>
                                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold italic">
                                *Data sinkron otomatis dengan server
                            </div>
                        </div>
                    </div>

                    {/* Tabel Laporan Detail */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Detail Pelanggan</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Periode</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-center">Meter (Awal - Akhir)</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-center">Konsumsi</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Total Tagihan</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800 text-sm">{item.user.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">TRX-ID: {item.id}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {item.bulan} {item.tahun}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-mono text-slate-500">
                                                {item.meter_awal} - {item.meter_akhir}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-black">
                                                    {item.meter_akhir - item.meter_awal} m³
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {formatRp(item.total_bayar)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    item.status_bayar === 'LUNAS' ? 'bg-emerald-100 text-emerald-700' : 
                                                    item.status_bayar === 'MENUNGGU_VERIFIKASI' ? 'bg-amber-100 text-amber-700' : 
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {item.status_bayar.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-500 uppercase">
                                Menampilkan {currentItems.length} dari {filteredData.length} Data
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}