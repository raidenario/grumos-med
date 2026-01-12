import { Consulta, Medico, Agenda } from '@/lib/types';

interface AppointmentCardProps {
    consulta: Consulta;
    medico?: Medico;
    agenda?: Agenda;
    onCancel?: () => void;
}

export default function AppointmentCard({ consulta, medico, agenda, onCancel }: AppointmentCardProps) {
    const statusColors: Record<string, string> = {
        PENDENTE: 'bg-yellow-100 text-yellow-800',
        AGENDADA: 'bg-green-100 text-green-800',
        FINALIZADA: 'bg-blue-100 text-blue-800',
        CANCELADA: 'bg-red-100 text-red-800',
        REJEITADA: 'bg-gray-100 text-gray-800',
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        }).toUpperCase();
    };

    const formatTime = (timeStr: string) => {
        return timeStr.slice(0, 5);
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-teal-500">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                {medico ? `Dr(a). ${medico.nome}` : 'Médico não informado'}
                            </h3>
                            <p className="text-sm text-teal-600">{medico?.especialidade || 'Especialidade'}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[consulta.status] || 'bg-gray-100'}`}>
                            {consulta.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                            {agenda ? `${formatDate(agenda.dia)}, ${formatTime(agenda.horario)}` : 'Data não informada'}
                        </span>
                    </div>

                    {consulta.observacoes && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                            &quot;{consulta.observacoes}&quot;
                        </p>
                    )}

                    {onCancel && consulta.status !== 'CANCELADA' && consulta.status !== 'FINALIZADA' && (
                        <button
                            onClick={onCancel}
                            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            Cancelar consulta
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
