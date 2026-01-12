
import os
import django
from datetime import datetime, timedelta, time
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proj1.settings')
django.setup()

from core.models import Medico, Agenda

def populate():
    # Setup data
    especialidades = ['Cardiologista', 'Dermatologista', 'Ortopedista', 'Pediatra', 'Clínico Geral', 'Neurologista', 'Oftalmologista', 'Ginecologista']
    
    medicos_data = [
        {"nome": "Ana Paula", "especialidade": "Cardiologista"},
        {"nome": "Roberto Carlos", "especialidade": "Ortopedista"},
        {"nome": "Fernanda Lima", "especialidade": "Dermatologista"},
        {"nome": "Carlos Drummond", "especialidade": "Pediatra"},
        {"nome": "Mariana Ximenes", "especialidade": "Clínico Geral"},
        {"nome": "Pedro Pascal", "especialidade": "Neurologista"},
        {"nome": "Juliana Paes", "especialidade": "Dermatologista"},
        {"nome": "Lazaro Ramos", "especialidade": "Cardiologista"},
        {"nome": "Rodrigo Santoro", "especialidade": "Oftalmologista"},
        {"nome": "Tais Araujo", "especialidade": "Ginecologista"},
        {"nome": "Wagner Moura", "especialidade": "Clínico Geral"},
        {"nome": "Selton Mello", "especialidade": "Neurologista"},
    ]

    print("Criando médicos...")
    medico_objects = []
    
    # Start CRM from a random base
    base_crm = 123456

    for i, data in enumerate(medicos_data):
        crm = str(base_crm + i)
        
        # Check if exists
        if not Medico.objects.filter(crm=crm).exists():
            medico = Medico.objects.create(
                nome=data["nome"],
                crm=crm,
                especialidade=data["especialidade"],
                email=f"{data['nome'].lower().replace(' ', '.')}@exemplo.com"
            )
            medico_objects.append(medico)
            print(f"Médico criado: {medico.nome} ({medico.especialidade})")
        else:
            print(f"Médico já existe (CRM {crm}): {data['nome']}")
            # Getting existing object for agenda creation
            medico = Medico.objects.get(crm=crm)
            medico_objects.append(medico)

    print("\nCriando agendas...")
    
    # Dates: Today + next 7 days
    today = datetime.now().date()
    days = [today + timedelta(days=i) for i in range(1, 8)] # Start from tomorrow to simplify time checks
    
    hours = [
        time(8, 0), time(9, 0), time(10, 0), time(11, 0),
        time(13, 0), time(14, 0), time(15, 0), time(16, 0), time(17, 0)
    ]

    count_agendas = 0
    for medico in medico_objects:
        # Create random slots for each doctor
        # Pick 3-5 random days
        selected_days = random.sample(days, k=random.randint(3, 5))
        
        for day in selected_days:
            # Pick 2-4 random hours per day
            selected_hours = random.sample(hours, k=random.randint(2, 4))
            
            for hora in selected_hours:
                if not Agenda.objects.filter(medico=medico, dia=day, horario=hora).exists():
                    Agenda.objects.create(
                        medico=medico,
                        dia=day,
                        horario=hora,
                        disponivel=True
                    )
                    count_agendas += 1

    print(f"\nConcluído! {len(medico_objects)} médicos processados e {count_agendas} novos horários de agenda criados.")

if __name__ == '__main__':
    populate()
