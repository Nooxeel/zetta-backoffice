# Sistema de Temas - Light y Dark Mode

## Descripción

El proyecto cuenta con un sistema completo de temas que soporta:
- **Light mode** - Tema claro
- **Dark mode** - Tema oscuro
- **System mode** - Sigue la preferencia del sistema operativo

## Implementación

### Tecnología
- **next-themes** - Librería para manejo de temas en Next.js
- **Tailwind CSS v4** - Con soporte para la clase `dark:`
- **CSS Variables** - Para colores dinámicos

### Componentes Creados

#### 1. ThemeProvider
`src/modules/shared/components/theme-provider.tsx`

Wrapper para `next-themes` que se integra en el layout raíz.

```tsx
import { ThemeProvider } from "@/src/modules/shared/components/theme-provider"

<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

#### 2. ThemeToggle
`src/modules/shared/components/theme-toggle.tsx`

Botón con dropdown para cambiar entre temas.

**Ubicación**: Header del dashboard (esquina superior derecha)

**Características**:
- Ícono animado (sol/luna)
- Dropdown con 3 opciones: Light, Dark, System
- Transiciones suaves

#### 3. ThemeMenuItem
`src/modules/shared/components/theme-menu.tsx`

Item de menú para cambiar tema desde el sidebar.

**Ubicación**: Dropdown del usuario en el footer del sidebar

**Características**:
- Cicla entre temas al hacer clic
- Muestra el siguiente tema disponible
- Íconos dinámicos (Sun, Moon, Laptop)

## Ubicación de los Controles

### 1. Header del Dashboard
```
┌──────────────────────────────────────┐
│ [☰] Dashboard > Home     [🌙]       │ ← ThemeToggle aquí
└──────────────────────────────────────┘
```

### 2. Sidebar Footer
```
┌─────────────────────┐
│ [👤] John Doe       │ ← Click aquí
│      john@email.com │
└─────────────────────┘
  ↓
┌─────────────────────────────┐
│ ⚙ Profile Settings          │
│ 🌙 Switch to Dark            │ ← ThemeMenuItem aquí
│ ─────────────────────────    │
│ 🚪 Log out                   │
└─────────────────────────────┘
```

## Colores y Variables CSS

Los colores están definidos en `src/app/globals.css`:

### Variables Principales

```css
:root {
  --background: oklch(1 0 0);          /* Blanco */
  --foreground: oklch(0.145 0 0);      /* Negro */
  --primary: oklch(0.205 0 0);         /* Gris oscuro */
  --sidebar: oklch(0.985 0 0);         /* Gris muy claro */
  /* ... más variables */
}

.dark {
  --background: oklch(0.145 0 0);      /* Negro */
  --foreground: oklch(0.985 0 0);      /* Blanco */
  --primary: oklch(0.922 0 0);         /* Gris claro */
  --sidebar: oklch(0.205 0 0);         /* Gris oscuro */
  /* ... más variables */
}
```

### Variables del Sidebar

```css
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

## Uso en Componentes

### Con Tailwind Classes

```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Texto secundario</p>
  <button className="bg-primary text-primary-foreground">
    Botón
  </button>
</div>
```

### Con el Hook useTheme

```tsx
"use client"

import { useTheme } from "next-themes"

export function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

### Clases Condicionales por Tema

```tsx
<div className="bg-white dark:bg-black">
  <p className="text-black dark:text-white">
    Este texto cambia de color según el tema
  </p>
</div>
```

## Personalización

### Cambiar Colores del Tema

Edita `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.5 0.2 250);  /* Azul */
}

.dark {
  --primary: oklch(0.7 0.2 250);  /* Azul más claro en dark */
}
```

### Agregar Nuevas Variables

1. Define en `:root` y `.dark`:
```css
:root {
  --my-custom-color: oklch(0.8 0.1 120);
}

.dark {
  --my-custom-color: oklch(0.3 0.1 120);
}
```

2. Agrega al tema inline:
```css
@theme inline {
  --color-my-custom: var(--my-custom-color);
}
```

3. Usa en componentes:
```tsx
<div className="bg-my-custom text-foreground">
  Mi contenido
</div>
```

## Mejores Prácticas

1. **Siempre usa variables CSS** en lugar de colores hardcodeados
2. **Prueba ambos temas** al desarrollar nuevos componentes
3. **Usa `dark:` prefix** de Tailwind para casos específicos
4. **Evita transiciones en el cambio de tema** (ya está configurado con `disableTransitionOnChange`)
5. **Verifica el contraste** - los textos deben ser legibles en ambos temas

## Testing

### Probar Manualmente

1. Abre el dashboard: http://localhost:3002/dashboard
2. Click en el botón del sol/luna (header derecha)
3. Selecciona cada tema y verifica:
   - Sidebar cambia de color
   - Cards cambian de color
   - Texto es legible
   - Botones son visibles
   - Borders son visibles

### Probar con el Sistema

1. Cambia la preferencia del sistema operativo (dark/light)
2. En la app, selecciona "System" en el theme toggle
3. Verifica que la app siga la preferencia del sistema

## Troubleshooting

### El tema no cambia
- Verifica que `ThemeProvider` esté en el layout raíz
- Asegúrate de que `html` tenga `suppressHydrationWarning`
- Revisa que las variables CSS estén definidas

### Flash de contenido sin estilo
- `next-themes` maneja esto automáticamente
- Si persiste, verifica `disableTransitionOnChange`

### Colores no se aplican
- Verifica que estés usando las variables CSS correctas
- Asegúrate de que `@theme inline` tenga las variables mapeadas
- Revisa que Tailwind esté procesando el CSS correctamente

## Referencias

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
