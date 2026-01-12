'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authService } from '@/lib/api';
import { LogoIcon } from '@/components/Logo';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [userType, setUserType] = useState<'paciente' | 'medico' | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = authService.isAuthenticated();
            setIsAuthenticated(isAuth);
            if (isAuth) {
                try {
                    const user = await authService.getMe();
                    setUserType(user.type);
                } catch {
                    // ignore
                }
            } else {
                setUserType(null);
            }
        };
        checkAuth();
        window.addEventListener('auth-update', checkAuth);
        return () => window.removeEventListener('auth-update', checkAuth);
    }, []);

    const handleLogout = () => {
        authService.logout();
        window.dispatchEvent(new Event('auth-update')); // Trigger update
        router.push('/');
    };

    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div className="container-custom h-20 flex items-center justify-between">
                {/* Logo area */}
                <div className="flex-shrink-0 w-1/4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <LogoIcon />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900 flex items-center">
                            <span className="text-[#009688]">grumos</span>
                            <span className="text-[#00bcd4]">Med</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation - Centered */}
                <nav className="hidden md:flex flex-1 justify-center items-center gap-10">
                    {/* Common Links */}
                    <Link
                        href="/"
                        className={`text-sm font-semibold transition-colors relative py-2 ${pathname === '/' ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}`}
                    >
                        Início
                    </Link>

                    {/* Conditional Links based on role */}
                    {userType === 'medico' ? (
                        <Link
                            href="/medico/dashboard"
                            className={`text-sm font-semibold transition-colors relative py-2 ${pathname === '/medico/dashboard' ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-teal-600' : 'text-gray-500 hover:text-teal-600'}`}
                        >
                            Painel Médico
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/agendar"
                                className={`text-sm font-semibold transition-colors relative py-2 ${pathname === '/agendar' ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-teal-600' : 'text-gray-500 hover:text-teal-600'}`}
                            >
                                Agendar
                            </Link>
                            <Link
                                href="/minhas-consultas"
                                className={`text-sm font-semibold transition-colors relative py-2 ${pathname === '/minhas-consultas' ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-teal-600' : 'text-gray-500 hover:text-teal-600'}`}
                            >
                                Minhas Consultas
                            </Link>
                        </>
                    )}
                </nav>

                {/* Auth Buttons - Right aligned */}
                <div className="flex-shrink-0 w-1/4 flex justify-end items-center gap-5">
                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/perfil"
                                className="text-sm font-semibold text-gray-600 hover:text-[#009688] transition-colors"
                            >
                                Meu Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#009688] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#00897b] transition-all transform hover:-translate-y-px"
                        >
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
