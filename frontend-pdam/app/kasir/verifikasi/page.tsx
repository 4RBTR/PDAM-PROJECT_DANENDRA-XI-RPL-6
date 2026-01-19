"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function VerifikasiPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [list, setList] = useState<any[]>([])
    const router = useRouter()

    const loadData = async () => {
        try {
            const res = await fetch('http://localhost:8000/tagihan/verifikasi/list')
            const data = await res.json()
            if (data.status) setList(data.data)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Error fetching verification list")
        }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadData() }, [])

    const proses = async (id: number, aksi: string) => {
        if (!confirm(`Yakin ingin ${aksi} pembayaran ini?`)) return;

        try {
            const res = await fetch(`http://localhost:8000/tagihan/verifikasi/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aksi })
            })
            const data = await res.json()
            if (data.status) {
                alert("Berhasil memproses data!");
                loadData();
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Gagal memproses.")
        }
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen font-sans text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-blue-800">🔍 VERIFIKASI PEMBAYARAN</h1>
                    <p className="text-sm text-gray-500">Cek bukti transfer pelanggan sebelum melunaskan.</p>
                </div>
                <button onClick={() => router.push('/kasir/dashboard')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm">
                    &larr; Kembali ke Dashboard
                </button>
            </div>

            {/* List Verifikasi */}
            <div className="grid gap-6">
                {list.length === 0 && (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm">
                        <p className="text-gray-400 italic">Tidak ada pembayaran yang menunggu verifikasi saat ini.</p>
                    </div>
                )}

                {list.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row gap-8">
                        {/* Bagian Gambar Bukti */}
                        <div className="w-full md:w-1/3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 text-center">Bukti Transfer</p>
                            <a href={`http://localhost:8000/uploads/${item.bukti_bayar}`} target="_blank" rel="noreferrer" title="bukti">
                                <Image
                                    src={`http://localhost:8000/uploads/${item.bukti_bayar}`}
                                    alt="Bukti Bayar"
                                    width={300}
                                    height={192}
                                    className="w-full h-48 object-cover rounded hover:opacity-90 cursor-zoom-in"
                                />
                            </a>
                        </div>

                        {/* Bagian Informasi */}
                        <div className="w-full md:w-2/3 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pelanggan</p>
                                        <h2 className="text-2xl font-black uppercase mb-1">{item.userName}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Periode</p>
                                        <p className="font-bold text-lg">{item.bulan} {item.tahun}</p>
                                    </div>
                                </div>

                                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 inline-block w-full">
                                    <p className="text-sm text-gray-500">Total yang harus dibayar:</p>
                                    <p className="text-3xl font-black text-blue-800">Rp {item.total_bayar.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => proses(item.id, 'TERIMA')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition transform active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <span>✅</span> TERIMA & LUNASKAN
                                </button>
                                <button
                                    onClick={() => proses(item.id, 'TOLAK')}
                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-3 rounded-xl font-bold border border-red-200 transition transform active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <span>❌</span> TOLAK BUKTI
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}