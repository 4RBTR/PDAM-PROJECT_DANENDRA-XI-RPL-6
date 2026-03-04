"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Droplets, Receipt, User } from "lucide-react"
import SidebarManager from "@/components/Manager/SidebarManager"
import { getAuthToken } from "@/utils/cookies"
import toast from "react-hot-toast"

interface Transaction {
    id: string | number
    bulan: string
    tahun: string
    meter_awal: number
    meter_akhir: number
    total_bayar: number
    status_bayar: 'LUNAS' | 'BELUM LUNAS'
}

interface Customer {
    name: string
    email: string
}

export default function DetailRiwayatPelanggan() {
    const { id } = useParams()
    const router = useRouter()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDetail()
    }, [id])

    const fetchDetail = async () => {
        try {
            const token = getAuthToken()
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manager/users/${id}/history`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.status) {
                setTransactions(data.transactions)
                setCustomer(data.user)
            }
        } catch (error) {
            toast.error("Gagal memuat riwayat")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Memuat...</div>

    return (
        <div className="flex min-h-screen bg-[#F4F7FE]">
            <SidebarManager managerName={localStorage.getItem("name") || ""} onLogout={() => {}} />
            
            <main className="flex-1 p-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-indigo-600 transition-colors">
                    <ChevronLeft size={20} /> Kembali ke Daftar
                </button>

                {/* Profil Singkat Pelanggan */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-3xl font-black">
                        {customer?.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{customer?.name}</h1>
                        <p className="text-slate-500">{customer?.email}</p>
                        <div className="flex gap-4 mt-2">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium">ID: #{id}</span>
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold uppercase">Aktif</span>
                        </div>
                    </div>
                </div>

                {/* Tabel Riwayat */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-lg text-slate-800">Log Transaksi Air</h3>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Periode</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Meter</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((t: Transaction) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold">{t.bulan} {t.tahun}</td>
                                    <td className="px-6 py-4 text-slate-600">{t.meter_awal} - {t.meter_akhir} m³</td>
                                    <td className="px-6 py-4 font-bold">Rp {t.total_bayar.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            t.status_bayar === 'LUNAS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {t.status_bayar}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}