'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { consultaService, agendaService, medicoService, authService } from '@/lib/api';
import { Consulta, Agenda, Medico } from '@/lib/types';
import Link from 'next/link';

interface ConsultaWithDetails {
    consulta: Consulta;
    agenda?: Agenda;
    medico?: Medico;
}

export default function MinhasConsultasPage() {
    const router = useRouter();
    const [consultas, setConsultas] = useState<ConsultaWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<number | null>(null);
    const [filter, setFilter] = useState<'todas' | 'proximas' | 'passadas'>('todas');

    useEffect(() => {
        if (!authService.isAuthenticated()) return router.push('/login');

        const load = async () => {
            try {
                const [c, m] = await Promise.all([
                    consultaService.getAll(),
                    medicoService.getAll(),
                ]);
                const combined = c.map((consulta: Consulta) => ({
                    consulta,
                    agenda: consulta.agenda_detalhes,
                    medico: m.find((x: Medico) => x.id === consulta.agenda_detalhes?.medico)
                }));
                setConsultas(combined);
            } finally { setLoading(false); }
        };
        load();
    }, [router]);

    const handleCancel = async (id: number) => {
        if (!confirm('Deseja realmente cancelar?')) return;
        setCancelling(id);
        try {
            await consultaService.cancelar(id);
            setConsultas(prev => prev.map(p => p.consulta.id === id ? { ...p, consulta: { ...p.consulta, status: 'CANCELADA' } } : p));
        } finally { setCancelling(null); }
    };

    const filtered = consultas.filter(({ consulta, agenda }) => {
        if (!agenda) return false;
        const dt = new Date(`${agenda.dia}T${agenda.horario}`);
        const now = new Date();
        if (filter === 'proximas') return dt >= now && consulta.status !== 'CANCELADA' && consulta.status !== 'FINALIZADA';
        if (filter === 'passadas') return dt < now || consulta.status === 'FINALIZADA';
        return true;
    }).sort((a, b) => {
        const da = new Date(`${a.agenda!.dia}T${a.agenda!.horario}`).getTime();
        const db = new Date(`${b.agenda!.dia}T${b.agenda!.horario}`).getTime();
        return filter === 'passadas' ? db - da : da - db;
    });

    const getStatusColor = (status: string, date: Date) => {
        if (status === 'CANCELADA') return 'bg-red-100 text-red-600';
        if (status === 'REJEITADA') return 'bg-yellow-100 text-yellow-600';
        if (date < new Date()) return 'bg-gray-100 text-gray-500';
        return 'bg-green-100 text-green-700';
    };

    const getStatusLabel = (status: string, date: Date) => {
        if (status === 'CANCELADA') return 'Cancelada';
        if (status === 'REJEITADA') return 'Rejeitada';
        if (date < new Date()) return 'Finalizada';
        return 'Confirmada';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-10 w-10 border-4 border-[#00bfa5] border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-[#00bfa5] to-[#00aeef] pt-20 pb-32">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Meus Agendamentos</h1>
                            <p className="text-white/90">Gerencie suas consultas e histórico médico.</p>
                        </div>
                        <Link href="/agendar" className="bg-white text-[#009688] px-6 py-3 rounded-xl font-bold hover:bg-teal-50 shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0">
                            + Nova Consulta
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-custom -mt-24 pb-20 relative z-10">
                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-1.5 flex gap-1 mb-8 max-w-md mx-auto md:mx-0">
                    {['todas', 'proximas', 'passadas'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-[#e0f2f1] text-[#00796b] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📅</div>
                            <h3 className="text-xl font-bold text-gray-800">Nenhuma consulta encontrada</h3>
                            <p className="text-gray-400 mt-2">Você não possui agendamentos nesta categoria.</p>
                        </div>
                    ) : (
                        filtered.map(({ consulta, agenda, medico }) => {
                            const date = new Date(`${agenda!.dia}T${agenda!.horario}`);
                            return (
                                <div key={consulta.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#b2dfdb] transition-all flex flex-col md:flex-row items-center gap-6">
                                    {/* Date Box */}
                                    <div className="flex-shrink-0 w-full md:w-24 bg-[#e0f2f1] rounded-2xl p-4 flex flex-col items-center justify-center text-[#00796b]">
                                        <span className="text-xs font-bold uppercase tracking-wider">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                        <span className="text-3xl font-extrabold leading-none my-1">{date.getDate()}</span>
                                        <span className="text-xs font-medium">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">Dr(a). {medico?.nome}</h3>
                                            <span className={`self-center md:self-auto px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(consulta.status, date)}`}>
                                                {getStatusLabel(consulta.status, date)}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 font-medium mb-1">{medico?.especialidade}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
                                            <span>🕒 {agenda?.horario.slice(0, 5)}</span>
                                            <span>•</span>
                                            <span>CRM {medico?.crm}</span>
                                        </div>

                                        {(consulta.status === 'REJEITADA' || consulta.status === 'CANCELADA') && consulta.motivo_cancelamento && (
                                            <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-left">
                                                <p className="text-xs font-bold text-yellow-700 uppercase mb-1">
                                                    Motivo:
                                                </p>
                                                <p className="text-sm text-yellow-600">
                                                    {consulta.motivo_cancelamento}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="w-full md:w-auto">
                                        {consulta.status !== 'CANCELADA' && date >= new Date() && (
                                            <button
                                                onClick={() => handleCancel(consulta.id)}
                                                disabled={cancelling === consulta.id}
                                                className="w-full md:w-auto px-5 py-2.5 rounded-xl border-2 border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                                            >
                                                {cancelling === consulta.id ? 'Cancelando...' : 'Cancelar'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
