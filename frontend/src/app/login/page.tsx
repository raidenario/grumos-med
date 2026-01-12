'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api';
import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loginType, setLoginType] = useState<'paciente' | 'medico'>('paciente');
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('Conta criada com sucesso! Faça login para continuar.');
        } else if (searchParams.get('registered') === 'medico') {
            setLoginType('medico');
            setSuccessMessage('Conta de médico criada! Acesse seu painel.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(formData.username, formData.password);

            // Redirect based on login type context
            if (loginType === 'medico') {
                router.push('/medico/dashboard');
            } else {
                router.push('/');
            }
        } catch (err) {
            setError('Credenciais inválidas. Verifique seus dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center px-4 py-20 md:py-0">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md text-white">
                            <LogoIcon />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Bem-vindo de volta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-50 p-1 rounded-xl mb-8 border border-gray-100">
                    <button
                        onClick={() => setLoginType('paciente')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all border-2 border-transparent ${loginType === 'paciente'
                            ? 'bg-white text-teal-600 shadow-sm border-teal-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Sou Paciente
                    </button>
                    <button
                        onClick={() => setLoginType('medico')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all border-2 border-transparent ${loginType === 'medico'
                            ? 'bg-white text-teal-600 shadow-sm border-teal-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Sou Médico
                    </button>
                </div>

                {successMessage && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                        <span className="text-lg">🎉</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            Usuário
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            placeholder="Digite seu usuário"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                Senha
                            </label>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            placeholder="******"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Entrando...' : `Entrar como ${loginType === 'paciente' ? 'Paciente' : 'Médico'}`}
                    </button>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-400 font-medium">
                            Novo por aqui?
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center text-sm">
                    <Link
                        href={loginType === 'paciente' ? "/registro" : "/registro-medico"}
                        className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-all"
                    >
                        {loginType === 'paciente' ? 'Criar conta de paciente' : 'Vincular conta médica'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
