'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function RegistroMedicoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: '',
        especialidade: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        crm: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirm_password) {
            setError('As senhas não conferem.');
            setLoading(false);
            return;
        }

        try {
            await authService.medicoRegister({
                nome: formData.nome,
                especialidade: formData.especialidade,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                crm: formData.crm
            });

            router.push('/login?registered=medico');
        } catch (err: any) {
            console.error('Registration error:', err);
            const msg = err.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : 'Erro ao criar conta. Verifique os dados e tente novamente.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center px-4 py-20 md:py-0">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden my-10">
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>

                <div className="text-center mb-6">
                    <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg text-white mx-auto">
                            <LogoIcon />
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Cadastro de Médico
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Crie sua conta para gerenciar seus agendamentos
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            Nome Completo
                        </label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="especialidade" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            Especialidade
                        </label>
                        <input
                            id="especialidade"
                            name="especialidade"
                            type="text"
                            required
                            placeholder="Ex: Cardiologia"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.especialidade}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="crm" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            CRM
                        </label>
                        <input
                            id="crm"
                            name="crm"
                            type="text"
                            required
                            placeholder="Ex: 12345-SP"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.crm}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            Nome de Usuário (Login)
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                Confirmar
                            </label>
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                value={formData.confirm_password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Cadastrando...' : 'Criar conta de médico'}
                    </button>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-400 font-medium">
                            Alternativas
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center text-sm">
                    <Link
                        href="/registro"
                        className="font-medium text-teal-600 hover:text-teal-700 hover:underline transition-all"
                    >
                        Sou paciente (Cadastro comum)
                    </Link>
                </div>
            </div>
        </div>
    );
}
