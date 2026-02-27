# Reporte de Interfaz de Usuario (UI)

Este documento detalla la arquitectura, componentes y estructura general de la interfaz de usuario del proyecto.

## 1. Core Tecnológico y Estructura de Estilos

La interfaz de usuario está construida sobre un stack tecnológico moderno y robusto, garantizando mantenibilidad y una experiencia de desarrollo consistente.

-   **Framework Principal**: **Next.js 14+** con **App Router**. La estructura del proyecto se basa en directorios, donde las carpetas dentro de `src/app` definen las rutas de la aplicación.
-   **Librería de Componentes**: **React**.
-   **Estilos**: **Tailwind CSS v4**. La configuración de Tailwind se centraliza en `src/app/globals.css` utilizando la nueva directiva `@theme`, donde se define un sistema de diseño completo (colores, fuentes, espaciado, temas) a través de variables CSS. Esto permite una consistencia visual total.
-   **Sistema de Componentes (UI Kit)**: **shadcn/ui**. Los componentes base se encuentran en `src/components/ui` y son "sin estilo" por defecto, adoptando el diseño definido en `globals.css`. El estilo configurado es `new-york`, como se especifica en `components.json`.

### Archivos Clave de Configuración:

-   `package.json`: Define todas las dependencias del proyecto.
-   `components.json`: Archivo de configuración para `shadcn/ui`.
-   `src/app/globals.css`: Archivo central de estilos que define el sistema de diseño con Tailwind CSS.
-   `src/app/layout.tsx`: Layout raíz de toda la aplicación.

---

## 2. Rutas y Páginas

La aplicación utiliza los "Route Groups" de Next.js para organizar las rutas de manera lógica y separar contextos.

-   **`(auth)`**: Agrupa todas las páginas relacionadas con la autenticación.
    -   `/login`
    -   `/register`
    -   `/forgot-password`
    -   `/reset-password`
    -   `/verify-email`
-   **`(dashboard)`**: Contiene las páginas y funcionalidades principales de la aplicación, accesibles tras iniciar sesión.
    -   `/dashboard`
    -   `/dashboard/campaigns`
    -   `/dashboard/campaigns/[campaignId]`
    -   `/dashboard/notes`
    -   `/dashboard/notes/[noteId]`
    -   `/dashboard/organization/members`
    -   `/dashboard/organization/settings`
    -   `/dashboard/settings`
-   **`(marketing)`**: Páginas públicas de marketing.
    -   `/pricing`
-   **Rutas de API**: Ubicadas en `src/app/api`, gestionan la lógica de backend.
-   **Otras Rutas**:
    -   `/invite/[token]`: Página para aceptar invitaciones a una organización.

---

## 3. Inventario de Componentes

Los componentes reutilizables son la base de la UI. Están organizados por funcionalidad en el directorio `src/components`.

### 3.1. Componentes Base de UI (`src/components/ui`)

Estos son los componentes primitivos de `shadcn/ui` que forman el sistema de diseño.

-   `alert-dialog.tsx`
-   `avatar.tsx`
-   `badge.tsx`
-   `button.tsx`
-   `card.tsx`
-   `checkbox.tsx`
-   `collapsible.tsx`
-   `command.tsx`
-   `dialog.tsx`
-   `dropdown-menu.tsx`
-   `form.tsx`
-   `input.tsx`
-   `label.tsx`
-   `popover.tsx`
-   `scroll-area.tsx`
-   `select.tsx`
-   `separator.tsx`
-   `sheet.tsx`
-   `skeleton.tsx`
-   `switch.tsx`
-   `table.tsx`
-   `tabs.tsx`
-   `textarea.tsx`
-   `tooltip.tsx`

### 3.2. Componentes de Layout (`src/components/layout`)

Gestionan la estructura principal de las páginas.

-   `dashboard-header.tsx`: Cabecera para las páginas del dashboard.
-   `dashboard-sidebar.tsx`: Barra lateral de navegación del dashboard.
-   `marketing-footer.tsx`: Pie de página para las páginas de marketing.
-   `marketing-header.tsx`: Cabecera para las páginas de marketing.

### 3.3. Componentes Compartidos (`src/components/shared`)

Componentes reutilizables en múltiples funcionalidades.

-   `empty-state.tsx`: Componente para mostrar cuando no hay datos.
-   `org-switcher.tsx`: Selector para cambiar entre organizaciones.
-   `page-header.tsx`: Cabecera estándar para páginas internas.
-   `theme-toggle.tsx`: Botón para cambiar entre tema claro y oscuro.
-   `user-avatar.tsx`: Avatar de usuario.
-   `user-menu.tsx`: Menú desplegable del perfil de usuario.

### 3.4. Componentes de Funcionalidad Específica

Estos componentes están agrupados por la característica a la que pertenecen.

#### Autenticación (`src/components/auth`)

-   `forgot-password-form.tsx`
-   `login-form.tsx`
-   `register-form.tsx`
-   `reset-password-form.tsx`

#### Campañas (`src/components/campaigns`)

-   `campaign-card.tsx`
-   `campaign-detail.tsx`
-   `campaign-list.tsx`
-   `create-campaign-dialog.tsx`
-   `public-campaign-form.tsx`
-   ... y otros relacionados.

#### Notas (`src/components/notes`)

-   `note-card.tsx`
-   `note-detail.tsx`
-   `note-list.tsx`
-   `create-note-dialog.tsx`
-   ... y otros relacionados.

#### Organización (`src/components/org`)

-   `members-table.tsx`
-   `invite-form.tsx`
-   `org-settings-form.tsx`
-   `create-org-dialog.tsx`
-   ... y otros relacionados.

#### Ajustes (`src/components/settings`)

-   `account-form.tsx`
-   `appearance-form.tsx`
-   `profile-form.tsx`

---

## 4. Activos Públicos

Recursos estáticos disponibles públicamente en la aplicación.

-   `file.svg`
-   `globe.svg`
-   `next.svg`
-   `vercel.svg`
-   `window.svg`
-   `favicon.ico`

---
## Resumen final
El reporte generado proporciona un análisis detallado y completo de la interfaz de usuario del proyecto. Se ha identificado el stack tecnológico principal, incluyendo Next.js 14+, React, y Tailwind CSS v4, y se ha destacado el uso de shadcn/ui para la construcción de componentes. La estructura de rutas y la organización de componentes por funcionalidad han sido mapeadas, ofreciendo una visión clara de la arquitectura de la aplicación.
El informe incluye un inventario completo de los componentes de la UI, desde los elementos base hasta los componentes de layout y de funcionalidades específicas como autenticación, campañas, notas, organización y ajustes. También se han documentado los activos públicos y la configuración de estilos, incluyendo el sistema de temas (claro/oscuro).
En resumen, este reporte sirve como una guía exhaustiva de la UI, útil para la incorporación de nuevos miembros al equipo, la planificación de nuevas funcionalidades y el mantenimiento general del código.
