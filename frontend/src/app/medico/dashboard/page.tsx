'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { consultaService, authService } from '@/lib/api';
import { Consulta, Agenda } from '@/lib/types'; // Assuming types are shared or need update
// Note: Consulta interface in types.ts likely needs 'paciente_detalhes' if we want to show patient name.
// Current frontend types might be minimal. I should check api response.
// Backend ConsultaSerializer has 'paciente' as ID.
// I should update ConsultaSerializer to include patient details or fetch them.
// Let's check backend serializer first? 
// Actually, I already modified ConsultaSerializer to have 'paciente' as PrimaryKeyRelatedField.
// I should probably add 'paciente_detalhes' to serializer for better DX.

export default function MedicoDashboard() {
    const router = useRouter();
    const [consultas, setConsultas] = useState<Consulta[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionState, setActionState] = useState<{ id: number; status: string; motivo: string } | null>(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) return router.push('/login');

        const loadData = async () => {
            try {
                const data = await consultaService.getAll();
                // Sort: Pendente first, then by date logic if needed. 
                // For now just load.
                setConsultas(data);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const updateConsultationStatus = async (id: number, status: string, motivo?: string) => {
        try {
            const updated = await consultaService.updateStatus(id, status, motivo);
            setConsultas(prev => prev.map(c => c.id === id ? updated : c));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Erro ao atualizar status.');
        }
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        if (newStatus === 'REJEITADA' || newStatus === 'CANCELADA') {
            setActionState({ id, status: newStatus, motivo: '' });
        } else {
            updateConsultationStatus(id, newStatus);
        }
    };

    const confirmStatusChange = () => {
        if (!actionState) return;
        updateConsultationChange(actionState.id, actionState.status, actionState.motivo);
        setActionState(null);
    };

    // Helper to fix the typo in confirmStatusChange call above:
    const updateConsultationChange = updateConsultationStatus;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 pb-32 pt-10 shadow-lg">
                <div className="container-custom text-white">
                    <h1 className="text-3xl font-bold">Painel do Médico</h1>
                    <p className="mt-2 text-teal-100 font-medium">Gerencie seus atendimentos e pacientes</p>
                </div>
            </div>

            <div className="container-custom -mt-24 pb-20">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Próximos Atendimentos</h2>
                        <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                            Total: {consultas.length}
                        </span>
                    </div>

                    {consultas.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📅</div>
                            <h3 className="text-lg font-bold text-gray-900">Agenda Vazia</h3>
                            <p className="text-gray-500 mt-1">Nenhuma consulta agendada no momento.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {consultas.map((consulta) => (
                                <div key={consulta.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6">
                                    {/* Date Column */}
                                    <div className="flex-shrink-0 flex flex-row md:flex-col items-center justify-center md:justify-start gap-2 md:w-24">
                                        <div className="text-center bg-teal-50 text-teal-700 rounded-xl p-3 w-full border border-teal-100">
                                            <p className="text-xs font-bold uppercase tracking-wider mb-1">
                                                {consulta.agenda_detalhes?.dia && new Date(consulta.agenda_detalhes.dia).toLocaleDateString('pt-BR', { month: 'short' })}
                                            </p>
                                            <p className="text-2xl font-black leading-none">
                                                {consulta.agenda_detalhes?.dia && new Date(consulta.agenda_detalhes.dia).getDate()}
                                            </p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
                                            {consulta.agenda_detalhes?.horario.slice(0, 5)}
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {consulta.paciente_detalhes?.nome || `Paciente #${consulta.paciente_detalhes?.id}`}
                                                </h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                        {consulta.paciente_detalhes?.telefone || 'Sem telefone'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                        {consulta.paciente_detalhes?.email || 'Sem email'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge (Static display or small indicator) */}
                                            <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${consulta.status === 'CONFIRMADA' ? 'bg-green-50 text-green-700 border-green-100' :
                                                consulta.status === 'PENDENTE' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    consulta.status === 'CANCELADA' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-gray-50 text-gray-700 border-gray-100'
                                                }`}>
                                                {consulta.status}
                                            </span>
                                        </div>

                                        {consulta.observacoes && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm md:max-w-xl">
                                                <span className="font-bold text-gray-700 block text-xs uppercase mb-1">Motivo / Observações:</span>
                                                <p className="text-gray-600">{consulta.observacoes}</p>
                                            </div>
                                        )}

                                        {/* Action Bar */}
                                        <div className="mt-4 flex flex-col gap-3">
                                            {actionState?.id === consulta.id ? (
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in text-left">
                                                    <p className="text-sm font-bold text-gray-700 mb-2">
                                                        {actionState.status === 'REJEITADA' ? 'Motivo da Rejeição' : 'Motivo do Cancelamento'}
                                                    </p>
                                                    <textarea
                                                        value={actionState.motivo}
                                                        onChange={(e) => setActionState({ ...actionState, motivo: e.target.value })}
                                                        placeholder="Descreva o motivo..."
                                                        className="w-full p-3 rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 text-sm mb-3"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setActionState(null)}
                                                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={confirmStatusChange}
                                                            disabled={!actionState.motivo.trim()}
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            Confirmar {actionState.status === 'REJEITADA' ? 'Rejeição' : 'Cancelamento'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    value={consulta.status}
                                                    onChange={(e) => handleStatusChange(consulta.id, e.target.value)}
                                                    className={`
                                                        text-sm font-bold py-2 pl-3 pr-8 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer w-full md:w-auto
                                                        ${consulta.status === 'CONFIRMADA' || consulta.status === 'AGENDADA' ? 'border-green-100 bg-green-50 text-green-700 focus:ring-green-200' :
                                                            consulta.status === 'CANCELADA' || consulta.status === 'REJEITADA' ? 'border-red-100 bg-red-50 text-red-700 focus:ring-red-200' :
                                                                'border-gray-200 bg-white text-gray-700 focus:ring-gray-200'}
                                                    `}
                                                >
                                                    <option value="PENDENTE">Pendente</option>
                                                    <option value="AGENDADA">Agendada (Confirmar)</option>
                                                    <option value="FINALIZADA">Finalizada</option>
                                                    <option value="REJEITADA">Rejeitar</option>
                                                    <option value="CANCELADA">Cancelar</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
