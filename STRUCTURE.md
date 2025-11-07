# Estructura del Proyecto Zippy BO

## Rutas Creadas

### Autenticación
- `/` → Redirige a `/login`
- `/login` → Página de inicio de sesión

### Dashboard (Con Sidebar)
- `/dashboard` → Página principal del dashboard con sidebar

## Estructura de Carpetas

```
src/
├── app/
│   ├── (auth)/                    # Grupo de rutas de autenticación
│   │   ├── layout.tsx            # Layout para auth (centrado)
│   │   └── login/
│   │       └── page.tsx          # Página de login
│   │
│   ├── (dashboard)/               # Grupo de rutas con dashboard
│   │   ├── layout.tsx            # Layout con sidebar
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard principal
│   │
│   ├── globals.css
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Redirige a /login
│
└── modules/
    └── shared/
        ├── components/
        │   ├── app-sidebar.tsx   # Componente del sidebar
        │   └── ui/               # 40+ componentes de shadcn
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── data-table.tsx
        │       ├── sidebar.tsx
        │       └── ... (más componentes)
        ├── hooks/
        │   └── use-mobile.ts
        └── lib/
            └── utils.ts          # Función cn() para clases
```

## Componentes Disponibles

### Temas (Light/Dark Mode) 🌓
- **ThemeProvider**: Proveedor de temas con next-themes
- **ThemeToggle**: Botón con dropdown en el header (3 opciones: Light, Dark, System)
- **ThemeMenuItem**: Opción de cambio de tema en el menú del usuario
- Soporte completo para:
  - Light mode
  - Dark mode
  - System mode (sigue preferencia del SO)
- Ver documentación completa en [THEMING.md](./THEMING.md)

### Sidebar
- **AppSidebar**: Sidebar completo con navegación, header y footer
- Incluye:
  - Logo y título de la app
  - Menú de navegación (Dashboard, Analytics, Users, Products, Reports, Settings)
  - Footer con perfil de usuario y dropdown (con cambio de tema)

### Layout Dashboard
- Header con:
  - Trigger para mostrar/ocultar sidebar
  - Breadcrumbs
  - Theme toggle (cambio de tema)
- Área de contenido responsive

### Página de Login
- Formulario con email y password
- Checkbox "Remember me"
- Link "Forgot password"
- Botones de login con GitHub y Google
- Link para registro
- Validación básica

## Uso

### Agregar nuevas páginas al dashboard

1. Crear una carpeta en `src/app/(dashboard)/[nombre]`
2. Agregar `page.tsx` con tu componente
3. Actualizar el menú en `app-sidebar.tsx` si es necesario

### Agregar nuevas páginas de autenticación

1. Crear una carpeta en `src/app/(auth)/[nombre]`
2. Agregar `page.tsx` con tu componente
3. Usa el mismo layout centrado automáticamente

## Navegación del Sidebar

Actualiza el array `menuItems` en `src/modules/shared/components/app-sidebar.tsx`:

```tsx
const menuItems = [
  {
    title: "Título",
    icon: IconComponent,  // De lucide-react
    href: "/ruta",
  },
]
```

## Componentes UI Instalados (40+)

- **Formularios**: Button, Input, Textarea, Label, Field, Checkbox, Switch, Radio Group, Select, Slider, Form, Button Group, Input Group
- **Navegación**: Breadcrumb, Command, Dropdown Menu, Tabs, Sidebar
- **Layout**: Card, Sheet, Dialog, Popover, Tooltip, Separator, Accordion
- **Datos**: Table, Data Table (con paginación y búsqueda)
- **Feedback**: Alert, Badge, Skeleton, Sonner, Empty, Item
- **Utilidades**: Avatar, Calendar

## Características Implementadas

- ✅ shadcn/ui con 40+ componentes
- ✅ Sidebar con navegación
- ✅ Dashboard layout responsive
- ✅ Página de login
- ✅ **Sistema de temas (Light/Dark mode)**
- ✅ Data Table con paginación
- ✅ Breadcrumbs
- ✅ Theme toggle en header y sidebar

## Próximos Pasos

1. Implementar autenticación real (NextAuth, Clerk, etc.)
2. Conectar con backend/API
3. Agregar más páginas al dashboard
4. Agregar gráficos y visualizaciones
5. Implementar notificaciones con Sonner
