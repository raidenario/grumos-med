
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from core.views import MedicoViewSet, ConsultaViewSet, AgendaViewSet, PacienteViewSet, userRegisterView, MedicoRegisterView, MeView, UpdateProfilePhotoView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register(r'medicos', MedicoViewSet)
router.register(r'consultas', ConsultaViewSet)
router.register(r'agendas', AgendaViewSet)  
router.register(r'pacientes', PacienteViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', userRegisterView.as_view(), name='register'),
    path('api/register/medico/', MedicoRegisterView.as_view(), name='register_medico'),
    path('api/me/', MeView.as_view(), name='me'),
    path('api/profile/photo/', UpdateProfilePhotoView.as_view(), name='update_photo'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)