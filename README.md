<p align="center">
  <img src="logo.png" alt="grumosMed Logo" width="120" />
</p>

<h1 align="center">grumosMed</h1>

<p align="center">
  <strong>Sistema de Agendamento de Consultas Médicas</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <img src="Screenshot_7.png" alt="Screenshot da Aplicação" width="700" />
</p>

---

## 📋 Sobre o Projeto

O **grumosMed** é uma aplicação fullstack moderna para gerenciamento de consultas médicas. Permite que pacientes agendem consultas com médicos, visualizem seu histórico e gerenciem seus agendamentos. Médicos podem gerenciar sua agenda, confirmar, rejeitar ou finalizar consultas em um painel dedicado.

### ✨ Principais Funcionalidades

| Funcionalidade | Pacientes | Médicos |
|----------------|:---------:|:-------:|
| Cadastro e Autenticação (JWT) | ✅ | ✅ |
| Visualizar médicos disponíveis | ✅ | — |
| Agendar consultas | ✅ | — |
| Cancelar consultas | ✅ | ✅ |
| Histórico de consultas | ✅ | — |
| Painel de gerenciamento | — | ✅ |
| Confirmar/Rejeitar consultas | — | ✅ |
| Alterar foto de perfil | ✅ | ✅ |

---

## 🏗️ Arquitetura do Projeto

```
grumosMed/
├── 📁 core/                     # App principal do Django
│   ├── models.py                # Modelos: Medico, Paciente, Agenda, Consulta
│   ├── views.py                 # ViewSets e APIViews (REST)
│   ├── serializers.py           # Serializers do DRF
│   ├── signals.py               # Sinais do Django
│   └── migrations/              # Migrações do banco
│
├── 📁 proj1/                    # Configurações do Django
│   ├── settings.py              # Configurações principais
│   ├── urls.py                  # Rotas da API
│   └── wsgi.py                  # WSGI application
│
├── 📁 frontend/                 # Aplicação Next.js
│   ├── src/
│   │   ├── app/                 # Páginas (App Router)
│   │   │   ├── page.tsx         # Home
│   │   │   ├── login/           # Login
│   │   │   ├── registro/        # Registro de Pacientes
│   │   │   ├── registro-medico/ # Registro de Médicos
│   │   │   ├── agendar/         # Agendamento
│   │   │   ├── minhas-consultas/# Consultas do Paciente
│   │   │   ├── perfil/          # Perfil do Usuário
│   │   │   └── medico/dashboard/# Painel do Médico
│   │   │
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── Header.tsx       # Navegação principal
│   │   │   ├── DoctorCard.tsx   # Card de médico
│   │   │   ├── SearchBar.tsx    # Barra de busca
│   │   │   └── ...
│   │   │
│   │   └── lib/                 # Utilitários
│   │       ├── api.ts           # Cliente Axios + Serviços
│   │       └── types.ts         # Tipagens TypeScript
│   │
│   └── package.json
│
├── 📁 media/                    # Upload de arquivos (fotos)
├── docker-compose.yml           # PostgreSQL + CloudBeaver
└── manage.py                    # CLI do Django
```

---

## 🗄️ Modelo de Dados

```mermaid
erDiagram
    User ||--o| Medico : has
    User ||--o| Paciente : has
    Medico ||--o{ Agenda : creates
    Agenda ||--o| Consulta : books
    Paciente ||--o{ Consulta : schedules
    
    Medico {
        int id PK
        string nome
        string crm UK
        string especialidade
        string email
        image foto
    }
    
    Paciente {
        int id PK
        string nome
        string cpf UK
        string email
        string telefone
        image foto
    }
    
    Agenda {
        int id PK
        int medico_id FK
        date dia
        time horario
        boolean disponivel
    }
    
    Consulta {
        int id PK
        int agenda_id FK
        int paciente_id FK
        string status
        text observacoes_paciente
        text prontuario_medico
        text motivo_cancelamento
    }
```

### Status de Consulta
- `PENDENTE` - Aguardando confirmação do médico
- `AGENDADA` - Confirmada pelo médico
- `REJEITADA` - Rejeitada pelo médico (requer motivo)
- `CANCELADA` - Cancelada por paciente ou médico (requer motivo)
- `FINALIZADA` - Consulta realizada

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Python 3.11+
- Node.js 20+
- Docker e Docker Compose (para PostgreSQL)
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/grumosmed.git
cd grumosmed
```

### 2. Inicie o Banco de Dados (PostgreSQL)

```bash
docker-compose up -d
```
> O banco estará disponível em `localhost:5432`  
> CloudBeaver (visualizador web) em `localhost:8978`

### 3. Configure o Backend (Django)

```bash
# Crie e ative o ambiente virtual
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Instale as dependências
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow psycopg2-binary

# Execute as migrações
python manage.py migrate

# (Opcional) Popule com dados de exemplo
python populate_script.py

# Inicie o servidor
python manage.py runserver
```
> API disponível em `http://localhost:8000/api/`

### 4. Configure o Frontend (Next.js)

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
> Frontend disponível em `http://localhost:3000`

---

## 🔌 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/token/` | Login (retorna JWT) |
| `POST` | `/api/token/refresh/` | Renova access token |
| `POST` | `/api/register/` | Cadastro de paciente |
| `POST` | `/api/register/medico/` | Cadastro de médico |
| `GET` | `/api/me/` | Dados do usuário logado |

### Recursos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/medicos/` | Lista todos os médicos |
| `GET` | `/api/agendas/` | Lista horários disponíveis |
| `GET` | `/api/agendas/?medico=ID` | Horários por médico |
| `GET` | `/api/consultas/` | Consultas do usuário logado |
| `POST` | `/api/consultas/` | Criar nova consulta |
| `POST` | `/api/consultas/{id}/cancelar/` | Cancelar consulta |
| `PATCH` | `/api/consultas/{id}/atualizar_status/` | Atualizar status (médico) |
| `PATCH` | `/api/profile/photo/` | Atualizar foto de perfil |

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Django 6.0** - Framework web Python
- **Django REST Framework** - API RESTful
- **Simple JWT** - Autenticação JWT
- **PostgreSQL 15** - Banco de dados
- **Pillow** - Processamento de imagens

### Frontend
- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização utilitária
- **Axios** - Cliente HTTP

### Infraestrutura
- **Docker** - Containerização
- **CloudBeaver** - Gerenciador de banco via browser

---

## 📁 Variáveis de Ambiente

Para produção, configure as seguintes variáveis:

```env
# Django
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com

# Banco de Dados
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Frontend
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

---

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**João Pedro** - [GitHub](https://github.com/seu-usuario)

---

<p align="center">
  Feito com ❤️ e ☕
</p>
