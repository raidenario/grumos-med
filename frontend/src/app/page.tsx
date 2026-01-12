'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { medicoService, consultaService, agendaService, authService, BASE_URL } from '@/lib/api';
import { Medico, Consulta, Agenda } from '@/lib/types';
import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function Home() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [proximasConsultas, setProximasConsultas] = useState<Array<{
    consulta: Consulta;
    medico?: Medico;
    agenda?: Agenda;
  }>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const medicosData = await medicoService.getAll();
        setMedicos(medicosData);

        if (authService.isAuthenticated()) {
          setIsAuthenticated(true);
          try {
            const consultasData = await consultaService.getAll();
            // We don't fetch agendas separately anymore as per previous fix, relying on nested details or similar logic if needed.
            // However, Home page logic was: 
            // "const agenda = agendasData.find..."
            // If I removed agendaService.getAll() from MinhasConsultas, I should probably check if I need it here.
            // Backend ConsultaSerializer has 'agenda_detalhes'. 
            // Let's use that if available, otherwise fetch agendas (but fetching all might miss unavailable ones).
            // Actually, for "Próximas Consultas", likely the same issue exists in Home page.
            // I should fix Home page logic too!

            // Let's use nested details if present, or just list specific agendas?
            // The previous code fetched all agendas. That was the bug source.
            // So I should fix it here too: use consulta.agenda_detalhes.

            const combined = consultasData
              .filter((c: Consulta) => c.status !== 'CANCELADA' && c.status !== 'FINALIZADA')
              .slice(0, 3)
              .map((consulta: Consulta) => {
                // Use nested details if available
                const agenda = consulta.agenda_detalhes;
                const medico = medicosData.find((m: Medico) => m.id === agenda?.medico);
                return { consulta, medico, agenda };
              });

            setProximasConsultas(combined);
          } catch {
            // User might not have permission
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const especialidades = [
    { nome: 'Cardiologista', icon: '❤️' },
    { nome: 'Médico', icon: '🩺' },
    { nome: 'Dermatologista', icon: '🧴' },
  ];

  const uniqueEspecialidades = [...new Set(medicos.map(m => m.especialidade))];
  const displayEspecialidades = uniqueEspecialidades.length > 0
    ? uniqueEspecialidades.slice(0, 3).map(e => ({ nome: e, icon: '❤️' }))
    : especialidades;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section - Using global CSS class for gradient */}
      <section className="relative w-full overflow-hidden bg-gradient-primary">

        {/* Large stylized G/Cross watermark */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none flex items-center justify-center overflow-hidden">
          <span className="text-[20rem] font-bold text-white leading-none translate-x-12">+</span>
        </div>

        <div className="container-custom pt-10 pb-32 md:pb-40 relative z-10 text-white">
          <div className="max-w-4xl">
            {/* SearchBar Container - floated style */}
            <div className="mb-12">
              <SearchBar />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-sm">
              Cuidando de você, sempre.
              <br />
              Agende sua consulta.
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content - Negative margin to pull up if we wanted card overlap, but ref has clean separation */}
      <main className="flex-grow container-custom py-12 -mt-8 relative z-20">

        {/* Próximas Consultas */}
        {isAuthenticated && proximasConsultas.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Próximas Consultas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proximasConsultas.map(({ consulta, medico, agenda }) => (
                <div key={consulta.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
                    <svg className="w-full h-full text-gray-400 p-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Dr(a). {medico?.nome || 'Médico'}</h3>
                    <p className="text-teal-600 text-sm font-medium mb-3">{medico?.especialidade}</p>

                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {agenda
                        ? `${new Date(agenda.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às ${agenda.horario.slice(0, 5)}`
                        : 'A definir'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Especialidades Populares */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Especialidades Populares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayEspecialidades.map((esp, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                  {/* Choose icon based on name or generic */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{esp.nome}</h3>
                  <Link href={`/agendar?especialidade=${esp.nome}`} className="text-sm text-teal-600 hover:underline font-medium">
                    Ver especialistas
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Médicos Disponíveis */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Médicos Disponíveis</h2>
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-teal-600"></div>
            </div>
          ) : medicos.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
              <p>Nenhum médico cadastrado no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicos.slice(0, 6).map((medico) => (
                <Link key={medico.id} href={`/agendar?medico=${medico.id}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden text-gray-400">
                        {medico.foto ? (
                          <img
                            src={medico.foto.startsWith('http') ? medico.foto : `${BASE_URL}${medico.foto}`}
                            alt={medico.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Dr(a). {medico.nome}</h3>
                        <p className="text-teal-600 font-medium">{medico.especialidade}</p>
                        <p className="text-xs text-gray-400 mt-1">CRM: {medico.crm}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-xl">
                <LogoIcon />
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                <span className="text-teal-400">grumos</span>
                <span className="text-cyan-400">Med</span>
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2026 grumosMed. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
