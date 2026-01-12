interface SpecialtyCardProps {
    nome: string;
    icon?: React.ReactNode;
    link?: string;
    onClick?: () => void;
}

export default function SpecialtyCard({ nome, icon, onClick }: SpecialtyCardProps) {
    const defaultIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''
                }`}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    {icon || defaultIcon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{nome}</h3>
                    <button className="text-sm text-teal-600 hover:text-teal-700 font-medium mt-1">
                        Especialidades
                    </button>
                </div>
            </div>
        </div>
    );
}
