from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consulta    

@receiver(post_save, sender=Consulta)
def notificar_medico_nova_consulta(sender, instance, created, **kwargs):
    if created:
        medico = instance.agenda.medico.nome
        paciente = instance.paciente.nome
        data = instance.agenda.dia
        horario = instance.agenda.horario
        
        print(f"--- NOTIFICAÇÃO ---")
        print(f"Olá Dr(a). {medico}!")
        print(f"O paciente {paciente} agendou uma consulta para {data} às {horario}.")
        print(f"---------------------") 
