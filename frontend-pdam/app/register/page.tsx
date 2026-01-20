"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        address: ''
        // Role dihapus dari state, nanti kita inject manual
    })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:8000/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    role: "PELANGGAN" // <--- PAKSA ROLE JADI PELANGGAN DISINI
                })
            })
            const data = await res.json()
            if (data.status) {
                toast.success("Register Berhasil! Silakan Login.")
                router.push('/login')
            } else {
                toast.error("Gagal: " + data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Terjadi kesalahan koneksi")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Daftar Pelanggan Baru</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                        <input
                            required name="name" type="text" placeholder="Nama Anda"
                            className="w-full border p-3 rounded-lg bg-slate-50 focus:outline-sky-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            required name="email" type="email" placeholder="email@contoh.com"
                            className="w-full border p-3 rounded-lg bg-slate-50 focus:outline-sky-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            required name="password" type="password" placeholder="********"
                            className="w-full border p-3 rounded-lg bg-slate-50 focus:outline-sky-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Alamat Pemasangan</label>
                        <textarea
                            required name="address" placeholder="Alamat lengkap..."
                            className="w-full border p-3 rounded-lg bg-slate-50 focus:outline-sky-500 h-24"
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* INPUT ROLE SUDAH DIHAPUS DARI SINI */}

                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition shadow-md mt-4">
                        Daftar Sekarang
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-4">
                    Sudah punya akun? <a href="/login" className="text-sky-600 font-bold hover:underline">Login disini</a>
                </p>
            </div>
        </div>
    )
}