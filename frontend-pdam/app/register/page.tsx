"use client"
import { useState } from "react"

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'PELANGGAN' })

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const res = await fetch('http://localhost:8000/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        const data = await res.json();
        alert(data.message);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-50">
            <form onSubmit={submit} className="p-10 bg-white rounded-xl shadow-lg w-96 flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-blue-600 text-center">Daftar PDAM</h1>
                <input className="border p-2 rounded" placeholder="Nama" onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="border p-2 rounded" type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
                <textarea className="border p-2 rounded" placeholder="Alamat" onChange={e => setForm({ ...form, address: e.target.value })} />
                <select className="border p-2 rounded" onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="PELANGGAN">PELANGGAN</option>
                    <option value="KASIR">KASIR</option>
                    <option value="MANAGER">MANAGER</option>
                </select>
                <button className="bg-blue-600 text-white p-2 rounded font-bold">DAFTAR</button>
            </form>
        </div>
    )
}