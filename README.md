# tasko-saas-boilerplate

Boilerplate SaaS production-ready construido con Next.js 16 y React 19. Incluye multi-tenant org management con RBAC, autenticacion SSR con Supabase, dashboard de campanas con formularios publicos, sistema de notas con comentarios y base de datos con Prisma + PostgreSQL. Listo para extender desde el primer dia sin perder tiempo en infraestructura.

## Stack

- **Next.js 16** App Router + Server Actions
- **React 19** + **TypeScript 5**
- **Supabase SSR** — autenticacion y sesiones
- **Prisma 7** + **PostgreSQL 16** — ORM y base de datos
- **Tailwind CSS 4** + **Radix UI** + **shadcn/ui**
- **Stripe** — billing (Checkout + webhooks)
- **Docker Compose** — PostgreSQL + Redis en local

## Funcionalidades incluidas

### Autenticacion (Supabase SSR)
- Registro, login, logout
- Recuperacion y reset de contrasena
- Verificacion de email
- Sesiones SSR con cookies (sin JWT manual)

### Org Management multi-tenant
- Creacion de organizaciones
- Invitacion de miembros por email con token
- Switcher de organizacion activa (cookie-based)
- Roles: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`

### RBAC (permisos por rol)

| Permiso | OWNER | ADMIN | MEMBER | VIEWER |
|---------|-------|-------|--------|--------|
| `manage:org` | si | si | - | - |
| `invite:members` | si | si | - | - |
| `create:content` | si | si | si | - |
| `view:content` | si | si | si | si |

### Campanas
- CRUD de campanas con campos personalizados
- Toggle de estado activo/inactivo
- Formulario publico accesible sin autenticacion (`/campaigns/[slug]`)
- Vista de submissions por campana

### Notas
- CRUD de notas por organizacion
- Comentarios en cada nota
- Filtros y listado

### Settings
- Perfil de usuario (nombre, avatar)
- Configuracion de organizacion
- Preferencias de tema (light/dark)

## Instalacion

### 1. Prerrequisitos
- Node.js 18+
- Docker (para PostgreSQL y Redis en local)
- Cuenta de Supabase
- Cuenta de Stripe (opcional para billing)

### 2. Clonar e instalar

```bash
git clone https://github.com/brunobelloso/tasko-saas-boilerplate
cd tasko-saas-boilerplate
npm install   # ejecuta prisma generate automaticamente
```

### 3. Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripcion |
|----------|-------------|
| `DATABASE_URL` | Conexion a PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase |
| `STRIPE_SECRET_KEY` | Secret key de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key de Stripe |

### 4. Base de datos

```bash
# Levantar PostgreSQL y Redis
docker-compose up -d

# Aplicar schema
npx prisma db push

# (Opcional) Seed inicial
npx prisma db seed
```

### 5. Correr en desarrollo

```bash
npm run dev   # http://localhost:3000
```

## Estructura

```
src/
  app/
    (auth)/         # login, register, forgot-password, reset, verify-email
    (dashboard)/    # dashboard protegido (campaigns, notes, org, settings)
    (marketing)/    # landing publica
    campaigns/      # formularios publicos de campanas
    api/orgs/       # API routes para invitaciones y miembros
    auth/callback/  # callback de Supabase Auth
    invite/[token]/ # aceptar invitacion por token
  components/
    auth/           # formularios de autenticacion
    campaigns/      # UI de campanas y formulario publico
    notes/          # UI de notas y comentarios
    org/            # switcher, invitaciones, tabla de miembros
    settings/       # perfil, apariencia, org settings
    layout/         # sidebar, header, footer
    ui/             # componentes base (shadcn/ui)
  lib/
    auth-actions.ts     # Server Actions de autenticacion
    org-actions.ts      # Server Actions de organizaciones
    campaign-actions.ts # Server Actions de campanas
    note-actions.ts     # Server Actions de notas
    rbac.ts             # requireAuth + guard de permisos
    permissions.ts      # mapa rol -> permisos
    db.ts               # cliente Prisma singleton
    supabase/           # cliente Supabase (server, client, middleware)
prisma/
  schema.prisma   # modelos: Organization, Member, Invite, Note, Campaign...
docker-compose.yml
```

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm start` | Servidor de produccion |
| `npm run lint` | ESLint |
| `npx prisma studio` | GUI de base de datos |
| `npx prisma db push` | Sincronizar schema con la DB |

## Licencia

MIT
