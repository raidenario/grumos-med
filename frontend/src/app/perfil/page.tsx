'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { User } from '@/lib/types';
import { LogoIcon } from '@/components/Logo';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authService.isAuthenticated()) return router.push('/login');

        const loadData = async () => {
            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch (error) {
                console.error('Failed to load profile:', error);
                authService.logout();
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const handleLogout = () => {
        authService.logout();
        window.dispatchEvent(new Event('auth-update'));
        router.push('/');
    };

    //const handleUpdateProfilePhoto 

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Cover */}
            {/* Header / Cover */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 h-48 w-full relative shadow-lg"></div>

            <div className="flex-1 container-custom relative z-10 -mt-24 pb-12 flex flex-col items-center">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
                    <div className="bg-gray-50/50 p-8 text-center border-b border-gray-100">
                        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 shadow-lg flex items-center justify-center text-gray-400 p-1">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{user?.username}</h1>
                        <p className="text-gray-500 font-medium">{user?.email}</p>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Detalhes da Conta</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user?.type === 'medico' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {user?.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ID do Usuário</label>
                                <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{user?.id}</p>
                            </div>

                            {user?.type === 'medico' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">CRM</label>
                                        <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{user?.crm}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Perfil Médico</label>
                                        <button
                                            onClick={() => router.push('/medico/dashboard')}
                                            className="w-full text-left font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 p-3 rounded-lg transition-colors flex items-center justify-between group"
                                        >
                                            Acessar Painel
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>
                                    </div>
                                </>
                            )}

                            {user?.type === 'paciente' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Minhas Consultas</label>
                                    <button
                                        onClick={() => router.push('/minhas-consultas')}
                                        className="w-full text-left font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition-colors flex items-center justify-between group"
                                    >
                                        Ver Histórico
                                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
