# 🍕 Pizza Antioquia - Resumen del Proyecto

## 📋 Descripción General
Sitio web completo y profesional para servicio de domicilios de pizzas y gaseosas en Medellín, Colombia. Mobile-first, moderno y optimizado para SEO.

## 🗂️ Estructura del Proyecto

### 📁 Archivos Principales

#### Configuración Base
- `package.json` - Dependencias del proyecto
- `.env.local` - Variables de entorno (Firebase, Google Maps, Wompi)
- `firebase.ts` - Configuración de Firebase
- `firestore.rules` - Reglas de seguridad de Firestore
- `firestore.indexes.json` - Índices para consultas optimizadas

#### Estado y Datos
- `store.ts` - Zustand store para estado global
- `i18n.ts` - Configuración de internacionalización (ES/EN)
- `menuData.ts` - Datos base del menú para ambas sucursales

#### Estilos y Layout
- `globals.css` - Estilos globales con tema rojo/blanco
- `layout.tsx` - Layout principal con Navbar y Footer
- `Navbar.tsx` - Navegación responsive con switch de idioma
- `Footer.tsx` - Footer con redes sociales y enlaces

#### Componentes Principales
- `OrderModal.tsx` - Modal de pedido completo (739 líneas)
- `CookieBanner.tsx` - Banner de consentimiento de cookies
- `useLanguage.ts` - Hook para manejo de idiomas

### 📁 Páginas del Sitio

#### Página Principal (`src/app/page.tsx`)
- Hero section con CTA "Ordenar Ahora"
- Características del servicio
- Testimonios de clientes
- Preview del blog
- FAQ preview

#### Sistema de Pedidos
- **Modal de Pedido** (`OrderModal.tsx`):
  - Geolocalización automática
  - Selector de sucursal (Norte/Sur)
  - Menú dinámico por sucursal
  - Formulario de entrega
  - Integración con Wompi

- **Seguimiento** (`src/app/rastrear/page.tsx`):
  - Seguimiento en 3 pasos con línea de progreso
  - Estados: Pedido recibido → En preparación → Despachado

#### Panel de Administración (`src/app/admin/page.tsx`)
- **Login**: Usuario: `admin`, Contraseña: `pizza123`
- **Pestañas**:
  - 📋 **Pedidos**: Lista con nombre, teléfono, estado, botones para cambiar estado + WhatsApp
  - 🍕 **Gestión de Menú**: Editar, agregar, eliminar pizzas, bebidas, precios por sucursal

#### Páginas Informativas
- **Nosotros** (`src/app/nosotros/page.tsx`) - Historia y valores
- **Blog** (`src/app/blog/page.tsx`) - Artículos sobre pizzas en Medellín
- **FAQ** (`src/app/faq/page.tsx`) - Preguntas frecuentes
- **Privacidad** (`src/app/privacidad/page.tsx`) - Política de privacidad
- **Términos** (`src/app/terminos/page.tsx`) - Términos y condiciones

#### SEO y Optimización
- `sitemap.ts` - Sitemap automático
- `robots.ts` - Robots.txt
- Meta tags optimizados en todas las páginas
- Schema.org para LocalBusiness

## 🔧 Funcionalidades Clave

### 1. 🛒 Pasarela de Pago (Wompi)
- **Ubicación**: `OrderModal.tsx` (líneas 600-700)
- **Integración**: API real de Wompi para pagos en COP
- **Flujo**:
  1. Usuario completa pedido y datos de entrega
  2. Redirección a checkout de Wompi
  3. Procesamiento seguro del pago
  4. Confirmación y guardado en Firestore

### 2. 👤 Panel de Administración
- **URL**: `/admin`
- **Acceso**: 
  - Usuario: `admin`
  - Contraseña: `pizza123`
- **Funciones**:
  - Ver todos los pedidos en tiempo real
  - Cambiar estados de pedido (pendiente → confirmado → preparación → despachado)
  - Enviar mensajes por WhatsApp prellenados
  - Editar menú por sucursal (precios, productos, especialidades)

### 3. 🍪 Gestión de Cookies
- Banner de consentimiento al entrar
- Guardado automático en localStorage si acepta
- Autocompletado de dirección y teléfono en pedidos futuros

### 4. 🌍 Internacionalización
- Switch Español ↔ Inglés en navbar
- Traducción completa del contenido
- Optimizado para turistas en Medellín

## 🚀 Despliegue

### Requisitos Previos
```bash
# Instalar dependencias
bun install

# Configurar variables de entorno en .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=tu_wompi_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_maps_key
```

### Despliegue en Vercel
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Configuración de Firebase
1. Crear proyecto en Firebase Console
2. Habilitar Firestore Database
3. Configurar reglas de seguridad (`firestore.rules`)
4. Crear índices (`firestore.indexes.json`)

## 📊 Estado Actual del Proyecto

### ✅ Completado (11/12)
- ✅ Configuración Firebase y variables de entorno
- ✅ Estilos globales y tema rojo/blanco
- ✅ Página principal con todas las secciones
- ✅ Modal de pedido completo
- ✅ Banner de cookies
- ✅ Página de seguimiento
- ✅ Panel de administración
- ✅ Páginas informativas (Nosotros, Blog, FAQ)
- ✅ Internacionalización
- ✅ SEO y optimización
- ✅ Configuración de despliegue

### ⏳ Pendiente (1/12)
- ⏳ Revisión final, typecheck y lint

## 🔍 Acceso Rápido

### Para Clientes
- **Ordenar**: Botón "Ordenar Ahora" en página principal
- **Seguimiento**: `/rastrear` con número de celular
- **Menú**: Disponible en modal de pedido por sucursal

### Para Administradores
- **Panel Admin**: `/admin`
  - Usuario: `admin`
  - Contraseña: `pizza123`
- **Funciones**: Ver pedidos, cambiar estados, editar menú

### Para Desarrolladores
- **Código fuente**: Estructura modular en `/src/app`
- **Estado global**: Zustand store en `store.ts`
- **Configuración**: Variables en `.env.local`

## 🎯 Próximos Pasos

1. **Configurar Firebase**: Crear proyecto y obtener credenciales
2. **Obtener API Keys**: Wompi y Google Maps
3. **Probar localmente**: `bun run dev`
4. **Desplegar en Vercel**: Conectar repositorio
5. **Configurar dominio**: Personalizar URL
6. **Testing**: Probar flujo completo de pedido
7. **Monitoreo**: Configurar Google Analytics 4
