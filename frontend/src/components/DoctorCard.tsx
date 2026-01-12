import { Medico } from '@/lib/types';

interface DoctorCardProps {
    medico: Medico;
    onClick?: () => void;
    active?: boolean;
}

export default function DoctorCard({ medico, onClick, active }: DoctorCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                relative bg-white rounded-2xl p-5 transition-all duration-300
                ${active
                    ? 'ring-2 ring-[#00bfa5] shadow-[0_10px_30px_-10px_rgba(0,191,165,0.3)]'
                    : 'shadow-sm hover:shadow-md border border-gray-100 hover:border-teal-100'
                }
                ${onClick ? 'cursor-pointer group' : ''}
            `}
        >
            <div className="flex items-center gap-5">
                {/* Avatar with gradient ring */}
                <div className={`p-0.5 rounded-full bg-gradient-to-br from-[#00bfa5] to-[#00bcd4] ${active ? 'scale-105' : ''} transition-transform`}>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-0.5">
                        <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center overflow-hidden">
                            {medico.foto ? (
                                <img src={medico.foto} alt={medico.nome} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className={`font-bold text-lg leading-tight transition-colors ${active ? 'text-[#009688]' : 'text-gray-800'}`}>
                        {medico.nome.startsWith('Dr') ? medico.nome : `Dr(a). ${medico.nome}`}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-[#00bfa5]" />
                        <p className="text-sm font-medium text-gray-500">{medico.especialidade}</p>
                    </div>
                </div>

                {/* Selection indicator arrow */}
                {active && (
                    <div className="absolute right-4 text-[#00bfa5]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
