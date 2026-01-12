'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const router = useRouter();
    const [especialidade, setEspecialidade] = useState('');
    const [localizacao, setLocalizacao] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (especialidade) params.set('especialidade', especialidade);
        if (localizacao) params.set('localizacao', localizacao);
        router.push(`/agendar?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 w-full max-w-5xl">
            {/* Input Group 1 */}
            <div className="flex-1 bg-white rounded-lg shadow-lg flex items-center p-1 relative group focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                <span className="pl-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
                <input
                    type="text"
                    placeholder="Especialidade, Médico"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400 rounded-lg"
                />
            </div>

            {/* Input Group 2 */}
            <div className="flex-1 bg-white rounded-lg shadow-lg flex items-center p-1 relative group focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                <span className="pl-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </span>
                <input
                    type="text"
                    placeholder="Localização"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400 rounded-lg"
                />
            </div>

            <button
                type="submit"
                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-teal-700 transition-all hover:shadow-xl uppercase tracking-wide text-sm md:w-auto w-full"
            >
                Agendar
            </button>
        </form>
    );
}
