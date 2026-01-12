from django.shortcuts import render
from rest_framework import viewsets, generics
from .models import Medico, Consulta, Agenda, Paciente
from .serializers import MedicoSerializer, ConsultaSerializer, AgendaSerializer, PacienteSerializer, UserRegistrationSerializer, MedicoRegistrationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.contrib.auth.models import User



from rest_framework.views import APIView

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'type': 'medico' if hasattr(user, 'medico') else 'paciente'
        }
        if hasattr(user, 'medico'):
            data['medico_id'] = user.medico.id
            data['crm'] = user.medico.crm
        elif hasattr(user, 'paciente'):
             data['paciente_id'] = user.paciente.id
        
        return Response(data)


class userRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class MedicoRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = MedicoRegistrationSerializer
    permission_classes = [AllowAny]



class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    permission_classes = [AllowAny]


class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer


class AgendaViewSet(viewsets.ModelViewSet):

    queryset = Agenda.objects.filter(disponivel=True)
    serializer_class = AgendaSerializer
    permission_classes = [AllowAny]

    
    def get_queryset(self):
        queryset = Agenda.objects.filter(disponivel=True)
        medico_id = self.request.query_params.get('medico')
        if medico_id:
            queryset = queryset.filter(medico_id=medico_id)
        
        return queryset


class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Retorna consultas do paciente logado OU do médico logado
        """
        user = self.request.user
        
        # Check if user is a doctor
        if hasattr(user, 'medico'):
            return Consulta.objects.filter(agenda__medico=user.medico).order_by('agenda__dia', 'agenda__horario').select_related('agenda', 'paciente')

        try:
            # Get or create paciente for the authenticated user
            paciente, created = Paciente.objects.get_or_create(
                user=self.request.user,
                defaults={
                    'nome': self.request.user.username,
                    'cpf': f'temp_{self.request.user.id}',
                    'email': self.request.user.email
                }
            )
            # Return only consultas for this paciente
            return Consulta.objects.filter(paciente=paciente).select_related('agenda', 'agenda__medico')
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            return Consulta.objects.none()


    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        consulta = self.get_object()
        data_hora_consulta = datetime.combine(consulta.agenda.dia, consulta.agenda.horario)
        agora = datetime.now()

        diferenca = data_hora_consulta - agora

        # if diferenca.total_seconds() < 3600:
        #     return Response(
        #         {'message': 'Não é possível cancelar uma consulta com menos de 1 hora de antecedência.'},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        consulta.motivo_cancelamento = request.data.get('motivo', request.data.get('motivo_cancelamento'))
        consulta.status = 'CANCELADA'
        consulta.save()

        # Re-open agenda if needed? Or keep it closed? Usually cancelation frees up agenda if sufficiently in advance.
        # For now, let's keep it simple as per previous logic (which didn't re-open). 
        # But logically, if canceled, agenda might become available. 
        # User constraint: "cancelamentos e rejeições exigem motivos". I won't enforce re-open logic changes unless asked.

        return Response(
            {'message': 'Consulta cancelada com sucesso.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'])
    def atualizar_status(self, request, pk=None):
        consulta = self.get_object()
        novo_status = request.data.get('status')
        motivo = request.data.get('motivo') or request.data.get('motivo_cancelamento')
        
        if novo_status not in ['PENDENTE', 'CONFIRMADA', 'REJEITADA', 'FINALIZADA', 'CANCELADA', 'AGENDADA']:
             return Response(
                {'message': 'Status inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if novo_status in ['REJEITADA', 'CANCELADA'] and not motivo:
            return Response(
                {'message': 'É obrigatório informar o motivo para cancelar ou rejeitar.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if motivo:
            consulta.motivo_cancelamento = motivo

        consulta.status = novo_status
        consulta.save()
        
        return Response(self.get_serializer(consulta).data)

    def create(self, request, *args, **kwargs):
        try:
            
            with transaction.atomic():
                
                # Log the incoming request data for debugging
                print(f"Request data: {request.data}")
                
                # Get or create paciente for the authenticated user
                paciente, created = Paciente.objects.get_or_create(
                    user=request.user,
                    defaults={
                        'nome': request.user.username,
                        'cpf': f'temp_{request.user.id}',  # Temporary CPF until user updates profile
                        'email': request.user.email
                    }
                )
                
                # Add paciente to request data
                data = request.data.copy()
                data['paciente'] = paciente.id
                
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                
                agenda_id = serializer.validated_data['agenda'].id
                agenda = Agenda.objects.get(id=agenda_id)

                
                if not agenda.disponivel:
                    return Response(
                        {'message': 'Esse horário já foi agendado por outra pessoa!'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                
                
                agenda.disponivel = False
                agenda.save()

                
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            print(f"Error creating consulta: {str(e)}")  # Log the error
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


        

class UpdateProfilePhotoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        user = request.user
        foto = request.FILES.get('foto') 
        if not foto:
            return Response({'message': 'Nenhuma foto foi enviada.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if hasattr(user,'medico'):
            user.medico.foto = foto
            user.medico.save()
        elif hasattr(user,'paciente'):
            user.paciente.foto = foto
            user.paciente.save()
        else:
            return Response({'message': 'Perfil não encontrado.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Foto atualizada com sucesso.'}, status=status.HTTP_200_OK)
