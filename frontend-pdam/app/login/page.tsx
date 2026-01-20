"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:8000/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (data.status) {
                toast.success("Login Berhasil! 🚀");
                // Simpan token ke localStorage (sementara untuk latihan)
                localStorage.setItem("token", data.token)
                localStorage.setItem("role", data.data.role)
                localStorage.setItem("name", data.data.name)
                localStorage.setItem("userId", data.data.id);

                // Redirect sesuai role
                const role = data.data.role
                if (role === "MANAGER") router.push("/manager/dashboard")
                else if (role === "KASIR") router.push("/kasir/dashboard")
                else router.push("/user/dashboard")
            } else {
                toast.error(data.message)
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Gagal terhubung ke server. Pastikan Backend sudah nyala!")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-100 font-[sans-serif]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-5xl">💧</span>
                    <h1 className="text-2xl font-bold text-sky-700 mt-2">Login PDAM Digital</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full p-3 border rounded-lg outline-sky-500 text-black"
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            className="w-full p-3 border rounded-lg outline-sky-500 text-black"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition mt-4">
                        MASUK
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-500">
                    Belum punya akun? <a href="/register" className="text-sky-600 font-bold hover:underline">Daftar Sekarang</a>
                </p>
            </div>
        </div>
    )
}