from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError


class Medico(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='medico', null=True, blank=True)
    nome = models.CharField(max_length=100)
    crm = models.CharField(max_length = 20, unique=True)
    especialidade = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=True, null=True)
    foto = models.ImageField(upload_to='medicos', blank=True, null=True)


    def __str__(self):
        return f" {self.nome} ({self.crm})"


class Paciente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='paciente', null=True, blank=True)
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    telefone = models.CharField(max_length=11, blank=True, null=True)
    foto = models.ImageField(upload_to='pacientes', blank=True, null=True)

    def __str__(self):
        return f" {self.nome} ({self.cpf})"


class Agenda(models.Model):
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE, related_name='agendas')
    dia = models.DateField()
    horario = models.TimeField()
    disponivel = models.BooleanField(default=True)

    class Meta:
        unique_together = ['medico', 'dia', 'horario']

    
    def clean(self):
        if self.dia < timezone.now().date():
            raise ValidationError("A data da agenda não pode ser anterior à data atual.")

        if self.dia == timezone.now().date() and self.horario < timezone.now().time():
            raise ValidationError("O horário da agenda não pode ser anterior ao horário atual.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f" {self.medico.nome} em {self.dia} às {self.horario}"

class Consulta (models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('REJEITADA', 'Rejeitada'),
        ('AGENDADA', 'Agendada'),
        ('FINALIZADA', 'Finalizada'),
        ('CANCELADA', 'Cancelada'),
    ]

    agenda = models.OneToOneField(Agenda, on_delete=models.CASCADE, related_name='consulta', null=True, blank=True)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='consultas', null=True, blank=True)
    data_agendamento = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    observacoes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDENTE')

    observacoes_paciente = models.TextField(blank = True, verbose_name='Motivo da visita')
    prontuario_medico = models.TextField(blank = True, null=True, verbose_name='Anotações médicas')
    motivo_cancelamento = models.TextField(blank=True, null=True, verbose_name='Motivo de Cancelamento/Rejeição')
    
    def __str__(self):
        paciente_nome = self.paciente.nome if self.paciente else "N/A"
        medico_nome = self.agenda.medico.nome if self.agenda and self.agenda.medico else "N/A"
        data_hora = f"{self.agenda.dia} {self.agenda.horario}" if self.agenda else "N/A"
        return f" {paciente_nome} com Dr(a). {medico_nome} em {data_hora}"



