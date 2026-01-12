# Relacionamento entre Tabelas - grumosMed

## 📊 Diagrama de Relacionamento

```
┌─────────────────┐
│      User       │ (Django built-in)
│  (auth_user)    │
├─────────────────┤
│ • id            │
│ • username      │
│ • email         │
│ • password      │
└────────┬────────┘
         │
         │ OneToOne (1:1)
         │
    ┌────┴─────┬──────────────────────────┐
    │          │                          │
    ▼          ▼                          ▼
┌─────────────────┐              ┌─────────────────┐
│    Paciente     │              │     Medico      │
├─────────────────┤              ├─────────────────┤
│ • id            │              │ • id            │
│ • user_id (FK)  │              │ • user_id (FK)  │
│ • nome          │              │ • nome          │
│ • cpf (unique)  │              │ • crm (unique)  │
│ • email         │              │ • especialidade │
│ • telefone      │              │ • email         │
└────────┬────────┘              └────────┬────────┘
         │                                │
         │                                │
         │                                │ OneToMany (1:N)
         │                                ▼
         │                       ┌─────────────────┐
         │                       │     Agenda      │
         │                       ├─────────────────┤
         │                       │ • id            │
         │                       │ • medico_id (FK)│
         │                       │ • dia           │
         │                       │ • horario       │
         │                       │ • disponivel    │
         │                       └────────┬────────┘
         │                                │
         │                                │ OneToOne (1:1)
         │                                ▼
         │                       ┌─────────────────┐
         └──────────────────────▶│    Consulta     │
                 ForeignKey (N:1)├─────────────────┤
                                 │ • id            │
                                 │ • agenda_id (FK)│◀── OneToOne com Agenda
                                 │ • paciente_id   │◀── ForeignKey com Paciente
                                 │ • status        │
                                 │ • observacoes   │
                                 │ • data_agend.   │
                                 └─────────────────┘
```

## 🔗 Explicação dos Relacionamentos

### 1. **User → Paciente** (OneToOne - 1:1)
- Cada usuário pode ter **1 perfil de Paciente**
- Campo: `Paciente.user` → `User.id`
- **Criação automática**: Quando um usuário agenda pela primeira vez

### 2. **User → Medico** (OneToOne - 1:1) 
- Cada usuário pode ter **1 perfil de Médico**
- Campo: `Medico.user` → `User.id`
- **Criação manual**: Via Django Admin

### 3. **Medico → Agenda** (OneToMany - 1:N)
- Um médico pode ter **muitos horários** na agenda
- Campo: `Agenda.medico` → `Medico.id`
- **Exemplo**: Dr. João tem 20 horários disponíveis
- **Constraint**: `unique_together = ['medico', 'dia', 'horario']`

### 4. **Agenda → Consulta** (OneToOne - 1:1)
- Cada horário da agenda pode ter **apenas 1 consulta**
- Campo: `Consulta.agenda` → `Agenda.id`
- **Quando criado**: Quando um paciente agenda aquele horário
- **Efeito**: `Agenda.disponivel = False`

### 5. **Paciente → Consulta** (OneToMany - 1:N)
- Um paciente pode ter **várias consultas**
- Campo: `Consulta.paciente` → `Paciente.id`
- **Exemplo**: Maria tem 3 consultas agendadas

## 🎯 Fluxo de Criação de Consulta

```
1. Usuário "joao" faz login
   └─> User.id = 5

2. Sistema verifica se existe Paciente
   └─> Paciente.user_id = 5? NÃO → CRIA!
   └─> Paciente.id = 3 (criado)
       - nome: "joao"
       - cpf: "temp_5"
       - email: "joao@email.com"

3. Usuário escolhe um horário
   └─> Agenda.id = 42
       - medico_id: 2 (Dr. Silva)
       - dia: 2026-01-10
       - horario: 14:00
       - disponivel: True

4. Sistema cria a Consulta
   └─> Consulta.id = 15
       - agenda_id: 42
       - paciente_id: 3
       - status: "PENDENTE"

5. Sistema marca horário como ocupado
   └─> Agenda.disponivel = False
```

## 🛡️ Segurança e Filtragem

### No Backend (`core/views.py`):

```python
# ConsultaViewSet.get_queryset()
# Retorna APENAS as consultas do paciente logado
def get_queryset(self):
    paciente = get_paciente_from_user(request.user)
    return Consulta.objects.filter(paciente=paciente)
```

### Resultado:
- Usuário "joao" vê apenas **suas próprias consultas**
- Não pode ver consultas de outros pacientes
- Segurança garantida no nível do banco de dados

## 📝 Alterações Realizadas

### ✅ Problema Resolvido:
**Consultas não apareciam em "Minhas Consultas"**

### 🔧 Causa:
`ConsultaViewSet` não tinha `get_queryset()` personalizado, então:
- Tentava retornar TODAS as consultas do sistema
- Mas o usuário não tinha permissão para ver todas
- Resultado: lista vazia

### 💡 Solução Implementada:

1. **Adicionado `get_queryset()` em `ConsultaViewSet`**:
   - Busca/cria o Paciente do usuário logado
   - Filtra consultas apenas desse paciente
   - Usa `select_related()` para otimizar queries

2. **Benefícios**:
   - ✅ Segurança: Cada usuário vê apenas suas consultas
   - ✅ Performance: `select_related` reduz queries ao banco
   - ✅ Automatização: Paciente criado automaticamente se não existir

## 📦 Estrutura Final das Tabelas

### Tabela: `core_paciente`
| id | user_id | nome   | cpf      | email           |
|----|---------|--------|----------|-----------------|
| 1  | 5       | joao   | temp_5   | joao@email.com  |
| 2  | 7       | maria  | temp_7   | maria@email.com |

### Tabela: `core_medico`
| id | user_id | nome      | crm      | especialidade |
|----|---------|-----------|----------|---------------|
| 1  | 3       | Dr. Silva | 12345-SP | Cardiologia   |
| 2  | 4       | Dra. Costa| 67890-RJ | Dermatologia  |

### Tabela: `core_agenda`
| id | medico_id | dia        | horario | disponivel |
|----|-----------|------------|---------|------------|
| 42 | 1         | 2026-01-10 | 14:00   | False      |
| 43 | 1         | 2026-01-10 | 15:00   | True       |
| 44 | 2         | 2026-01-11 | 09:00   | True       |

### Tabela: `core_consulta`
| id | agenda_id | paciente_id | status   | data_agendamento |
|----|-----------|-------------|----------|------------------|
| 15 | 42        | 1           | PENDENTE | 2026-01-07 12:00 |
| 16 | 55        | 2           | AGENDADA | 2026-01-06 10:00 |

## 🎯 Como Funciona Agora

1. **Agendar Consulta**:
   - Frontend envia: `{ agenda: 42 }`
   - Backend cria Paciente automaticamente se não existir
   - Backend adiciona `paciente_id` automaticamente
   - Marca `agenda.disponivel = False`

2. **Ver "Minhas Consultas"**:
   - Frontend chama: `GET /api/consultas/`
   - Backend filtra: `Consulta.objects.filter(paciente=usuario_logado)`
   - Retorna apenas consultas do usuário
   - Inclui dados relacionados (agenda, médico) via `select_related`

## ✨ Estado Final

**Agora as consultas aparecem corretamente em "Minhas Consultas"!** 🎉
