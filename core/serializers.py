from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Medico, Consulta, Agenda, Paciente


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "As senhas não conferem."})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class MedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medico
        fields = ['id', 'nome', 'crm', 'especialidade', 'email', 'foto']


class AgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agenda
        fields = ['id', 'medico', 'dia', 'horario', 'disponivel']


class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = ['id', 'nome', 'cpf', 'email', 'telefone', 'foto']
        

class ConsultaSerializer(serializers.ModelSerializer):
    
    agenda_detalhes = AgendaSerializer(source='agenda', read_only=True)
    paciente_detalhes = PacienteSerializer(source='paciente', read_only=True)
    paciente = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all(), required=False)
    
    class Meta:
        model = Consulta
        fields = ['id', 'agenda', 'agenda_detalhes', 'paciente', 'paciente_detalhes', 'status', 'observacoes', 'motivo_cancelamento']


class MedicoRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    crm = serializers.CharField(write_only=True)
    nome = serializers.CharField(write_only=True)
    especialidade = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'crm', 'nome', 'especialidade']

    def validate_crm(self, value):
        # Check if CRM exists in Medico table
        try:
            medico = Medico.objects.get(crm=value)
            # Check if Medico is already linked to a user
            if medico.user:
                raise serializers.ValidationError("Este CRM já possui um cadastro ativo.")
        except Medico.DoesNotExist:
            # CRM doesn't exist, we will create it
            pass
        
        return value

    def create(self, validated_data):
        crm = validated_data.pop('crm')
        password = validated_data.pop('password')
        nome = validated_data.pop('nome')
        especialidade = validated_data.pop('especialidade')
        
        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        
        # Get or Create Medico
        medico, created = Medico.objects.get_or_create(
            crm=crm,
            defaults={
                'nome': nome,
                'especialidade': especialidade,
                'email': validated_data['email']
            }
        )

        # If medico already existed (but had no user), update details
        if not created:
            medico.nome = nome
            medico.especialidade = especialidade
            medico.email = validated_data['email']
            
        medico.user = user
        medico.save()
        
        return user

