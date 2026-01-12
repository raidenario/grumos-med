'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { medicoService, agendaService, consultaService, authService } from '@/lib/api';
import { Medico, Agenda } from '@/lib/types';
import DoctorCard from '@/components/DoctorCard';
import Link from 'next/link';

export default function AgendarPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const medicoIdParam = searchParams.get('medico');
    const especialidadeParam = searchParams.get('especialidade');

    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [observacoes, setObservacoes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [filterEspecialidade, setFilterEspecialidade] = useState(especialidadeParam || '');

    useEffect(() => {
        const loadMedicos = async () => {
            try {
                const data = await medicoService.getAll();
                setMedicos(data);

                if (medicoIdParam) {
                    const medico = data.find((m: Medico) => m.id === parseInt(medicoIdParam));
                    if (medico) setSelectedMedico(medico);
                }
            } catch (error) {
                console.error('Error loading doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        loadMedicos();
    }, [medicoIdParam]);

    useEffect(() => {
        const loadAgendas = async () => {
            if (selectedMedico) {
                try {
                    const data = await agendaService.getByMedico(selectedMedico.id);
                    setAgendas(data.filter((a: Agenda) => a.disponivel));
                } catch (error) {
                    console.error('Error loading schedules:', error);
                }
            }
        };
        loadAgendas();
    }, [selectedMedico]);

    const handleSelectMedico = (medico: Medico) => {
        setSelectedMedico(medico);
        setSelectedAgenda(null);
        setSuccess(false);
        setError('');
    };

    const [userType, setUserType] = useState<'paciente' | 'medico' | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const user = await authService.getMe();
                    setUserType(user.type);
                    if (user.type === 'medico') {
                        router.push('/medico/dashboard'); // Redirect doctors to their dashboard
                    }
                } catch {
                    // ignore
                }
            }
        };
        checkUser();
    }, [router]);

    const handleSubmit = async () => {
        if (!authService.isAuthenticated()) {
            setError('Faça login para continuar.');
            return;
        }

        if (userType === 'medico') {
            setError('Médicos não podem agendar consultas como pacientes.');
            return;
        }

        if (!selectedAgenda) {
            setError('Selecione um horário.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await consultaService.create({
                agenda: selectedAgenda.id,
                observacoes: observacoes,
            });
            setSuccess(true);
            setSelectedAgenda(null);
            setObservacoes('');

            // Refresh
            const data = await agendaService.getByMedico(selectedMedico!.id);
            setAgendas(data.filter((a: Agenda) => a.disponivel));
        } catch {
            setError('Erro ao agendar. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMedicos = medicos.filter((m) => {
        if (!filterEspecialidade) return true;
        return m.especialidade.toLowerCase().includes(filterEspecialidade.toLowerCase());
    });

    const especialidades = [...new Set(medicos.map((m) => m.especialidade))];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const groupedAgendas = agendas.reduce((acc, agenda) => {
        if (!acc[agenda.dia]) acc[agenda.dia] = [];
        acc[agenda.dia].push(agenda);
        return acc;
    }, {} as Record<string, Agenda[]>);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#00bfa5] to-[#00bcd4] pt-24 pb-16 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-teal-900 opacity-10 rounded-full blur-2xl"></div>

                <div className="container-custom relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Novo Agendamento</h1>
                    <p className="text-teal-50 text-lg opacity-90">Escolha o especialista ideal e o melhor horário para você.</p>
                </div>
            </div>

            <div className="container-custom -mt-10 pb-20 relative z-20">
                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg shadow-md mb-8 flex items-center justify-between animate-fade-in-up">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🎉</span>
                            <div>
                                <p className="font-bold">Agendamento Realizado!</p>
                                <p className="text-sm">Sua consulta foi confirmada com sucesso.</p>
                            </div>
                        </div>
                        <Link href="/minhas-consultas" className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all">
                            Ver Detalhes
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="bg-white border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-md mb-8 flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span className="font-medium">{error}</span>
                        {error.includes('login') && <Link href="/login" className="underline font-bold ml-2">Entrar agora</Link>}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Doctor Selection */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Filter */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Filtrar por Especialidade</label>
                            <div className="relative">
                                <select
                                    value={filterEspecialidade}
                                    onChange={(e) => setFilterEspecialidade(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#00bfa5] text-gray-700 font-medium appearance-none cursor-pointer"
                                >
                                    <option value="">Todas as especialidades</option>
                                    {especialidades.map((esp) => (
                                        <option key={esp} value={esp}>{esp}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex flex-col gap-3">
                            <h2 className="text-gray-800 font-bold text-lg px-2">Especialistas Disponíveis</h2>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredMedicos.map((medico) => (
                                        <DoctorCard
                                            key={medico.id}
                                            medico={medico}
                                            active={selectedMedico?.id === medico.id}
                                            onClick={() => handleSelectMedico(medico)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Time Slots & Confirmation */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] relative">
                            {!selectedMedico ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                                        <span className="text-4xl">👈</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Comece por aqui</h3>
                                    <p className="text-gray-500 max-w-sm">Selecione um médico na lista ao lado para visualizar a agenda disponível.</p>
                                </div>
                            ) : (
                                <div className="p-8">
                                    {/* Selected Doctor Header */}
                                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                                        <div className="w-16 h-16 bg-[#e0f2f1] rounded-2xl flex items-center justify-center overflow-hidden">
                                            {selectedMedico.foto ? (
                                                <img src={selectedMedico.foto} alt={selectedMedico.nome} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#009688] uppercase tracking-wide">Médico Selecionado</p>
                                            <h2 className="text-2xl font-bold text-gray-900">Dr(a). {selectedMedico.nome}</h2>
                                            <p className="text-gray-500">{selectedMedico.especialidade} • CRM {selectedMedico.crm}</p>
                                        </div>
                                    </div>

                                    {/* Calendar */}
                                    {Object.keys(groupedAgendas).length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-400 font-medium">Nenhum horário disponível para este médico.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-fade-in">
                                            {Object.entries(groupedAgendas).map(([dia, slots]) => (
                                                <div key={dia}>
                                                    <div className="flex items-end gap-3 mb-4">
                                                        <h3 className="text-lg font-bold text-gray-800 capitalize">
                                                            {new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                                                        </h3>
                                                        <span className="text-gray-400 text-sm font-medium mb-1">
                                                            {new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                        {slots.map((agenda) => (
                                                            <button
                                                                key={agenda.id}
                                                                onClick={() => setSelectedAgenda(agenda)}
                                                                className={`
                                                                    py-2.5 px-3 rounded-xl text-sm font-bold transition-all border
                                                                    ${selectedAgenda?.id === agenda.id
                                                                        ? 'bg-[#009688] text-white border-[#009688] shadow-lg shadow-teal-500/30 scale-105'
                                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#00bfa5] hover:text-[#009688]'
                                                                    }
                                                                `}
                                                            >
                                                                {agenda.horario.slice(0, 5)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Confirmation Area */}
                                    {selectedAgenda && (
                                        <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-slide-up">
                                            <h3 className="font-bold text-gray-900 mb-4">Confirmar Detalhes</h3>

                                            <div className="mb-6">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observações (Opcional)</label>
                                                <textarea
                                                    value={observacoes}
                                                    onChange={(e) => setObservacoes(e.target.value)}
                                                    className="w-full p-4 rounded-xl border-gray-200 focus:border-[#00bfa5] focus:ring-[#00bfa5] bg-white"
                                                    rows={2}
                                                    placeholder="Alguma informação importante para o médico?"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="w-full bg-gradient-to-r from-[#00bfa5] to-[#00bcd4] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                                        Confirmando...
                                                    </span>
                                                ) : (
                                                    'Confirmar Agendamento'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
